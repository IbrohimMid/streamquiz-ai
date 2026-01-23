import React from 'react';
import {
    ShieldCheck, Dumbbell, PenTool, Mic, BookOpen,
    ArrowLeft, Target, Zap, Sparkles, ChevronRight,
    Brain, Layers, GraduationCap
} from 'lucide-react';
import { AppView } from '../../../types';

interface PracticeHubViewProps {
    onNavigate: (view: AppView) => void;
}

interface PracticeItem {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    category: 'CORE' | 'SKILL';
    theme: 'blue' | 'orange' | 'green' | 'purple';
    badge?: string;
    recommended?: boolean;
    onClick: () => void;
}

const PracticeCard: React.FC<{ item: PracticeItem }> = ({ item }) => {
    const themeStyles = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'hover:border-blue-200',
            badge: 'bg-blue-100 text-blue-700'
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            border: 'hover:border-orange-200',
            badge: 'bg-orange-100 text-orange-700'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            border: 'hover:border-green-200',
            badge: 'bg-green-100 text-green-700'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            border: 'hover:border-purple-200',
            badge: 'bg-purple-100 text-purple-700'
        }
    };

    const style = themeStyles[item.theme];
    const isCore = item.category === 'CORE';

    return (
        <button
            onClick={item.onClick}
            className={`
                group relative flex flex-col text-left
                bg-white border border-slate-200 rounded-2xl
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/5
                ${style.border}
                ${isCore ? 'col-span-2 p-5' : 'col-span-1 p-4'}
            `}
        >
            {item.recommended && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>BEST START</span>
                </div>
            )}

            <div className={`flex ${isCore ? 'flex-row items-start gap-4' : 'flex-col gap-3'}`}>
                <div className={`
                    ${style.bg} ${style.text}
                    rounded-xl flex items-center justify-center
                    transition-transform group-hover:scale-110
                    ${isCore ? 'w-12 h-12 shrink-0' : 'w-10 h-10'}
                `}>
                    <item.icon className={isCore ? 'w-6 h-6' : 'w-5 h-5'} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {item.title}
                        </h3>
                    </div>

                    <p className={`text-slate-500 leading-snug ${isCore ? 'text-sm' : 'text-xs line-clamp-2'}`}>
                        {item.description}
                    </p>

                    <div className={`flex items-center justify-between ${isCore ? 'mt-3' : 'mt-4'}`}>
                        {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${style.badge}`}>
                                {item.badge}
                            </span>
                        )}
                        {isCore && (
                            <div className="flex items-center text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                Open <ChevronRight className="w-3 h-3 ml-1" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({ onNavigate }) => {
    
    const practiceItems: PracticeItem[] = [
        {
            id: 'learning-path',
            category: 'CORE',
            title: 'Learning Path',
            description: 'Your personalized roadmap. Master skills module by module.',
            icon: GraduationCap,
            theme: 'blue',
            badge: 'Guided',
            recommended: true,
            onClick: () => onNavigate(AppView.LEARNING_PATH)
        },
        {
            id: 'simulation',
            category: 'CORE',
            title: 'Full Simulation',
            description: 'Realistic TOEFL Structure & Written Expression test environment.',
            icon: ShieldCheck,
            theme: 'purple',
            badge: '40 Questions',
            onClick: () => onNavigate(AppView.SIMULATION)
        },
        {
            id: 'writing-gym',
            category: 'SKILL',
            title: 'Writing Gym',
            description: 'Build muscle memory with clause & style drills.',
            icon: Dumbbell,
            theme: 'orange',
            badge: 'Grammar',
            onClick: () => onNavigate(AppView.WRITING_GYM)
        },
        {
            id: 'essay',
            category: 'SKILL',
            title: 'Essay Dojo',
            description: 'Timed writing with AI grading.',
            icon: PenTool,
            theme: 'blue',
            badge: 'Writing',
            onClick: () => onNavigate(AppView.WRITING)
        },
        {
            id: 'speaking-lab',
            category: 'SKILL',
            title: 'Speaking Lab',
            description: 'Practice speaking with Shadowing, Verbal Drills & more.',
            icon: Mic,
            theme: 'green',
            badge: 'Speaking',
            onClick: () => onNavigate(AppView.SPEAKING_HUB)
        },
        {
            id: 'paraphrase',
            category: 'SKILL',
            title: 'Paraphrase',
            description: 'Rewrite sentences without changing meaning.',
            icon: Layers,
            theme: 'purple',
            badge: 'Reading',
            onClick: () => onNavigate(AppView.PARAPHRASE_PRACTICE)
        }
    ];

    const coreItems = practiceItems.filter(i => i.category === 'CORE');
    const skillItems = practiceItems.filter(i => i.category === 'SKILL');

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* --- Hero Header --- */}
            <div
                className="relative z-0 px-5 pt-6 pb-24 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)' }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500 opacity-[0.05] rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => onNavigate(AppView.DASHBOARD)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Practice Hub</h1>
                            <p className="text-blue-100 text-xs font-medium opacity-80">Refine your English skills</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-300">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white leading-none">6</div>
                                <div className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Activities</div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-200">
                                <Brain className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white leading-none">All</div>
                                <div className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Levels</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="relative z-10 -mt-12 bg-slate-50 rounded-t-[2.5rem]">
                <div className="container max-w-2xl mx-auto px-5 pt-6 space-y-6">

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1">
                            <Target className="w-4 h-4 text-slate-500" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Core Training</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {coreItems.map(item => (
                                <PracticeCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1">
                            <Dumbbell className="w-4 h-4 text-slate-500" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Gym</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {skillItems.map(item => (
                                <PracticeCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm mb-1">Consistency is Key</h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Start with the <strong>Learning Path</strong> to identify your weak areas, then use the <strong>Gym</strong> for targeted drills.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};