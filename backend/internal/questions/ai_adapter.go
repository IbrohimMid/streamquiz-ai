package questions

import (
	"context"
	"encoding/json"
	"fmt"
	"streamquiz-backend/internal/service" // Import the existing service package which has LLM logic
	"strings"
)

type AIAdapter struct{}

func NewAIAdapter() *AIAdapter {
	return &AIAdapter{}
}

func (a *AIAdapter) GenerateQuestions(ctx context.Context, skillID, section string, count int) ([]Question, error) {
	// Call the generic GenerateQuiz from internal/service (which I might need to adjust or expose primitives)
	// Actually, internal/service/ai.go probably has 'GenerateQuiz' that returns a Quiz struct.
	// The prompt strategy logic I created in internal/service/prompts.go should be used here.

	// Since 'service.GenerateQuiz' is high level, I should probably expose a lower level 'GenerateQuestionsFromPrompt'
	// or just duplicate the LLM call logic here for cleaner separation.
	// For now, let's assume we can call service.GenerateContent(system, user) -> string.

	strategy := service.GetSkillStrategy(skillID)
	systemPrompt := strategy.SystemPrompt
	var formatInstructions string
	if section == "READING" {
		formatInstructions = "For reading comprehension, ensure the question relates to the passage."
	} else {
		formatInstructions = "For 'sentence_completion', use '____' (4 underscores) to denote the blank. For 'error_identification', enclose the 4 options in the sentence with {A}...{/A}, {B}...{/B}, {C}...{/C}, {D}...{/D}."
	}
	userPrompt := fmt.Sprintf("%s\n%s\nGenerate %d questions in JSON format. Output a JSON array of objects with keys: text, options (array of 4 objects with keys A, B, C, D), correctAnswer, explanation. Ensure there are exactly 4 options per question. The explanation field is REQUIRED and must explain why the correct answer is right and why others are wrong.", strategy.TaskPrompt, formatInstructions, count)

	// We need access to the LLM client.
	// Option 1: internal/service exposes a global client? No, bad practice.
	// Option 2: Instantiate a new LLM client here?
	// Let's assume we use the one from internal/service if exported, or just make a new simple request to OpenRouter.

	resp, err := service.QueryLLM(ctx, systemPrompt, userPrompt) // We need to make sure QueryLLM is exported or duplicate it
	if err != nil {
		return nil, err
	}

	// Flexible parsing to handle both Array and Map formats for Options
	type FlexibleOption struct {
		Key  string `json:"key"`
		Text string `json:"text"`
	}
	type FlexibleQuestion struct {
		Text          string      `json:"text"`
		Question      string      `json:"question"` // Alias
		PassageText   string      `json:"passageText,omitempty"`
		Options       interface{} `json:"options"` // Can be []FlexibleOption OR map[string]string
		CorrectAnswer string      `json:"correctAnswer"`
		Explanation   string      `json:"explanation"`
	}

	var rawQs []FlexibleQuestion

	// STRATEGY 1: Unmarshal as Array
	if err := json.Unmarshal([]byte(resp), &rawQs); err != nil {
		// STRATEGY 2: Unmarshal as Wrapper Object {"questions": [...]}
		var wrapper struct {
			Questions []FlexibleQuestion `json:"questions"`
		}
		if errWrap := json.Unmarshal([]byte(resp), &wrapper); errWrap == nil && len(wrapper.Questions) > 0 {
			rawQs = wrapper.Questions
		} else {
			// STRATEGY 3: Unmarshal as Object Map with Single Values (e.g., {"question1": {...}})
			// OR Object Map with ARRAY Values (e.g., {"sentence_completion": [...]})
			// We check for Array Values FIRST as that seems to be the current issue.
			var categoryMap map[string][]FlexibleQuestion
			if errCat := json.Unmarshal([]byte(resp), &categoryMap); errCat == nil && len(categoryMap) > 0 {
				for _, list := range categoryMap {
					rawQs = append(rawQs, list...)
				}
			} else {
				// Fallback to Single Value Map
				var rawMap map[string]FlexibleQuestion
				if errMap := json.Unmarshal([]byte(resp), &rawMap); errMap == nil && len(rawMap) > 0 {
					for _, v := range rawMap {
						rawQs = append(rawQs, v)
					}
				} else {
					// STRATEGY 4: NDJSON / Concatenated JSON Objects
					decoder := json.NewDecoder(strings.NewReader(resp))
					for decoder.More() {
						var single FlexibleQuestion
						if err := decoder.Decode(&single); err == nil {
							if single.Text != "" || single.Question != "" {
								rawQs = append(rawQs, single)
							}
						} else {
							break
						}
					}
				}
			}
		}
	}

	// Convert FlexibleQuestion to Question
	qs := make([]Question, 0, len(rawQs))
	for i, fq := range rawQs {
		text := fq.Text
		if text == "" {
			text = fq.Question
		}

		// DEBUG: Log first question details
		if i == 0 {
			fmt.Printf("DEBUG: First Question Parse. Text len: %d, Explanation: '%s'\n", len(text), fq.Explanation)
		}

		q := Question{
			Text:          text,
			CorrectAnswer: fq.CorrectAnswer,
			Explanation:   fq.Explanation,
			PassageText:   fq.PassageText,
		}

		if q.Explanation == "" {
			q.Explanation = "No detailed explanation provided by AI."
		}

		// Handle Options
		switch opts := fq.Options.(type) {
		case []interface{}: // JSON Array
			for _, item := range opts {
				if m, ok := item.(map[string]interface{}); ok {
					// Check for "key" and "text" fields
					key, _ := m["key"].(string)
					valText, _ := m["text"].(string)

					// If standard fields missing, check if it is {"A": "val"} format
					if key == "" || valText == "" {
						for k, v := range m {
							// checking against A, B, C, D keys
							upperK := strings.ToUpper(k)
							if upperK == "A" || upperK == "B" || upperK == "C" || upperK == "D" {
								key = upperK
								valText, _ = v.(string)
								break
							}
						}
					}

					// Checking aliases if still empty
					if key == "" {
						key, _ = m["label"].(string)
					}
					if valText == "" {
						valText, _ = m["value"].(string)
					}

					if key != "" || valText != "" {
						q.Options = append(q.Options, Option{Key: key, Text: valText})
					}
				}
			}
		case map[string]interface{}: // JSON Object {"A": "text", ...}
			// Enforce order A, B, C, D
			for _, k := range []string{"A", "B", "C", "D"} {
				if val, ok := opts[k]; ok {
					if text, ok := val.(string); ok {
						q.Options = append(q.Options, Option{Key: k, Text: text})
					}
				}
			}
		}
		qs = append(qs, q)
	}

	// Post-processing and Validation
	validQs := make([]Question, 0, len(qs))
	for _, q := range qs {
		// Basic check if unmarshal actually found data
		if q.Text != "" { // Allow 0 options initially to enter auto-repair
			// ...
			q.SkillID = skillID
			q.Section = section
			q.Source = "ai"

			// Auto-Detect Type based on content to prevent mismatches
			// If text has {A} markers, it IS error_identification
			if strings.Contains(q.Text, "{A}") && strings.Contains(q.Text, "{/A}") {
				q.Type = "error_identification"
			} else if strings.Contains(q.Text, "___") {
				// If text has underscores, it IS sentence_completion
				q.Type = "sentence_completion"
			}
			// Fallback: trust the AI's Type or default to sentence_completion
			if q.Type == "" {
				q.Type = "sentence_completion"
			}

			// Auto-Repair: Ensure 4 options
			requiredKeys := []string{"A", "B", "C", "D"}

			// 1. Normalize existing keys
			// Create a map of existing keys
			existing := make(map[string]bool)
			for j := range q.Options {
				// simple normalization: assume ordering matches A,B,C,D if keys are weird,
				// or just uppercase them.
				if j < 4 {
					// Force key based on index if weird or missing
					if q.Options[j].Key == "" || (q.Options[j].Key != "A" && q.Options[j].Key != "B" && q.Options[j].Key != "C" && q.Options[j].Key != "D") {
						q.Options[j].Key = requiredKeys[j]
					}
				}
				existing[q.Options[j].Key] = true
			}

			// 2. Fill missing options
			for _, key := range requiredKeys {
				if !existing[key] {
					q.Options = append(q.Options, Option{
						Key:  key,
						Text: "Answer not provided (Auto-repaired)",
					})
				}
			}

			// 3. Final validation of Option Text (Fix for "option has empty text")
			for i := range q.Options {
				if strings.TrimSpace(q.Options[i].Text) == "" {
					q.Options[i].Text = fmt.Sprintf("Option %s", q.Options[i].Key)
				}
			}

			// 3. Truncate if too many (rare)
			if len(q.Options) > 4 {
				q.Options = q.Options[:4]
			}

			// 4. Force placeholders for sentence_completion (Fix for missing underscores)
			if q.Type == "sentence_completion" && !strings.Contains(q.Text, "___") {
				q.Text = q.Text + " ____"
			}

			validQs = append(validQs, q)
		}
	}

	if len(validQs) == 0 {
		return nil, fmt.Errorf("AI response parsed but contained no valid questions. Raw: %s", resp)
	}

	return validQs, nil
}

func (a *AIAdapter) GenerateBulkQuestions(ctx context.Context, section string, count int, strategy map[string]int) ([]Question, error) {
	// Simple implementation: sequential calls
	var all []Question
	for skillID, num := range strategy {
		qs, err := a.GenerateQuestions(ctx, skillID, section, num)
		if err == nil {
			all = append(all, qs...)
		}
	}
	return all, nil
}

func (a *AIAdapter) StreamQuestions(ctx context.Context, skillID, section string, count int) (<-chan []Question, <-chan error) {
	out := make(chan []Question)
	errChan := make(chan error, 1)

	go func() {
		defer close(out)
		defer close(errChan)

		// For now, just non-streaming generation
		qs, err := a.GenerateQuestions(ctx, skillID, section, count)
		if err != nil {
			errChan <- err
			return
		}
		out <- qs
	}()
	return out, errChan
}
