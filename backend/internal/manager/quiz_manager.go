package manager

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"streamquiz-backend/internal/service"

	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

type Session struct {
	ID          string
	Topic       string
	Section     string
	ResultChan  chan *service.QuizResponse // Channel to stream results
	Total       int
	Generated   int32 // Atomic
	CreatedAt   time.Time
	Questions   []*service.QuizResponse
	UserAnswers map[string]string
	Score       int
	Status      string // "active", "completed"
}

type QuizGenerator interface {
	GenerateQuiz(topic, section string) (*service.QuizResponse, error)
}

// ServiceQuizGenerator wraps the service.GenerateQuiz function
type ServiceQuizGenerator struct{}

func (g *ServiceQuizGenerator) GenerateQuiz(topic, section string) (*service.QuizResponse, error) {
	return service.GenerateQuiz(topic, section)
}

type QuizManager struct {
	sessions  map[string]*Session
	mu        sync.RWMutex
	limiter   *rate.Limiter
	generator QuizGenerator
}

func NewQuizManager(generator QuizGenerator) *QuizManager {
	if generator == nil {
		generator = &ServiceQuizGenerator{}
	}
	m := &QuizManager{
		sessions:  make(map[string]*Session),
		limiter:   rate.NewLimiter(rate.Every(time.Second*2), 5), // 1 request every 2s, burst 5
		generator: generator,
	}
	go m.cleanupLoop()
	return m
}

func (m *QuizManager) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		m.mu.Lock()
		for id, s := range m.sessions {
			if time.Since(s.CreatedAt) > 1*time.Hour {
				delete(m.sessions, id)
				// Drain channel to unblock any pending writes if any (though processSession should be done)
				select {
				case <-s.ResultChan:
				default:
				}
			}
		}
		m.mu.Unlock()
	}
}

// StartSession initiates the creation of 'count' quizzes.
// It returns the session ID immediately, while starting a background goroutine.
func (m *QuizManager) StartSession(ctx context.Context, topic, section string, count int) string {
	sessionID := uuid.New().String()

	// Create a buffered channel large enough for all requests to prevent blocking
	resultChan := make(chan *service.QuizResponse, count)

	session := &Session{
		ID:          sessionID,
		Topic:       topic,
		Section:     section,
		ResultChan:  resultChan,
		Total:       count,
		Generated:   0,
		CreatedAt:   time.Now(),
		Questions:   make([]*service.QuizResponse, 0, count),
		UserAnswers: make(map[string]string),
		Status:      "active",
	}

	m.mu.Lock()
	m.sessions[sessionID] = session
	m.mu.Unlock()

	// Start Background Generation
	// Use a detached context for background work so it doesn't cancel when HTTP request ends
	bgCtx := context.Background()
	go m.processSession(bgCtx, session)

	return sessionID
}

func (m *QuizManager) processSession(ctx context.Context, s *Session) {
	log.Printf("[Session %s] Starting background generation of %d quizzes", s.ID, s.Total)

	var wg sync.WaitGroup

	// Global Rate Limit
	if m.limiter == nil {
		m.limiter = rate.NewLimiter(rate.Every(time.Second), 5)
	}

	// Local concurrency semaphore
	sem := make(chan struct{}, 5)

	var failedCount int32
	// Allow more failures, but stop if it's clearly broken (e.g. 100% failure after some attempts)
	// If total is small (e.g. 1), threshold 1 is fine.
	errThreshold := int32(s.Total)
	if s.Total > 5 {
		errThreshold = int32(s.Total * 2) // Allow retries/failures up to 2x total requests before giving up entirely?
		// Actually, let's stick to the logic: if we fail too many times, we stop.
		// If we want 10 quizzes, and 5 fail, do we stop? We might want to try harder.
		// Let's set a hard limit of failed attempts.
		errThreshold = int32(s.Total) + 5
	}

	for i := 0; i < s.Total; i++ {
		// Check for high failure rate
		if atomic.LoadInt32(&failedCount) >= errThreshold {
			log.Printf("[Session %s] Aborting due to high failure rate (%d/%d)", s.ID, failedCount, errThreshold)
			break
		}

		wg.Add(1)
		go func(idx int) {
			defer wg.Done()

			// Retry loop for this specific item
			for attempt := 0; attempt < 3; attempt++ {
				// Use Global Limiter for API politeness
				if err := m.limiter.Wait(ctx); err != nil {
					log.Printf("[Session %s] Limiter error: %v", s.ID, err)
					return // Context cancelled/error
				}

				sem <- struct{}{} // Acquire token
				quiz, err := m.generator.GenerateQuiz(s.Topic, s.Section)
				<-sem // Release token

				if err == nil {
					m.mu.Lock()
					s.Questions = append(s.Questions, quiz)
					m.mu.Unlock()

					s.ResultChan <- quiz
					atomic.AddInt32(&s.Generated, 1)
					return // Success
				}

				log.Printf("[Session %s] Error generating quiz %d (attempt %d): %v", s.ID, idx, attempt+1, err)
				time.Sleep(time.Second * time.Duration(attempt+1))
			}

			// If we exhausted retries
			atomic.AddInt32(&failedCount, 1)
		}(i)
	}

	wg.Wait()
	close(s.ResultChan)
	log.Printf("[Session %s] Finished generating quizzes. Generated: %d, Failed: %d", s.ID, atomic.LoadInt32(&s.Generated), failedCount)
}

func (m *QuizManager) GetNextQuiz(sessionID string) *service.QuizResponse {
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()

	if !exists {
		return nil
	}

	// Read from channel (blocking if empty but not closed)
	quiz, ok := <-session.ResultChan
	if !ok {
		// Channel closed, meaning all generation finished and all items were consumed.
		return nil
	}

	return quiz
}

func (m *QuizManager) GetSessionStatus(sessionID string) (int, int, bool) {
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()

	if !exists {
		return 0, 0, false
	}
	return int(atomic.LoadInt32(&session.Generated)), session.Total, true
}

func (m *QuizManager) SubmitQuiz(sessionID string, answers map[string]string) (int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	s, exists := m.sessions[sessionID]
	if !exists {
		return 0, fmt.Errorf("session not found")
	}

	s.UserAnswers = answers
	s.Status = "completed"

	score := 0
	for _, q := range s.Questions {
		if ans, ok := answers[q.ID]; ok {
			if ans == q.CorrectAnswer {
				score++
			}
		}
	}
	s.Score = score
	return score, nil
}

type QuizResult struct {
	SessionID   string                  `json:"sessionId"`
	Score       int                     `json:"score"`
	Total       int                     `json:"totalQuestions"`
	Questions   []*service.QuizResponse `json:"questions"`
	UserAnswers map[string]string       `json:"userAnswers"`
	SkillName   string                  `json:"skillName"`
}

func (m *QuizManager) GetQuizResult(sessionID string) (*QuizResult, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	s, exists := m.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found")
	}

	// Enrich questions with isCorrect context if needed, but frontend can calc it
	// Actually frontend needs full details to show Review Mode

	res := &QuizResult{
		SessionID:   s.ID,
		Score:       s.Score,
		Total:       len(s.Questions),
		Questions:   s.Questions,
		UserAnswers: s.UserAnswers,
		SkillName:   s.Topic + " " + s.Section,
	}
	return res, nil
}
