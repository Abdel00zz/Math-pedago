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
import { hasActiveSession, hasUpcomingSession } from '../utils/chapterStatusHelpers';

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
            const result = {
                completed: progress.lesson.completedParagraphs || 0,
                total: progress.lesson.totalParagraphs,
                percentage: progress.lesson.checklistPercentage || 0,
            };
            console.log(`📊 [${chapter.chapter}] Leçon depuis AppContext:`, result);
            return result;
        }

        // Fallback: Lire depuis lessonProgressService (pour compatibilité)
        if (!lessonId) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const fallbackResult = readLessonCompletion(lessonId);
        console.log(`📊 [${chapter.chapter}] Leçon depuis lessonProgressService (lessonId: ${lessonId}):`, fallbackResult);
        return fallbackResult;
    }, [progress?.lesson, lessonId, refreshKey, chapter.chapter]);

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
        const status = progress?.status || 'a-venir';

        // Prioriser les mises à jour
        if (progress?.hasUpdate) {
            return {
                text: 'Mis à jour',
                icon: 'update',
                disabled: false,
                variant: 'update',
                color: '#a855f7',
            };
        }

        // Utiliser le statut pour déterminer l'affichage
        switch (status) {
            case 'acheve':
                return {
                    text: 'Réussi',
                    icon: 'check_circle',
                    disabled: false,
                    variant: 'completed',
                    color: '#22c55e',
                };
            case 'en-cours':
                return {
                    text: 'En apprentissage',
                    icon: 'pending',
                    disabled: false,
                    variant: 'progress',
                    color: '#eab308',
                };
            case 'a-venir':
            default:
                // Vérifier si le chapitre est verrouillé
                if (!chapter.isActive) {
                    return {
                        text: 'Bientôt',
                        icon: 'lock',
                        disabled: true,
                        variant: 'locked',
                        color: '#94a3b8',
                    };
                }
                return {
                    text: 'Disponible',
                    icon: 'auto_stories',
                    disabled: false,
                    variant: 'todo',
                    color: '#3b82f6',
                };
        }
    }, [chapter.isActive, progress]);

    const { text, icon, variant, disabled, color } = getStatusInfo();

    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect(chapter.id);
        }
    }, [disabled, onSelect, chapter.id]);

    // Vérifier si le chapitre a une session active ou prochaine
    const isSessionActive = useMemo(() => {
        return hasActiveSession(chapter.sessionDates || []);
    }, [chapter.sessionDates]);

    const isSessionUpcoming = useMemo(() => {
        return !isSessionActive && hasUpcomingSession(chapter.sessionDates || []);
    }, [chapter.sessionDates, isSessionActive]);

    // 🎯 Calcul de progression avec coefficients égaux pour leçons, quiz et exercices
    const progressPercentage = useMemo(() => {
        const params = {
            // ✅ FIX: Ne vérifier que lessonCompletion.total, pas chapter.lesson
            // car l'utilisateur peut avoir une progression même si chapter.lesson n'existe pas
            lessonProgress: lessonCompletion.total > 0 ? lessonCompletion : undefined,
            quizTotal: chapter.quiz?.length ?? 0,
            quizAnswered: progress?.quiz?.answers ? Object.keys(progress.quiz.answers).length : 0,
            quizSubmitted: progress?.quiz?.isSubmitted ?? false,
            exercisesTotal: chapter.exercises?.length ?? 0,
            exercisesCompleted: Object.keys(progress?.exercisesFeedback || {}).length,
        };
        const result = calculateChapterProgress(params);
        console.log(`🎯 [${chapter.chapter}] Progression calculée:`, { params, result });
        return result;
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
            disabled={disabled && !isSessionActive}
            className={`chapter-card-v2 ${disabled && !isSessionActive ? 'is-disabled' : ''} ${isSessionActive ? 'has-active-session' : ''} ${isSessionUpcoming ? 'has-upcoming-session' : ''}`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled && !isSessionActive}
            data-status={variant}
        >
            {/* Suppression du badge rouge "EN DIRECT" - remplacé par bordure animée subtile */}

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
                            {progress?.isWorkSubmitted
                                ? 'Chapitre maîtrisé'
                                : isSessionActive
                                    ? '🔵 Séance en direct'
                                    : isSessionUpcoming
                                        ? 'Séance prochainement'
                                        : chapter.isActive
                                            ? 'Chapitre ouvert'
                                            : 'Bientôt disponible'
                            }
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
