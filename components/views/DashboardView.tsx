// Fix: Import `useState` from React to handle component state.
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';
import HelpModal from '../HelpModal';
import OrientationModal from '../OrientationModal';
import { CLASS_OPTIONS, DB_KEY } from '../../constants';
import { useNotification } from '../../context/NotificationContext';

interface ChapterCardProps {
    chapter: Chapter;
    progress: ChapterProgress;
    onSelect: (chapterId: string) => void;
}

const ChapterCard: React.FC<ChapterCardProps> = React.memo(({ chapter, progress, onSelect }) => {
    const getStatusInfo = () => {
        if (!chapter.isActive) {
            return {
                badgeText: 'Prochainement',
                badgeClasses: 'bg-gray-200 text-gray-600',
                disabled: true,
            };
        }
        if (progress?.isWorkSubmitted) {
            return {
                badgeText: 'Travail soumis',
                badgeClasses: 'bg-success/10 text-success',
                disabled: false,
            };
        }
        if (progress?.quiz.isSubmitted || Object.keys(progress?.exercisesFeedback || {}).length > 0) {
            return {
                badgeText: 'En cours',
                badgeClasses: 'bg-warning/10 text-warning',
                disabled: false,
            };
        }
        return {
            badgeText: 'À commencer',
            badgeClasses: 'bg-primary/10 text-primary',
            disabled: false,
        };
    };

    const { badgeText, badgeClasses, disabled } = getStatusInfo();

    const cardBaseClasses = "w-full flex justify-between items-center p-6 bg-surface border border-border rounded-lg transition-all duration-200 font-button";
    const cardInteractiveClasses = "hover:bg-background hover:border-border-hover hover:shadow-claude transform hover:-translate-y-1 cursor-pointer";
    const cardDisabledClasses = "opacity-60 cursor-not-allowed";

    return (
        <button
            onClick={() => onSelect(chapter.id)}
            disabled={disabled}
            className={`${cardBaseClasses} ${disabled ? cardDisabledClasses : cardInteractiveClasses}`}
            aria-label={`Accéder au chapitre ${chapter.chapter}`}
        >
            <div className="flex-1 text-left">
                <h2 className="text-xl font-semibold text-text">{chapter.chapter}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </div>
                    <p className="text-sm text-secondary">Séance Live : {chapter.sessionDate}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
                 <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${badgeClasses}`}>{badgeText}</span>
            </div>
        </button>
    );
});


const DashboardView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { profile, activities, progress, chapterOrder } = state;
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);

    const { addNotification } = useNotification();
    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<number | null>(null);

    const handleHelpClick = () => {
        setHelpModalOpen(true);

        if (helpClickTimerRef.current) {
            clearTimeout(helpClickTimerRef.current);
        }

        helpClickCountRef.current += 1;
        const currentCount = helpClickCountRef.current;

        if (currentCount === 5) {
            if (state.profile) {
                const profileToKeep = {
                    profile: { name: state.profile.name, classId: '' },
                };
                localStorage.setItem(DB_KEY, JSON.stringify(profileToKeep));
                window.location.reload();
            }
            helpClickCountRef.current = 0;
        } else {
            if (currentCount >= 3) {
                addNotification(`Cliquez encore ${5 - currentCount} fois pour réinitialiser.`, 'info');
            }
            helpClickTimerRef.current = window.setTimeout(() => {
                helpClickCountRef.current = 0;
            }, 1500); // Reset after 1.5 seconds
        }
    };
    
    useEffect(() => {
        const timerId = helpClickTimerRef.current;
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, []);

    const userActivities = useMemo(() => {
        if (!profile) return [];
        return (Object.values(activities) as Chapter[])
            .filter(activity => activity.class === profile.classId)
            .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;

                const indexA = chapterOrder.indexOf(a.id);
                const indexB = chapterOrder.indexOf(b.id);

                if (indexA === -1) return 1;
                if (indexB === -1) return -1;

                return indexA - indexB;
            });
    }, [activities, profile, chapterOrder]);

    const className = useMemo(() => {
        if (!profile) return '';
        return CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || profile.classId;
    }, [profile]);

    if (!profile) {
        return <div>Chargement du profil...</div>;
    }

    const handleChapterSelect = (chapterId: string) => {
        const chapter = activities[chapterId];
        if (chapter && chapter.isActive) {
          dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="flex justify-end items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative group flex items-center">
                        <button 
                            onClick={handleHelpClick} 
                            className="p-2 rounded-full text-secondary hover:bg-background transition active:scale-95 font-button"
                            aria-label="Aide"
                        >
                            <span className="material-symbols-outlined text-3xl">help_outline</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-text text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            Aide
                            <svg className="absolute text-text left-0 top-full h-2 w-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                    <div className="relative group flex items-center">
                        <button 
                            onClick={() => setOrientationModalOpen(true)} 
                            className="p-2 rounded-full text-secondary hover:bg-background transition active:scale-95 font-button"
                            aria-label="Orientation"
                        >
                            <span className="material-symbols-outlined text-3xl">explore</span>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-text text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            Orientation
                            <svg className="absolute text-text left-0 top-full h-2 w-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text min-h-[2.5rem] font-title flex items-baseline flex-wrap gap-x-2">
                    <span 
                        className="inline-block opacity-0 animate-slideInUp" 
                        style={{ animationDelay: '0ms' }}>
                        Ravi de vous revoir,
                    </span>
                    <span 
                        className="inline-block text-primary opacity-0 animate-slideInUp" 
                        style={{ animationDelay: '150ms' }}>
                        {profile.name}
                    </span>
                    <span 
                        className="inline-block opacity-0 animate-slideInUp" 
                        style={{ animationDelay: '300ms' }}>
                        !
                    </span>
                </h1>
                <p 
                    className="text-secondary mt-2 opacity-0 animate-slideInUp" 
                    style={{ animationDelay: '450ms' }}>
                    Voici les prochaines étapes de votre parcours en <strong className="text-text-secondary font-semibold">{className}</strong>.
                </p>
            </header>
            
            {userActivities.length > 0 ? (
                <div className="space-y-4">
                    {userActivities.map(chapter => (
                        <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            progress={progress[chapter.id]}
                            onSelect={handleChapterSelect}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-surface border border-border rounded-lg">
                    <span className="material-symbols-outlined text-5xl text-secondary">upcoming</span>
                    <h2 className="mt-4 text-xl font-semibold text-text">Aucune activité disponible</h2>
                    <p className="text-secondary mt-2">De nouveaux chapitres seront bientôt disponibles. Revenez plus tard !</p>
                </div>
            )}
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
            <OrientationModal isOpen={isOrientationModalOpen} onClose={() => setOrientationModalOpen(false)} classId={profile.classId} />
        </div>
    );
};

export default DashboardView;