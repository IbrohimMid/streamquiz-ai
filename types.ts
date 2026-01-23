export type QuestionType = 'sentence_completion' | 'error_identification' | 'reading_comprehension';

export interface QuizData {
  type: QuestionType;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string; // "A", "B", "C", or "D"
  explanation: string;
  patternTip?: string;
  passageText?: string;
  hints?: string[];
  referencedText?: string;
  source?: string;
  section?: string;
}

export interface QuizState {
  status: 'idle' | 'generating' | 'playing' | 'answered' | 'error';
  currentData: QuizData | null;
  loading: boolean;
  error: string | null;
  streak: number;
  sessionId?: string | null;
  score: number;
  selectedOptionKey: string | null;
  history?: { questionId: string; isCorrect: boolean; timestamp: number }[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  MICRO_LEARNING = 'MICRO_LEARNING',
  PRACTICE_HUB = 'PRACTICE_HUB',
  VOCAB_HUB = 'VOCAB_HUB',
  MORE_HUB = 'MORE_HUB',
  ANALYTICS = 'ANALYTICS',
  ERROR_JAIL = 'ERROR_JAIL',
  TUTORING = 'TUTORING',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  PDF_UPLOAD = 'PDF_UPLOAD',
  AI_CHAT = 'AI_CHAT',
  SOCRATIC = 'SOCRATIC',
  DEVILS_ADVOCATE = 'DEVILS_ADVOCATE',
  STUDY_ROOM = 'STUDY_ROOM',
  PEER_REVIEW = 'PEER_REVIEW',
  ORACLE = 'ORACLE',
  SIMULATION = 'SIMULATION',
  WRITING_GYM = 'WRITING_GYM',
  WRITING = 'WRITING',
  SHADOWING = 'SHADOWING',
  PARAPHRASE_PRACTICE = 'PARAPHRASE_PRACTICE',
  SPEAKING_HUB = 'SPEAKING_HUB',
  LEXICAL_LAB = 'LEXICAL_LAB',
  LANGUAGE_DOJO = 'LANGUAGE_DOJO',
  FLASHCARDS = 'FLASHCARDS',
  LEADERBOARD = 'LEADERBOARD',
  FRIEND_LIST = 'FRIEND_LIST',
  LEARNING_PATH = 'LEARNING_PATH'
}

export enum SkillType {
  STRUCTURE = 'Structure',
  LISTENING = 'Listening',
  READING = 'Reading',
  SPEAKING = 'Speaking'
}

export type SectionType = 'STRUCTURE' | 'LISTENING' | 'READING' | 'SPEAKING';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  part?: string;
}

export type OnboardingStatus = 'completed' | 'pending';

export interface OnboardingProfile {
  name: string;
  targetScore: number;
}

export interface UserProgress {
  completedSkills: number;
  totalSkills: number;
  streak: number;
  level: number;
  xp: number;
  currentStreak: number;
  totalQuizzes: number;
  totalCorrect: number;
  unlockedBadges: string[];
}

export interface MicroLesson {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  durationMinutes: number;
  isDownloaded: boolean;
  category: 'GRAMMAR_HACK' | 'VOCAB_BOOST' | 'STUDY_TIP';
  section: 'STRUCTURE' | 'WRITING' | 'LISTENING' | 'READING';
  mode: 'VIDEO' | 'TEXT';
  level: 'EASY' | 'MEDIUM' | 'HARD';
  contentMarkdown: string;
}