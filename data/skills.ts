import { Skill } from '../types';

export const TOEFL_STRUCTURE_SKILLS: Skill[] = [
  // A. Sentences with One Clause
  { id: 'S01', name: 'Skill 1: Subjects and Verbs', description: 'Ensure every sentence has a subject and a verb.', category: 'A. Sentences with One Clause', part: 'Structure' },
  { id: 'S02', name: 'Skill 2: Objects of Prepositions', description: 'Be careful of objects of prepositions.', category: 'A. Sentences with One Clause', part: 'Structure' },
  { id: 'S03', name: 'Skill 3: Appositives', description: 'Be careful of appositives.', category: 'A. Sentences with One Clause', part: 'Structure' },
  { id: 'S04', name: 'Skill 4: Present Participles', description: 'Be careful of present participles.', category: 'A. Sentences with One Clause', part: 'Structure' },
  { id: 'S05', name: 'Skill 5: Past Participles', description: 'Be careful of past participles.', category: 'A. Sentences with One Clause', part: 'Structure' },

  // B. Sentences with Multiple Clauses
  { id: 'S06', name: 'Skill 6: Coordinate Connectors', description: 'Use coordinate connectors strictly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S07', name: 'Skill 7: Adv. Time/Cause Connectors', description: 'Use adverb time and cause connectors correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S08', name: 'Skill 8: Other Adverb Connectors', description: 'Use other adverb connectors correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S09', name: 'Skill 9: Noun Clause Connectors', description: 'Use noun clause connectors correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S10', name: 'Skill 10: Noun Clause Subjects', description: 'Use noun clause connector/subjects correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S11', name: 'Skill 11: Adj. Clause Connectors', description: 'Use adjective clause connectors correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },
  { id: 'S12', name: 'Skill 12: Adj. Clause Subjects', description: 'Use adjective clause connector/subjects correctly.', category: 'B. Sentences with Multiple Clauses', part: 'Structure' },

  // C. Reduced Clauses & Inversion
  { id: 'S13', name: 'Skill 13: Reduced Adj. Clauses', description: 'Use reduced adjective clauses correctly.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S14', name: 'Skill 14: Reduced Adv. Clauses', description: 'Use reduced adverb clauses correctly.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S15', name: 'Skill 15: Invert with Question Words', description: 'Invert the subject and verb with question words.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S16', name: 'Skill 16: Invert with Place Expressions', description: 'Invert the subject and verb with place expressions.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S17', name: 'Skill 17: Invert with Negatives', description: 'Invert the subject and verb with negatives.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S18', name: 'Skill 18: Invert with Conditionals', description: 'Invert the subject and verb with conditionals.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },
  { id: 'S19', name: 'Skill 19: Invert with Comparisons', description: 'Invert the subject and verb with comparisons.', category: 'C. Reduced Clauses & Inversion', part: 'Structure' },

  // D. Subject-Verb Agreement
  { id: 'S20', name: 'Skill 20: SV Agreement (Prepositions)', description: 'Make verbs agree after prepositional phrases.', category: 'D. Written Expression (SV Agreement)', part: 'Written Expression' },
  { id: 'S21', name: 'Skill 21: SV Agreement (Quantities)', description: 'Make verbs agree after expressions of quantity.', category: 'D. Written Expression (SV Agreement)', part: 'Written Expression' },
  { id: 'S22', name: 'Skill 22: Inverted Verb Agreement', description: 'Make inverted verbs agree.', category: 'D. Written Expression (SV Agreement)', part: 'Written Expression' },
  { id: 'S23', name: 'Skill 23: SV Agreement (Certain Words)', description: 'Make verbs agree after certain words.', category: 'D. Written Expression (SV Agreement)', part: 'Written Expression' },

  // E. Parallel Structure
  { id: 'S24', name: 'Skill 24: Parallel (Coordinate)', description: 'Use parallel structure with coordinate conjunctions.', category: 'E. Written Expression (Parallel)', part: 'Written Expression' },
  { id: 'S25', name: 'Skill 25: Parallel (Paired)', description: 'Use parallel structure with paired conjunctions.', category: 'E. Written Expression (Parallel)', part: 'Written Expression' },
  { id: 'S26', name: 'Skill 26: Parallel (Comparisons)', description: 'Use parallel structure with comparisons.', category: 'E. Written Expression (Parallel)', part: 'Written Expression' },

  // F. Comparatives & Superlatives
  { id: 'S27', name: 'Skill 27: Form of Comparatives', description: 'Form comparatives and superlatives correctly.', category: 'F. Written Expression (Comparisons)', part: 'Written Expression' },
  { id: 'S28', name: 'Skill 28: Use of Comparatives', description: 'Use comparatives and superlatives correctly.', category: 'F. Written Expression (Comparisons)', part: 'Written Expression' },
  { id: 'S29', name: 'Skill 29: Irregular Structure', description: 'Use the irregular -er, -er structure.', category: 'F. Written Expression (Comparisons)', part: 'Written Expression' },

  // G. Problems with Verbs
  { id: 'S30', name: 'Skill 30: Have + Participle', description: 'After have, use the past participle.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S31', name: 'Skill 31: Be + Participle', description: 'After be, use the present or past participle.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S32', name: 'Skill 32: Modals + Base Form', description: 'After will, would, or other modals, use the base form.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S33', name: 'Skill 33: Past with Present', description: 'Know when to use the past with the present.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S34', name: 'Skill 34: Have and Had', description: 'Use have and had correctly.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S35', name: 'Skill 35: Time Expressions', description: 'Use the correct tense with time expressions.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },
  { id: 'S36', name: 'Skill 36: Will and Would', description: 'Use the correct tense with will and would.', category: 'G. Written Expression (Verbs)', part: 'Written Expression' },

  // H. Passive Voice
  { id: 'S37', name: 'Skill 37: Passive Form', description: 'Use the correct form of the passive.', category: 'H. Written Expression (Passive)', part: 'Written Expression' },
  { id: 'S38', name: 'Skill 38: Active vs Passive', description: 'Recognize active and passive meanings.', category: 'H. Written Expression (Passive)', part: 'Written Expression' },

  // I. Nouns
  { id: 'S39', name: 'Skill 39: Singular/Plural Nouns', description: 'Use the correct singular or plural noun.', category: 'I. Written Expression (Nouns)', part: 'Written Expression' },
  { id: 'S40', name: 'Skill 40: Countable/Uncountable', description: 'Distinguish countable and uncountable nouns.', category: 'I. Written Expression (Nouns)', part: 'Written Expression' },
  { id: 'S41', name: 'Skill 41: Irregular Plurals', description: 'Recognize irregular plurals of nouns.', category: 'I. Written Expression (Nouns)', part: 'Written Expression' },
  { id: 'S42', name: 'Skill 42: Person vs Thing', description: 'Distinguish the person from the thing.', category: 'I. Written Expression (Nouns)', part: 'Written Expression' },

  // J. Pronouns
  { id: 'S43', name: 'Skill 43: Subject/Object Pronouns', description: 'Distinguish subject and object pronouns.', category: 'J. Written Expression (Pronouns)', part: 'Written Expression' },
  { id: 'S44', name: 'Skill 44: Possessives', description: 'Distinguish possessive adjectives and pronouns.', category: 'J. Written Expression (Pronouns)', part: 'Written Expression' },
  { id: 'S45', name: 'Skill 45: Pronoun Reference', description: 'Check pronoun reference for agreement.', category: 'J. Written Expression (Pronouns)', part: 'Written Expression' },

  // K. Adj/Adv
  { id: 'S46', name: 'Skill 46: Basic Adj/Adv', description: 'Use basic adjectives and adverbs correctly.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },
  { id: 'S47', name: 'Skill 47: Adj after Linking Verbs', description: 'Use adjectives after linking verbs.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },
  { id: 'S48', name: 'Skill 48: Placement', description: 'Position adjectives and adverbs correctly.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },
  { id: 'S49', name: 'Skill 49: -ly Adjectives', description: 'Recognize -ly adjectives.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },
  { id: 'S50', name: 'Skill 50: Predicate Adjectives', description: 'Use predicate adjectives correctly.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },
  { id: 'S51', name: 'Skill 51: -ed/-ing Adjectives', description: 'Use -ed and -ing adjectives correctly.', category: 'K. Written Expression (Adj/Adv)', part: 'Written Expression' },

  // L. Articles
  { id: 'S52', name: 'Skill 52: Singular Noun Articles', description: 'Use articles with singular nouns.', category: 'L. Written Expression (Articles)', part: 'Written Expression' },
  { id: 'S53', name: 'Skill 53: A and An', description: 'Distinguish a and an.', category: 'L. Written Expression (Articles)', part: 'Written Expression' },
  { id: 'S54', name: 'Skill 54: Article Agreement', description: 'Make articles agree with nouns.', category: 'L. Written Expression (Articles)', part: 'Written Expression' },
  { id: 'S55', name: 'Skill 55: Specific/General', description: 'Distinguish specific and general ideas.', category: 'L. Written Expression (Articles)', part: 'Written Expression' },

  // M. Prepositions
  { id: 'S56', name: 'Skill 56: Incorrect Prepositions', description: 'Recognize incorrect prepositions.', category: 'M. Written Expression (Prepositions)', part: 'Written Expression' },
  { id: 'S57', name: 'Skill 57: Omitted Prepositions', description: 'Recognize when prepositions have been omitted.', category: 'M. Written Expression (Prepositions)', part: 'Written Expression' },

  // N. Usage
  { id: 'S58', name: 'Skill 58: Make and Do', description: 'Distinguish make and do.', category: 'N. Written Expression (Usage)', part: 'Written Expression' },
  { id: 'S59', name: 'Skill 59: Like, Alike, Unlike', description: 'Distinguish like, alike, unlike, and dislike.', category: 'N. Written Expression (Usage)', part: 'Written Expression' },
  { id: 'S60', name: 'Skill 60: Other, Another, Others', description: 'Distinguish other, another, and others.', category: 'N. Written Expression (Usage)', part: 'Written Expression' },
];

export const TOEFL_LISTENING_SKILLS: Skill[] = [
  // Short Conversations
  { id: 'L01', name: 'Skill 1: Focus on the Last Line', description: 'The answer is often found in the second speaker\'s line.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L02', name: 'Skill 2: Choose Answers with Synonyms', description: 'Look for words that mean the same as keywords.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L03', name: 'Skill 3: Avoid Similar Sounds', description: 'Be careful of words that sound like words in the dialogue.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L04', name: 'Skill 4: Draw Conclusions about Who, What, Where', description: 'Identify who is speaking, what is happening, where it is.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L05', name: 'Skill 5: Listen for Who and What in Passives', description: 'Understand passive statements in dialogues.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L06', name: 'Skill 6: Listen for Who and What with Multiple Nouns', description: 'Understand sentences with multiple nouns.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L07', name: 'Skill 7: Listen for Negative Expressions', description: 'Understand negative expressions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L08', name: 'Skill 8: Listen for Double Negative Expressions', description: 'Understand double negative expressions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L09', name: 'Skill 9: Listen for "Almost" Negative Expressions', description: 'Understand almost negative expressions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L10', name: 'Skill 10: Listen for Negatives with Comparatives', description: 'Understand negatives with comparatives.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L11', name: 'Skill 11: Listen for Expressions of Agreement', description: 'Recognize agreement expressions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L12', name: 'Skill 12: Listen for Expressions of Uncertainty/Suggestion', description: 'Recognize uncertainty and suggestion.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L13', name: 'Skill 13: Listen for Emphatic Expressions of Surprise', description: 'Recognize surprise expressions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L14', name: 'Skill 14: Listen for Wishes', description: 'Understand wishes.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L15', name: 'Skill 15: Listen for Untrue Conditions', description: 'Understand untrue conditions.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L16', name: 'Skill 16: Listen for Two- and Three-Part Verbs', description: 'Understand phrasal verbs.', category: 'Short Conversations', part: 'Part A' },
  { id: 'L17', name: 'Skill 17: Listen for Idioms', description: 'Understand idioms.', category: 'Short Conversations', part: 'Part A' },

  // Long Conversations (Basic, Pragmatic, Connecting) - Simplified Category Mapping
  { id: 'L18', name: 'Skill 18: Basic Comprehension (Main Idea)', description: 'Identify the main idea.', category: 'Long Conversations', part: 'Part B/C' },
  { id: 'L19', name: 'Skill 19: Basic Comprehension (Details)', description: 'Identify specific details.', category: 'Long Conversations', part: 'Part B/C' },
  { id: 'L20', name: 'Skill 20: Pragmatic (Purpose)', description: 'Determine the speaker\'s purpose.', category: 'Long Conversations', part: 'Part B/C' },
  { id: 'L21', name: 'Skill 21: Pragmatic (Tone/Attitude)', description: 'Determine tone and attitude.', category: 'Long Conversations', part: 'Part B/C' },
  { id: 'L22', name: 'Skill 22: Connecting Information (Organization)', description: 'Understand how ideas are organized.', category: 'Long Conversations', part: 'Part B/C' },
  { id: 'L23', name: 'Skill 23: Connecting Information (Relationship)', description: 'Connect relationships between ideas.', category: 'Long Conversations', part: 'Part B/C' },
];

export const TOEFL_READING_SKILLS: Skill[] = [
  { id: 'R01', name: 'Skill 1: Main Idea Questions', description: 'Identify the primary topic or main idea.', category: 'Reading Comprehension', part: 'Reading' },
  { id: 'R02', name: 'Skill 2: Stated Detail Questions', description: 'Find specific information stated directly.', category: 'Reading Comprehension', part: 'Reading' },
  { id: 'R03', name: 'Skill 3: Unstated Detail Questions', description: 'Identify which option is NOT mentioned.', category: 'Reading Comprehension', part: 'Reading' },
  { id: 'R04', name: 'Skill 4: Implied Detail Questions', description: 'Draw conclusions that are not explicitly stated.', category: 'Reading Comprehension', part: 'Reading' },
  { id: 'R05', name: 'Skill 5: Vocabulary in Context', description: 'Determine word meaning from context.', category: 'Reading Comprehension', part: 'Reading' },
  { id: 'R06', name: 'Skill 6: "Where" Questions', description: 'Identify where specific info is found.', category: 'Reading Comprehension', part: 'Reading' },
];