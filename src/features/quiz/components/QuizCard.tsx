import React, { useState, useEffect } from 'react';
import { QuizData } from '../../../../types';
import { Typewriter } from '../../../components/ui/Typewriter';
import { CheckCircle, X, Lightbulb, ArrowRight, Ban, Loader2, BookOpen, Search, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface QuizCardProps {
  data: QuizData;
  onAnswer: (key: string) => void;
  onNext: () => void;
  isAnswered: boolean;
  selectedOptionKey: string | null;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  data,
  onAnswer,
  onNext,
  isAnswered,
  selectedOptionKey,
}) => {
  const [eliminatedKeys, setEliminatedKeys] = useState<string[]>([]);
  const [structureTab, setStructureTab] = useState<'question' | 'explanation'>('question');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setEliminatedKeys([]);
    setStructureTab('question');
    setIsTyping(true);
  }, [data]);

  const toggleElimination = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    if (isAnswered) return;
    setEliminatedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isErrorIdentification = data.type === 'error_identification';
  const isCorrect = selectedOptionKey === data.correctAnswer;

  const renderPartBText = (text: string) => {
    const parts = text.split(/(\{[A-D]\}.*?\{\/??[A-D]\})/g);
    return (
      <p className="font-serif text-lg md:text-xl leading-loose text-slate-800">
        {parts.map((part, idx) => {
          const match = part.match(/\{([A-D])\}(.*?)\{\/??[A-D]\}/);
          if (match) {
            const key = match[1];
            const content = match[2];
            const isSelected = selectedOptionKey === key;
            const isTheCorrectOne = data.correctAnswer === key;

            let className = "border-b-2 border-slate-700 px-1 mx-0.5 cursor-pointer hover:bg-blue-50 transition-colors inline-block pb-0.5";

            if (isAnswered) {
              if (isTheCorrectOne) {
                className = "border-b-4 border-blue-600 bg-blue-50 text-blue-900 font-bold px-1 mx-0.5 inline-block pb-0.5";
              } else if (isSelected && !isTheCorrectOne) {
                className = "border-b-4 border-orange-500 bg-orange-50 text-orange-700 px-1 mx-0.5 inline-block pb-0.5";
              } else {
                className = "border-b-2 border-slate-300 opacity-50 px-1 mx-0.5 inline-block pb-0.5";
              }
            } else if (isSelected) {
              className = "border-b-4 border-blue-600 bg-blue-50 px-1 mx-0.5 inline-block pb-0.5";
            }

            return (
              <span key={idx} onClick={() => !isAnswered && onAnswer(key)} className={className}>
                {content}
                <sub className="text-xs font-sans text-slate-400 ml-1 select-none font-bold align-baseline">[{key}]</sub>
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </p>
    );
  };

  const renderPartAText = (text: string) => {
    const displayText = text.replace(/_{2,}/g, '<span class="inline-block border-b-2 border-slate-800 w-16 mx-1">&nbsp;</span>');
    return (
      <div className="font-serif text-lg md:text-xl leading-loose text-slate-800">
        {isTyping && !isAnswered ? (
          <Typewriter
            text={text.replace(/_{2,}/g, '_______')}
            speed={20}
            onComplete={() => setIsTyping(false)}
          />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: displayText }} />
        )}
      </div>
    );
  };

  const badge = isErrorIdentification
    ? { text: 'Identify the Error', class: 'bg-orange-50 text-orange-600 border-orange-100' }
    : { text: 'Complete the Sentence', class: 'bg-blue-50 text-blue-600 border-blue-100' };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up pb-10">

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex mb-4 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setStructureTab('question')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${structureTab === 'question' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Question
        </button>
        <button
          onClick={() => isAnswered && setStructureTab('explanation')}
          disabled={!isAnswered}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${structureTab === 'explanation' ? 'bg-white text-blue-800 shadow-sm' : !isAnswered ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Explanation {isAnswered && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">!</span>}
        </button>
      </div>

      <div className={`${structureTab === 'question' ? 'block' : 'hidden'} md:block`}>
        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

          <div className="p-6 md:p-8 border-b border-slate-50 bg-gradient-to-b from-blue-50/30 to-transparent">
            <div className="mb-4 flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${badge.class}`}>
                {isErrorIdentification ? <Loader2 className="w-3 h-3 mr-1.5" /> : <BookOpen className="w-3 h-3 mr-1.5" />}
                {badge.text}
              </span>
              <span className="inline-flex items-center px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                ✨ AI Generated
              </span>
            </div>

            <div className="min-h-[120px] flex items-center">
              {isErrorIdentification ? (
                <div className="animate-in fade-in duration-700 w-full">
                  {renderPartBText(data.question)}
                </div>
              ) : (
                renderPartAText(data.question)
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white">
            <div className="grid gap-3 grid-cols-1">
              {data.options.map((opt, idx) => {
                const isSelected = selectedOptionKey === opt.key;
                const isTheCorrectOne = data.correctAnswer === opt.key;
                const isEliminated = eliminatedKeys.includes(opt.key);

                let btnClass = "relative w-full text-left py-4 px-5 border rounded-xl transition-all duration-200 group flex items-center";

                if (isAnswered) {
                  if (isTheCorrectOne) {
                    btnClass += " bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600 shadow-sm";
                  } else if (isSelected && !isTheCorrectOne) {
                    btnClass += " bg-orange-50 border-orange-500 text-orange-900";
                  } else {
                    btnClass += " opacity-50 border-slate-100 grayscale bg-slate-50";
                  }
                } else if (isSelected) {
                  btnClass += " ring-2 ring-blue-600 border-blue-600 bg-blue-50 shadow-md";
                } else if (isEliminated) {
                  btnClass += " bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed";
                } else {
                  btnClass += " border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 hover:shadow-sm";
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => !isAnswered && !isEliminated && onAnswer(opt.key)}
                    disabled={isAnswered || isEliminated}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className={`${btnClass} animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm mr-4 border transition-colors ${isAnswered && isTheCorrectOne ? 'bg-blue-600 border-blue-600 text-white' :
                        isAnswered && isSelected ? 'bg-orange-500 border-orange-500 text-white' :
                          isEliminated ? 'bg-slate-100 border-slate-200 text-slate-300' :
                            'bg-white border-slate-200 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600'
                      }`}>
                      {opt.key}
                    </span>

                    <span className={`text-base font-medium flex-1 ${isEliminated ? 'line-through decoration-slate-300' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>

                    {!isAnswered && (
                      <div
                        onClick={(e) => toggleElimination(e, opt.key)}
                        className={`absolute right-4 p-2 rounded-full transition-all z-10 ${isEliminated
                            ? 'text-orange-500 bg-orange-50 hover:bg-orange-100 opacity-100'
                            : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500 opacity-0 group-hover:opacity-100'
                          }`}
                        title="Eliminate Answer"
                      >
                        <Ban className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isAnswered && (
        <div className={`${structureTab === 'explanation' ? 'block' : 'hidden'} md:block mt-4 animate-in slide-in-from-bottom-8 duration-500`}>

          {/* Action Buttons (Analysis) */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 md:pb-0">
            <button className="flex-1 whitespace-nowrap md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition-colors">
              <Sparkles className="w-4 h-4" />
              See the Fix
            </button>
            <button className="flex-1 whitespace-nowrap md:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-4 py-3 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
              <Search className="w-4 h-4" />
              Analyze Traps
            </button>
          </div>

          <div className={`rounded-[24px] p-6 border-l-[6px] shadow-lg ${isCorrect ? 'bg-white border-blue-600' : 'bg-white border-orange-500'}`}>

            <div className="flex items-start gap-4 mb-4">
              <div className={`p-2 rounded-2xl ${isCorrect ? 'bg-blue-50' : 'bg-orange-50'}`}>
                {isCorrect ? <CheckCircle className="w-6 h-6 text-blue-600" /> : <X className="w-6 h-6 text-orange-500" />}
              </div>
              <div>
                <h3 className={`font-bold text-lg leading-tight ${isCorrect ? 'text-blue-900' : 'text-orange-900'}`}>
                  {isCorrect ? 'Excellent!' : 'Not quite right'}
                </h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">AI Explanation</p>
              </div>
            </div>

            {data.patternTip && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-100 text-xs font-semibold text-yellow-800">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />
                <span>Pattern: {data.patternTip}</span>
              </div>
            )}

            <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <Typewriter text={data.explanation} speed={15} showCursor={true} />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onNext} className="gap-2 rounded-xl shadow-lg shadow-blue-900/10">
                Next Question <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};