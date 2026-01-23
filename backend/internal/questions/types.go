package questions

import (
	"context"
	cryptoRand "crypto/rand"
	"encoding/hex"
	"time"
)

// Question represents a quiz question
type Question struct {
	ID             string    `json:"id"`
	Text           string    `json:"text"`
	Type           string    `json:"type"`
	Options        []Option  `json:"options"`
	CorrectAnswer  string    `json:"correctAnswer"`
	Explanation    string    `json:"explanation,omitempty"`
	SkillID        string    `json:"skillId"`
	Section        string    `json:"section"`
	Source         string    `json:"source"`     // "ai", "static", "database"
	Difficulty     string    `json:"difficulty"` // "easy", "medium", "hard"
	PassageID      string    `json:"passageId,omitempty"`
	PassageText    string    `json:"passageText,omitempty"` // Transient field for new generations
	PatternTip     string    `json:"patternTip,omitempty"`
	Hints          []string  `json:"hints,omitempty"`
	ReferencedText string    `json:"referencedText,omitempty"`
	QualityScore   float64   `json:"qualityScore"`
	TimesServed    int       `json:"timesServed"`
	ContentHash    string    `json:"contentHash"`
	IsVerified     bool      `json:"isVerified"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Passage struct {
	ID        string    `json:"id"`
	Text      string    `json:"text"`
	Topic     string    `json:"topic"`
	CreatedAt time.Time `json:"createdAt"`
}

type Option struct {
	Key  string `json:"key"` // A, B, C, D
	Text string `json:"text"`
}

// HybridRequest parameters for fetching questions
type HybridRequest struct {
	SkillID string `json:"skillId"`
	Section string `json:"section"`
	Count   int    `json:"count"`
	UserID  string `json:"userId"`
}

// HybridResult result payload
type HybridResult struct {
	Questions []Question     `json:"questions"`
	Breakdown map[string]int `json:"breakdown"`
}

type BulkGenerateRequest struct {
	Section  string
	Count    int
	Strategy map[string]int
}

// Repository defines data access
type Repository interface {
	GetBySkill(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, error)
	GetPassages(ctx context.Context, skillID string, maxPassages int) ([]map[string]any, error)
	Save(ctx context.Context, q Question) (Question, error)
	SavePassage(ctx context.Context, p Passage) error
	MarkUsed(ctx context.Context, ids []string) error
	MarkUsedByUser(ctx context.Context, userID string, ids []string) error
	GetUsedByUser(ctx context.Context, userID, skillID string) (map[string]bool, error)
	FindSimilar(ctx context.Context, q Question, limit int, embedding []float32) ([]Question, error)
}

// AIService defines AI generation
type AIService interface {
	GenerateQuestions(ctx context.Context, skillID, section string, count int) ([]Question, error)
	GenerateBulkQuestions(ctx context.Context, section string, count int, strategy map[string]int) ([]Question, error)
	StreamQuestions(ctx context.Context, skillID, section string, count int) (<-chan []Question, <-chan error)
}

// EmbeddingService defines vector embedding
type EmbeddingService interface {
	Embed(ctx context.Context, text string) ([]float32, error)
}

// DifficultyTracker tracks user performance
type DifficultyTracker interface {
	NextDifficulty(skillID string) string
}

// Simple Tracker Implementation
type SimpleDifficultyTracker struct {
	windowSize int
}

func NewSimpleDifficultyTracker(window int) *SimpleDifficultyTracker {
	return &SimpleDifficultyTracker{windowSize: window}
}

func (t *SimpleDifficultyTracker) NextDifficulty(skillID string) string {
	return "medium" // Default
}

// StreamingManager stub
type StreamingManager struct{}

func (sm *StreamingManager) RegisterConnection(connID, userID, skillID string, total int) *StreamConnection {
	return &StreamConnection{ExpectedTotal: total, StartedAt: time.Now()}
}
func (sm *StreamingManager) CompleteConnection(connID string)                      {}
func (sm *StreamingManager) UpdateProgress(connID string, sent int)                {}
func (sm *StreamingManager) MarkFailed(connID string, err error)                   {}
func (sm *StreamingManager) GetConnection(connID string) (*StreamConnection, bool) { return nil, false }
func (sm *StreamingManager) RecordMessage()                                        {}

type StreamConnection struct {
	ExpectedTotal  int
	TotalSent      int
	StartedAt      time.Time
	ReconnectToken string
}

// Validator stub
type Validator struct{}

func NewValidator() *Validator { return &Validator{} }

type ValidationResult struct {
	Valid     bool
	Score     float64
	Issues    []ValidationIssue
	Breakdown map[string]float64
}
type ValidationIssue struct{ Message string }

func (v *Validator) Validate(q Question) ValidationResult {
	return ValidationResult{Valid: true, Score: 1.0}
}

// RuleEngine stub
type RuleEngine struct{}

func NewRuleEngine() (*RuleEngine, error) { return &RuleEngine{}, nil }

type RuleResult struct {
	IsValid bool
	Issues  []ValidationIssue
}

func (re *RuleEngine) Validate(ctx context.Context, q Question) (RuleResult, error) {
	return RuleResult{IsValid: true}, nil
}

// Helper for fingerprint
func GenerateFingerprint(q Question) string {
	return q.Text + q.CorrectAnswer
}

func randomHex(n int) string {
	bytes := make([]byte, n)
	if _, err := cryptoRand.Read(bytes); err != nil {
		return "000000"
	}
	return hex.EncodeToString(bytes)
}
