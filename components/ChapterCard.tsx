import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chapter, ChapterProgress } from '../types';
import SessionStatus from './SessionStatus';
import {
    LESSON_PROGRESS_EVENT,
    LESSON_PROGRESS_REFRESH_EVENT,
    readLessonCompletion,
    type LessonCompletionSummary,
    type LessonProgressEventDetail,
} from '../utils/lessonProgressHelpers';

interface ChapterCardProps {
    chapter: Chapter;
    progress: ChapterProgress;
    onSelect: (chapterId: string) => void;
}

interface StatusInfo {
    text: string;
    icon: string;
    disabled: boolean;
    variant: 'todo' | 'progress' | 'completed' | 'update' | 'locked';
    color: string;
}

const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, progress, onSelect }) => {
    const lessonId = useMemo(() => `${chapter.class}-${chapter.chapter}`, [chapter.class, chapter.chapter]);
    
    // 🔥 SOLUTION RADICALE FINALE: Utiliser progress.lesson depuis AppContext (source unique de vérité)
    // au lieu de recalculer depuis lessonProgressService qui peut être désynchronisé
    const lessonCompletion = useMemo<LessonCompletionSummary>(() => {
        // Priorité 1: Utiliser progress.lesson depuis AppContext
        if (progress?.lesson?.totalParagraphs !== undefined && progress.lesson.totalParagraphs > 0) {
            const result = {
                completed: progress.lesson.completedParagraphs || 0,
                total: progress.lesson.totalParagraphs,
                percentage: progress.lesson.checklistPercentage || 0,
            };
            console.log(`📊 ChapterCard using progress.lesson for ${chapter.chapter}:`, result);
            return result;
        }
        
        // Fallback: Lire depuis lessonProgressService (pour compatibilité)
        if (!lessonId) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const fallback = readLessonCompletion(lessonId);
        console.log(`📊 ChapterCard fallback for ${chapter.chapter}:`, fallback);
        return fallback;
    }, [progress?.lesson, lessonId, chapter.chapter]);

    const getStatusInfo = useCallback((): StatusInfo => {
        if (progress?.hasUpdate) {
            return {
                text: 'Mis à jour',
                icon: 'update',
                disabled: false,
                variant: 'update',
                color: '#a855f7',
            };
        }
        if (progress?.isWorkSubmitted) {
            return {
                text: 'Terminé',
                icon: 'check_circle',
                disabled: false,
                variant: 'completed',
                color: '#22c55e',
            };
        }
        if (!chapter.isActive) {
            return {
                text: 'Verrouillé',
                icon: 'lock',
                disabled: true,
                variant: 'locked',
                color: '#94a3b8',
            };
        }
        if (
            progress?.quiz?.isSubmitted ||
            Object.keys(progress?.exercisesFeedback || {}).length > 0 ||
            lessonCompletion.percentage > 0
        ) {
            return {
                text: 'En cours',
                icon: 'pending',
                disabled: false,
                variant: 'progress',
                color: '#eab308',
            };
        }
        return {
            text: 'À faire',
            icon: 'radio_button_unchecked',
            disabled: false,
            variant: 'todo',
            color: '#f97316',
        };
    }, [chapter.isActive, progress, lessonCompletion.percentage]);

    const { text, icon, variant, disabled, color } = getStatusInfo();

    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect(chapter.id);
        }
    }, [disabled, onSelect, chapter.id]);

    // Calcul intelligent basé sur les trois piliers (leçon, quiz, exercices)
    const progressPercentage = useMemo(() => {
        const contributions: Array<{ weight: number; value: number }> = [];

        // ✅ FIX: N'inclure la leçon que si elle a été structurée (total > 0)
        // Sinon, la progression circulaire reste à 0% même si quiz/exercices sont faits
        if (chapter.lesson && lessonCompletion.total > 0) {
            const weight = lessonCompletion.total;
            const value = Math.max(0, Math.min(lessonCompletion.percentage / 100, 1));
            contributions.push({ weight, value });
            console.log(`📊 Lesson contribution for ${chapter.chapter}: weight=${weight}, value=${value}, percentage=${lessonCompletion.percentage}`);
        }

        const totalQuestions = chapter.quiz?.length ?? 0;
        if (totalQuestions > 0) {
            const quizAnswers = progress?.quiz?.answers ? Object.keys(progress.quiz.answers).length : 0;
            const quizValue = progress?.quiz?.isSubmitted
                ? 1
                : totalQuestions > 0
                    ? Math.min(quizAnswers, totalQuestions) / totalQuestions
                    : 0;
            contributions.push({ weight: totalQuestions, value: quizValue });
            console.log(`📊 Quiz contribution for ${chapter.chapter}: weight=${totalQuestions}, value=${quizValue}`);
        }

        const totalExercises = chapter.exercises?.length ?? 0;
        if (totalExercises > 0) {
            const completedExercises = Object.keys(progress?.exercisesFeedback || {}).length;
            const exerciseValue = totalExercises > 0
                ? Math.min(completedExercises, totalExercises) / totalExercises
                : 0;
            contributions.push({ weight: totalExercises, value: exerciseValue });
            console.log(`📊 Exercise contribution for ${chapter.chapter}: weight=${totalExercises}, value=${exerciseValue}`);
        }

        if (contributions.length === 0) {
            console.log(`📊 No contributions for ${chapter.chapter}, returning 0%`);
            return 0;
        }

        const totalWeight = contributions.reduce((acc, item) => acc + item.weight, 0);
        if (!totalWeight) {
            console.log(`📊 Total weight is 0 for ${chapter.chapter}, returning 0%`);
            return 0;
        }

        const weightedValue = contributions.reduce((acc, item) => acc + item.value * item.weight, 0) / totalWeight;
        const finalPercentage = Math.round(Math.max(0, Math.min(weightedValue, 1)) * 100);
        console.log(`📊 Final progress for ${chapter.chapter}: ${finalPercentage}% (contributions:`, contributions, `)`)
        return finalPercentage;
    }, [chapter, progress, lessonCompletion]);

    // Stats computation
    const stats = useMemo(() => {
        const items = [];

        if (chapter.lesson) {
            items.push({
                icon: 'article',
                label: lessonCompletion.total > 0
                    ? `Leçon ${lessonCompletion.completed}/${lessonCompletion.total}`
                    : 'Leçon',
                completed: lessonCompletion.percentage >= 99,
                color: '#3b82f6'
            });
        }

        if (chapter.videos && chapter.videos.length > 0) {
            items.push({
                icon: 'play_circle',
                label: `${chapter.videos.length} vidéo${chapter.videos.length > 1 ? 's' : ''}`,
                completed: progress?.videos?.allWatched || false,
                color: '#ef4444'
            });
        }

        if (chapter.quiz && chapter.quiz.length > 0) {
            items.push({
                icon: 'quiz',
                label: `${chapter.quiz.length} quiz`,
                completed: progress?.quiz?.isSubmitted || false,
                color: '#8b5cf6'
            });
        }

        if (chapter.exercises && chapter.exercises.length > 0) {
            const completedCount = Object.keys(progress?.exercisesFeedback || {}).length;
            items.push({
                icon: 'draw',
                label: `${completedCount}/${chapter.exercises.length} exo`,
                completed: completedCount === chapter.exercises.length && completedCount > 0,
                color: '#10b981'
            });
        }

        return items;
    }, [chapter, progress, lessonCompletion]);

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`chapter-card-v2 ${disabled ? 'is-disabled' : ''}`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled}
            data-status={variant}
        >
            {/* Background effects */}
            <div className="chapter-card-v2__bg" aria-hidden="true" />

            {/* Main content */}
            <div className="chapter-card-v2__container">
                {/* Left section: Visual indicator */}
                <div className="chapter-card-v2__visual">
                    <div className="chapter-card-v2__progress-ring">
                        <svg className="chapter-card-v2__progress-svg" viewBox="0 0 100 100">
                            <circle
                                className="chapter-card-v2__progress-bg"
                                cx="50"
                                cy="50"
                                r="42"
                            />
                            <circle
                                className="chapter-card-v2__progress-bar"
                                cx="50"
                                cy="50"
                                r="42"
                                style={{
                                    strokeDashoffset: 264 - (264 * progressPercentage) / 100,
                                    stroke: color
                                }}
                            />
                        </svg>
                        <div className="chapter-card-v2__progress-text">
                            <span className="chapter-card-v2__progress-number">{progressPercentage}</span>
                            <span className="chapter-card-v2__progress-unit">%</span>
                        </div>
                    </div>
                </div>

                {/* Center section: Content */}
                <div className="chapter-card-v2__content">
                    <div className="chapter-card-v2__header">
                        <span className="chapter-card-v2__eyebrow">
                            {progress?.isWorkSubmitted ? 'Chapitre complété' : chapter.isActive ? 'Chapitre actif' : 'Chapitre verrouillé'}
                        </span>
                        <h3 className="chapter-card-v2__title">{chapter.chapter}</h3>
                    </div>

                    {/* Session dates */}
                    <div className="chapter-card-v2__sessions">
                        <SessionStatus dates={chapter.sessionDates} />
                    </div>

                    {/* Stats grid */}
                    <div className="chapter-card-v2__stats">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={`chapter-card-v2__stat ${stat.completed ? 'is-completed' : ''}`}
                            >
                                <span
                                    className="material-symbols-outlined chapter-card-v2__stat-icon"
                                    style={{ color: stat.color }}
                                >
                                    {stat.icon}
                                </span>
                                <span className="chapter-card-v2__stat-label">{stat.label}</span>
                                {stat.completed && (
                                    <span className="material-symbols-outlined chapter-card-v2__stat-check">
                                        check_circle
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right section: Status badge */}
                <div className="chapter-card-v2__status" data-variant={variant}>
                    <div className="chapter-card-v2__status-content">
                        <span
                            className="material-symbols-outlined chapter-card-v2__status-icon"
                            style={{ color }}
                        >
                            {icon}
                        </span>
                        <span className="chapter-card-v2__status-text">{text}</span>
                    </div>
                </div>
            </div>
        </button>
    );
});

export default ChapterCard;
