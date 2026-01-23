package questions

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
)

// HybridStrategy defines distribution percentages.
type HybridStrategy struct {
	StaticPct int
	DBPct     int
	AIPct     int
}

type StreamEventType string

const (
	StreamEventQuestions StreamEventType = "questions"
	StreamEventProgress  StreamEventType = "progress"
	StreamEventHeartbeat StreamEventType = "heartbeat"
	StreamEventLog       StreamEventType = "log"
	StreamEventComplete  StreamEventType = "complete"
	StreamEventError     StreamEventType = "error"
	StreamEventReconnect StreamEventType = "reconnect"
)

type StreamEvent struct {
	Type      StreamEventType `json:"type"`
	Data      interface{}     `json:"data,omitempty"`
	Timestamp time.Time       `json:"timestamp"`
	StreamID  string          `json:"stream_id"`
}

type ProgressData struct {
	Received   int     `json:"received"`
	Expected   int     `json:"expected"`
	Percentage float64 `json:"percentage"`
	ETA        string  `json:"eta,omitempty"`
}

// newQuestionID generates a random, prefixed identifier for persisted questions.
func newQuestionID() string {
	return "q-" + uuid.New().String()
}

// appendUnique appends candidates into dest until maxLen is reached, skipping duplicate IDs or fingerprints.
func appendUnique(dest []Question, candidates []Question, seenIDs map[string]struct{}, seenFP map[string]struct{}, maxLen int) []Question {
	for _, q := range candidates {
		fp := GenerateFingerprint(q)
		if _, ok := seenIDs[q.ID]; ok {
			continue
		}
		if _, ok := seenFP[fp]; ok {
			continue
		}
		if maxLen > 0 && len(dest) >= maxLen {
			break
		}
		dest = append(dest, q)
		seenIDs[q.ID] = struct{}{}
		seenFP[fp] = struct{}{}
	}
	return dest
}

// normalizeAIQuestion fills missing identifiers and metadata so AI outputs can be persisted and reused.
func normalizeAIQuestion(q Question, req HybridRequest) Question {
	if q.ID == "" {
		q.ID = newQuestionID()
	}
	if len(q.Options) > 0 {
		q.Options = normalizeOptions(q.Options)
	}
	if q.CorrectAnswer != "" {
		q.CorrectAnswer = strings.ToUpper(strings.TrimSpace(q.CorrectAnswer))
	}
	if q.SkillID == "" {
		q.SkillID = req.SkillID
	}
	if q.Section == "" {
		q.Section = req.Section
	}
	if q.Source == "" {
		q.Source = "ai"
	}
	return q
}

// normalizeOptions uppercases keys and trims whitespace to keep stored rows consistent.
func normalizeOptions(opts []Option) []Option {
	normalized := make([]Option, 0, len(opts))
	for _, opt := range opts {
		k := strings.ToUpper(strings.TrimSpace(opt.Key))
		t := strings.TrimSpace(opt.Text)

		// If key or text is present, keep it.
		// If both are empty, skip.
		if k != "" || t != "" {
			opt.Key = k
			opt.Text = t
			// If key missing but text present, maybe assign a placeholder?
			// But for now let's just keep it so validation catches the specific missing field rather than "0 options" error.
			normalized = append(normalized, opt)
		}
	}
	return normalized
}

// validateQuestionShape enforces a strict TOEFL-style multiple-choice format before persisting.
func validateQuestionShape(q Question) error {
	if q.Text == "" {
		return errors.New("question_text required")
	}

	// Type-specific validation to prevent mixed formats
	switch strings.ToUpper(strings.TrimSpace(q.Type)) {
	case "SENTENCE_COMPLETION", "COMPLETE_THE_SENTENCE", "SENTENCE_COMPLETION_4OPT", "SENTENCE_COMPLETION_OPT":
		if !strings.Contains(q.Text, "___") {
			return errors.New("sentence completion items must contain '___' placeholder")
		}
	case "ERROR_IDENTIFICATION", "IDENTIFY_ERROR", "ERROR_ANALYSIS":
		requiredMarkers := []string{"{A}", "{/A}", "{B}", "{/B}", "{C}", "{/C}", "{D}", "{/D}"}
		for _, m := range requiredMarkers {
			if !strings.Contains(q.Text, m) {
				return fmt.Errorf("error identification items must include marker %s", m)
			}
		}
	}

	if len(q.Options) != 4 {
		return fmt.Errorf("requires exactly 4 options, got %d", len(q.Options))
	}

	requiredKeys := map[string]bool{"A": true, "B": true, "C": true, "D": true}
	presentKeys := make(map[string]bool)

	for _, opt := range q.Options {
		if opt.Text == "" {
			return fmt.Errorf("option %s has empty text", opt.Key)
		}
		if !requiredKeys[opt.Key] {
			return fmt.Errorf("invalid option key: %s", opt.Key)
		}
		presentKeys[opt.Key] = true
	}

	for k := range requiredKeys {
		if !presentKeys[k] {
			return fmt.Errorf("missing option: %s", k)
		}
	}

	correct := strings.ToUpper(strings.TrimSpace(q.CorrectAnswer))
	if correct == "" {
		return errors.New("correct_answer required")
	}
	if !presentKeys[correct] {
		return fmt.Errorf("correct_answer %s not found in options", correct)
	}
	return nil
}

