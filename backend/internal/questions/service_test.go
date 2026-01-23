package questions

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock Repository
type MockRepo struct {
	mock.Mock
}

func (m *MockRepo) GetBySkill(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, error) {
	args := m.Called(ctx, skillID, limit, excludeUsed)
	return args.Get(0).([]Question), args.Error(1)
}
func (m *MockRepo) GetPassages(ctx context.Context, skillID string, maxPassages int) ([]map[string]any, error) {
	args := m.Called(ctx, skillID, maxPassages)
	return args.Get(0).([]map[string]any), args.Error(1)
}
func (m *MockRepo) Save(ctx context.Context, q Question) (Question, error) {
	args := m.Called(ctx, q)
	return args.Get(0).(Question), args.Error(1)
}
func (m *MockRepo) SavePassage(ctx context.Context, p Passage) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}
func (m *MockRepo) MarkUsed(ctx context.Context, ids []string) error {
	args := m.Called(ctx, ids)
	return args.Error(0)
}
func (m *MockRepo) MarkUsedByUser(ctx context.Context, userID string, ids []string) error {
	args := m.Called(ctx, userID, ids)
	return args.Error(0)
}
func (m *MockRepo) GetUsedByUser(ctx context.Context, userID, skillID string) (map[string]bool, error) {
	args := m.Called(ctx, userID, skillID)
	return args.Get(0).(map[string]bool), args.Error(1)
}
func (m *MockRepo) FindSimilar(ctx context.Context, q Question, limit int, embedding []float32) ([]Question, error) {
	args := m.Called(ctx, q, limit, embedding)
	return args.Get(0).([]Question), args.Error(1)
}

func TestService_Save_Validation(t *testing.T) {
	repo := new(MockRepo)
	svc := NewService(repo, nil, HybridStrategy{}, nil, nil, nil, nil)

	// Invalid Shape (Sentence Completion without blank)
	q1 := Question{ID: "1", SkillID: "s1", Type: "SENTENCE_COMPLETION", Text: "Hello world", CorrectAnswer: "A", Options: []Option{{Key: "A", Text: "A"}, {Key: "B", Text: "B"}, {Key: "C", Text: "C"}, {Key: "D", Text: "D"}}}
	_, err := svc.Save(context.Background(), q1)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "must contain '___'")

	// Valid Shape
	q2 := Question{ID: "2", SkillID: "s1", Type: "SENTENCE_COMPLETION", Text: "Hello ___ world", CorrectAnswer: "A", Options: []Option{{Key: "A", Text: "A"}, {Key: "B", Text: "B"}, {Key: "C", Text: "C"}, {Key: "D", Text: "D"}}}
	repo.On("Save", mock.Anything, mock.Anything).Return(q2, nil)

	saved, err := svc.Save(context.Background(), q2)
	assert.NoError(t, err)
	assert.Equal(t, "2", saved.ID)
}

type MockAIService struct {
	mock.Mock
}

func (m *MockAIService) GenerateQuestions(ctx context.Context, skillID, section string, count int) ([]Question, error) {
	args := m.Called(ctx, skillID, section, count)
	return args.Get(0).([]Question), args.Error(1)
}
func (m *MockAIService) GenerateBulkQuestions(ctx context.Context, section string, count int, strategy map[string]int) ([]Question, error) {
	return nil, nil
}
func (m *MockAIService) StreamQuestions(ctx context.Context, skillID, section string, count int) (<-chan []Question, <-chan error) {
	return nil, nil
}

func TestService_Replenish_Passage(t *testing.T) {
	repo := new(MockRepo)
	ai := new(MockAIService)
	svc := NewService(repo, nil, HybridStrategy{}, ai, nil, nil, nil)

	// Mock AI Response with PassageText
	qs := []Question{
		{
			ID:            "ai-q1",
			Text:          "Q1 based on passage",
			PassageText:   "This is a reading passage.",
			Options:       []Option{{Key: "A", Text: "A"}, {Key: "B", Text: "B"}, {Key: "C", Text: "C"}, {Key: "D", Text: "D"}},
			CorrectAnswer: "A",
			Type:          "MAIN_IDEA",
		},
	}

	ai.On("GenerateQuestions", mock.Anything, "read_01", "READING", 1).Return(qs, nil)
	repo.On("SavePassage", mock.Anything, mock.MatchedBy(func(p Passage) bool {
		return p.Text == "This is a reading passage."
	})).Return(nil)
	repo.On("Save", mock.Anything, mock.MatchedBy(func(q Question) bool {
		return q.PassageText == "" && q.PassageID != "" // Verified it was cleared and ID set
	})).Return(qs[0], nil)

	_, err := svc.Replenish(context.Background(), "read_01", "READING", 1)
	assert.NoError(t, err)
	repo.AssertExpectations(t)
}
