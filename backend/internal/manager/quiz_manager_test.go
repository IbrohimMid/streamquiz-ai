package manager

import (
	"context"
	"testing"
	"time"

	"streamquiz-backend/internal/service"
)

type MockGenerator struct{}

func (m *MockGenerator) GenerateQuiz(topic, section string) (*service.QuizResponse, error) {
	return &service.QuizResponse{
		Text: "Mock Question",
	}, nil
}

func TestQuizManager_StartSession(t *testing.T) {
	m := NewQuizManager(&MockGenerator{})

	// We might need to mock or just test the structure creation since we can't easily mock the static GenerateQuiz
	sessionId := m.StartSession(context.Background(), "TOEFL", "Reading", 2)

	if sessionId == "" {
		t.Error("Expected non-empty session ID")
	}

	_, total, exists := m.GetSessionStatus(sessionId)
	if !exists {
		t.Error("Session should exist")
	}
	if total != 2 {
		t.Errorf("Expected total 2, got %d", total)
	}

	// Wait a bit for async generation
	time.Sleep(100 * time.Millisecond)

	q1 := m.GetNextQuiz(sessionId)
	if q1 == nil {
		t.Error("Expected quiz 1")
	}
	q2 := m.GetNextQuiz(sessionId)
	if q2 == nil {
		t.Error("Expected quiz 2")
	}
	q3 := m.GetNextQuiz(sessionId)
	if q3 != nil {
		t.Error("Expected nil for quiz 3 (end of session)")
	}
}

func TestQuizManager_GetNextQuiz_NotFound(t *testing.T) {
	m := NewQuizManager(&MockGenerator{})
	q := m.GetNextQuiz("non-existent")
	if q != nil {
		t.Error("Expected nil for non-existent session")
	}
}