// Service orchestrates question sourcing and mutations.
type Service struct {
	repo             Repository
	static           []Question
	strategy         HybridStrategy
	aiService        AIService
	embedSvc         EmbeddingService
	userHistory      DifficultyTracker
	cache            QuestionCache
	streamingManager *StreamingManager
	// AI-Free validation
	validator     *Validator
	ruleEngine    *RuleEngine
	logger        *zap.Logger
	aiLimiter     *rate.Limiter
	aiMaxRetries  int
	aiBackoffBase time.Duration
	aiBackoffMax  time.Duration
}

// QuestionCache provides optional Redis-backed caching for frequently read queries.
type QuestionCache interface {
	Get(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, bool)
	Set(ctx context.Context, skillID string, limit int, excludeUsed bool, qs []Question)
	InvalidateSkill(ctx context.Context, skillID string)
}

func NewService(repo Repository, static []Question, strategy HybridStrategy, ai AIService, embed EmbeddingService, cache QuestionCache, logger *zap.Logger) *Service {
	if strategy.StaticPct == 0 && strategy.DBPct == 0 && strategy.AIPct == 0 {
		strategy = HybridStrategy{StaticPct: 40, DBPct: 40, AIPct: 20}
	}
	// Initialize AI-Free validators
	validator := NewValidator()
	ruleEngine, _ := NewRuleEngine()

	if logger == nil {
		logger, _ = zap.NewProduction()
	}

	return &Service{
		repo:          repo,
		static:        static,
		strategy:      strategy,
		aiService:     ai,
		embedSvc:      embed,
		userHistory:   NewSimpleDifficultyTracker(5),
		cache:         cache,
		validator:     validator,
		ruleEngine:    ruleEngine,
		logger:        logger,
		aiLimiter:     rate.NewLimiter(rate.Every(2*time.Second), 1),
		aiMaxRetries:  3,
		aiBackoffBase: 500 * time.Millisecond,
		aiBackoffMax:  5 * time.Second,
	}
}

// SetStreamingManager assigns the connection manager used by enhanced streaming.
func (s *Service) SetStreamingManager(sm *StreamingManager) {
	s.streamingManager = sm
}

// AttachDifficultyTracker allows sharing a tracker instance with other domains (e.g., quiz).
func (s *Service) AttachDifficultyTracker(t DifficultyTracker) {
	if t != nil {
		s.userHistory = t
	}
}

func (s *Service) GetQuestions(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, error) {
	if skillID == "" {
		return nil, errors.New("skill_id required")
	}
	if limit <= 0 {
		limit = 20
	}

	// CHECK CACHE FIRST
	if s.cache != nil {
		if cached, ok := s.cache.Get(ctx, skillID, limit, excludeUsed); ok && len(cached) > 0 {
			return cached, nil
		}
	}

	// FETCH FROM DATABASE
	// Note: Repo is responsible for strictly filtering by skill_id
	res, err := s.repo.GetBySkill(ctx, skillID, limit, excludeUsed)
	if err == nil && s.cache != nil && len(res) > 0 {
		s.cache.Set(ctx, skillID, limit, excludeUsed, res)
	}
	return res, err
}

func (s *Service) Save(ctx context.Context, q Question) (Question, error) {
	if q.ID == "" || q.SkillID == "" {
		return Question{}, errors.New("id and skill_id required")
	}

	// 1. SHAPE VALIDATION - Validate question structure by type
	if err := validateQuestionShape(q); err != nil {
		return Question{}, fmt.Errorf("shape validation: %w", err)
	}

	// 2. AI-FREE VALIDATION - Multi-layer quality checks
	if s.validator != nil {
		// Mock validation result for now as validator stub is simple
		result := s.validator.Validate(q)
		if !result.Valid {
			issueMsg := "validation failed"
			if len(result.Issues) > 0 {
				issueMsg = result.Issues[0].Message
			}
			return Question{}, fmt.Errorf("AI-free validation: %s (score: %.2f)", issueMsg, result.Score)
		}
	}

	// 3. RULE ENGINE VALIDATION - Business rules
	if s.ruleEngine != nil {
		fact, err := s.ruleEngine.Validate(ctx, q)
		if err == nil && !fact.IsValid {
			issueMsg := "rule validation failed"
			if len(fact.Issues) > 0 {
				issueMsg = fact.Issues[0].Message
			}
			return Question{}, fmt.Errorf("rule engine: %s", issueMsg)
		}
	}

	// 4. SAVE TO DATABASE
	s.cacheInvalidate(ctx, q.SkillID)
	// If persistence fails, return the error so the caller knows this question wasn't saved.
	return s.repo.Save(ctx, q)
}

