import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { useNotificationGenerator } from '../hooks/useNotificationGenerator';
import HelpModal from './HelpModal';
import OrientationModal from './OrientationModal';
import NotificationCenter from './NotificationCenter';
import { DB_KEY, HELP_CLICKS_TO_RESET, HELP_RESET_DELAY_MS } from '../constants';

const NOTIFICATION_READ_KEY = 'pedagoEleveNotificationsRead_V1';

// ✅ OPTIMISATION 1: Cache pour les IDs de notifications lues
let cachedReadIds: Set<string> | null = null;

const getReadNotificationIds = (): Set<string> => {
    if (cachedReadIds) {
        return cachedReadIds;
    }
    
    try {
        const stored = localStorage.getItem(NOTIFICATION_READ_KEY);
        cachedReadIds = stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        cachedReadIds = new Set();
    }
    
    return cachedReadIds;
};

const saveReadNotificationIds = (ids: Set<string>) => {
    cachedReadIds = ids;
    try {
        localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(Array.from(ids)));
    } catch (error) {
        console.error("Failed to save read notifications:", error);
    }
};

const useKeyboardShortcuts = (callbacks: { 
    onHelp: () => void; 
    onOrientation: () => void; 
    onRefresh: () => void; 
}) => {
    // ✅ OPTIMISATION 2: Callbacks stables avec useRef
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;
    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        callbacksRef.current.onHelp();
                        break;
                    case 'o':
                        e.preventDefault();
                        callbacksRef.current.onOrientation();
                        break;
                    case 'r':
                        e.preventDefault();
                        callbacksRef.current.onRefresh();
                        break;
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
};

const GlobalActionButtons: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const { profile } = state;

    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);
    const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

    // ✅ OPTIMISATION 3: Callbacks mémorisés pour les raccourcis clavier
    const keyboardCallbacks = useMemo(() => ({
        onHelp: () => setHelpModalOpen(true),
        onOrientation: () => setOrientationModalOpen(true),
        onRefresh: () => window.location.reload()
    }), []);
    
    useKeyboardShortcuts(keyboardCallbacks);

    // ✅ OPTIMISATION 4: État des notifications avec cache
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => 
        getReadNotificationIds()
    );

    const allNotifications = useNotificationGenerator(state);

    // ✅ OPTIMISATION 5: Calcul du compteur mémorisé
    const unreadNotificationsCount = useMemo(() => {
        return allNotifications.filter(n => !readNotificationIds.has(n.id)).length;
    }, [allNotifications, readNotificationIds]);

    const handleOpenNotifications = useCallback(() => {
        setNotificationCenterOpen(true);
        
        if (unreadNotificationsCount > 0) {
            const currentAllIds = allNotifications.map(n => n.id);
            const newReadIds = new Set([...readNotificationIds, ...currentAllIds]);
            
            setReadNotificationIds(newReadIds);
            saveReadNotificationIds(newReadIds);
        }
    }, [allNotifications, readNotificationIds, unreadNotificationsCount]);

    // ✅ OPTIMISATION 6: Logique de reset avec useRef pour éviter recréations
    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleHelpClick = useCallback(() => {
        setHelpModalOpen(true);
        
        if (helpClickTimerRef.current) {
            clearTimeout(helpClickTimerRef.current);
        }

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

    useEffect(() => {
        return () => {
            if (helpClickTimerRef.current) {
                clearTimeout(helpClickTimerRef.current);
            }
        };
    }, []);

    if (!profile) return null;

    // ✅ OPTIMISATION 7: Badge de notification optimisé
    const NotificationBadge = unreadNotificationsCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-xs font-bold">
                {unreadNotificationsCount}
            </span>
        </span>
    ) : null;

    return (
        <>
            {/* Desktop Action Buttons - Aligné avec les cartes et couleurs douces */}
            <div className="fixed top-4 right-4 z-40 hidden sm:flex items-center gap-3 p-1.5">
                {/* Bouton Notifications - Couleur vert doux */}
                <div className="group relative flex items-center">
                    <button
                        onClick={handleOpenNotifications}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined !text-xl">notifications</span>
                        {NotificationBadge}
                    </button>
                    <span className="absolute right-0 translate-x-0 top-full mt-3 w-max rounded-lg bg-surface/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-text opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow z-50">
                        Notifications
                    </span>
                </div>

                {/* Bouton Orientation - Couleur orange doux */}
                <div className="group relative flex items-center">
                    <button
                        onClick={() => setOrientationModalOpen(true)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined !text-xl">explore</span>
                    </button>
                    <span className="absolute right-0 translate-x-0 top-full mt-3 w-max rounded-lg bg-surface/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-text opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow z-50">
                        Programme
                    </span>
                </div>

                {/* Bouton Aide - Couleur bleu doux */}
                <div className="group relative flex items-center">
                    <button
                        onClick={handleHelpClick}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined !text-xl">help_outline</span>
                    </button>
                    <span className="absolute right-0 translate-x-0 top-full mt-3 w-max rounded-lg bg-surface/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-text opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow z-50">
                        Aide
                    </span>
                </div>
            </div>
            
            {/* Mobile Bottom Navigation - Couleurs douces appliquées */}
            <div className="sm:hidden fixed bottom-4 inset-x-3 z-40">
                <nav className="max-w-md mx-auto bg-surface/95 backdrop-blur-2xl border-t border-border/40 rounded-xl flex justify-around items-center py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-2 shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                    {/* Notifications - Vert doux */}
                    <button
                        onClick={handleOpenNotifications}
                        className="relative flex-1 flex flex-col items-center justify-center p-2 rounded-lg hover:bg-primary/10 text-primary/80 hover:text-primary focus:outline-none transition-all duration-200 active:scale-95 touch-manipulation min-h-[52px]"
                        aria-label="Notifications"
                    >
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1.5 right-1/2 translate-x-6 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-[10px] font-bold ring-2 ring-surface shadow-md">
                                {unreadNotificationsCount}
                            </span>
                        )}
                        <span className="material-symbols-outlined !text-[22px]">notifications</span>
                        <span className="text-[9px] font-semibold mt-1 tracking-wide uppercase">Notifs</span>
                    </button>

                    {/* Orientation - Orange doux */}
                    <button
                        onClick={() => setOrientationModalOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg hover:bg-primary/10 text-primary/80 hover:text-primary focus:outline-none transition-all duration-200 active:scale-95 touch-manipulation min-h-[52px]"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined !text-[22px]">explore</span>
                        <span className="text-[9px] font-semibold mt-1 tracking-wide uppercase">Programme</span>
                    </button>

                    {/* Aide - Bleu doux */}
                    <button
                        onClick={handleHelpClick}
                        className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg hover:bg-primary/10 text-primary/80 hover:text-primary focus:outline-none transition-all duration-200 active:scale-95 touch-manipulation min-h-[52px]"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined !text-[22px]">help_outline</span>
                        <span className="text-[9px] font-semibold mt-1 tracking-wide uppercase">Aide</span>
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
            <NotificationCenter 
                isOpen={isNotificationCenterOpen} 
                onClose={() => setNotificationCenterOpen(false)}
                notifications={allNotifications}
            />
        </>
    );
};

export default GlobalActionButtons;