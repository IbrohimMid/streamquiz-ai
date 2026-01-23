import React, { useState, useEffect } from 'react';
import { TOEFL_STRUCTURE_SKILLS, TOEFL_LISTENING_SKILLS, TOEFL_READING_SKILLS } from '../../../data/skills';
import { Skill, SectionType } from '../../../types';
import { BookOpen, Headphones, Book, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';

interface SkillSelectorProps {
  onSelectSkill: (skill: Skill) => void;
  isLoading?: boolean;
  hideHeader?: boolean;
  initialSection?: SectionType;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ onSelectSkill, isLoading, hideHeader, initialSection }) => {
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection || 'STRUCTURE');

  // Track active category index PER PART. 
  // Key: Part Name, Value: Index of the selected category in that part
  const [activeCategoryIndices, setActiveCategoryIndices] = useState<Record<string, number>>({});

  let currentSkills: Skill[] = [];
  if (activeSection === 'STRUCTURE') currentSkills = TOEFL_STRUCTURE_SKILLS;
  else if (activeSection === 'LISTENING') currentSkills = TOEFL_LISTENING_SKILLS;
  else currentSkills = TOEFL_READING_SKILLS;

  // Helper to extract clean category number (e.g. "I. Sentences...", "A. Sentences..." -> "01")
  const getCategoryNumber = (categoryName: string, index: number) => {
    // Try to find Roman numerals or Letters
    const match = categoryName.match(/^([IVX]+|[A-Z])\.\s+(.+)/);
    if (match) {
      return (index + 1).toString().padStart(2, '0');
    }
    return (index + 1).toString().padStart(2, '0');
  };

  const getCleanCategoryName = (categoryName: string) => {
    // Remove "I. ", "II. ", "A. ", "B. " etc.
    return categoryName.replace(/^([IVX]+|[A-Z])\.\s+/, '');
  };

  // Group by Part first
  const groupedByPart = currentSkills.reduce((acc, skill) => {
    const part = skill.part || 'Main';
    if (!acc[part]) {
      acc[part] = { skills: [], categories: {}, categoryNames: [] };
    }
    acc[part].skills.push(skill);

    if (!acc[part].categories[skill.category]) {
      acc[part].categories[skill.category] = [];
      acc[part].categoryNames.push(skill.category);
    }
    acc[part].categories[skill.category].push(skill);
    return acc;
  }, {} as Record<string, {
    skills: Skill[],
    categories: Record<string, Skill[]>,
    categoryNames: string[]
  }>);

  // Initialize active indices when section changes or on mount
  useEffect(() => {
    const initialIndices: Record<string, number> = {};
    Object.keys(groupedByPart).forEach(key => {
      initialIndices[key] = 0;
    });
    setActiveCategoryIndices(initialIndices);
  }, [activeSection]);


  const getThemeColors = (section: SectionType) => {
    // All sections use the unified Blue/Orange theme now
    return {
      primary: 'text-text-primary',
      bg: 'bg-blue-soft',
      border: 'border-border-light',
      wrapper: 'bg-bg-card', // Simplify gradient to card bg
      button: 'bg-blue-primary hover:bg-blue-dark',
      lightBtn: 'bg-blue-soft text-text-primary',
      ring: 'ring-border-light'
    };
  };

  const theme = getThemeColors(activeSection);

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto pb-8">
      {!hideHeader && (
        <div className="text-left space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-text-primary">
            <BookOpen className="w-4 h-4" />
            <h2 className="text-base font-bold">Learning Path</h2>
          </div>

          <div className="flex md:inline-flex bg-blue-soft border border-border-light p-1 rounded-lg">
            {(['STRUCTURE', 'LISTENING', 'READING'] as SectionType[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeSection === sec
                  ? 'bg-blue-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {sec.charAt(0) + sec.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
      {hideHeader && (
        <div className="flex md:inline-flex bg-blue-soft border border-border-light p-1 rounded-lg mb-6">
          {(['STRUCTURE', 'LISTENING', 'READING'] as SectionType[]).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeSection === sec
                ? 'bg-blue-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {sec.charAt(0) + sec.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {Object.entries(groupedByPart).map(([partName, data], partIndex) => {
        const activeIndex = activeCategoryIndices[partName] || 0;
        const activeCategoryName = data.categoryNames[activeIndex];
        const activeSkills = data.categories[activeCategoryName] || [];
        const cleanActiveName = activeCategoryName ? getCleanCategoryName(activeCategoryName) : '';

        return (
          <div key={partName} className="space-y-6">
            {/* PART HEADER */}
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">{partName}</h2>
              <div className="h-px bg-border-light flex-grow"></div>
            </div>

            {/* MODULE SELECTOR GRID */}
            <div className="bg-bg-card rounded-2xl border border-border-light p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Book className={`w-5 h-5 ${theme.primary}`} />
                  <span className="font-bold text-text-primary">
                    {data.skills.length} SKILLS
                  </span>
                </div>
                <div className="text-xs text-text-secondary font-medium uppercase">
                  Select a Module
                </div>
              </div>

              {/* Grid of CATEGORIES (Modules) */}
              <div className="flex flex-wrap gap-2">
                {data.categoryNames.map((catName, idx) => {
                  const isActive = idx === activeIndex;
                  const displayNum = (idx + 1).toString().padStart(2, '0');

                  return (
                    <button
                      key={catName}
                      onClick={() => setActiveCategoryIndices(prev => ({
                        ...prev,
                        [partName]: prev[partName] === idx ? -1 : idx
                      }))}
                      className={`
                             w-10 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all border
                             ${isActive
                          ? `bg-blue-primary text-white border-transparent shadow-md transform scale-105`
                          : `bg-bg-card text-text-secondary border-border-light hover:border-blue-primary hover:text-text-primary hover:bg-blue-soft`}
                           `}
                    >
                      {displayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE CATEGORY CARD */}
            {activeSkills.length > 0 && (
              <div className="bg-bg-card rounded-xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
                {/* Header */}
                <div className={`p-3 border-b border-border-light flex items-center bg-blue-soft`}>
                  <div className={`
                         w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-base mr-3
                         bg-bg-card text-text-primary
                       `}>
                    {(activeIndex + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-base">
                      {cleanActiveName}
                    </h3>
                    <p className="text-xs text-text-secondary">{activeSkills.length} skills in this module</p>
                  </div>
                </div>

                {/* Skill List */}
                <div className="divide-y divide-border-light">
                  {activeSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => !isLoading && onSelectSkill(skill)}
                      className="w-full text-left p-3 pl-4 hover:bg-blue-soft transition-all flex items-center group cursor-pointer"
                    >
                      {/* Action Icon */}
                      <div className={`
                             mr-3 text-border-light group-hover:text-blue-primary transition-colors
                           `}>
                        {activeSection === 'STRUCTURE' ? <PlayCircle size={20} /> : <BookOpen size={20} />}
                      </div>

                      <div className="flex-grow min-w-0 mr-3">
                        <div className="text-sm font-semibold text-text-primary group-hover:text-blue-primary mb-0.5">
                          {skill.name.includes(':') ? skill.name.split(':')[1].trim() : skill.name}
                        </div>
                        <div className="text-xs text-text-secondary group-hover:text-text-primary truncate">
                          {skill.description}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-blue-soft opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};