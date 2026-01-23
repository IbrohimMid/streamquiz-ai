import { useState, useCallback } from 'react';
import { QuizData, QuizState, SectionType } from './types';
import { startQuizSession, getNextQuiz } from './src/features/quiz/services/api';

export const useQuizState = () => {
    const [state, setState] = useState<QuizState>({
        currentQuestion: null,
        history: [],
        loading: false,
        error: null,
        streak: 0,
        sessionId: null
    });

    const generateNewQuestion = useCallback(async (section: SectionType = 'STRUCTURE') => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            let data: QuizData;
            let currentSessionId = state.sessionId;

            // If no session or we want to ensure we have a buffer, check session logic
            if (!currentSessionId) {
                console.log("Starting new quiz session...");
                const session = await startQuizSession('TOEFL ' + section, section, 5);
                currentSessionId = session.sessionId;
                data = session.firstQuiz;
                setState(prev => ({ ...prev, sessionId: currentSessionId }));
            } else {
                console.log("Fetching next quiz from session...", currentSessionId);
                const next = await getNextQuiz(currentSessionId);
                if (next) {
                    data = next;
                } else {
                    console.log("Session exhausted, starting new one...");
                    const session = await startQuizSession('TOEFL ' + section, section, 5);
                    currentSessionId = session.sessionId;
                    data = session.firstQuiz;
                    setState(prev => ({ ...prev, sessionId: currentSessionId }));
                }
            }

            setState(prev => ({
                ...prev,
                currentQuestion: data,
                loading: false
            }));
        } catch (err) {
            console.error(err);
            setState(prev => ({
                ...prev,
                error: "Failed to generate question. Please try again.",
                loading: false
            }));
        }
    }, [state.sessionId]);

    const handleAnswer = useCallback((answerKey: string) => {
        if (!state.currentQuestion) return;

        const isCorrect = answerKey === state.currentQuestion.correctAnswer;
        const newStreak = isCorrect ? state.streak + 1 : 0;

        setState(prev => ({
            ...prev,
            history: [...prev.history, {
                questionId: prev.currentQuestion!.question,
                isCorrect,
                timestamp: Date.now()
            }],
            streak: newStreak
        }));
    }, [state.currentQuestion, state.streak]);

    return {
        state,
        generateNewQuestion,
        handleAnswer
    };
};
