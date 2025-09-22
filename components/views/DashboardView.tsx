import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Chapter } from '../../types';
import HelpModal from '../HelpModal';
import OrientationModal from '../OrientationModal';
import { CLASS_OPTIONS, DB_KEY } from '../../constants';
import { useNotification } from '../../context/NotificationContext';
import ChapterSection from '../ChapterSection';
import NotificationCenter from '../NotificationCenter';
import { useNotificationGenerator } from '../../hooks/useNotificationGenerator';


// Types pour une meilleure type-safety
interface CategorizedActivities {
    inProgress: Chapter[];
    completed: Chapter[];
    upcoming: Chapter[];
}

// Constantes pour éviter les recalculs
const HELP_RESET_DELAY_MS = 1500;
const HELP_CLICKS_TO_RESET = 5;

// Styles personnalisés optimisés
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap');
  
  :root {
    --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .claude-card {
    background-color: #FFFFFF;
    border: 1px solid #E5E5E5; /* border */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .claude-card:hover:not(:disabled) {
    border-color: #D4D4D4; /* border-hover */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  .antique-title {
    font-family: 'Crimson Text', serif;
    letter-spacing: 0.03em;
    font-weight: 600;
  }
  
  .serif-text {
    font-family: 'EB Garamond', serif;
    font-feature-settings: 'liga' 1, 'calt' 1;
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
  
  .ornament:hover {
    opacity: 1;
  }
  
  .tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    padding: 6px 12px;
    background: rgba(23, 23, 23, 0.95); /* text color with opacity */
    color: white;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    backdrop-filter: blur(4px);
  }
  
  .tooltip::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: rgba(23, 23, 23, 0.95);
  }
  
  .group:hover .tooltip {
    opacity: 1;
  }

  @media (min-width: 640px) {
    .notification-popover-arrow::before,
    .notification-popover-arrow::after {
      content: '';
      position: absolute;
      bottom: 100%;
      right: 1.25rem; /* 20px -> ~center of the trigger button */
      transform: translateX(50%);
      border-width: 7px;
      border-style: solid;
      border-color: transparent;
    }

    .notification-popover-arrow::before {
      border-bottom-color: #E5E5E5; /* border color */
    }

    .notification-popover-arrow::after {
      margin-bottom: -2px;
      border-bottom-color: #FFFFFF; /* surface color */
    }
  }
