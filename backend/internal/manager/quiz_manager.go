package manager

import (
	"log"
	"sync"
	"time"

	"streamquiz-backend/internal/service"

	"github.com/google/uuid"
)

type Session struct {
	ID         string
	Topic      string
	Section    string
	ResultChan chan *service.QuizResponse // Channel to stream results
	Total      int
	Generated  int
	CreatedAt  time.Time
}

type QuizManager struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

var GlobalManager *QuizManager

func Init() {
	GlobalManager = &QuizManager{
		sessions: make(map[string]*Session),
	}
}

// StartSession initiates the creation of 'count' quizzes.
// It returns the session ID immediately, while starting a background goroutine.
func (m *QuizManager) StartSession(topic, section string, count int) string {
	sessionID := uuid.New().String()

	// Create a buffered channel large enough for all requests to prevent blocking
	// If count is very large, we might want a smaller buffer, but for <50 it's fine.
	resultChan := make(chan *service.QuizResponse, count)

	session := &Session{
		ID:         sessionID,
		Topic:      topic,
		Section:    section,
		ResultChan: resultChan,
		Total:      count,
		Generated:  0,
		CreatedAt:  time.Now(),
	}

	m.mu.Lock()
	m.sessions[sessionID] = session
	m.mu.Unlock()

	// Start Background Generation
	go m.processSession(session)

	return sessionID
}

func (m *QuizManager) processSession(s *Session) {
	log.Printf("[Session %s] Starting background generation of %d quizzes", s.ID, s.Total)

	var wg sync.WaitGroup

	// We want to generate them in parallel, but maybe limit concurrency?
	// For "Simultaneous" feel, let's just launch them all (up to a limit).
	// Let's limit concurrent AI calls to 5 at a time to be polite to the API.
	sem := make(chan struct{}, 5)

	for i := 0; i < s.Total; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{}        // Acquire token
			defer func() { <-sem }() // Release token

			// Add retries?
			quiz, err := service.GenerateQuiz(s.Topic, s.Section)
			if err != nil {
				log.Printf("[Session %s] Error generating quiz %d: %v", s.ID, idx, err)
				// Put a nil or error object? For now, just skip.
				// Ideally we should signal error to frontend or retry.
				return
			}

			// Send to channel
			s.ResultChan <- quiz
		}(i)
	}

	wg.Wait()
	close(s.ResultChan)
	log.Printf("[Session %s] Finished generating all quizzes", s.ID)

	// Optional: Cleanup session after some time?
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
