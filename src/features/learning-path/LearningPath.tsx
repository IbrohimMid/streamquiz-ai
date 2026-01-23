import React from 'react';
import { BookOpen } from 'lucide-react';
import { OnboardingProfile, OnboardingStatus, Skill, SectionType } from '../../../types';
import { SkillSelector } from '../../components/shared/SkillSelector';
import { Button } from '../../components/ui/Button';

interface LearningPathProps {
  onSelectSkill: (skill: Skill) => void;
  onOpenOnboarding: () => void;
  onboardingStatus: OnboardingStatus;
  onboardingProfile: OnboardingProfile;
  isLoading?: boolean;
  onBack?: () => void;
  initialSection?: SectionType;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  onSelectSkill,
  onOpenOnboarding,
  onboardingStatus,
  onboardingProfile,
  isLoading = false,
  onBack,
  initialSection
}) => {
  // Navigation state handling is managed by the parent (App.tsx)
  // We use props instead of useLocation to keep it clean and independent of router

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container mx-auto max-w-5xl px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Learning Path</h1>
          </div>
          {onBack && (
            <Button size="sm" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
        </div>

        <SkillSelector
          onSelectSkill={onSelectSkill}
          isLoading={isLoading}
          hideHeader
          initialSection={initialSection}
        />
      </div>
    </div>
  );
};