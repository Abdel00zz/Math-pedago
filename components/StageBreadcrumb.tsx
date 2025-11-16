import React from 'react';

export type StageBreadcrumbStage = 'lesson' | 'videos' | 'quiz' | 'exercises';

interface StageBreadcrumbProps {
    currentStage?: StageBreadcrumbStage;
    className?: string;
    onNavigateHome?: () => void;
    onNavigateSteps?: () => void;
    onSelectStage?: (stage: StageBreadcrumbStage) => void;
    disabledStages?: StageBreadcrumbStage[];
    showStages?: boolean; // Si false, masque la section "Leçon / Vidéos / Quiz / Exercices"
}

const stageOrder: StageBreadcrumbStage[] = ['lesson', 'videos', 'quiz', 'exercises'];
const stageLabels: Record<StageBreadcrumbStage, string> = {
    lesson: 'Leçon',
    videos: 'Vidéos',
    quiz: 'Quiz',
    exercises: 'Exercices',
};

const StageBreadcrumb: React.FC<StageBreadcrumbProps> = ({
    currentStage = 'lesson',
    className = '',
    onNavigateHome,
    onNavigateSteps,
    onSelectStage,
    disabledStages = [],
    showStages = true, // Par défaut, afficher les étapes
}) => {
    const renderPrimarySegment = (label: string, handler?: () => void, key?: string) => {
        if (!handler) {
            return (
                <span key={key ?? label} className="stage-breadcrumb__label" aria-disabled="true">
                    {label}
                </span>
            );
        }

        return (
            <button
                key={key ?? label}
                type="button"
                className="stage-breadcrumb__label stage-breadcrumb__label--button"
                onClick={handler}
            >
                {label}
            </button>
        );
    };

    return (
        <nav className={`stage-breadcrumb ${className}`} aria-label="Navigation pédagogique">
            <div className="stage-breadcrumb__trail">
                {renderPrimarySegment('Page principale', onNavigateHome, 'home')}
                <span className="stage-breadcrumb__divider">/</span>
                {renderPrimarySegment('Les étapes', onNavigateSteps, 'steps')}
                {showStages && (
                    <>
                        <span className="stage-breadcrumb__divider">/</span>
                        <div className="stage-breadcrumb__stages" aria-label="Accès rapide aux activités">
                            {stageOrder.map((stage) => {
                                const isStageDisabled = disabledStages.includes(stage) || !onSelectStage;

                                return (
                                    <button
                                        key={stage}
                                        type="button"
                                        className={`stage-breadcrumb__stage${currentStage === stage ? ' stage-breadcrumb__stage--active' : ''}`}
                                        onClick={() => {
                                            if (isStageDisabled || !onSelectStage) return;
                                            onSelectStage(stage);
                                        }}
                                        aria-current={currentStage === stage ? 'step' : undefined}
                                        disabled={isStageDisabled}
                                        aria-disabled={isStageDisabled}
                                    >
                                        {stageLabels[stage]}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default StageBreadcrumb;
