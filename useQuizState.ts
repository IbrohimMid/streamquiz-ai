import { useState, useCallback } from 'react';
import { QuizData, QuizState, SectionType } from './types';
import { startQuizSession, getNextQuiz, submitQuiz, getQuizResult } from './src/features/quiz/services/api';

export interface ExtendedQuizState extends QuizState {
    questions: QuizData[];
    currentIndex: number;
    answers: Record<string, string>; // questionId -> answerKey
    isSubmitted: boolean;
    result: any | null;
}

export const useQuizState = () => {
    const [state, setState] = useState<ExtendedQuizState>({
        status: 'idle',
        currentData: null,
        loading: false,
        error: null,
        streak: 0,
        sessionId: null,
        score: 0,
        selectedOptionKey: null,
        questions: [],
        currentIndex: 0,
        answers: {},
        isSubmitted: false,
        result: null,
    });

    const pollForQuestions = async (sessionId: string, count: number) => {
        let fetched = 0;
        while (fetched < count) {
            try {
                const quiz = await getNextQuiz(sessionId);
                if (!quiz) break; // done

                setState(prev => {
                    if (prev.questions.some(q => q.id === quiz.id)) return prev;
                    const newQs = [...prev.questions, quiz];
                    return {
                        ...prev,
                        questions: newQs,
                        currentData: prev.currentIndex === newQs.length - 1 ? quiz : prev.currentData,
                    };
                });
                fetched++;
            } catch (err) {
                console.error("Polling error", err);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };

    const startSession = useCallback(async (topic: string, section: SectionType = 'STRUCTURE') => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null,
            questions: [],
            currentIndex: 0,
            answers: {},
            isSubmitted: false,
            result: null,
            status: 'generating'
        }));

        try {
            const session = await startQuizSession(topic, section, 10);
            setState(prev => ({
                ...prev,
                sessionId: session.sessionId,
                loading: false,
                status: 'playing'
            }));

            // Start background fetching of questions
            pollForQuestions(session.sessionId, 10);
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                error: err.message || "Failed to start quiz session",
                loading: false,
                status: 'error'
            }));
        }
    }, []);

    const setQuestionIndex = useCallback((index: number) => {
        setState(prev => {
            if (index < 0 || index >= prev.questions.length) return prev;
            const q = prev.questions[index];
            return {
                ...prev,
                currentIndex: index,
                currentData: q,
                selectedOptionKey: prev.answers[q.id || ''] || null
            };
        });
    }, []);

    const nextQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex < prev.questions.length - 1) {
                const nextIdx = prev.currentIndex + 1;
                const q = prev.questions[nextIdx];
                return {
                    ...prev,
                    currentIndex: nextIdx,
                    currentData: q,
                    selectedOptionKey: prev.answers[q.id || ''] || null
                };
            }
            return prev;
        });
    }, []);

    const prevQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex > 0) {
                const prevIdx = prev.currentIndex - 1;
                const q = prev.questions[prevIdx];
                return {
                    ...prev,
                    currentIndex: prevIdx,
                    currentData: q,
                    selectedOptionKey: prev.answers[q.id || ''] || null
                };
            }
            return prev;
        });
    }, []);

    const handleAnswer = useCallback((answerKey: string) => {
        setState(prev => {
            if (!prev.currentData || !prev.currentData.id) return prev;
            return {
                ...prev,
                answers: { ...prev.answers, [prev.currentData.id]: answerKey },
                selectedOptionKey: answerKey
            };
        });
    }, []);

    const submit = useCallback(async () => {
        if (!state.sessionId) return;
        setState(prev => ({ ...prev, loading: true }));
        try {
            const res = await submitQuiz(state.sessionId, state.answers);
            const resultDetails = await getQuizResult(state.sessionId);

            setState(prev => ({
                ...prev,
                loading: false,
                isSubmitted: true,
                status: 'answered',
                score: res.score,
                result: resultDetails
            }));
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                error: "Failed to submit quiz",
                loading: false
            }));
        }
    }, [state.sessionId, state.answers]);

    return {
        state,
        startSession,
        setQuestionIndex,
        nextQuestion,
        prevQuestion,
        handleAnswer,
        submit
    };
};
