import React, { useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Chapter } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import { useNotification } from '../../context/NotificationContext';
import ChapterSection from '../ChapterSection';
import GlobalActionButtons from '../GlobalActionButtons';

// ✅ OPTIMISATION 1: Suppression du code mort (CacheService, useThemePreference, useIdleDetection)
// Ces hooks/services étaient créés mais jamais utilisés

interface CategorizedActivities {
    inProgress: Chapter[];
    completed: Chapter[];
    upcoming: Chapter[];
}

// ✅ OPTIMISATION 2: Styles en constante (évite recréation)
const customStyles = `
  :root {
    --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .claude-card {
    background-color: #FFFFFF;
    border: 1px solid #E5E5E5;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .claude-card:hover:not(:disabled) {
    border-color: #D4D4D4;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .pulse-dot {
    animation: pulse 2s var(--transition-smooth) infinite;
  }
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.1);
    }
  }
`;

const DashboardView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { profile, activities, progress, chapterOrder } = state;

    // ✅ OPTIMISATION 3: Calcul du greeting mémorisé (ne change qu'une fois par session)
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Bonjour';
        if (hour >= 12 && hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []);

    const className = useMemo(() => {
        if (!profile) return '';
        return CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || '';
    }, [profile]);

    const formatClassNameHTML = useCallback((name: string): string => {
        return name.replace(/(\d+)(ère|ème|er|re|e)/gi, '$1<sup>$2</sup>');
    }, []);

    // ✅ OPTIMISATION 4: Catégorisation optimisée avec reduce
    const categorizedActivities = useMemo((): CategorizedActivities => {
        if (!profile) return { inProgress: [], completed: [], upcoming: [] };

        const allUserActivities = chapterOrder
            .map(id => activities[id])
            .filter(Boolean);

        return allUserActivities.reduce<CategorizedActivities>(
            (acc, chapter) => {
                const chapterProgress = progress[chapter.id];
                if (chapterProgress?.isWorkSubmitted) {
                    acc.completed.push(chapter);
                } else if (chapter.isActive) {
                    acc.inProgress.push(chapter);
                } else {
                    acc.upcoming.push(chapter);
                }
                return acc;
            },
            { inProgress: [], completed: [], upcoming: [] }
        );
    }, [activities, progress, profile, chapterOrder]);

    // ✅ OPTIMISATION 5: handleChapterSelect avec useCallback
    const handleChapterSelect = useCallback((chapterId: string) => {
        const chapter = activities[chapterId];
        if (chapter && (chapter.isActive || progress[chapterId]?.isWorkSubmitted)) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        }
    }, [activities, progress, dispatch]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center p-8 claude-card rounded-2xl max-w-md">
                    <span className="text-5xl text-text-disabled block mb-4">⚠</span>
                    <h2 className="text-xl font-title text-text mb-2">Profil non trouvé</h2>
                    <p className="font-sans text-text-secondary italic">Veuillez vous reconnecter pour accéder à votre espace</p>
                </div>
            </div>
        );
    }

    const { inProgress, completed, upcoming } = categorizedActivities;
    const hasAnyActivity = inProgress.length > 0 || completed.length > 0 || upcoming.length > 0;
    
    return (
        <>
            <style>{customStyles}</style>
            <GlobalActionButtons />

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28">
                    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md py-6 mb-6 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 max-w-5xl mx-auto">
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-title text-text mb-2 tracking-tight">
                                    {greeting},
                                    <span className="text-[#FF7A00] ml-4">
                                        {profile.name}
                                    </span>
                                </h1>
                                <div className="mt-2">
                                    <div
                                        className="inline-block text-lg font-sans text-text-secondary italic"
                                        dangerouslySetInnerHTML={{ __html: formatClassNameHTML(className) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {hasAnyActivity ? (
                        <div className="space-y-12">
                            <ChapterSection
                                title="Chapitres en cours"
                                chapters={inProgress}
                                progress={progress}
                                onSelect={handleChapterSelect}
                            />
                            <ChapterSection
                                title="Chapitres achevés"
                                chapters={completed}
                                progress={progress}
                                onSelect={handleChapterSelect}
                                icon="✓"
                            />
                            <ChapterSection
                                title="Chapitres à venir"
                                chapters={upcoming}
                                progress={progress}
                                onSelect={handleChapterSelect}
                            />
                        </div>
                    ) : (
                        <div className="claude-card text-center p-12 rounded-2xl mt-8">
                            <span className="text-5xl text-text-disabled block mb-4">◎</span>
                            <h2 className="text-xl font-title text-text mb-2">Aucun chapitre disponible</h2>
                            <p className="font-sans text-text-secondary italic">
                                Les chapitres pour votre classe seront bientôt révélés...
                            </p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-6 px-6 py-2 bg-background hover:bg-border/50 text-text rounded-lg transition-colors font-sans"
                            >
                                Rafraîchir la page
                            </button>
                        </div>
                    )}

                    <footer className="text-center mt-16 mb-8">
                        <div className="flex flex-col items-center justify-center opacity-70">
                            <span className="font-brand text-xs tracking-wider text-text-secondary">Center Scientific</span>
                            <div className="w-8 h-px bg-border-hover my-1.5"></div>
                            <span className="font-brand text-2xl text-primary -mt-1">of Mathematics</span>
                        </div>
                        <p className="text-xs text-text-secondary font-sans italic mt-4">
                            © {new Date().getFullYear()} - Votre parcours d'apprentissage interactif
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default DashboardView;