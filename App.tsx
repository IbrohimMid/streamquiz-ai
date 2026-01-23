import React, { useState } from 'react';
import { AppView, SkillType, UserProgress, Skill, SectionType } from './types';
import { useQuizState } from './useQuizState';
import { QuizCard } from './src/features/quiz/components/QuizCard';
import { QuizViewReading } from './src/features/quiz/components/QuizViewReading';
import { ReviewMode } from './src/features/quiz/components/ReviewMode';
import { Button } from './src/components/ui/Button';
import { Dashboard } from './src/features/dashboard/Dashboard';
import { MobileTabBar } from './src/components/shared/MobileTabBar';
import { MoreHub } from './src/features/more-hub/MoreHub';
import { Profile } from './src/features/profile/Profile';
import { Settings } from './src/features/settings/Settings';
import { PracticeHubView } from './src/features/practice-hub/PracticeHub';
import { VocabHubView } from './src/features/vocab-hub/VocabHub';
import { MicroLearningView } from './src/features/micro-learning/MicroLearning';
import { LearningPath } from './src/features/learning-path/LearningPath';
import { BrainCircuit, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ name: string, email: string } | null>({ name: "Student", email: "student@example.com" });
  const [showNavPopup, setShowNavPopup] = useState(false);

  const {
    state: quizState,
    startSession,
    nextQuestion,
    prevQuestion,
    setQuestionIndex,
    handleAnswer,
    submit
  } = useQuizState();

  // Mock Progress Data
  const [progress, setProgress] = useState<UserProgress>({
    completedSkills: 12,
    totalSkills: 50,
    streak: 3,
    level: 5,
    xp: 2450,
    currentStreak: 3,
    totalQuizzes: 45,
    totalCorrect: 38,
    unlockedBadges: ['first_steps', 'on_fire']
  });

  const handleStartSkill = async (topic: string, section: SectionType = 'STRUCTURE', skillId?: string) => {
    setSelectedTopic(topic);
    if (skillId) setSelectedSkillId(skillId);
    setCurrentView(AppView.QUIZ);
    setShowNavPopup(false);
    startSession(topic, section);
  };

  const handleSkillSelection = (skill: Skill) => {
    let section: SectionType = 'STRUCTURE';
    if (skill.part === 'Reading' || skill.category.includes('Reading')) {
      section = 'READING';
    } else if (skill.part === 'Listening' || skill.category.includes('Listening')) {
      section = 'LISTENING';
    }
    handleStartSkill(skill.name + ": " + skill.description, section, skill.id);
  };

  const handleExitQuiz = () => {
    setCurrentView(AppView.DASHBOARD);
    setShowNavPopup(false);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard
            onStartTodayFocus={(skillType) => handleStartSkill(`${skillType} Practice`, (skillType as string).toUpperCase() as SectionType)}
            onNavigate={setCurrentView}
            userProgress={{ completedSkills: progress.completedSkills, totalSkills: progress.totalSkills }}
            userName={user?.name || "Guest"}
            streak={progress.streak}
            isGuest={!user}
          />
        );

      case AppView.MORE_HUB:
        return (
          <MoreHub
            onNavigate={setCurrentView}
            onSignOut={() => setUser(null)}
            user={user}
            progress={progress}
          />
        );

      case AppView.PROFILE:
        return (
          <Profile
            user={user}
            progress={progress}
            onNavigate={setCurrentView}
          />
        );

      case AppView.SETTINGS:
        return (
          <Settings onNavigate={setCurrentView} />
        );

      case AppView.PRACTICE_HUB:
        return (
          <PracticeHubView onNavigate={setCurrentView} />
        );

      case AppView.VOCAB_HUB:
        return (
          <VocabHubView onNavigate={setCurrentView} />
        );

      case AppView.MICRO_LEARNING:
        return (
          <MicroLearningView onBack={() => setCurrentView(AppView.DASHBOARD)} />
        );

      case AppView.LEARNING_PATH:
        return (
          <LearningPath
            onSelectSkill={handleSkillSelection}
            onOpenOnboarding={() => { }}
            onboardingStatus="completed"
            onboardingProfile={{ name: user?.name || '', targetScore: 550 }}
            onBack={() => setCurrentView(AppView.PRACTICE_HUB)}
          />
        );

      case AppView.QUIZ:
        if (quizState.isSubmitted && quizState.result) {
          return (
            <div className="flex flex-col min-h-screen bg-white">
              <div className="px-4 py-3 flex items-center border-b sticky top-0 bg-white z-10">
                <button onClick={handleExitQuiz} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="ml-2 font-bold text-base">Quiz Results</h2>
              </div>
              <ReviewMode
                questions={quizState.result.questions}
                userAnswers={quizState.result.userAnswers}
                score={quizState.result.score}
                totalQuestions={quizState.result.totalQuestions}
                skillName={quizState.result.skillName}
                onBack={handleExitQuiz}
              />
            </div>
          );
        }

        return (
          <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
            {/* Quiz Header - More Compact */}
            <div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-[#F5F7FA]/95 backdrop-blur-sm z-50 border-b border-slate-200/50">
              <button
                onClick={handleExitQuiz}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center flex-1 mx-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                  {selectedTopic}
                </span>
                <div className="h-1 w-full max-w-[120px] bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(quizState.currentIndex + 1) * 10}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => setShowNavPopup(true)}
                className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black hover:bg-blue-200 transition-colors shadow-sm border border-blue-200"
              >
                {quizState.currentIndex + 1}/10
              </button>
            </div>

            {/* Modal Overlay for Navigation */}
            {showNavPopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNavPopup(false)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Jump to Question</h3>
                    <button onClick={() => setShowNavPopup(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuestionIndex(i);
                          setShowNavPopup(false);
                        }}
                        disabled={!quizState.questions[i]}
                        className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all border-2
                          ${quizState.currentIndex === i
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                            : !quizState.questions[i]
                              ? 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed'
                              : quizState.answers[quizState.questions[i]?.id || '']
                                ? 'bg-white text-blue-600 border-blue-100'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <main className="flex-1 px-4 py-3 flex flex-col items-center pb-20 overflow-y-auto">
              {/* Loading State */}
              {quizState.loading && quizState.questions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-3 rounded-full shadow-md border border-blue-50">
                      <BrainCircuit className="w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-serif">Consulting AI...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Generating your practice session
                  </p>
                </div>
              )}

              {/* Error State */}
              {quizState.error && (
                <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-red-100 text-center mt-8">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Generation Failed</h3>
                  <p className="text-sm text-slate-500 mb-6">{quizState.error}</p>
                  <Button onClick={() => startSession(selectedTopic || 'Practice')} variant="secondary" className="w-full">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Quiz Card */}
              {quizState.currentData && (
                <div className="w-full max-w-2xl">
                  {quizState.currentData.passageText ? (
                    <QuizViewReading
                      currentQuestion={quizState.currentData}
                      selectedAnswer={quizState.answers[quizState.currentData.id || ''] || undefined}
                      isCorrect={quizState.answers[quizState.currentData.id || ''] === quizState.currentData.correctAnswer}
                      showExplanation={!!quizState.answers[quizState.currentData.id || '']}
                      onAnswer={handleAnswer}
                      onNext={nextQuestion}
                    />
                  ) : (
                    <QuizCard
                      data={quizState.currentData}
                      onAnswer={handleAnswer}
                      onNext={nextQuestion}
                      isAnswered={!!quizState.answers[quizState.currentData.id || '']}
                      selectedOptionKey={quizState.answers[quizState.currentData.id || '']}
                    />
                  )}

                  {/* Navigation Controls */}
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={quizState.currentIndex === 0}
                      className="flex-1 max-w-[120px]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    {quizState.currentIndex === quizState.questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={submit}
                        disabled={Object.keys(quizState.answers).length < quizState.questions.length}
                        className="flex-1 max-w-[160px] bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Finish Quiz
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={nextQuestion}
                        disabled={quizState.currentIndex >= quizState.questions.length - 1}
                        className="flex-1 max-w-[120px]"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500 p-8 text-center pb-24">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Under Construction</h2>
              <p className="mb-6">The {currentView.replace('_', ' ')} module is coming soon.</p>
              <Button onClick={() => setCurrentView(AppView.DASHBOARD)}>Back Home</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans max-w-md mx-auto md:max-w-4xl shadow-2xl shadow-slate-200 min-h-[100vh] border-x border-slate-100 relative">
      {renderView()}

      {/* Show Tab Bar only on appropriate screens */}
      {!([AppView.QUIZ] as AppView[]).includes(currentView) && (
        <MobileTabBar currentView={currentView} onNavigate={setCurrentView} />
      )}
    </div>
  );
};

export default App;