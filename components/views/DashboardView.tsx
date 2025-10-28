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

// ✅ OPTIMISATION 2: Styles modernes avec animations Coursera-inspired
const customStyles = `
  :root {
    --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .claude-card {
    background-color: #FFFFFF;
    border: 1px solid #E0E7EF;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .claude-card:hover:not(:disabled) {
    border-color: #C5D0DC;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
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

  @keyframes welcomeBounce {
    0% {
      transform: scale(0.95) translateY(-10px);
      opacity: 0;
    }
    60% {
      transform: scale(1.02) translateY(0);
    }
    80% {
      transform: scale(0.98);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  .student-name-animated {
    animation: welcomeBounce 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
    background: linear-gradient(
      135deg,
      #0056D2 0%,
      #3387FF 25%,
      #0056D2 50%,
      #3387FF 75%,
      #0056D2 100%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: welcomeBounce 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) forwards,
               shimmer 4s linear infinite;
    display: inline-block;
    font-weight: 800;
    filter: drop-shadow(0 0 20px rgba(0, 86, 210, 0.2));
  }
`;

const DashboardView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
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
            // If the chapter had an update flag, mark it as seen and remove related UI notifications
            if (progress[chapterId]?.hasUpdate) {
                dispatch({ type: 'MARK_UPDATE_SEEN', payload: { chapterId } });
                addNotification('Contenu consulté', 'info', { message: `Vous avez ouvert le chapitre "${chapter.chapter}".`, duration: 3000 });
            }

            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        }
    }, [activities, progress, dispatch, addNotification]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
                <div className="text-center p-10 claude-card rounded-2xl max-w-md animate-scale-in">
                    <div className="w-20 h-20 mx-auto mb-6 bg-warning-50 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined !text-5xl text-warning">warning</span>
                    </div>
                    <h2 className="text-heading-xl font-display text-text-primary mb-3">Profil non trouvé</h2>
                    <p className="font-sans text-body-md text-text-secondary">Veuillez vous reconnecter pour accéder à votre espace</p>
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

            <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
                <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 pb-24 sm:pb-28 md:pb-32">
                    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg py-5 sm:py-6 md:py-8 mb-6 sm:mb-8 md:mb-10 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 px-4 sm:px-6 md:px-8 border-b border-border shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 max-w-6xl mx-auto animate-slide-in-down">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-text-primary mb-2 tracking-tight font-bold">
                                    {greeting},{' '}
                                    <span className="student-name-animated">
                                        {profile.name}
                                    </span>
                                </h1>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary !text-xl">school</span>
                                    <div
                                        className="inline-block text-base sm:text-lg text-text-secondary font-sans font-medium"
                                        dangerouslySetInnerHTML={{ __html: formatClassNameHTML(className) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {hasAnyActivity ? (
                        <div className="space-y-8 sm:space-y-10 md:space-y-12">
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
                        <div className="claude-card text-center p-10 sm:p-12 md:p-16 rounded-2xl md:rounded-3xl mt-8 sm:mt-10 animate-scale-in">
                            <div className="w-24 h-24 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined !text-6xl text-primary">pending_actions</span>
                            </div>
                            <h2 className="text-heading-xl font-display text-text-primary mb-3">Aucun chapitre disponible</h2>
                            <p className="font-sans text-body-md text-text-secondary max-w-md mx-auto">
                                Les chapitres pour votre classe seront bientôt disponibles. Revenez plus tard pour découvrir votre contenu.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-8 px-8 py-3.5 bg-primary hover:bg-primary-600 text-white rounded-xl transition-all font-sans font-semibold shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:scale-95"
                            >
                                Rafraîchir la page
                            </button>
                        </div>
                    )}

                    <footer className="text-center mt-16 sm:mt-20 md:mt-24 mb-8 sm:mb-10">
                        <div className="flex flex-col items-center justify-center opacity-70">
                            <span className="font-display text-xs sm:text-sm tracking-wider text-text-tertiary font-semibold">Center Scientific</span>
                            <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent my-2 sm:my-3 rounded-full"></div>
                            <span className="font-display text-2xl sm:text-3xl text-primary font-bold">of Mathematics</span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-tertiary font-sans mt-4 sm:mt-6 px-4">
                            © {new Date().getFullYear()} - Votre parcours d'excellence en mathématiques
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default DashboardView;