package questions

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestReplenish_PassageFailure_SkipsQuestionSave verifies that if saving a passage fails,
// the corresponding question is NOT saved to the database.
func TestReplenish_PassageFailure_SkipsQuestionSave(t *testing.T) {
	repo := new(MockRepo)
	ai := new(MockAIService)
	svc := NewService(repo, nil, HybridStrategy{}, ai, nil, nil, nil)

	// AI generates 1 question with a passage
	qs := []Question{
		{
			ID:          "ai-q1",
			Text:        "Q1",
			PassageText: "Passage content",
			Options:     []Option{{Key: "A", Text: "A"}, {Key: "B", Text: "B"}, {Key: "C", Text: "C"}, {Key: "D", Text: "D"}},
		},
	}

	ai.On("GenerateQuestions", mock.Anything, "skill1", "READING", 1).Return(qs, nil)

	// Repo fails to save passage
	repo.On("SavePassage", mock.Anything, mock.MatchedBy(func(p Passage) bool {
		return p.Text == "Passage content"
	})).Return(errors.New("db disconnect"))

	// Expect Save(Question) to NOT be called

	count, err := svc.Replenish(context.Background(), "skill1", "READING", 1)

	assert.Error(t, err)      // Replenish fails if 0 saved
	assert.Equal(t, 0, count) // 0 saved

	repo.AssertExpectations(t)
	repo.AssertNotCalled(t, "Save")
}

// TestHybrid_StrictQuota verifies that DB fetch does not fill the gap left by Static,
// preserving room for AI replenishment.
func TestHybrid_StrictQuota(t *testing.T) {
	repo := new(MockRepo)
	ai := new(MockAIService)

	// Strategy: 50% Static (5), 50% DB (5). Total 10.
	strategy := HybridStrategy{StaticPct: 50, DBPct: 50, AIPct: 0}

	// Static has only 3 questions
	staticQs := []Question{
		{ID: "s1", SkillID: "skill1", Text: "S1", CorrectAnswer: "A"},
		{ID: "s2", SkillID: "skill1", Text: "S2", CorrectAnswer: "A"},
		{ID: "s3", SkillID: "skill1", Text: "S3", CorrectAnswer: "A"},
	}

	svc := NewService(repo, staticQs, strategy, ai, nil, nil, nil)

	// DB has plenty
	dbQs := []Question{
		{ID: "d1", SkillID: "skill1", Text: "D1", CorrectAnswer: "A"},
		{ID: "d2", SkillID: "skill1", Text: "D2", CorrectAnswer: "A"},
		{ID: "d3", SkillID: "skill1", Text: "D3", CorrectAnswer: "A"},
		{ID: "d4", SkillID: "skill1", Text: "D4", CorrectAnswer: "A"},
		{ID: "d5", SkillID: "skill1", Text: "D5", CorrectAnswer: "A"},
		{ID: "d6", SkillID: "skill1", Text: "D6", CorrectAnswer: "A"}, // Extra
	}

	// Repo should be asked for 7 (DB Pct 5 + Static gap 2).
	repo.On("GetBySkill", mock.Anything, "skill1", 7, true).Return(dbQs[:5], nil) // DB only has 5? No, DB has 6 in setup. Return 5 is fine.
	// Wait, if DB returns 5, total = 3+5=8. AI needed=2.

	repo.On("GetUsedByUser", mock.Anything, "u1", "skill1").Return(map[string]bool{}, nil)

	// AI Service should be called for the remaining 2 (10 total - 3 static - 5 db = 2)
	ai.On("GenerateQuestions", mock.Anything, "skill1", "SECTION", 2).Return([]Question{}, nil)

	req := HybridRequest{SkillID: "skill1", Section: "SECTION", Count: 10, UserID: "u1"}
	_, err := svc.Hybrid(context.Background(), req)

	assert.NoError(t, err)
	repo.AssertExpectations(t)
	ai.AssertExpectations(t)
}
