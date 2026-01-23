import React from 'react';
import { Home, Zap, Dumbbell, Microscope, Menu } from 'lucide-react';
import { AppView } from '../../../types';

interface MobileTabBarProps {
    currentView: AppView;
    onNavigate: (view: AppView) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentView, onNavigate }) => {
    const handleTabClick = (tab: 'home' | 'daily' | 'practice' | 'vocab' | 'more') => {
        if (tab === 'home') {
            onNavigate(AppView.DASHBOARD);
        } else if (tab === 'daily') {
            // Placeholder for Daily/Micro Learning
            onNavigate(AppView.MICRO_LEARNING);
        } else if (tab === 'practice') {
            onNavigate(AppView.PRACTICE_HUB);
        } else if (tab === 'vocab') {
            onNavigate(AppView.VOCAB_HUB);
        } else {
            onNavigate(AppView.MORE_HUB);
        }
    };

    const isActive = (tab: 'home' | 'daily' | 'practice' | 'vocab' | 'more') => {
        if (tab === 'home') return currentView === AppView.DASHBOARD;
        if (tab === 'daily') return currentView === AppView.MICRO_LEARNING;
        if (tab === 'practice') return currentView === AppView.PRACTICE_HUB || [AppView.SIMULATION, AppView.WRITING_GYM, AppView.WRITING, AppView.SHADOWING, AppView.PARAPHRASE_PRACTICE, AppView.QUIZ].includes(currentView);
        if (tab === 'vocab') return currentView === AppView.VOCAB_HUB || [AppView.LEXICAL_LAB, AppView.LANGUAGE_DOJO, AppView.FLASHCARDS].includes(currentView);
        return currentView === AppView.MORE_HUB || [AppView.ANALYTICS, AppView.ERROR_JAIL, AppView.TUTORING, AppView.PROFILE, AppView.SETTINGS, AppView.PDF_UPLOAD, AppView.AI_CHAT, AppView.SOCRATIC, AppView.DEVILS_ADVOCATE, AppView.STUDY_ROOM, AppView.PEER_REVIEW, AppView.ORACLE].includes(currentView);
    };

    const tabs = [
        { id: 'home' as const, label: 'Home', icon: Home },
        { id: 'daily' as const, label: 'Daily', icon: Zap },
        { id: 'practice' as const, label: 'Practice', icon: Dumbbell },
        { id: 'vocab' as const, label: 'Vocab', icon: Microscope },
        { id: 'more' as const, label: 'More', icon: Menu },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-slate-100"
        >
            <div className="px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex justify-around items-center">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.id);

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex flex-col items-center justify-center p-1 rounded-2xl transition-all duration-300 min-w-[60px] group relative`}
                            >
                                {active && (
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full shadow-sm"></span>
                                )}
                                <div className={`p-2 rounded-xl transition-all duration-300 mb-0.5 ${active
                                    ? 'bg-blue-50 text-blue-600 scale-110'
                                    : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-50'
                                    }`}>
                                    <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold transition-colors ${active ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};