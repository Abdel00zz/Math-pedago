import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chapter, ChapterProgress } from '../types';
import SessionStatus from './SessionStatus';
import {
    LESSON_PROGRESS_EVENT,
    LESSON_PROGRESS_REFRESH_EVENT,
    readLessonCompletion,
    calculateChapterProgress,
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
    const [refreshKey, setRefreshKey] = useState(0);

    // 📊 Calcul de la progression de la leçon depuis AppContext ou lessonProgressService
    const lessonCompletion = useMemo<LessonCompletionSummary>(() => {
        // Priorité 1: Utiliser progress.lesson depuis AppContext (source unique de vérité)
        if (progress?.lesson?.totalParagraphs !== undefined && progress.lesson.totalParagraphs > 0) {
            return {
                completed: progress.lesson.completedParagraphs || 0,
                total: progress.lesson.totalParagraphs,
                percentage: progress.lesson.checklistPercentage || 0,
            };
        }

        // Fallback: Lire depuis lessonProgressService (pour compatibilité)
        if (!lessonId) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        return readLessonCompletion(lessonId);
    }, [progress?.lesson, lessonId, refreshKey]);

    // 🔄 Détection des changements de progression pour rafraîchir automatiquement
    useEffect(() => {
        const handleProgressUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<LessonProgressEventDetail>;
            if (customEvent.detail?.lessonId === lessonId || customEvent.detail?.lessonId === 'GLOBAL_REFRESH') {
                setRefreshKey(prev => prev + 1);
            }
        };

        const handleRefreshEvent = (event: Event) => {
            const customEvent = event as CustomEvent<{ lessonId: string }>;
            if (customEvent.detail?.lessonId === lessonId || customEvent.detail?.lessonId === 'GLOBAL_REFRESH') {
                setRefreshKey(prev => prev + 1);
            }
        };

        window.addEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate);
        window.addEventListener(LESSON_PROGRESS_REFRESH_EVENT, handleRefreshEvent);

        return () => {
            window.removeEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate);
            window.removeEventListener(LESSON_PROGRESS_REFRESH_EVENT, handleRefreshEvent);
        };
    }, [lessonId]);

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

    // 🎯 Calcul de progression avec coefficients égaux pour leçons, quiz et exercices
    const progressPercentage = useMemo(() => {
        return calculateChapterProgress({
            lessonProgress: chapter.lesson && lessonCompletion.total > 0 ? lessonCompletion : undefined,
            quizTotal: chapter.quiz?.length ?? 0,
            quizAnswered: progress?.quiz?.answers ? Object.keys(progress.quiz.answers).length : 0,
            quizSubmitted: progress?.quiz?.isSubmitted ?? false,
            exercisesTotal: chapter.exercises?.length ?? 0,
            exercisesCompleted: Object.keys(progress?.exercisesFeedback || {}).length,
        });
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
