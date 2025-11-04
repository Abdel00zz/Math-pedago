import React, { useCallback } from 'react';
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

    const quizCount = chapter.quiz?.length || 0;
    const exerciseCount = chapter.exercises?.length || 0;

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`dashboard-card group w-full ${disabled ? 'is-disabled' : ''}`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled}
            data-status={variant}
        >
            <div className="dashboard-card__content">
                <h3 className="dashboard-card__title">
                    {chapter.chapter}
                </h3>
                <SessionStatus dates={chapter.sessionDates} />
            </div>

            <div className="dashboard-card__footer">
                <div className={`dashboard-card__status dashboard-card__status--${variant}`}>
                    <span className="material-symbols-outlined dashboard-card__status-icon" aria-hidden="true">{icon}</span>
                    <span className="dashboard-card__status-text">{text}</span>
                </div>
            </div>

            <div className="dashboard-card__stats">
                {quizCount > 0 && (
                    <div className="dashboard-card__stat">
                        <span className="material-symbols-outlined">quiz</span>
                        <span>{quizCount} Quiz</span>
                    </div>
                )}
                {exerciseCount > 0 && (
                    <div className="dashboard-card__stat">
                        <span className="material-symbols-outlined">assignment</span>
                        <span>
                            {exerciseCount} Exercice{exerciseCount > 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
});

export default ChapterCard;