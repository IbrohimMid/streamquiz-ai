import React, { useState, useEffect } from 'react';
import {
    Bell, Target, Flame, User,
    Play, Zap, ChevronRight, ChevronDown, Sparkles,
    FileText, Lock, Dumbbell, PenTool, Mic, Layers, BookOpen
} from 'lucide-react';
import { AppView, SkillType } from '../../../types';

interface DashboardProps {
    onStartTodayFocus: (skill: SkillType) => void;
    onNavigate: (view: AppView) => void;
    userProgress: {
        completedSkills: number;
        totalSkills: number;
    };
    userName: string;
    streak: number;
    isGuest: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onStartTodayFocus,
    onNavigate,
    userProgress,
    streak,
    isGuest
}) => {
    const [selectedLevel, setSelectedLevel] = useState<string>('Structure');
    const [isSkillMenuOpen, setIsSkillMenuOpen] = useState(false);

    // Dynamic Content & Theme Configuration
    const skillConfig: Record<string, any> = {
        'Structure': {
            theme: {
                gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)',
                shadow: 'shadow-blue-200/50 hover:shadow-blue-300/50',
                buttonText: 'text-blue-700',
                iconBg: 'bg-blue-700'
            },
            content: {
                title: 'Adaptive: Skill 1: Subjects and Verbs',
                subtitle: 'Has not been practiced recently',
                icon: Target,
                badges: ['Adaptive learning', 'AI powered']
            }
        },
        'Listening': {
            theme: {
                gradient: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)', // Emerald/Green
                shadow: 'shadow-green-200/50 hover:shadow-green-300/50',
                buttonText: 'text-green-700',
                iconBg: 'bg-green-700'
            },
            content: {
                title: 'Listening: Short Conversations',
                subtitle: 'Focus on Idioms & Inference',
                icon: Mic,
                badges: ['Audio drills', 'Native speed']
            }
        },
        'Reading': {
            theme: {
                gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)', // Violet/Purple
                shadow: 'shadow-purple-200/50 hover:shadow-purple-300/50',
                buttonText: 'text-purple-700',
                iconBg: 'bg-purple-700'
            },
            content: {
                title: 'Reading: Inference Questions',
                subtitle: 'Master implicit meaning extraction',
                icon: BookOpen,
                badges: ['Comprehension', 'Speed reading']
            }
        },
        'Speaking': {
            theme: {
                gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)', // Orange
                shadow: 'shadow-orange-200/50 hover:shadow-orange-300/50',
                buttonText: 'text-orange-700',
                iconBg: 'bg-orange-700'
            },
            content: {
                title: 'Speaking: Independent Tasks',
                subtitle: 'Structure your response effectively',
                icon: Mic,
                badges: ['Fluency', 'Pronunciation']
            }
        }
    };

    const currentConfig = skillConfig[selectedLevel] || skillConfig['Structure'];

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleSkillSelect = (skill: string) => {
        setSelectedLevel(skill);
        setIsSkillMenuOpen(false);
    };

    const handleStartSession = () => {
        const sectionMap: Record<string, SkillType> = {
            'Structure': SkillType.STRUCTURE,
            'Listening': SkillType.LISTENING,
            'Reading': SkillType.READING,
            'Speaking': SkillType.SPEAKING
        };
        const section = sectionMap[selectedLevel] || SkillType.STRUCTURE;
        onStartTodayFocus(section);
    };

    return (
        <div className="w-full relative pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- 1. Header Section (Pill-shaped) --- */}
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                    {/* Notification Button */}
                    <button className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors relative">
                        <Bell className="w-5 h-5 text-slate-600" />
                        <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {/* Pill Search/Brand Bar */}
                    <button
                        className="flex-1 flex items-center justify-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                    >
                        <span className="font-serif font-bold text-slate-800 text-sm tracking-tight">
                            StreamQuiz AI
                        </span>
                    </button>

                    {/* User Avatar */}
                    <button
                        onClick={() => onNavigate(AppView.PROFILE)}
                        className="relative p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:shadow-md transition-all"
                    >
                        <User className="w-5 h-5 text-slate-600" />
                        {streak > 0 && (
                            <div className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-orange-500 text-white text-[8px] font-bold rounded-full w-4 h-4 items-center justify-center border border-white">
                                {streak}
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* --- 2. Brand Section with Dropdown --- */}
            <div className="px-5 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-medium mb-0.5">Let's learn</p>
                        <h1 className="text-xl font-bold text-slate-900 font-serif">
                            {getTimeBasedGreeting()}
                        </h1>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSkillMenuOpen(!isSkillMenuOpen)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{selectedLevel}</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isSkillMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSkillMenuOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {['Structure', 'Listening', 'Reading', 'Speaking'].map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => handleSkillSelect(skill)}
                                            className={`w-full text-left px-4 py-3 text-xs font-semibold hover:bg-blue-50 transition-colors ${selectedLevel === skill ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 3. Hero Card (Dynamic Gradient) --- */}
            <div className="px-4 mb-4">
                <div
                    onClick={handleStartSession}
                    className={`relative rounded-[24px] p-5 cursor-pointer group overflow-hidden shadow-lg transition-all duration-300 ${currentConfig.theme.shadow}`}
                    style={{
                        background: currentConfig.theme.gradient
                    }}
                >
                    {/* Decorative circles */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-0 right-8 w-12 h-12 bg-white/10 rounded-full blur-lg" />

                    {/* Content */}
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1 pr-3">
                            {/* Label */}
                            <div className="inline-flex items-center text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                TODAY'S FOCUS
                            </div>

                            {/* Title */}
                            <h2 className="text-white text-lg font-bold leading-tight mb-1 font-serif">
                                {currentConfig.content.title}
                            </h2>
                            <p className="text-white/80 text-xs mb-3 line-clamp-2 leading-relaxed">
                                {currentConfig.content.subtitle}
                            </p>

                            {/* CTA Button */}
                            <button className={`inline-flex items-center gap-2 bg-white ${currentConfig.theme.buttonText} px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all group-hover:scale-105`}>
                                <span>Start session</span>
                                <div className={`w-4 h-4 ${currentConfig.theme.iconBg} rounded-full flex items-center justify-center`}>
                                    <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                                </div>
                            </button>
                        </div>

                        {/* Floating Icon */}
                        <div className="relative mt-1">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                                <currentConfig.content.icon className="w-6 h-6 text-white" />
                            </div>
                            {/* Small badges */}
                            <div className="absolute -bottom-1.5 -left-1.5 flex gap-0.5">
                                <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center shadow-md">
                                    <Zap className="w-3 h-3 text-white fill-white" />
                                </div>
                                <div className="w-5 h-5 bg-yellow-400 rounded-md flex items-center justify-center shadow-md">
                                    <Flame className="w-3 h-3 text-white fill-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badge Tags */}
                    <div className="relative z-10 flex items-center gap-3 mt-3 pt-2.5 border-t border-white/20">
                        {currentConfig.content.badges.map((badge: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 text-white/90 text-[10px]">
                                <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-2 h-2" />
                                </div>
                                <span>{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 4. Quick Actions (2 Cards) --- */}
            <div className="px-4">
                <div className="grid grid-cols-2 gap-3">
                    {/* PDF Quiz */}
                    <button
                        onClick={() => onNavigate(AppView.PDF_UPLOAD)}
                        className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <FileText className="w-5 h-5 text-slate-500 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm mb-0.5">PDF to Quiz</h3>
                                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                                    Upload & generate
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Error Jail */}
                    <button
                        onClick={() => onNavigate(AppView.ERROR_JAIL)}
                        className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                <Lock className="w-5 h-5 text-slate-500 group-hover:text-orange-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm mb-0.5">Error Jail</h3>
                                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                                    Fix past mistakes
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* --- 5. Skill Tools Section --- */}
            <div className="px-4 mt-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-base">Skill Tools</h3>
                    <button
                        onClick={() => onNavigate(AppView.MORE_HUB)}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View all <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {/* Writing Gym Card */}
                    <button
                        onClick={() => onNavigate(AppView.WRITING_GYM)}
                        className="flex-shrink-0 bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all w-[140px] text-left group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Dumbbell className="w-4.5 h-4.5 text-orange-500" />
                            </div>
                            <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Grammar</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-0.5 group-hover:text-blue-600 transition-colors">Writing Gym</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Build muscle memory</p>
                    </button>

                    {/* Essay Dojo Card */}
                    <button
                        onClick={() => onNavigate(AppView.WRITING)}
                        className="flex-shrink-0 bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all w-[140px] text-left group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <PenTool className="w-4.5 h-4.5 text-blue-600" />
                            </div>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Writing</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-0.5 group-hover:text-blue-600 transition-colors">Essay Dojo</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Timed AI grading</p>
                    </button>

                    {/* Speaking Lab Card */}
                    <button
                        onClick={() => onNavigate(AppView.SPEAKING_HUB)}
                        className="flex-shrink-0 bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all w-[140px] text-left group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Mic className="w-4.5 h-4.5 text-green-600" />
                            </div>
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Speaking</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-0.5 group-hover:text-blue-600 transition-colors">Speaking Lab</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Shadowing & drills</p>
                    </button>

                    {/* Paraphrase Card */}
                    <button
                        onClick={() => onNavigate(AppView.PARAPHRASE_PRACTICE)}
                        className="flex-shrink-0 bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-all w-[140px] text-left group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Layers className="w-4.5 h-4.5 text-purple-600" />
                            </div>
                            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Reading</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-0.5 group-hover:text-blue-600 transition-colors">Paraphrase</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Rewrite sentences</p>
                    </button>
                </div>
            </div>
        </div>
    );
};