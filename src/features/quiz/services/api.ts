import { QuizData, SectionType } from "../../../../types";

const BACKEND_URL = "http://localhost:8080/api";

export interface QuizSessionStartResponse {
  sessionId: string;
  firstQuiz: QuizData;
  remaining: number;
}

// Client-side cache for the current session
let currentSessionQuestions: QuizData[] = [];
let currentSessionIndex = 0;
let currentSessionId: string | null = null;

export const startQuizSession = async (topic: string, section: SectionType = 'STRUCTURE', count: number = 3, skillId?: string): Promise<QuizSessionStartResponse> => {
  try {
    // Use the new Hybrid endpoint
    const response = await fetch(`${BACKEND_URL}/questions/hybrid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillId: skillId || "", // If no skillId, backend might fall back or error. Ideally pass a valid ID.
        section: section,
        count: count,
        userId: "guest"
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const result = await response.json();
    // Maps backend questions to QuizData
    currentSessionQuestions = result.questions.map((q: any) => ({
      type: q.type || 'sentence_completion',
      question: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      section: q.section,
      source: q.source,
      // Map other fields as needed
    }));

    currentSessionId = result.sessionId || "local-session-" + Date.now();
    currentSessionIndex = 0;

    if (currentSessionQuestions.length === 0) {
      throw new Error("No questions returned from backend");
    }

    return {
      sessionId: currentSessionId!,
      firstQuiz: currentSessionQuestions[0],
      remaining: currentSessionQuestions.length - 1
    };

  } catch (error) {
    console.error("Error starting quiz session:", error);
    throw error;
  }
};

export const getNextQuiz = async (sessionId: string): Promise<QuizData | null> => {
  try {
    // For now, we use local cache. In a real stateless flow we might ask backend for "next" 
    // but the hybrid endpoint returned a batch.
    if (sessionId === currentSessionId) {
      currentSessionIndex++;
      if (currentSessionIndex < currentSessionQuestions.length) {
        return currentSessionQuestions[currentSessionIndex];
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching next quiz:", error);
    return null;
  }
};

// Legacy support (calls start session for 1 quiz)
export const generateQuizQuestion = async (topic: string, section: SectionType = 'STRUCTURE'): Promise<QuizData> => {
  const session = await startQuizSession(topic, section, 1);
  return session.firstQuiz;
};
