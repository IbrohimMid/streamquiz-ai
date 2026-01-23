package questions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"streamquiz-backend/internal/database"
	"strings"
	"time"
)

type PgRepository struct{}

func NewPgRepository() *PgRepository {
	return &PgRepository{}
}

func (r *PgRepository) GetBySkill(ctx context.Context, skillID string, limit int, excludeUsed bool) ([]Question, error) {
	if skillID == "" {
		return nil, errors.New("skill_id required")
	}
	if limit <= 0 {
		limit = 20
	}

	// Query by skill_id - returns all question types for that skill
	query := `
        SELECT id, skill_id, section, question_text, options, correct_answer, source, passage_id, type, difficulty, quality_score, times_served, content_hash, is_verified, created_at
        FROM question_bank
        WHERE skill_id = $1
    `
	args := []any{skillID}

	if excludeUsed {
		query += ` AND used_at IS NULL`
	}

	query += ` ORDER BY RANDOM() LIMIT $2`
	args = append(args, limit)

	// DEBUG LOG
	fmt.Printf("GetBySkill Executing: skill='%s', limit=%d, excludeUsed=%v\n", skillID, limit, excludeUsed)

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		fmt.Printf("GetBySkill Query Error: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var qs []Question
	for rows.Next() {
		var q Question
		var optionsJSON []byte
		var passageID *string // Temporary pointer for nullable column

		err := rows.Scan(&q.ID, &q.SkillID, &q.Section, &q.Text, &optionsJSON, &q.CorrectAnswer, &q.Source, &passageID, &q.Type, &q.Difficulty, &q.QualityScore, &q.TimesServed, &q.ContentHash, &q.IsVerified, &q.CreatedAt)
		if err != nil {
			fmt.Printf("GetBySkill Scan Error: %v\n", err)
			continue
		}

		if passageID != nil {
			q.PassageID = *passageID
		}
		// ... (JSON parsing code)
		// We need to include the parsing code here or we break the loop logic if I just replace valid code with snippets.
		// Let's include the block.

		// Parse optionsMap from JSONB
		var optionsMap map[string]string
		if err := json.Unmarshal(optionsJSON, &optionsMap); err != nil {
			// Try array
			if err := json.Unmarshal(optionsJSON, &q.Options); err != nil {
				fmt.Printf("GetBySkill Options Parse Error: %v\n", err)
				continue
			}
		} else {
			q.Options = make([]Option, 0, 4)
			for _, k := range []string{"A", "B", "C", "D"} {
				if v, ok := optionsMap[k]; ok {
					q.Options = append(q.Options, Option{Key: k, Text: v})
				}
			}
		}
		qs = append(qs, q)
	}
	fmt.Printf("GetBySkill Found: %d questions\n", len(qs))
	return qs, nil
}

func (r *PgRepository) Save(ctx context.Context, q Question) (Question, error) {
	// ... (preamble)
	if q.ID == "" || q.SkillID == "" {
		return Question{}, errors.New("id and skill_id required")
	}

	// Convert options...
	optionsMap := make(map[string]string)
	for _, o := range q.Options {
		key := strings.ToUpper(strings.TrimSpace(o.Key))
		text := strings.TrimSpace(o.Text)
		if key == "" || text == "" {
			continue
		}
		optionsMap[key] = text
	}
	optionsBytes, err := json.Marshal(optionsMap)
	if err != nil {
		return Question{}, err
	}

	// Query definition...
	query := `
		INSERT INTO question_bank (
			id, skill_id, section, question_text, options, correct_answer, source, passage_id, type, difficulty, quality_score, times_served, content_hash, is_verified, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
		ON CONFLICT (id) DO UPDATE SET
			question_text = EXCLUDED.question_text,
			skill_id = EXCLUDED.skill_id,
            -- ... (rest of update)
			section = EXCLUDED.section,
			options = EXCLUDED.options,
			correct_answer = EXCLUDED.correct_answer,
			source = EXCLUDED.source,
			passage_id = EXCLUDED.passage_id,
			type = EXCLUDED.type,
			difficulty = EXCLUDED.difficulty,
			quality_score = EXCLUDED.quality_score,
			times_served = EXCLUDED.times_served,
			content_hash = EXCLUDED.content_hash,
			is_verified = EXCLUDED.is_verified,
			updated_at = NOW()
	`

	if q.CreatedAt.IsZero() {
		q.CreatedAt = time.Now()
	}

	var passageID *string
	if q.PassageID != "" {
		passageID = &q.PassageID
	}

	tag, err := database.Pool.Exec(ctx, query, q.ID, q.SkillID, q.Section, q.Text, optionsBytes, q.CorrectAnswer, q.Source, passageID, q.Type, q.Difficulty, q.QualityScore, q.TimesServed, q.ContentHash, q.IsVerified, q.CreatedAt)
	if err != nil {
		fmt.Printf("Save Error: %v\n", err)
		return Question{}, err
	}
	fmt.Printf("Save Success: %v rows affected. ID: %s, Skill: %s\n", tag.RowsAffected(), q.ID, q.SkillID)
	return q, nil
}

func (r *PgRepository) SavePassage(ctx context.Context, p Passage) error {
	if p.ID == "" || p.Text == "" {
		return errors.New("passage id and text required")
	}
	query := `INSERT INTO passages (id, text, topic, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`
	_, err := database.Pool.Exec(ctx, query, p.ID, p.Text, p.Topic, p.CreatedAt)
	return err
}

func (r *PgRepository) GetPassages(ctx context.Context, skillID string, maxPassages int) ([]map[string]any, error) {
	return nil, nil // Not implemented yet
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
