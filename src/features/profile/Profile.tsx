import React from 'react';
import { UserProgress, AppView } from '../../../types';
import { BookOpen, Trophy, Flame, Target, Award, Star, ArrowLeft } from 'lucide-react';

interface ProfileProps {
    user: any;
    progress: UserProgress;
    onNavigate: (view: AppView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, progress, onNavigate }) => {

    // Mock level calculation
    const levelProgress = { percentage: 65, xpToNext: 350 };
    const badgeList = [
        { id: 1, name: 'First Steps', description: 'Completed your first quiz', icon: '🚀' },
        { id: 2, name: 'On Fire', description: 'reached a 3-day streak', icon: '🔥' }
    ];

    return (
        <div className="container mx-auto px-4 py-4 min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="flex items-center mb-6 pt-2">
                <button
                    onClick={() => onNavigate(AppView.MORE_HUB)}
                    className="mr-3 p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Your Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Card */}
                <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-600 to-blue-800 opacity-10" />

                    <div className="relative z-10 flex flex-col items-center text-center mt-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-blue-900/20 transform rotate-3">
                            {user?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-1">
                            {user?.name || 'Student'}
                        </h2>
                        <p className="text-slate-500 text-sm mb-6 bg-blue-50 px-3 py-1 rounded-full">{user?.email || 'Guest Account'}</p>

                        <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-500">Level {progress.level}</span>
                                <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-bold border border-orange-200">
                                    Lvl {progress.level}
                                </span>
                            </div>
                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                    style={{ width: `${levelProgress.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-right font-medium">
                                {levelProgress.xpToNext} XP to next level
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="text-xl font-bold text-slate-800">{progress.xp}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total XP</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-xl font-bold text-slate-800">{progress.currentStreak}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Day Streak</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-xl font-bold text-slate-800">{progress.totalQuizzes}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Quizzes</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                <Target className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-xl font-bold text-slate-800">{progress.totalCorrect}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Correct</div>
                        </div>
                    </div>

                    {/* Recent Activity / Achievements */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-3 text-blue-600" />
                            Achievements
                        </h3>
                        {badgeList.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {badgeList.map(badge => (
                                    <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
                                        <div className="text-2xl drop-shadow-sm">{badge.icon}</div>
                                        <div>
                                            <div className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Badge</div>
                                            <div className="text-sm font-bold text-slate-800 leading-tight">{badge.name}</div>
                                            <div className="text-xs text-slate-500 leading-tight">{badge.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p className="font-medium">No achievements yet. Keep practicing!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};