func (s *Service) MarkUsed(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return errors.New("ids required")
	}
	s.cacheInvalidate(ctx, "")
	return s.repo.MarkUsed(ctx, ids)
}

func (s *Service) Hybrid(ctx context.Context, req HybridRequest) (HybridResult, error) {
	if req.SkillID == "" || req.Section == "" {
		return HybridResult{}, errors.New("skill_id and section required")
	}
	if req.Count <= 0 {
		req.Count = 10
	}

	questions, breakdown, err := s.selectCandidates(ctx, req)
	if err != nil {
		return HybridResult{}, err
	}

	if len(questions) < req.Count {
		// Replenish synchronously if short
		missing := req.Count - len(questions)
		if s.aiService != nil {
			s.logger.Info("triggering_replenish", zap.String("skill", req.SkillID), zap.Int("missing", missing))
			genCtx, cancel := context.WithTimeout(ctx, 300*time.Second) // Increased timeout to 5 minutes
			added, err := s.Replenish(genCtx, req.SkillID, req.Section, missing)
			cancel()
			if err != nil {
				s.logger.Error("hybrid_replenish_failed", zap.Error(err))
			}
			s.logger.Info("replenish_completed", zap.Int("added", added))
			if added > 0 {
				questions, breakdown, _ = s.selectCandidates(ctx, req)
			}
		}
	}

	// Final check: if we have 0 questions, return Error
	if len(questions) == 0 {
		s.logger.Error("hybrid_fetch_failed", zap.String("reason", "no valid questions from any source"), zap.Any("breakdown", breakdown))
		return HybridResult{}, errors.New("failed to generate any valid questions from AI or DB")
	}

	// Fill breakdown for what's present if replenish failed/partial
	if breakdown == nil {
		breakdown = make(map[string]int)
	}

	return HybridResult{
		Questions: questions,
		Breakdown: breakdown,
	}, nil
}

// selectCandidates gathers available questions from Static and DB sources.
func (s *Service) selectCandidates(ctx context.Context, req HybridRequest) ([]Question, map[string]int, error) {
	questions := make([]Question, 0, req.Count)
	breakdown := make(map[string]int)
	seen := make(map[string]struct{})
	seenFP := make(map[string]struct{})

	userUsed := make(map[string]bool)
	if req.UserID != "" {
		if usedIDs, err := s.repo.GetUsedByUser(ctx, req.UserID, req.SkillID); err == nil {
			userUsed = usedIDs
		}
	}

	staticQuota := s.strategy.StaticPct * req.Count / 100

	// Static - STRICTLY filtered by SkillID
	for _, q := range s.static {
		if q.SkillID != req.SkillID || len(questions) >= staticQuota {
			continue
		}
		if userUsed[q.ID] {
			continue
		}
		q.Source = "static"
		fp := GenerateFingerprint(q)
		if _, ok := seen[q.ID]; ok {
			continue
		}
		if _, ok := seenFP[fp]; ok {
			continue
		}
		questions = append(questions, q)
		seen[q.ID] = struct{}{}
		seenFP[fp] = struct{}{}
	}

	// DB
	if len(questions) < req.Count {
		// Calculate how many non-AI questions we aimed for
		nonAITarget := (s.strategy.StaticPct + s.strategy.DBPct) * req.Count / 100

		// If Static didn't fill its share, let DB fill the rest up to nonAITarget
		// Also ensure we don't exceed req.Count
		needed := nonAITarget - len(questions)
		if needed < 0 {
			needed = 0
		}

		// But also, if we have plenty of DB questions, maybe we SHOULD fill more if AI is expensive?
		// For now, let's strictly stick to the strategy's "Non-AI" total.
		// If request is 10, Static 40%, DB 40%, AI 20%. Target Non-AI = 8.
		// If Static gives 0, needed from DB = 8.

		dbTarget := needed
		// Capping just in case
		if len(questions)+dbTarget > req.Count {
			dbTarget = req.Count - len(questions)
		}

		if dbTarget > 0 {
			// Query by skill_id - returns all question types for that SPECIFIC skill
			dbQs, err := s.repo.GetBySkill(ctx, req.SkillID, dbTarget, true)
			if err == nil {
				s.logger.Info("db_fetch_success", zap.Int("count", len(dbQs)), zap.String("skill", req.SkillID))
				dbQs = filterUserUsed(dbQs, userUsed)
				for i := range dbQs {
					if dbQs[i].Source == "" {
						dbQs[i].Source = "database"
					}
				}
				questions = appendUnique(questions, dbQs, seen, seenFP, len(questions)+dbTarget)
			} else {
				s.logger.Error("db_fetch_failed", zap.Error(err))
			}
		}
	}

	// Recalculate breakdown based on final source attribution
	for _, q := range questions {
		src := q.Source
		if src == "" {
			src = "unknown"
		}
		breakdown[src]++
	}

	return questions, breakdown, nil
}

