import React, { useState } from 'react';
import { QuizData } from '../../../../types';
import { Check, X, ChevronDown, ChevronUp, ArrowLeft, Filter, Lightbulb, BookOpen, Headphones, Book } from 'lucide-react';

interface ReviewModeProps {
    questions: QuizData[];
    userAnswers: Record<string, string>;
    score: number;
    totalQuestions: number;
    skillName: string;
    onBack: () => void;
}

type FilterType = 'all' | 'correct' | 'incorrect';

export const ReviewMode: React.FC<ReviewModeProps> = ({ questions, userAnswers, score, totalQuestions, skillName, onBack }) => {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

    const results = questions.map(q => ({
        question: q,
        selectedAnswer: userAnswers[q.id || ''] || '',
        isCorrect: (userAnswers[q.id || ''] || '') === q.correctAnswer
    }));

    const filteredResults = results.filter(r => {
        if (filter === 'correct') return r.isCorrect;
        if (filter === 'incorrect') return !r.isCorrect;
        return true;
    });

    const toggleExpand = (index: number) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedQuestions(new Set(filteredResults.map((_, i) => i)));
    };

    const collapseAll = () => {
        setExpandedQuestions(new Set());
    };

    const getSectionIcon = (type: string) => {
        if (type.includes('listening')) {
            return <Headphones className="w-4 h-4" />;
        }
        if (type.includes('reading')) {
            return <Book className="w-4 h-4" />;
        }
        return <BookOpen className="w-4 h-4" />;
    };

    const correctCount = results.filter(r => r.isCorrect).length;
    const incorrectCount = totalQuestions - correctCount;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={onBack} className="text-sm flex items-center hover:bg-slate-100 px-3 py-1 rounded-md transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Quiz Review</h1>
                                <p className="text-sm text-slate-500">{skillName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${percentage >= 80 ? 'bg-green-100 text-green-700' :
                                percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {percentage}% ({score}/{totalQuestions})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Filter Bar */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">Filter:</span>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    All ({results.length})
                                </button>
                                <button
                                    onClick={() => setFilter('correct')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${filter === 'correct' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Check className="w-3 h-3 mr-1" /> Correct ({correctCount})
                                </button>
                                <button
                                    onClick={() => setFilter('incorrect')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${filter === 'incorrect' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <X className="w-3 h-3 mr-1" /> Incorrect ({incorrectCount})
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={expandAll}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Expand All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                                onClick={collapseAll}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Collapse All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {filteredResults.map((result, index) => {
                        const originalIndex = questions.indexOf(result.question);
                        const isExpanded = expandedQuestions.has(index);

                        return (
                            <div
                                key={originalIndex}
                                className={`bg-white rounded-lg border overflow-hidden transition-all ${result.isCorrect ? 'border-green-200' : 'border-red-200'
                                    }`}
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full p-4 flex items-start justify-between text-left hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {result.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-xs font-bold text-slate-400">Q{originalIndex + 1}</span>
                                                <span className="text-slate-300">{getSectionIcon(result.question.type)}</span>
                                            </div>
                                            <p className="text-slate-800 line-clamp-2">
                                                {result.question.question}
                                            </p>

                                            <div className="mt-2 flex items-center space-x-4 text-sm">
                                                <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                    Your answer: <strong>({result.selectedAnswer})</strong>
                                                </span>
                                                {!result.isCorrect && (
                                                    <span className="text-green-600">
                                                        Correct: <strong>({result.question.correctAnswer})</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-4 bg-slate-50 animate-fade-in">
                                        {/* Reference Text */}
                                        {result.question.passageText && (
                                            <div className="mb-4 p-3 bg-white border border-slate-200 rounded text-sm text-slate-600 italic">
                                                {result.question.passageText}
                                            </div>
                                        )}

                                        {/* Options */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-600 mb-2">Options:</h4>
                                            <div className="grid gap-2">
                                                {result.question.options.map(opt => {
                                                    const isSelected = result.selectedAnswer === opt.key;
                                                    const isCorrectOption = result.question.correctAnswer === opt.key;

                                                    let optClass = 'bg-white border-slate-200';
                                                    if (isCorrectOption) {
                                                        optClass = 'bg-green-50 border-green-300 text-green-800';
                                                    } else if (isSelected && !isCorrectOption) {
                                                        optClass = 'bg-red-50 border-red-300 text-red-800';
                                                    }

                                                    return (
                                                        <div key={opt.key} className={`p-2 rounded border text-sm ${optClass}`}>
                                                            <span className="font-bold mr-2">({opt.key})</span>
                                                            {opt.text}
                                                            {isCorrectOption && <Check className="w-4 h-4 inline ml-2 text-green-600" />}
                                                            {isSelected && !isCorrectOption && <X className="w-4 h-4 inline ml-2 text-red-600" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                            <h4 className="text-sm font-bold text-slate-700 mb-2">Explanation:</h4>
                                            <p className="text-slate-700">{result.question.explanation}</p>
                                        </div>

                                        {/* Pattern Tip */}
                                        {result.question.patternTip && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                                                <Lightbulb className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Strategy Tip</span>
                                                    <p className="text-blue-700 text-sm italic">{result.question.patternTip}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredResults.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>No questions match the current filter.</p>
                    </div>
                )}

                {/* Bottom Action */}
                <div className="mt-8 text-center">
                    <button onClick={onBack} className="px-8 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
