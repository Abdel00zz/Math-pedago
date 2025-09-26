import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { useNotificationGenerator } from '../hooks/useNotificationGenerator';
import HelpModal from './HelpModal';
import OrientationModal from './OrientationModal';
import NotificationCenter from './NotificationCenter';
import { DB_KEY, HELP_CLICKS_TO_RESET, HELP_RESET_DELAY_MS } from '../constants';

const NOTIFICATION_READ_KEY = 'pedagoEleveNotificationsRead_V1';

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


const GlobalActionButtons: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const { profile } = state;

    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);
    const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onHelp: () => setHelpModalOpen(true),
        onOrientation: () => setOrientationModalOpen(true),
        onRefresh: () => window.location.reload()
    });

    // Notification logic
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem(NOTIFICATION_READ_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    const allNotifications = useNotificationGenerator(state);

    const unreadNotificationsCount = useMemo(() => {
        return allNotifications.filter(n => !readNotificationIds.has(n.id)).length;
    }, [allNotifications, readNotificationIds]);

    const handleOpenNotifications = () => {
        setNotificationCenterOpen(true);
        if (unreadNotificationsCount > 0) {
            const currentAllIds = allNotifications.map(n => n.id);
            const newReadIds = new Set([...readNotificationIds, ...currentAllIds]);
            
            setReadNotificationIds(newReadIds);
            try {
                localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(Array.from(newReadIds)));
            } catch (error) {
                console.error("Failed to save read notifications:", error);
            }
        }
    };

    // Help click reset logic
    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => {
        return () => {
            if (helpClickTimerRef.current) clearTimeout(helpClickTimerRef.current);
        };
    }, []);

    if (!profile) return null;

    return (
        <>
            {/* Desktop Action Buttons */}
            <div className="fixed top-5 right-5 z-40 hidden sm:flex items-center gap-3">
                <div className="group relative flex items-center">
                    <button 
                        onClick={handleOpenNotifications}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-surface/80 backdrop-blur-md border border-border/70 text-text-secondary hover:text-primary hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined !text-xl">notifications</span>
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
                                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-xs font-bold">
                                    {unreadNotificationsCount}
                                </span>
                            </span>
                        )}
                    </button>
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max rounded-md bg-text/90 px-3 py-1.5 text-xs font-semibold text-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Notifications
                    </span>
                    <NotificationCenter 
                        isOpen={isNotificationCenterOpen} 
                        onClose={() => setNotificationCenterOpen(false)}
                        notifications={allNotifications}
                    />
                </div>
                <div className="group relative flex items-center">
                    <button 
                        onClick={() => setOrientationModalOpen(true)}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-surface/80 backdrop-blur-md border border-border/70 text-text-secondary hover:text-primary hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined !text-xl">explore</span>
                    </button>
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max rounded-md bg-text/90 px-3 py-1.5 text-xs font-semibold text-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Programme
                    </span>
                </div>
                <div className="group relative flex items-center">
                    <button 
                        onClick={handleHelpClick}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-surface/80 backdrop-blur-md border border-border/70 text-text-secondary hover:text-primary hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined !text-xl">help_outline</span>
                    </button>
                     <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max rounded-md bg-text/90 px-3 py-1.5 text-xs font-semibold text-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Aide
                    </span>
                </div>
            </div>
            
            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-t border-border/70 z-40">
                <nav className="flex justify-around items-center h-16">
                    <button
                        onClick={handleOpenNotifications}
                        className="relative flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary focus:text-primary focus:outline-none transition-all duration-200 active:scale-95"
                        aria-label="Notifications"
                    >
                         {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1.5 right-1/2 translate-x-5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-[10px] font-bold ring-2 ring-surface">
                                {unreadNotificationsCount}
                            </span>
                        )}
                        <span className="material-symbols-outlined !text-[26px]">notifications</span>
                        <span className="text-xs font-medium mt-0.5 font-button">Notifications</span>
                    </button>
                     <button
                        onClick={() => setOrientationModalOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary focus:text-primary focus:outline-none transition-all duration-200 active:scale-95"
                        aria-label="Programme d'orientation"
                    >
                        <span className="material-symbols-outlined !text-[26px]">explore</span>
                        <span className="text-xs font-medium mt-0.5 font-button">Programme</span>
                    </button>
                    <button
                        onClick={handleHelpClick}
                        className="flex-1 flex flex-col items-center justify-center p-2 text-text-secondary hover:text-primary focus:text-primary focus:outline-none transition-all duration-200 active:scale-95"
                        aria-label="Aide et support"
                    >
                        <span className="material-symbols-outlined !text-[26px]">help_outline</span>
                        <span className="text-xs font-medium mt-0.5 font-button">Aide</span>
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
        </>
    );
}

export default GlobalActionButtons;