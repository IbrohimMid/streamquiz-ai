import React, { useState } from 'react';
import { AppView, QuizState, SkillType, UserProgress, Skill, SectionType } from './types';
import { startQuizSession, getNextQuiz } from './src/features/quiz/services/api';
import { QuizCard } from './src/features/quiz/components/QuizCard';
import { QuizViewReading } from './src/features/quiz/components/QuizViewReading';
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
import { BrainCircuit, ArrowLeft, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ name: string, email: string } | null>({ name: "Student", email: "student@example.com" });

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

  const [quizState, setQuizState] = useState<QuizState>({
    status: 'idle',
    currentData: null,
    selectedOptionKey: null,
    score: 0,
    loading: false,
    error: null,
    streak: 0,
    sessionId: null
  });

  const handleStartSkill = async (topic: string, section: SectionType = 'STRUCTURE', skillId?: string) => {
    setSelectedTopic(topic);
    if (skillId) setSelectedSkillId(skillId);

    setCurrentView(AppView.QUIZ);
    setQuizState(prev => ({ ...prev, status: 'generating', error: undefined }));

    try {
      const effectiveSkillId = skillId || selectedSkillId;
      // Start a session with 10 questions for Structure
      const count = section === 'STRUCTURE' ? 10 : 5;
      const session = await startQuizSession(topic, section, count, effectiveSkillId);

      setQuizState(prev => ({
        ...prev,
        status: 'playing',
        currentData: session.firstQuiz,
        selectedOptionKey: null,
        sessionId: session.sessionId
      }));
    } catch (error) {
      setQuizState(prev => ({
        ...prev,
        status: 'error',
        error: "Failed to generate question. The AI might be busy."
      }));
    }
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

  const handleAnswer = (key: string) => {
    if (!quizState.currentData) return;

    const isCorrect = key === quizState.currentData.correctAnswer;
    setQuizState(prev => ({
      ...prev,
      status: 'answered',
      selectedOptionKey: key,
      score: isCorrect ? prev.score + 1 : prev.score
    }));

    if (isCorrect) {
      setProgress(prev => ({
        ...prev,
        xp: prev.xp + 10,
        totalCorrect: prev.totalCorrect + 1,
        totalQuizzes: prev.totalQuizzes + 1
      }));
    } else {
      setProgress(prev => ({
        ...prev,
        totalQuizzes: prev.totalQuizzes + 1
      }));
    }
  };

  const handleNextQuestion = async () => {
    if (quizState.sessionId) {
      setQuizState(prev => ({ ...prev, status: 'generating' }));
      try {
        const next = await getNextQuiz(quizState.sessionId);
        if (next) {
          setQuizState(prev => ({
            ...prev,
            status: 'playing',
            currentData: next,
            selectedOptionKey: null
          }));
        } else {
          if (selectedTopic) {
            const section = quizState.currentData?.section as SectionType || 'STRUCTURE';
            handleStartSkill(selectedTopic, section, selectedSkillId);
          }
        }
      } catch (e) {
        const section = quizState.currentData?.section as SectionType || 'STRUCTURE';
        if (selectedTopic) handleStartSkill(selectedTopic, section, selectedSkillId);
      }
    } else if (selectedTopic) {
      const section = quizState.currentData?.section as SectionType || 'STRUCTURE';
      handleStartSkill(selectedTopic, section, selectedSkillId);
    }
  };

  const handleExitQuiz = () => {
    // If we came from learning path, maybe go back there? For now go to Dashboard
    setCurrentView(AppView.DASHBOARD);
    setQuizState({
      status: 'idle',
      currentData: null,
      selectedOptionKey: null,
      score: 0,
      loading: false,
      error: null,
      streak: 0,
      sessionId: null
    });
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
        return (
          <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
            {/* Quiz Header */}
            <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#F5F7FA]/90 backdrop-blur-sm z-50 border-b border-slate-200/50">
              <button
                onClick={handleExitQuiz}
                className="p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                  {selectedTopic}
                </span>
                <div className="h-1 w-24 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {quizState.score}
              </div>
            </div>

            <main className="flex-1 p-4 flex flex-col items-center justify-center pb-20">
              {/* Loading State */}
              {quizState.status === 'generating' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-50">
                      <BrainCircuit className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 font-serif">Consulting AI...</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                    Generating a unique challenge for: {selectedTopic}
                  </p>
                </div>
              )}

              {/* Error State */}
              {quizState.status === 'error' && (
                <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-red-100 text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Generation Failed</h3>
                  <p className="text-sm text-slate-500 mb-6">{quizState.error}</p>
                  <Button onClick={() => handleNextQuestion()} variant="secondary" className="w-full">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Quiz Card */}
              {(quizState.status === 'playing' || quizState.status === 'answered') && quizState.currentData && (
                <div className="w-full">
                  {quizState.currentData.passageText ? (
                    <QuizViewReading
                      currentQuestion={quizState.currentData}
                      selectedAnswer={quizState.selectedOptionKey || undefined}
                      isCorrect={quizState.selectedOptionKey === quizState.currentData.correctAnswer}
                      showExplanation={quizState.status === 'answered'}
                      onAnswer={handleAnswer}
                      onNext={handleNextQuestion}
                    />
                  ) : (
                    <QuizCard
                      data={quizState.currentData}
                      onAnswer={handleAnswer}
                      onNext={handleNextQuestion}
                      isAnswered={quizState.status === 'answered'}
                      selectedOptionKey={quizState.selectedOptionKey}
                    />
                  )}
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
      {currentView !== AppView.QUIZ && (
        <MobileTabBar currentView={currentView} onNavigate={setCurrentView} />
      )}
    </div>
  );
};

export default App;