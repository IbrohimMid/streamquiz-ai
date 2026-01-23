package questions

import (
	"context"
	"encoding/json"
	"streamquiz-backend/internal/database"
	"time"
)

type PgRepository struct{}

func NewPgRepository() *PgRepository {
	return &PgRepository{}
}

func (r *PgRepository) GetBySkill(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, error) {
	query := `SELECT id, skill_id, section, question_type, text, options, correct_answer, explanation, source, difficulty, created_at 
	          FROM questions WHERE skill_id = $1`

	// Note: excludeUsed logic would typically require a join with user_history.
	// For now, we just fetch by skill and limit.
	query += ` ORDER BY RANDOM() LIMIT $2`

	rows, err := database.Pool.Query(ctx, query, skillID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var qs []Question
	for rows.Next() {
		var q Question
		var optionsJSON []byte
		err := rows.Scan(&q.ID, &q.SkillID, &q.Section, &q.Type, &q.Text, &optionsJSON, &q.CorrectAnswer, &q.Explanation, &q.Source, &q.Difficulty, &q.CreatedAt)
		if err != nil {
			continue
		}
		json.Unmarshal(optionsJSON, &q.Options)
		qs = append(qs, q)
	}
	return qs, nil
}

func (r *PgRepository) Save(ctx context.Context, q Question) (Question, error) {
	optionsJSON, _ := json.Marshal(q.Options)
	query := `INSERT INTO questions (id, skill_id, section, question_type, text, options, correct_answer, explanation, source, difficulty, created_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			  ON CONFLICT (id) DO NOTHING`

	if q.CreatedAt.IsZero() {
		q.CreatedAt = time.Now() // Need time package import if passing valid time, or let DB default?
		// Since we pass it, we should set it. But the SQL has NOW() default if we exclude it.
		// Let's pass it.
	}

	_, err := database.Pool.Exec(ctx, query, q.ID, q.SkillID, q.Section, q.Type, q.Text, optionsJSON, q.CorrectAnswer, q.Explanation, q.Source, q.Difficulty, q.CreatedAt)
	if err != nil {
		return Question{}, err
	}
	return q, nil
}

func (r *PgRepository) GetPassages(ctx context.Context, skillID string, maxPassages int) ([]map[string]any, error) {
	return nil, nil // Not implemented
}

func (r *PgRepository) MarkUsed(ctx context.Context, ids []string) error {
	return nil // No-op for global mark used currently
}

func (r *PgRepository) MarkUsedByUser(ctx context.Context, userID string, ids []string) error {
	// Need a user_question_history table
	return nil
}

func (r *PgRepository) GetUsedByUser(ctx context.Context, userID, skillID string) (map[string]bool, error) {
	return make(map[string]bool), nil
}

func (r *PgRepository) FindSimilar(ctx context.Context, q Question, limit int, embedding []float32) ([]Question, error) {
	return nil, nil
}
