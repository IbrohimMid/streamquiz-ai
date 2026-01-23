import React, { useMemo, useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, Clock, Search,
    Play, Flame, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MicroLesson } from '../../../types';

interface MicroLearningViewProps {
    onBack: () => void;
}

export const MOCK_LESSONS: MicroLesson[] = [
    {
        id: '1',
        title: 'The "Who" vs "Whom" Hack',
        description: 'Never get confused again with this simple substitution trick.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
        duration: '2 min',
        durationMinutes: 2,
        isDownloaded: false,
        category: 'GRAMMAR_HACK',
        section: 'STRUCTURE',
        mode: 'VIDEO',
        level: 'EASY',
        contentMarkdown: '## The He/Him Method\n\nIf you can replace the word with **he**, use **who**.\nIf you can replace it with **him**, use **whom**.'
    },
    {
        id: '2',
        title: '5 Academic Verbs for Essays',
        description: 'Upgrade your writing instantly by swapping these common verbs.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
        duration: '3 min',
        durationMinutes: 3,
        isDownloaded: true,
        category: 'VOCAB_BOOST',
        section: 'WRITING',
        mode: 'TEXT',
        level: 'MEDIUM',
        contentMarkdown: '## Upgrade List\n\n1. **Use** -> **Utilize** / **Employ**\n2. **Show** -> **Demonstrate** / **Illustrate**'
    },
    {
        id: '3',
        title: 'Listening Section Strategy',
        description: 'How to predict the answer before hearing the dialogue.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
        duration: '4 min',
        durationMinutes: 4,
        isDownloaded: false,
        category: 'STUDY_TIP',
        section: 'LISTENING',
        mode: 'VIDEO',
        level: 'EASY',
        contentMarkdown: '## Preview the Options\n\nBefore the audio starts, read the 4 options. They tell you the **topic**.'
    }
];

const getCategoryColor = (cat: MicroLesson['category']) => {
    switch (cat) {
        case 'GRAMMAR_HACK': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'VOCAB_BOOST': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'STUDY_TIP': return 'bg-orange-100 text-orange-700 border-orange-200';
        default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

export const MicroLearningView: React.FC<MicroLearningViewProps> = ({ onBack }) => {
    const [lessons, setLessons] = useState<MicroLesson[]>(MOCK_LESSONS);
    const [durationFilter, setDurationFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    const filteredLessons = useMemo(() => {
        const term = searchQuery.toLowerCase().trim();
        return lessons.filter(l => {
            if (durationFilter && l.durationMinutes && l.durationMinutes > durationFilter) return false;
            if (term && !l.title.toLowerCase().includes(term) && !l.description.toLowerCase().includes(term)) return false;
            return true;
        });
    }, [lessons, durationFilter, searchQuery]);

    const heroLesson = filteredLessons[0];
    const quickBites = filteredLessons.filter(l => (l.durationMinutes || 0) <= 2 && l.id !== heroLesson?.id);
    const grammarHacks = filteredLessons.filter(l => l.category === 'GRAMMAR_HACK' && l.id !== heroLesson?.id);
    const trending = filteredLessons.filter(l => l.id !== heroLesson?.id && !quickBites.includes(l) && !grammarHacks.includes(l));

    const handleLessonSelect = (id: string) => {
        alert("Micro-lesson player coming soon!");
    };

    const renderPill = (label: string, isActive: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 pt-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-orange-100">
                            <Flame className="w-3 h-3 mr-1" />
                            <span>3 Day Streak</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-xl font-bold text-slate-800 mb-0.5 tracking-tight">
                    {getGreeting()}, Scholar.
                </h1>
                <p className="text-slate-500 text-xs mb-3">
                    Ready for your daily knowledge bite?
                </p>

                {/* Search & Filter Bar */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find a topic..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {renderPill('All Bites', durationFilter === null, () => setDurationFilter(null))}
                        {renderPill('Quick (< 2m)', durationFilter === 2, () => setDurationFilter(durationFilter === 2 ? null : 2))}
                        {renderPill('Deep Dive (> 5m)', durationFilter === 10, () => setDurationFilter(durationFilter === 10 ? null : 10))}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6 animate-fade-in">
                {/* Hero Card */}
                {heroLesson && !searchQuery && (
                    <div onClick={() => handleLessonSelect(heroLesson.id)} className="cursor-pointer group">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                <span>Daily Pick</span>
                            </div>
                        </div>
                        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                            <img
                                src={heroLesson.thumbnailUrl}
                                alt={heroLesson.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute top-3 left-3">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border shadow-sm ${getCategoryColor(heroLesson.category)}`}>
                                    {heroLesson.category.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="flex items-center gap-2 text-white/80 text-xs font-semibold mb-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{heroLesson.duration}</span>
                                    <span>•</span>
                                    <span>{heroLesson.section}</span>
                                </div>
                                <h2 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-blue-200 transition-colors">
                                    {heroLesson.title}
                                </h2>
                                <p className="text-white/70 text-xs line-clamp-1">
                                    {heroLesson.description}
                                </p>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                                    <Play className="w-6 h-6 text-white ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Horizontal Rails */}
                {quickBites.length > 0 && (
                    <CategoryRail
                        title="Quick Coffee Bites"
                        subtitle="Learn something in under 2 minutes"
                        lessons={quickBites}
                        onNavigate={handleLessonSelect}
                        completedIds={completedIds}
                    />
                )}

                {grammarHacks.length > 0 && (
                    <CategoryRail
                        title="Grammar Hacks"
                        subtitle="Shortcuts to ace Structure"
                        lessons={grammarHacks}
                        onNavigate={handleLessonSelect}
                        completedIds={completedIds}
                    />
                )}

                {/* Vertical Feed for the rest */}
                {trending.length > 0 && (
                    <div className="space-y-3">
                        <div className="px-1">
                            <h2 className="text-base font-bold text-slate-800">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {trending.map(lesson => (
                                <div
                                    key={lesson.id}
                                    onClick={() => handleLessonSelect(lesson.id)}
                                    className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                                >
                                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative bg-slate-100">
                                        <img src={lesson.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                            {lesson.duration}
                                        </div>
                                    </div>
                                    <div className="flex-1 py-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getCategoryColor(lesson.category)} bg-opacity-50`}>
                                                {lesson.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-0.5 line-clamp-2">
                                            {lesson.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                            {lesson.description}
                                        </p>
                                    </div>
                                    <div className="self-center">
                                        {completedIds.has(lesson.id) ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                                <Play className="w-3 h-3 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredLessons.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No bites found.</p>
                        <Button
                            variant="ghost"
                            onClick={() => { setSearchQuery(''); setDurationFilter(null); }}
                            className="text-blue-600 mt-2 hover:bg-blue-50"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface CategoryRailProps {
    title: string;
    subtitle?: string;
    lessons: MicroLesson[];
    onNavigate: (id: string) => void;
    completedIds: Set<string>;
}

const CategoryRail: React.FC<CategoryRailProps> = ({ title, subtitle, lessons, onNavigate, completedIds }) => {
    return (
        <div className="space-y-2">
            <div className="px-1">
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 no-scrollbar snap-x">
                {lessons.map(lesson => (
                    <div
                        key={lesson.id}
                        onClick={() => onNavigate(lesson.id)}
                        className="snap-start shrink-0 w-60 group cursor-pointer"
                    >
                        <div className="aspect-video rounded-xl overflow-hidden relative mb-2 shadow-sm border border-slate-200">
                            <img src={lesson.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                            {completedIds.has(lesson.id) && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                {lesson.duration}
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};