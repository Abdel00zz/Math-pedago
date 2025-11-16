import React, { useMemo } from 'react';
import type { Chapter, ChapterProgress } from '../../types';
import StageBreadcrumb, { StageBreadcrumbStage } from '../StageBreadcrumb';

export type LessonStage = StageBreadcrumbStage;

interface LessonStageNavigationProps {
    chapter: Chapter;
    chapterProgress: ChapterProgress | null;
    activeStage: LessonStage;
    onNavigateHome?: () => void;
    onNavigateSteps?: () => void;
    onStageSelect?: (stage: LessonStage) => void;
}

type StageStatus = 'locked' | 'available' | 'active' | 'completed';

interface StageDefinition {
    id: LessonStage;
    label: string;
    status: StageStatus;
    disabled: boolean;
    meta?: string;
}

const statusStyles: Record<StageStatus, string> = {
    locked: 'text-text-disabled border-border bg-surface/40 cursor-not-allowed',
    available: 'text-text-secondary border-border bg-white hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary',
    active: 'text-primary border-primary bg-primary/10 shadow-sm',
    completed: 'text-success border-success/40 bg-success/10 shadow-sm',
};

const LessonStageNavigation: React.FC<LessonStageNavigationProps> = ({
    chapter,
    chapterProgress,
    activeStage,
    onNavigateHome,
    onNavigateSteps,
    onStageSelect,
}) => {
    const stageData = useMemo<StageDefinition[]>(() => {
        if (!chapter) {
            return [];
        }

        const hasLesson = !!(chapter.lesson || chapter.lessonFile);
        const lessonMeta = chapterProgress?.lesson;
        const lessonPercent = Math.max(
            lessonMeta?.scrollProgress ?? 0,
            lessonMeta?.checklistPercentage ?? 0,
        );
        const isLessonDone = !!lessonMeta?.isRead || lessonPercent >= 95;

        const totalVideos = chapter.videos?.length ?? 0;
        const watchedVideos = totalVideos > 0
            ? Object.values(chapterProgress?.videos?.watched || {}).filter(Boolean).length
            : 0;
        const videosPercent = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;
        const videosDone = totalVideos === 0 ? true : !!chapterProgress?.videos?.allWatched;

        const quizProgress = chapterProgress?.quiz;
        const totalQuestions = chapter.quiz?.length ?? 0;
        const answeredQuestions = quizProgress ? Object.keys(quizProgress.answers || {}).length : 0;
        const quizPercent = totalQuestions > 0 ? Math.round((Math.min(answeredQuestions, totalQuestions) / totalQuestions) * 100) : 0;
        const quizDone = !!quizProgress?.isSubmitted;

        const totalExercises = chapter.exercises?.length ?? 0;
        const evaluatedExercises = Object.keys(chapterProgress?.exercisesFeedback || {}).length;
        const exercisesPercent = totalExercises > 0 ? Math.round((Math.min(evaluatedExercises, totalExercises) / totalExercises) * 100) : 0;
        const exercisesDone = totalExercises > 0 ? evaluatedExercises >= totalExercises : true;

        const stages: StageDefinition[] = [
            {
                id: 'lesson',
                label: 'Leçon',
                disabled: !hasLesson,
                meta: hasLesson ? `${Math.round(lessonPercent)}%` : 'Non fournie',
                status: !hasLesson
                    ? 'locked'
                    : activeStage === 'lesson'
                        ? 'active'
                        : isLessonDone
                            ? 'completed'
                            : 'available',
            },
            {
                id: 'videos',
                label: 'Vidéos',
                disabled: totalVideos === 0,
                meta: totalVideos === 0 ? 'Aucune vidéo' : `${watchedVideos}/${totalVideos}`,
                status: totalVideos === 0
                    ? 'locked'
                    : activeStage === 'videos'
                        ? 'active'
                        : videosDone
                            ? 'completed'
                            : 'available',
            },
            {
                id: 'quiz',
                label: 'Quiz',
                disabled: !isLessonDone,
                meta: !isLessonDone ? 'Leçon requise' : `${quizPercent}%`,
                status: !isLessonDone
                    ? 'locked'
                    : activeStage === 'quiz'
                        ? 'active'
                        : quizDone
                            ? 'completed'
                            : 'available',
            },
            {
                id: 'exercises',
                label: 'Exercices',
                disabled: !quizDone,
                meta: !quizDone ? 'Quiz requis' : `${evaluatedExercises}/${totalExercises || 0}`,
                status: !quizDone
                    ? 'locked'
                    : activeStage === 'exercises'
                        ? 'active'
                        : exercisesDone
                            ? 'completed'
                            : 'available',
            },
        ];

        return stages;
    }, [chapter, chapterProgress, activeStage]);

    if (!chapter) {
        return null;
    }

    const disabledStages = stageData.filter((stage) => stage.disabled).map((stage) => stage.id);

    return (
        <div className="w-full space-y-3 md:space-y-4 mb-6">
            <StageBreadcrumb
                currentStage={activeStage}
                onNavigateHome={onNavigateHome}
                onNavigateSteps={onNavigateSteps}
                onSelectStage={onStageSelect}
                disabledStages={disabledStages}
            />

            <div className="flex flex-wrap justify-end gap-2">
                {stageData.map((stage) => (
                    <button
                        key={stage.id}
                        type="button"
                        className={`px-4 py-2 rounded-full border text-xs font-semibold tracking-[0.08em] uppercase transition-colors duration-200 ${statusStyles[stage.status]}`}
                        onClick={() => {
                            if (stage.disabled || !onStageSelect) return;
                            onStageSelect(stage.id);
                        }}
                        disabled={stage.disabled}
                        aria-current={stage.id === activeStage ? 'step' : undefined}
                    >
                        <span className="block text-right">{stage.label}</span>
                        {stage.meta && (
                            <span className="block text-[0.65rem] font-normal tracking-[0.1em] opacity-80">
                                {stage.meta}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export { LessonStageNavigation };
