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
}

const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, progress, onSelect }) => {
    const getStatusInfo = useCallback((): StatusInfo => {
        if (progress?.hasUpdate) {
            return {
                text: 'Contenu mis à jour',
                icon: 'update',
                disabled: false,
                variant: 'update',
            };
        }
        if (progress?.isWorkSubmitted) {
            return {
                text: 'Terminé',
                icon: 'check_circle',
                disabled: false,
                variant: 'completed',
            };
        }
        if (!chapter.isActive) {
            return {
                text: 'Bientôt disponible',
                icon: 'lock',
                disabled: true,
                variant: 'locked',
            };
        }
        if (progress?.quiz?.isSubmitted || Object.keys(progress?.exercisesFeedback || {}).length > 0) {
            return {
                text: 'En cours',
                icon: 'autorenew',
                disabled: false,
                variant: 'progress',
            };
        }
        return {
            text: 'À faire',
            icon: 'edit_note',
            disabled: false,
            variant: 'todo',
        };
    }, [chapter.isActive, progress]);

    const { text, icon, variant, disabled } = getStatusInfo();

    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect(chapter.id);
        }
    }, [disabled, onSelect, chapter.id]);

    const quizCount = chapter.quiz?.length ?? 0;
    const exerciseCount = chapter.exercises?.length ?? 0;
    const videosCount = chapter.videos?.length ?? 0;

    const lessonParagraphsCount = chapter.lesson?.paragraphs?.length ?? 0;

    const quizProgress = progress?.quiz;
    const isQuizSubmitted = Boolean(quizProgress?.isSubmitted);
    const isWorkSubmitted = Boolean(progress?.isWorkSubmitted);

    const cardStats = useMemo(() => {
        const formatCount = (count: number, singular: string, plural?: string) => {
            const noun = count === 1 ? singular : plural ?? `${singular}s`;
            return `${count} ${noun}`;
        };

        const stats: Array<{ icon: string; label: string; highlight?: boolean }> = [];

        if (lessonParagraphsCount > 0) {
            stats.push({
                icon: 'article',
                label: formatCount(lessonParagraphsCount, 'paragraphe'),
            });
        }

        if (videosCount > 0) {
            stats.push({
                icon: 'play_circle',
                label: formatCount(videosCount, 'vidéo', 'vidéos'),
            });
        }

        if (quizCount > 0) {
            stats.push({
                icon: isQuizSubmitted ? 'workspace_premium' : 'quiz',
                label: formatCount(quizCount, 'quiz', 'quiz'),
                highlight: isQuizSubmitted,
            });
        }

        if (exerciseCount > 0) {
            stats.push({
                icon: isWorkSubmitted ? 'task_alt' : 'draw',
                label: formatCount(exerciseCount, 'exercice'),
                highlight: isWorkSubmitted,
            });
        }

        return stats;
    }, [videosCount, quizCount, isQuizSubmitted, exerciseCount, isWorkSubmitted, lessonParagraphsCount]);

    const cardEyebrow = progress?.isWorkSubmitted
        ? 'Travail remis'
        : chapter.isActive
            ? 'Chapitre actif'
            : 'Prochainement';

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`dashboard-card group w-full ${disabled ? 'is-disabled' : ''}`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled}
            data-status={variant}
        >
            <span className="dashboard-card__background" aria-hidden="true">
                <span className="dashboard-card__gradient" />
                <span className="dashboard-card__pattern" />
            </span>

            <div className="dashboard-card__content-wrapper">
                <div className="dashboard-card__inner">
                    <div className="dashboard-card__overview">
                        <span className="dashboard-card__eyebrow">{cardEyebrow}</span>
                        <h3 className="dashboard-card__title">{chapter.chapter}</h3>
                    </div>

                    <div className="dashboard-card__body">
                        <div className="dashboard-card__session">
                            <SessionStatus dates={chapter.sessionDates} />
                        </div>
                    </div>

                    {cardStats.length > 0 && (
                        <div className="dashboard-card__footer">
                            <div className="dashboard-card__stats" aria-label="Indicateurs du chapitre">
                                {cardStats.map((stat) => (
                                    <div
                                        key={`${stat.icon}-${stat.label}`}
                                        className={`dashboard-card__stat${stat.highlight ? ' is-highlighted' : ''}`}
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">{stat.icon}</span>
                                        <span>{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dashboard-card__badge-panel" data-variant={variant}>
                    <div className="dashboard-card__badge-content">
                        <span className="material-symbols-outlined dashboard-card__badge-icon">{icon}</span>
                        <span className="dashboard-card__badge-text">{text}</span>
                    </div>
                </div>
            </div>
        </button>
    );
});

export default ChapterCard;