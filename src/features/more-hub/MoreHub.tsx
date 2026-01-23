import React from 'react';
import {
    BarChart2, Lock, Video, User, Settings, LogOut, ChevronRight,
    Crown, Bot, Mic, Swords, Users, FileEdit,
    TrendingUp, Maximize2, Download, Zap, Shield, GraduationCap
} from 'lucide-react';
import { AppView, UserProgress } from '../../../types';

interface MoreHubProps {
    onNavigate: (view: AppView) => void;
    onSignOut: () => void;
    user: any;
    progress: UserProgress;
}

const FeatureCard: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    theme: 'indigo' | 'green' | 'red' | 'emerald' | 'blue' | 'orange';
    onClick: () => void;
    badge?: number | string;
}> = ({ icon: Icon, title, subtitle, theme, onClick, badge }) => {

    const themes = {
        indigo: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'hover:border-green-200' },
        red: { bg: 'bg-red-50', text: 'text-red-500', border: 'hover:border-red-200' },
        emerald: { bg: 'bg-green-50', text: 'text-green-600', border: 'hover:border-green-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-200' },
    };

    const t = themes[theme];

    return (
        <button
            onClick={onClick}
            className={`
                group relative flex flex-col items-start p-4
                bg-white border border-slate-200 rounded-2xl
                transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                ${t.border} text-left h-full
            `}
        >
            <div className="flex justify-between w-full mb-3">
                <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center ${t.text} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                </div>
                {badge && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full h-fit shadow-sm animate-pulse">
                        {badge}
                    </span>
                )}
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
            <p className="text-[10px] text-slate-500 leading-snug">{subtitle}</p>
        </button>
    );
};

const ListItem: React.FC<{
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    color?: string;
    rightElement?: React.ReactNode;
}> = ({ icon: Icon, label, onClick, color = "text-slate-500", rightElement }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
    >
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} transition-colors group-hover:text-blue-600`} />
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        {rightElement || <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />}
    </button>
);

export const MoreHub: React.FC<MoreHubProps> = ({ onNavigate, onSignOut, user, progress }) => {
    const [isFullscreen, setIsFullscreen] = React.useState(!!document.fullscreenElement);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDownloadApk = () => {
        alert('This is a demo. App download coming soon!');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* --- Hero Header (User Profile) --- */}
            <div
                className="relative z-0 px-5 pt-8 pb-24 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)' }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 max-w-2xl mx-auto flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                            {user?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Lvl {progress.level}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Guest User'}</h2>
                        <p className="text-blue-100 text-xs opacity-80 mb-2">{user?.email || 'Start your journey today'}</p>

                        {/* XP Bar */}
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-32 bg-blue-900/30 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-orange-400 rounded-full" style={{ width: '65%' }} />
                            </div>
                            <span className="text-[10px] text-orange-200 font-bold">{progress.xp.toLocaleString()} XP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 -mt-12 bg-slate-50 rounded-t-[2.5rem]">
                <div className="container max-w-2xl mx-auto px-5 pt-6 space-y-6">

                    {/* Section 1: AI Power Tools */}
                    <div>
                        <div className="flex items-center gap-2 pl-1 mb-3">
                            <Bot className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">AI Studio</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FeatureCard
                                icon={Bot}
                                title="AI Mentor"
                                subtitle="24/7 Personal Coach"
                                theme="indigo"
                                onClick={() => onNavigate(AppView.AI_CHAT)}
                            />
                            <FeatureCard
                                icon={Mic}
                                title="Socratic Tutor"
                                subtitle="Voice-based interactive learning"
                                theme="green"
                                onClick={() => onNavigate(AppView.SOCRATIC)}
                            />
                            <FeatureCard
                                icon={Swords}
                                title="Devil's Advocate"
                                subtitle="Challenge your arguments"
                                theme="red"
                                onClick={() => onNavigate(AppView.DEVILS_ADVOCATE)}
                            />
                            <FeatureCard
                                icon={TrendingUp}
                                title="Score Oracle"
                                subtitle="AI Score Prediction"
                                theme="emerald"
                                onClick={() => onNavigate(AppView.ORACLE)}
                            />
                        </div>
                    </div>

                    {/* Section 2: Essentials */}
                    <div>
                        <div className="flex items-center gap-2 pl-1 mb-3">
                            <Zap className="w-4 h-4 text-orange-600" />
                            <h2 className="text-xs font-bold text-orange-900 uppercase tracking-wider">Essentials</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <FeatureCard
                                    icon={BarChart2}
                                    title="Performance Analytics"
                                    subtitle="Deep dive into your strengths & weaknesses"
                                    theme="blue"
                                    onClick={() => onNavigate(AppView.ANALYTICS)}
                                />
                            </div>
                            <FeatureCard
                                icon={Lock}
                                title="Error Jail"
                                subtitle="Review your mistakes"
                                theme="orange"
                                badge="3 Pending"
                                onClick={() => onNavigate(AppView.ERROR_JAIL)}
                            />
                            <FeatureCard
                                icon={Crown}
                                title="Leaderboard"
                                subtitle="Global Rankings"
                                theme="orange"
                                onClick={() => onNavigate(AppView.LEADERBOARD)}
                            />
                        </div>
                    </div>

                    {/* Section 3: Menu */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pl-1">
                            <Settings className="w-4 h-4 text-slate-500" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</h2>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                            <ListItem icon={Users} label="Friends & Study Circle" onClick={() => onNavigate(AppView.FRIEND_LIST)} color="text-cyan-600" />
                            <ListItem icon={GraduationCap} label="Virtual Study Room" onClick={() => onNavigate(AppView.STUDY_ROOM)} color="text-indigo-600" />
                            <ListItem icon={Video} label="Live Tutoring" onClick={() => onNavigate(AppView.TUTORING)} color="text-purple-600" />
                            <ListItem icon={FileEdit} label="Peer Review" onClick={() => onNavigate(AppView.PEER_REVIEW)} color="text-amber-600" />
                            <ListItem icon={User} label="My Profile" onClick={() => onNavigate(AppView.PROFILE)} />
                            <ListItem icon={Settings} label="Settings" onClick={() => onNavigate(AppView.SETTINGS)} />
                            <ListItem
                                icon={Maximize2}
                                label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                                onClick={toggleFullscreen}
                                rightElement={<div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">TOGGLE</div>}
                            />
                            <ListItem
                                icon={Download}
                                label="Download Android App"
                                onClick={handleDownloadApk}
                                rightElement={<div className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded">APK</div>}
                            />
                        </div>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-2 pb-6">
                        <button
                            onClick={onSignOut}
                            className="w-full bg-white border border-red-100 rounded-2xl p-3 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 transition-colors shadow-sm mb-6"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>

                        <div className="flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-3 h-3" />
                                <span className="text-[10px] font-semibold tracking-wider">TOEFL MASTER v1.0</span>
                            </div>
                            <p className="text-[10px]">Empowered by AI • Designed for Excellence</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};