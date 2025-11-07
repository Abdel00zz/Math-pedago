import React, { useCallback, useMemo } from 'react';
import { Chapter, ChapterProgress } from '../types';
import SessionStatus from './SessionStatus';

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
        if (progress?.quiz?.isSubmitted || Object.keys(progress?.exercisesFeedback || {}).length > 0) {
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
            icon: 'play_circle',
            disabled: false,
            variant: 'todo',
            color: '#f97316',
        };
    }, [chapter.isActive, progress]);

    const { text, icon, variant, disabled, color } = getStatusInfo();

    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect(chapter.id);
        }
    }, [disabled, onSelect, chapter.id]);

    // Calculate progress percentage
    const progressPercentage = useMemo(() => {
        if (!progress) return 0;

        const weights = {
            lesson: 0.3,
            quiz: 0.3,
            exercises: 0.4
        };

        let totalProgress = 0;

        // Lesson progress (0-1)
        if (chapter.lesson) {
            const lessonProgress = progress.lesson?.isRead ? 1 : 0;
            totalProgress += lessonProgress * weights.lesson;
        }

        // Quiz progress (0-1)
        if (chapter.quiz?.length > 0) {
            const quizProgress = progress.quiz?.isSubmitted ? 1 : 0;
            totalProgress += quizProgress * weights.quiz;
        }

        // Exercises progress (0-1)
        if (chapter.exercises?.length > 0) {
            const completedExercises = Object.keys(progress.exercisesFeedback || {}).length;
            const exerciseProgress = completedExercises / chapter.exercises.length;
            totalProgress += exerciseProgress * weights.exercises;
        }

        return Math.round(totalProgress * 100);
    }, [progress, chapter]);

    // Stats computation
    const stats = useMemo(() => {
        const items = [];

        if (chapter.lesson) {
            items.push({
                icon: 'article',
                label: 'Leçon',
                completed: progress?.lesson?.isRead || false,
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
    }, [chapter, progress]);

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
                    {!disabled && (
                        <div className="chapter-card-v2__arrow">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
});

export default ChapterCard;