func filterUserUsed(qs []Question, used map[string]bool) []Question {
	if len(used) == 0 {
		return qs
	}
	out := make([]Question, 0, len(qs))
	for _, q := range qs {
		if used[q.ID] {
			continue
		}
		out = append(out, q)
	}
	return out
}

func (s *Service) cacheInvalidate(ctx context.Context, skillID string) {
	if s.cache == nil {
		return
	}
	if skillID != "" {
		s.cache.InvalidateSkill(ctx, skillID)
	}
}

// Replenish generates new questions via AI and persists them.
func (s *Service) Replenish(ctx context.Context, skillID, section string, count int) (int, error) {
	if s.aiService == nil {
		return 0, errors.New("ai service not configured")
	}

	rawQs, err := s.aiService.GenerateQuestions(ctx, skillID, section, count)
	if err != nil {
		return 0, fmt.Errorf("ai generation failed: %w", err)
	}

	savedCount := 0
	var lastErr error

	for _, q := range rawQs {
		q = normalizeAIQuestion(q, HybridRequest{SkillID: skillID, Section: section})

		// Handle Passage if present
		if q.PassageText != "" {
			// GENERATE DETERMINISTIC ID for Deduplication (UUIDv5 based on text)
			// This allows us to reuse passages without looking them up purely by text query if we use ON CONFLICT DO NOTHING
			// We use a custom namespace UUID for passages
			// Using UUID NamespaceOID as a seed is fine
			passageUUID := uuid.NewSHA1(uuid.NameSpaceOID, []byte(q.PassageText))
			q.PassageID = passageUUID.String()

			passage := Passage{
				ID:        q.PassageID,
				Text:      q.PassageText,
				Topic:     skillID,
				CreatedAt: time.Now(),
			}

			// SavePassage is expected to use ON CONFLICT DO NOTHING
			if err := s.repo.SavePassage(ctx, passage); err != nil {
				s.logger.Warn("save_passage_failed", zap.Error(err))
				// Failure to save passage (other than conflict) means we shouldn't save the question referring to it
				lastErr = err
				continue
			}
			q.PassageText = "" // Clear transient field
		}

		if _, err := s.Save(ctx, q); err == nil {
			savedCount++
		} else {
			s.logger.Warn("replenish_save_failed", zap.String("question_id", q.ID), zap.Error(err))
			lastErr = err
		}
	}

	if savedCount == 0 && len(rawQs) > 0 {
		if lastErr != nil {
			return 0, fmt.Errorf("all questions failed validation/persistence. last fail: %w", lastErr)
		}
		return 0, errors.New("all generated questions failed validation or persistence")
	}

	return savedCount, nil
}

func (s *Service) waitForAILimiter(ctx context.Context) error {
	if s.aiLimiter == nil {
		return nil
	}
	return s.aiLimiter.Wait(ctx)
}

func (s *Service) sleepWithBackoff(ctx context.Context, d time.Duration) {
	if d <= 0 {
		return
	}
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-timer.C:
	case <-ctx.Done():
	}
}

func minDuration(a, b time.Duration) time.Duration {
	if a < b {
		return a
	}
	return b
}

func (s *Service) scheduleBackgroundReplenish(skillID, section string, target int) {
	if target <= 0 || s.aiService == nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()
		s.Replenish(ctx, skillID, section, target)
	}()
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// -- Placeholder methods for streaming (cut for brevity/compatibility if not used directly,
// -- but keeping them compiling)
func (s *Service) EnhancedStreaming(ctx context.Context, req HybridRequest) (<-chan StreamEvent, <-chan error) {
	return nil, nil
}
