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
    iconClasses: string;
    textClasses: string;
    disabled: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, progress, onSelect }) => {
    const getStatusInfo = useCallback((): StatusInfo => {
        if (progress?.hasUpdate) {
            return {
                text: 'Contenu mis à jour',
                icon: 'update',
                iconClasses: 'text-primary-600 animate-pulse',
                textClasses: 'text-primary-600 font-bold',
                disabled: false,
            };
        }
        if (progress?.isWorkSubmitted) {
            return {
                text: 'Terminé',
                icon: 'check_circle',
                iconClasses: 'text-success-600',
                textClasses: 'text-success-600 font-bold',
                disabled: false,
            };
        }
        if (!chapter.isActive) {
            return {
                text: 'Bientôt disponible',
                icon: 'lock',
                iconClasses: 'text-text-tertiary',
                textClasses: 'text-text-tertiary',
                disabled: true,
            };
        }
        if (progress?.quiz?.isSubmitted || Object.keys(progress?.exercisesFeedback || {}).length > 0) {
            return {
                text: 'En cours',
                icon: 'pending',
                iconClasses: 'text-info-600',
                textClasses: 'text-info-600 font-bold',
                disabled: false,
            };
        }
        return {
            text: 'À faire',
            icon: 'play_circle',
            iconClasses: 'text-primary',
            textClasses: 'text-primary font-bold',
            disabled: false,
        };
    }, [chapter.isActive, progress]);

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
            className={`claude-card group w-full flex flex-col sm:flex-row justify-between items-start gap-5 p-6 sm:p-7 rounded-2xl transition-all duration-200 ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
            }`}
            aria-label={`Accéder au ${chapter.chapter}`}
            aria-disabled={disabled}
        >
            <div className="flex-1 text-left">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <span className="material-symbols-outlined !text-2xl text-primary-600">calculate</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-text-primary mb-1 group-hover:text-primary transition-colors">
                            {chapter.chapter}
                        </h3>
                    </div>
                </div>
                <div className="ml-15">
                    <SessionStatus dates={chapter.sessionDates} />
                </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center mt-2 sm:mt-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-xl font-sans font-semibold text-sm transition-colors group-hover:bg-background-tertiary">
                    <span className={`material-symbols-outlined !text-lg ${iconClasses}`}>{icon}</span>
                    <span className={textClasses}>{text}</span>
                </div>
                {!disabled && (
                    <span className="material-symbols-outlined text-text-tertiary text-2xl group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                )}
            </div>
        </button>
    );
});

export default ChapterCard;