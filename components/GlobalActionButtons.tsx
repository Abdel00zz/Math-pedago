import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAppState } from '../context/AppContext';
import HelpModal from './HelpModal';
import OrientationModal from './OrientationModal';
import { DB_KEY, HELP_CLICKS_TO_RESET, HELP_RESET_DELAY_MS } from '../constants';

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
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isOrientationModalOpen, setOrientationModalOpen] = useState(false);
    const [helpHint, setHelpHint] = useState<string | null>(null);

    const helpClickCountRef = useRef(0);
    const helpClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const helpHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleHelpClick = useCallback(() => {
        setHelpModalOpen(true);

        if (helpClickTimerRef.current) {
            clearTimeout(helpClickTimerRef.current);
        }

        helpClickCountRef.current += 1;
        const remaining = HELP_CLICKS_TO_RESET - helpClickCountRef.current;

        if (helpClickCountRef.current >= HELP_CLICKS_TO_RESET) {
            const profileName = profile?.name ?? '';
            const profileToPreserve = {
                profile: { name: profileName, classId: '' },
            };
            localStorage.setItem(DB_KEY, JSON.stringify(profileToPreserve));
            showHelpHint('Réinitialisation du parcours en cours...');
            helpClickCountRef.current = 0;
            setTimeout(() => window.location.reload(), 600);
            return;
        }

        if (remaining > 0) {
            showHelpHint(`Encore ${remaining} clic${remaining > 1 ? 's' : ''} pour réinitialiser.`);
        }

        helpClickTimerRef.current = setTimeout(() => {
            helpClickCountRef.current = 0;
        }, HELP_RESET_DELAY_MS);
    }, [profile, showHelpHint]);

    useEffect(() => {
        return () => {
            if (helpClickTimerRef.current) {
                clearTimeout(helpClickTimerRef.current);
            }
            if (helpHintTimerRef.current) {
                clearTimeout(helpHintTimerRef.current);
            }
        };
    }, []);

    if (!profile) {
        return null;
    }

    return (
        <>
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-3 sm:gap-4">
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
                        className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label="Aide et support"
                        type="button"
                    >
                        <span className="material-symbols-outlined !text-2xl sm:!text-3xl">help_outline</span>
                    </button>
                </div>
                {helpHint && (
                    <div className="pointer-events-auto mt-3 flex justify-end">
                        <div className="inline-flex items-center justify-center rounded-full bg-primary/90 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-lg">
                        {helpHint}
                        </div>
                    </div>
                )}
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