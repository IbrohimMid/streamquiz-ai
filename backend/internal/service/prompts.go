package service

import "fmt"

// SkillStrategy defines how to generate content for a specific skill
type SkillStrategy struct {
	SystemPrompt string
	TaskPrompt   string
}

// GetSkillStrategy returns the prompt strategy for a given skill ID
func GetSkillStrategy(skillID string) SkillStrategy {
	// Default Strategy
	defaultStrategy := SkillStrategy{
		SystemPrompt: "You are a TOEFL expert. Generate high-quality TOEFL questions.",
		TaskPrompt:   fmt.Sprintf("Create a TOEFL question for skill %s.", skillID),
	}

	strategies := map[string]SkillStrategy{
		// --- STRUCTURE ---
		"S01": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question where the subject or verb is missing. The sentence MUST be long (15-25 words), complex, and academic in tone. Ensure the sentence has only one main clause but may have complex phrases.",
		},
		"S02": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Objects of Prepositions. The sentence MUST be long (15-25 words), complex, and academic. Example: 'To the north of the island, separated by a narrow channel, ___ the massive rock formation.'",
		},
	}

	if strategy, exists := strategies[skillID]; exists {
		return strategy
	}

	// Fallback Categories based on ID prefix
	if len(skillID) >= 3 {
		prefix := skillID[:1]
		switch prefix {
		case "S":
			return SkillStrategy{
				SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
				TaskPrompt:   fmt.Sprintf("Create a difficult TOEFL Structure question testing skill %s. The sentence MUST be long (15-25 words), complex, and academic. Do not create short or simple sentences.", skillID),
			}
		case "L":
			return SkillStrategy{
				SystemPrompt: "You are a TOEFL Listening expert.",
				TaskPrompt:   fmt.Sprintf("Create a TOEFL Listening script and question for skill %s. Include a short dialogue script.", skillID),
			}
		case "R":
			return SkillStrategy{
				SystemPrompt: "You are a TOEFL Reading expert.",
				TaskPrompt:   fmt.Sprintf("Create a TOEFL Reading passage (short) and question for skill %s.", skillID),
			}
		}
	}

	return defaultStrategy
}
