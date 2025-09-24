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
    iconClasses: string;
    textClasses: string;
    disabled: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, progress, onSelect }) => {
    const evaluatedExercisesCount = useMemo(() => {
        if (!chapter?.exercises || !progress?.exercisesFeedback) {
            return 0;
        }
        const currentExerciseIds = new Set(chapter.exercises.map(ex => ex.id));
        return Object.keys(progress.exercisesFeedback)
            .filter(exId => currentExerciseIds.has(exId))
            .length;
    }, [chapter, progress]);

    const getStatusInfo = useCallback((): StatusInfo => {
        if (progress?.isWorkSubmitted) {
            const isOutdated = chapter.version && progress.submittedVersion && chapter.version !== progress.submittedVersion;
            if (isOutdated) {
                return {
                    text: 'Mis à jour',
                    icon: 'update',
                    iconClasses: 'text-info',
                    textClasses: 'text-info font-semibold',
                    disabled: false,
                };
            }
            return {
                text: 'Terminé',
                icon: 'check_circle',
                iconClasses: 'text-text-secondary',
                textClasses: 'text-text-secondary',
                disabled: false,
            };
        }
        if (!chapter.isActive) {
            return {
                text: 'Bientôt disponible',
                icon: 'lock',
                iconClasses: 'text-text-secondary',
                textClasses: 'text-text-secondary',
                disabled: true,
            };
        }
        if (progress?.quiz?.isSubmitted || evaluatedExercisesCount > 0) {
            return {
                text: 'En cours',
                icon: 'autorenew',
                iconClasses: 'text-text',
                textClasses: 'text-text',
                disabled: false,
            };
        }
        return {
            text: 'À faire',
            icon: 'edit_note',
            iconClasses: 'text-text-secondary',
            textClasses: 'text-text-secondary',
            disabled: false,
        };
    }, [chapter.isActive, chapter.version, progress, evaluatedExercisesCount]);

    const { text, icon, iconClasses, textClasses, disabled } = getStatusInfo();

    const handleClick = useCallback(() => {
        if (!disabled) {
            onSelect(chapter.id);
        }
    }, [disabled, onSelect, chapter.id]);

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`claude-card group w-full flex flex-col sm:flex-row justify-between items-start gap-4 p-6 rounded-xl ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled}
        >
            <div className="flex-1 text-left">
                <h3 className="text-2xl antique-title text-primary mb-1">
                    {chapter.chapter}
                </h3>
                <div className="mt-3">
                    <SessionStatus dates={chapter.sessionDates} />
                </div>
            </div>
            <div className="flex items-center gap-4 self-start sm:self-center mt-3 sm:mt-0">
                <div className="flex items-center gap-1.5 font-medium serif-text text-base">
                    <span className={`material-symbols-outlined !text-xl ${iconClasses}`}>{icon}</span>
                    <span className={textClasses}>{text}</span>
                </div>
                {!disabled && (
                    <span className="material-symbols-outlined text-border-hover text-2xl">arrow_forward</span>
                )}
            </div>
        </button>
    );
});

export default ChapterCard;