`;

// Hook personnalisé pour la gestion du thème
const useThemePreference = () => {
    const [theme, setTheme] = useState('light');
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };
        
        setTheme(mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    return theme;
};

// Hook pour les raccourcis clavier
const useKeyboardShortcuts = (callbacks: { onHelp: () => void; onOrientation: () => void; onRefresh: () => void; }) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        callbacks.onHelp();
                        break;
                    case 'o':
                        e.preventDefault();
                        callbacks.onOrientation();
                        break;
                    case 'r':
                        e.preventDefault();
                        callbacks.onRefresh();
                        break;
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [callbacks]);
};

// Hook pour la détection de l'inactivité
const useIdleDetection = (timeout = 300000) => { // 5 minutes
    const [isIdle, setIsIdle] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsIdle(false);
        
        timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
        }, timeout);
    }, [timeout]);
    
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });
        
        resetTimer();
        
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resetTimer]);
    
    return isIdle;
};

// Service de cache pour les données
const CacheService = (() => {
    let instance: {
        set: (key: string, data: any) => void;
        get: (key: string) => any;
        clear: () => void;
    };

    function createInstance() {
        const cache = new Map();
        const TTL = 5 * 60 * 1000; // 5 minutes

        return {
            set(key: string, data: any) {
                cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
            },
            get(key: string) {
                const cached = cache.get(key);
                if (!cached) return null;

                if (Date.now() - cached.timestamp > TTL) {
                    cache.delete(key);
                    return null;
                }

                return cached.data;
            },
            clear() {
                cache.clear();
            }
        };
    }

    return {
        getInstance: () => {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

// Composant principal DashboardView avec améliorations avancées
const DashboardView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { profile, activities, progress, chapterOrder } = state;
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);
    const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(!profile);
    
    const notifications = useNotificationGenerator(state);

    const { addNotification } = useNotification();
    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Hooks personnalisés
    useThemePreference();
    const isIdle = useIdleDetection();
    CacheService.getInstance();
    
    // Raccourcis clavier
    useKeyboardShortcuts({
        onHelp: () => setHelpModalOpen(true),
        onOrientation: () => setOrientationModalOpen(true),
        onRefresh: () => window.location.reload()
    });
    
    // Gestion de l'état idle
    useEffect(() => {
        if (isIdle) {
            addNotification('Votre session est inactive. Les données seront rafraîchies.', 'info');
        }
    }, [isIdle, addNotification]);

    // Calcul du message de bienvenue basé sur l'heure
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

    const formatClassNameHTML = (name: string): string => {
        return name.replace(/(\d+)(ère|ème|er|re|e)/gi, '$1<sup>$2</sup>');
    };

    // Gestion optimisée du clic d'aide avec réinitialisation
    const handleHelpClick = useCallback(() => {
        setHelpModalOpen(true);
        if (helpClickTimerRef.current) clearTimeout(helpClickTimerRef.current);

        helpClickCountRef.current += 1;
        const currentCount = helpClickCountRef.current;

        if (currentCount === HELP_CLICKS_TO_RESET) {
            if (state.profile) {
                const profileToKeep = {
                    profile: { name: state.profile.name, classId: '' },
                };
                localStorage.setItem(DB_KEY, JSON.stringify(profileToKeep));
                addNotification('Réinitialisation en cours...', 'success');
                setTimeout(() => window.location.reload(), 500);
            }
            helpClickCountRef.current = 0;
        } else {
            if (currentCount >= 3) {
                addNotification(
                    `${HELP_CLICKS_TO_RESET - currentCount} clic${HELP_CLICKS_TO_RESET - currentCount > 1 ? 's' : ''} pour réinitialiser`,
                    'info'
                );
            }
            helpClickTimerRef.current = setTimeout(() => {
                helpClickCountRef.current = 0;
            }, HELP_RESET_DELAY_MS);
        }
    }, [state.profile, addNotification]);

    // Nettoyage du timer au démontage
    useEffect(() => {
        return () => {
            if (helpClickTimerRef.current) clearTimeout(helpClickTimerRef.current);
        };
    }, []);

    // Simulation du chargement
    useEffect(() => {
        if (!profile) {
            const timer = setTimeout(() => setIsLoading(false), 1500);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
        }
    }, [profile]);

    // Catégorisation optimisée des activités
    const categorizedActivities = useMemo((): CategorizedActivities => {
        if (!profile) return { inProgress: [], completed: [], upcoming: [] };

        const allUserActivities = (Object.values(activities) as Chapter[])
            .filter(activity => activity.class === profile.classId)
            .sort((a, b) => {
                const indexA = chapterOrder.indexOf(a.id);
                const indexB = chapterOrder.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

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

    // Gestion de la sélection de chapitre
    const handleChapterSelect = useCallback((chapterId: string) => {
        const chapter = activities[chapterId];
        if (chapter && (chapter.isActive || progress[chapterId]?.isWorkSubmitted)) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId } });
        } else {
            addNotification('Ce chapitre n\'est pas encore accessible', 'info');
        }
    }, [activities, progress, dispatch, addNotification]);

    // État de chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-border border-t-secondary rounded-full animate-spin mb-6 mx-auto" />
                    <h2 className="text-xl antique-title text-text">Chargement de votre espace...</h2>
                    <p className="serif-text text-text-secondary italic mt-2">Préparation de vos chapitres</p>
                </div>
            </div>
        );
    }

    // Pas de profil
    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center p-8 claude-card rounded-2xl max-w-md">
                    <span className="text-5xl text-text-disabled block mb-4">⚠</span>
                    <h2 className="text-xl antique-title text-text mb-2">Profil non trouvé</h2>
                    <p className="serif-text text-text-secondary italic">Veuillez vous reconnecter pour accéder à votre espace</p>
                </div>
            </div>
        );
    }

    const { inProgress, completed, upcoming } = categorizedActivities;
    const hasAnyActivity = inProgress.length > 0 || completed.length > 0 || upcoming.length > 0;
    
    return (
        <>
            <style>{customStyles}</style>

             {/* Desktop Action Buttons */}
             <div className="fixed top-4 right-4 z-40 hidden sm:flex items-center gap-3">
                <div className="group relative">
                    <button 
                        onClick={() => setNotificationCenterOpen(prev => !prev)}
                        className="w-14 h-14 rounded-full flex items-center justify-center bg-surface/50 hover:bg-surface border border-border/70 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined text-text-secondary !text-3xl group-hover:text-primary transition-colors">notifications</span>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-xs font-bold">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                    <NotificationCenter 
                        isOpen={isNotificationCenterOpen} 
                        onClose={() => setNotificationCenterOpen(false)}
                        notifications={notifications}
                    />
                </div>
                
                <div className="group relative">
                    <button 
                        onClick={handleHelpClick}
                        className="w-14 h-14 rounded-full flex items-center justify-center bg-surface/50 hover:bg-surface border border-border/70 transition-all duration-200"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined text-text-secondary !text-3xl group-hover:text-primary transition-colors">help_outline</span>
                    </button>
                    <span className="tooltip">Aide (Ctrl+H)</span>
                </div>
                
                <div className="group relative">
                    <button 
                        onClick={() => setOrientationModalOpen(true)}
                        className="w-14 h-14 rounded-full flex items-center justify-center bg-surface/50 hover:bg-surface border border-border/70 transition-all duration-200"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined text-text-secondary !text-3xl group-hover:text-primary transition-colors">explore</span>
                    </button>
                    <span className="tooltip">Programme (Ctrl+O)</span>
                </div>
            </div>

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28">
                    {/* Header */}
                    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md py-6 mb-6 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 max-w-5xl mx-auto">
                            <div>
                                <h1 className="text-4xl sm:text-6xl font-playfair mb-2">
                                    {greeting},
                                    <span className="text-text ml-4">
                                        {profile.name}
                                    </span>
                                </h1>
                                <div className="mt-2">
                                    <div
                                        className="inline-block text-xl font-garamond text-text-secondary italic"
                                        dangerouslySetInnerHTML={{ __html: formatClassNameHTML(className) }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Contenu principal */}
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
                            <h2 className="text-xl antique-title text-text mb-2">Aucun chapitre disponible</h2>
                            <p className="serif-text text-text-secondary italic">
                                Les chapitres pour votre classe seront bientôt révélés...
                            </p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-6 px-6 py-2 bg-background hover:bg-border/50 text-text rounded-lg transition-colors serif-text"
                            >
                                Rafraîchir la page
                            </button>
                        </div>
                    )}

                    {/* Ornement de fin */}
                    <footer className="text-center mt-16 mb-8">
                        <div className="flex flex-col items-center justify-center opacity-70">
                            <span className="font-brand text-xs tracking-wider text-text-secondary">Le Centre</span>
                            <div className="w-8 h-px bg-border-hover my-1.5"></div>
                            <span className="font-brand text-2xl text-primary -mt-1">Scientifique</span>
                        </div>
                        <p className="text-xs text-text-secondary serif-text italic mt-4">
                            © {new Date().getFullYear()} - Votre parcours d'apprentissage interactif
                        </p>
                    </footer>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-sm border-t border-border z-40 shadow-claude">
                <nav className="flex justify-around items-center h-16">
                    <button
                        onClick={() => setNotificationCenterOpen(prev => !prev)}
                        className="relative flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary transition-colors"
                        aria-label="Notifications"
                    >
                         {notifications.length > 0 && (
                            <span className="absolute top-2 right-1/2 translate-x-4 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-[10px] font-bold">
                                {notifications.length}
                            </span>
                        )}
                        <span className="material-symbols-outlined !text-[28px]">notifications</span>
                        <span className="text-xs font-medium mt-1">Notifications</span>
                    </button>
                    <button
                        onClick={handleHelpClick}
                        className="flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary transition-colors"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined !text-[28px]">help_outline</span>
                        <span className="text-xs font-medium mt-1">Aide</span>
                    </button>
                    <button
                        onClick={() => setOrientationModalOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary transition-colors"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined !text-[28px]">explore</span>
                        <span className="text-xs font-medium mt-1">Programme</span>
                    </button>
                </nav>
            </div>


            {/* Modals */}
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
            <OrientationModal 
                isOpen={isOrientationModalOpen} 
                onClose={() => setOrientationModalOpen(false)} 
                classId={profile.classId} 
            />
            
            {/* Notifications flottantes */}
            <NotificationToast />
        </>
    );
};

// Composant de notifications toast
const NotificationToast: React.FC = () => {
    const { notifications } = useNotification();
    
    return (
        <div className="fixed top-8 right-8 z-50 space-y-2">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`claude-card p-4 rounded-xl shadow-lg backdrop-blur-sm
                        ${notif.type === 'success' ? 'bg-emerald-50/90 border-emerald-200' : ''}
                        ${notif.type === 'warning' ? 'bg-amber-50/90 border-amber-200' : ''}
                        ${notif.type === 'error' ? 'bg-red-50/90 border-red-200' : ''}
                        ${notif.type === 'info' ? 'bg-blue-50/90 border-blue-200' : ''}
                    `}
                >
                    <p className="text-sm serif-text text-text">{notif.message}</p>
                </div>
            ))}
        </div>
    );
};

export default DashboardView;