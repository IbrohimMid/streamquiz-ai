import { QuizData, SectionType } from "../../../../types";

const BACKEND_URL = "http://localhost:8080/api";

export interface QuizSessionStartResponse {
  sessionId: string;
}

// export const getQuizStreamUrl = ... (removed duplicate)

export interface QuizSessionStartResponse {
  sessionId: string;
}

export const startQuizSession = async (topic: string, section: SectionType = 'STRUCTURE', count: number = 3, skillId?: string): Promise<QuizSessionStartResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: skillId || topic, // Use skillId as topic if available to trigger specific prompt strategies
        section: section,
        count: count
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const result = await response.json();
    // The backend now returns { sessionId, status: "started" }

    return {
      sessionId: result.sessionId
    };

  } catch (error) {
    console.error("Error starting quiz session:", error);
    throw error;
  }
};

export const getNextQuiz = async (sessionId: string): Promise<QuizData | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/next?sessionId=${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error(await response.text());

    const result = await response.json();

    // Check for "done" signal
    if (result.done) {
      return null;
    }

    const mapQuiz = (q: any): QuizData => ({
      id: q.id,
      type: q.type || 'sentence_completion',
      question: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      section: q.section,
      source: q.source,
      patternTip: q.patternTip,
      hints: q.hints,
      referencedText: q.referencedText,
      passageText: q.passageText
    });

    return mapQuiz(result);
  } catch (error) {
    console.error("Error fetching next quiz:", error);
    return null;
  }
};

// Legacy support (calls start session for 1 quiz)
export const generateQuizQuestion = async (topic: string, section: SectionType = 'STRUCTURE'): Promise<QuizData> => {
  const session = await startQuizSession(topic, section, 1);
  const quiz = await getNextQuiz(session.sessionId);
  if (!quiz) throw new Error("Failed to generate quiz");
  return quiz;
};
export const getQuizStreamUrl = (sessionId: string): string => {
  return `${BACKEND_URL}/quiz/stream?sessionId=${sessionId}`;
};

export const submitQuiz = async (sessionId: string, answers: Record<string, string>): Promise<{ status: string; score: number }> => {
  const response = await fetch(`${BACKEND_URL}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answers })
  });

  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export const getQuizResult = async (sessionId: string): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/quiz/results?sessionId=${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error(await response.text());

  const result = await response.json();

  // Map questions for consistency if needed, but backend result should mirror proper structure
  // Need to ensure result.questions are mapped correctly to QuizData if keys differ
  // Backend QuizResponse keys match QuizData largely
  // Mapping logic:
  if (result.questions) {
    result.questions = result.questions.map((q: any) => ({
      id: q.id,
      type: q.type || 'sentence_completion',
      question: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      section: q.section,
      source: q.source,
      patternTip: q.patternTip,
      hints: q.hints,
      referencedText: q.referencedText,
      passageText: q.passageText
    }));
  }

  return result;
};
