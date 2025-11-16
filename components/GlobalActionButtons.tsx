import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppState } from '../context/AppContext';
import HelpModal from './HelpModal';
import OrientationModal from './OrientationModal';
import { DB_KEY, HELP_CLICKS_TO_RESET, HELP_RESET_DELAY_MS, HELP_SECRET_HOLD_MS } from '../constants';

const useKeyboardShortcuts = (callbacks: {
    onHelp: () => void;
    onOrientation: () => void;
    onRefresh: () => void;
}) => {
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!event.ctrlKey && !event.metaKey) {
                return;
            }

            switch (event.key) {
                case 'h':
                    event.preventDefault();
                    callbacksRef.current.onHelp();
                    break;
                case 'o':
                    event.preventDefault();
                    callbacksRef.current.onOrientation();
                    break;
                case 'r':
                    event.preventDefault();
                    callbacksRef.current.onRefresh();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
};

const GlobalActionButtons: React.FC = () => {
    const { profile } = useAppState();
    const dispatch = useAppDispatch();
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);
    const [helpHint, setHelpHint] = useState<string | null>(null);

    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const helpHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const secretHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const secretDoorTriggeredRef = useRef(false);

    const clearHelpClickTimer = useCallback(() => {
        if (helpClickTimerRef.current) {
            clearTimeout(helpClickTimerRef.current);
            helpClickTimerRef.current = null;
        }
    }, []);

    const resetHelpClickCounter = useCallback(() => {
        helpClickCountRef.current = 0;
    }, []);

    const scheduleHelpClickReset = useCallback(() => {
        clearHelpClickTimer();
        helpClickTimerRef.current = setTimeout(() => {
            helpClickCountRef.current = 0;
            helpClickTimerRef.current = null;
        }, HELP_RESET_DELAY_MS);
    }, [clearHelpClickTimer]);

    const keyboardCallbacks = useMemo(() => ({
        onHelp: () => setHelpModalOpen(true),
        onOrientation: () => setOrientationModalOpen(true),
        onRefresh: () => window.location.reload(),
    }), []);

    useKeyboardShortcuts(keyboardCallbacks);

    const showHelpHint = useCallback((message: string) => {
        setHelpHint(message);
        if (helpHintTimerRef.current) {
            clearTimeout(helpHintTimerRef.current);
        }
        helpHintTimerRef.current = setTimeout(() => setHelpHint(null), 3200);
    }, []);

    const cancelSecretDoorCountdown = useCallback(() => {
        if (secretHoldTimerRef.current) {
            clearTimeout(secretHoldTimerRef.current);
            secretHoldTimerRef.current = null;
        }
    }, []);

    const triggerSecretDoor = useCallback(() => {
        secretDoorTriggeredRef.current = true;
        cancelSecretDoorCountdown();
        clearHelpClickTimer();
        resetHelpClickCounter();
        setHelpModalOpen(false);
        showHelpHint('Portail secret → connexion...');

        dispatch({
            type: 'CHANGE_VIEW',
            payload: {
                view: 'login',
                forceLogin: true,
            },
        });
    }, [cancelSecretDoorCountdown, clearHelpClickTimer, dispatch, resetHelpClickCounter, showHelpHint]);

    const startSecretDoorCountdown = useCallback(() => {
        cancelSecretDoorCountdown();
        secretHoldTimerRef.current = setTimeout(triggerSecretDoor, HELP_SECRET_HOLD_MS);
    }, [cancelSecretDoorCountdown, triggerSecretDoor]);

    const handleHelpClick = useCallback(() => {
        if (secretDoorTriggeredRef.current) {
            secretDoorTriggeredRef.current = false;
            return;
        }

        setHelpModalOpen(true);

        helpClickCountRef.current += 1;

        if (helpClickCountRef.current >= HELP_CLICKS_TO_RESET) {
            const profileName = profile?.name ?? '';
            const profileToPreserve = {
                profile: { name: profileName, classId: '' },
            };
            localStorage.setItem(DB_KEY, JSON.stringify(profileToPreserve));
            showHelpHint('Réinitialisation du parcours en cours...');
            resetHelpClickCounter();
            clearHelpClickTimer();
            setTimeout(() => window.location.reload(), 600);
            return;
        }

        scheduleHelpClickReset();
    }, [clearHelpClickTimer, profile, resetHelpClickCounter, scheduleHelpClickReset, showHelpHint]);

    useEffect(() => {
        return () => {
            clearHelpClickTimer();
            if (helpHintTimerRef.current) {
                clearTimeout(helpHintTimerRef.current);
            }
            if (secretHoldTimerRef.current) {
                clearTimeout(secretHoldTimerRef.current);
            }
        };
    }, [clearHelpClickTimer]);

    if (!profile) {
        return null;
    }

    return (
        <>
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 pointer-events-none">
                <div className="pointer-events-auto relative inline-flex flex-col items-end">
                    <div className="inline-flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setOrientationModalOpen(true)}
                            className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            aria-label="Programme d'orientation"
                            type="button"
                        >
                            <span className="material-symbols-outlined !text-2xl sm:!text-3xl">explore</span>
                        </button>
                        <button
                            onClick={handleHelpClick}
                            onPointerDown={startSecretDoorCountdown}
                            onPointerUp={cancelSecretDoorCountdown}
                            onPointerLeave={cancelSecretDoorCountdown}
                            onPointerCancel={cancelSecretDoorCountdown}
                            className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            aria-label="Aide et support"
                            type="button"
                        >
                            <span className="material-symbols-outlined !text-2xl sm:!text-3xl">help_outline</span>
                        </button>
                    </div>
                    {helpHint && (
                        <div className="pointer-events-auto absolute top-full right-0 mt-3 flex justify-end" role="status" aria-live="polite">
                            <div className="inline-flex items-center justify-center rounded-full bg-primary/90 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-lg">
                                {helpHint}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
            <OrientationModal
                isOpen={isOrientationModalOpen}
                onClose={() => setOrientationModalOpen(false)}
                classId={profile.classId}
            />
        </>
    );
};

export default GlobalActionButtons;