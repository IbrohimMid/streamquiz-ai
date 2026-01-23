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
		// Sentences with One Clause
		"S01": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question where the subject or verb is missing. The sentence MUST be long (15-25 words), complex, and academic in tone. Ensure the sentence has only one main clause but may have complex phrases.",
		},
		"S02": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Objects of Prepositions. The sentence MUST be long (15-25 words), complex, and academic. Example: 'To the north of the island, separated by a narrow channel, ___ the massive rock formation.'",
		},
		"S03": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Appositives. An appositive is a noun phrase that explains another noun. Ensure the appositive or the subject is missing.",
		},
		"S04": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Present Participles. Test the confusion between parts of the verb and adjectives (-ing forms).",
		},
		"S05": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Past Participles. Test the confusion between parts of the verb and adjectives (-ed/irregular forms).",
		},

		// Sentences with Multiple Clauses
		"S06": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Coordinate Connectors (and, but, or, so, yet). Ensure the sentence creates a compound sentence structure.",
		},
		"S07": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Adverb Time and Cause Connectors (because, after, before, when, etc.). Ensure correct placement of the connector.",
		},
		"S08": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving other Adverb Connectors. Ensure the connector correctly links a dependent clause to an independent clause.",
		},
		"S09": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Noun Clause Connectors (what, when, where, why, how). Ensure the clause functions as a noun.",
		},
		"S10": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Noun Clause Subjects. The noun clause itself should serve as the subject of the sentence.",
		},
		"S11": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Adjective Clause Connectors (who, which, that). Ensure the clause describes a noun.",
		},
		"S12": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Adjective Clause Subjects. The connector must also function as the subject of the clause.",
		},

		// Reduced Clauses & Inversion
		"S13": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Reduced Adjective Clauses. The relative pronoun and 'be' verb should be omitted.",
		},
		"S14": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question involving Reduced Adverb Clauses. The subject and 'be' verb should be omitted in the dependent clause.",
		},
		"S15": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question requiring Subject-Verb Inversion with Question Words (what, where, etc.) used in specific contexts.",
		},
		"S16": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question requiring Subject-Verb Inversion with Place Expressions (e.g., 'Here is...', 'In the closet are...').",
		},
		"S17": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question requiring Subject-Verb Inversion with Negative Expressions (e.g., 'Rarely', 'Never', 'Not only'). Example: 'Rarely have I seen...'",
		},
		"S18": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question requiring Subject-Verb Inversion with Conditionals (omitting 'if'). Example: 'Had he known...'",
		},
		"S19": {
			SystemPrompt: "You are a TOEFL Structure expert. Generate difficult, academic-level questions.",
			TaskPrompt:   "Create a 'Sentence Completion' question requiring Subject-Verb Inversion with Comparisons (e.g., '...and neither did she').",
		},

		// Subject-Verb Agreement
		"S20": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Subject-Verb Agreement after Prepositional Phrases. The subject and verb should be separated by a prepositional phrase to cause confusion.",
		},
		"S21": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Subject-Verb Agreement with Expressions of Quantity (e.g., 'all of', 'some of').",
		},
		"S22": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Inverted Subject-Verb Agreement. The verb comes before the subject, and they must agree.",
		},
		"S23": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Subject-Verb Agreement with Certain Words (e.g., 'everybody', 'each'). These take singular verbs.",
		},

		// Parallel Structure
		"S24": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Parallel Structure with Coordinate Conjunctions (and, but, or). Items in the list must be the same grammatical form.",
		},
		"S25": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Parallel Structure with Paired Conjunctions (both...and, either...or, neither...nor, not only...but also).",
		},
		"S26": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Parallel Structure with Comparisons. The items being compared must be grammatically parallel.",
		},

		// Comparatives & Superlatives
		"S27": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing the Form of Comparatives and Superlatives (e.g., '-er' vs 'more').",
		},
		"S28": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing the Use of Comparatives and Superlatives. Use comparative for two items, superlative for three or more.",
		},
		"S29": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing the Irregular -er, -er Structure (e.g., 'The harder he tried, the farther he fell').",
		},

		// Problems with Verbs
		"S30": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing 'Have + Participle'. Ensure 'have' is followed by a past participle.",
		},
		"S31": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing 'Be + Participle'. 'Be' can be followed by present participle (active) or past participle (passive).",
		},
		"S32": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Modals. Modals (will, can, may, etc.) must be followed by the base form of the verb.",
		},
		"S33": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Verb Tense Sequencing (Past with Present).",
		},
		"S34": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing 'Have' and 'Had'. Ensure correct use of Present Perfect and Past Perfect tenses.",
		},
		"S35": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Time Expressions. Specific time words require specific tenses.",
		},
		"S36": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing 'Will' and 'Would'. 'Would' is used in past contexts or conditionals.",
		},

		// Passive Voice
		"S37": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing the form of the Passive Voice (be + past participle).",
		},
		"S38": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Active vs Passive meaning. Valid grammar but incorrect voice for the context.",
		},

		// Nouns
		"S39": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Singular vs Plural Nouns. Look for keywords like 'each', 'every', 'many', 'several'.",
		},
		"S40": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Countable vs Uncountable Nouns. E.g., 'much' vs 'many', 'amount' vs 'number'.",
		},
		"S41": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Irregular Plurals (e.g., 'child/children', 'person/people', 'datum/data').",
		},
		"S42": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Person vs Thing nouns (e.g., 'authority' vs 'author').",
		},

		// Pronouns
		"S43": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Subject vs Object Pronouns.",
		},
		"S44": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Possessive Adjectives vs Pronouns.",
		},
		"S45": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Pronoun Reference. The pronoun must clearly and correctly refer to an antecedent.",
		},

		// Adj/Adv
		"S46": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Basic Adjectives and Adverbs usage.",
		},
		"S47": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Adjectives after Linking Verbs (be, seem, look, smell, taste, etc.).",
		},
		"S48": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Placement of Adjectives and Adverbs.",
		},
		"S49": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing -ly Adjectives (e.g., friendly, costly) which are adjectives, not adverbs.",
		},
		"S50": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Predicate Adjectives (adjectives that follow 'be' and describe the subject).",
		},
		"S51": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing -ed vs -ing Adjectives (e.g., 'boring' vs 'bored').",
		},

		// Articles
		"S52": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Articles with Singular Nouns. A singular countable noun must have an article or determiner.",
		},
		"S53": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing 'A' vs 'An'. Check the sound of the following word.",
		},
		"S54": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Article Agreement with nouns.",
		},
		"S55": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Specific vs General ideas (usage of 'the').",
		},

		// Prepositions
		"S56": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Incorrect Prepositions (idiomatic usage).",
		},
		"S57": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing Omitted Prepositions where one is required.",
		},

		// Usage
		"S58": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing usage of 'Make' vs 'Do'.",
		},
		"S59": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing usage of 'Like', 'Alike', 'Unlike', 'Dislike'.",
		},
		"S60": {
			SystemPrompt: "You are a TOEFL Written Expression expert. Generate difficult Error Identification questions.",
			TaskPrompt:   "Create an 'Error Identification' question testing usage of 'Other', 'Another', 'Others'.",
		},

		// --- LISTENING ---
		"L01": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on the Last Line key strategy. The answer is often inferred from the second speaker's response.",
		},
		"L02": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Synonyms. The correct answer should use synonyms for keywords in the dialogue.",
		},
		"L03": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Avoiding Similar Sounds. The distractors should sound similar to words in the dialogue but have different meanings.",
		},
		"L04": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question requiring conclusions about Who, What, or Where.",
		},
		"L05": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question involving Passive Voice statements.",
		},
		"L06": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question involving Multiple Nouns. Identifying who does what is key.",
		},
		"L07": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Negative Expressions.",
		},
		"L08": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Double Negative Expressions.",
		},
		"L09": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on 'Almost' Negative Expressions.",
		},
		"L10": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Negatives with Comparatives.",
		},
		"L11": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Expressions of Agreement (e.g., 'So do I', 'I'll say').",
		},
		"L12": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Expressions of Uncertainty and Suggestion.",
		},
		"L13": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Emphatic Expressions of Surprise.",
		},
		"L14": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Wishes. Implies the opposite of reality.",
		},
		"L15": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Untrue Conditions.",
		},
		"L16": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Two- and Three-Part Verbs (Phrasal Verbs).",
		},
		"L17": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a short conversation script.",
			TaskPrompt:   "Create a Short Conversation question focusing on Idioms.",
		},
		"L18": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Basic Comprehension (Main Idea).",
		},
		"L19": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Basic Comprehension (Specific Details).",
		},
		"L20": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Pragmatic Understanding (Purpose).",
		},
		"L21": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Pragmatic Understanding (Tone/Attitude).",
		},
		"L22": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Connecting Information (Organization).",
		},
		"L23": {
			SystemPrompt: "You are a TOEFL Listening expert. Generate a long conversation script topic.",
			TaskPrompt:   "Create a Long Conversation/Lecture question focusing on Connecting Information (Relationships/Inference).",
		},

		// --- READING ---
		"R01": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on Main Idea. The question asks for the primary topic of the passage.",
		},
		"R02": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on Stated Details. The answer is explicitly stated in the text.",
		},
		"R03": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on Unstated Details. Start with 'Which of the following is NOT...'.",
		},
		"R04": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on Implied Details. The answer must be inferred.",
		},
		"R05": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on Vocabulary in Context. Ask for the meaning of a specific word as used in the passage.",
		},
		"R06": {
			SystemPrompt: "You are a TOEFL Reading expert. Generate an academic passage.",
			TaskPrompt:   "Create a Reading Comprehension passage and question focusing on 'Where' questions. Ask where specific information is located.",
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
