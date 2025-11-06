import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

const MAX_MOBILE_WIDTH = 900;

const addMediaListener = (query: MediaQueryList, handler: () => void) => {
    const listener = () => handler();

    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }

    const legacyQuery = query as MediaQueryList & {
        addListener?: (cb: () => void) => void;
        removeListener?: (cb: () => void) => void;
    };

    if (typeof legacyQuery.addListener === 'function') {
        legacyQuery.addListener(listener);
        return () => legacyQuery.removeListener?.(listener);
    }

    return () => undefined;
};

const MobileOrientationPrompt: React.FC = () => {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);

    const computeViewportState = useCallback(() => {
        if (typeof window === 'undefined') {
            return { mobile: false, portrait: false };
        }

        const pointerQuery = window.matchMedia('(pointer: coarse)');
        const widthQuery = window.matchMedia(`(max-width: ${MAX_MOBILE_WIDTH}px)`);
        const orientationQuery = window.matchMedia('(orientation: portrait)');

        const portrait = orientationQuery.matches || window.innerHeight > window.innerWidth;
        const mobileCandidate = pointerQuery.matches && widthQuery.matches;

        return { mobile: mobileCandidate, portrait };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const updateState = () => {
            const { mobile, portrait } = computeViewportState();
            setIsMobileViewport(mobile);
            setIsPortrait(portrait);
        };

        updateState();

        const pointerQuery = window.matchMedia('(pointer: coarse)');
        const widthQuery = window.matchMedia(`(max-width: ${MAX_MOBILE_WIDTH}px)`);
        const orientationQuery = window.matchMedia('(orientation: portrait)');

        const cleanups = [
            addMediaListener(pointerQuery, updateState),
            addMediaListener(widthQuery, updateState),
            addMediaListener(orientationQuery, updateState),
        ];

        window.addEventListener('resize', updateState);
        window.addEventListener('orientationchange', updateState);

        return () => {
            cleanups.forEach(cleanup => cleanup());
            window.removeEventListener('resize', updateState);
            window.removeEventListener('orientationchange', updateState);
        };
    }, [computeViewportState]);

    useEffect(() => {
        if (!isPortrait) {
            setHasDismissed(false);
        }
    }, [isPortrait]);

    const shouldDisplay = useMemo(() => {
        return isMobileViewport && isPortrait && !hasDismissed;
    }, [isMobileViewport, isPortrait, hasDismissed]);

    useEffect(() => {
        if (!shouldDisplay || typeof document === 'undefined') {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [shouldDisplay]);

    const handleRefreshState = () => {
        const { mobile, portrait } = computeViewportState();
        setIsMobileViewport(mobile);
        setIsPortrait(portrait);
    };

    if (!shouldDisplay || typeof document === 'undefined') {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-6 py-10">
            <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.32)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <span className="material-symbols-outlined text-4xl">screen_rotation</span>
                </div>
                <h2 className="mt-6 text-lg font-semibold tracking-tight text-slate-900">
                    Passez en mode paysage
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Pour profiter d'une interface plus riche et de l'espace nécessaire aux formules, pivotez votre écran en mode paysage. Nous ajusterons automatiquement la mise en page.
                </p>
                <ul className="mt-4 space-y-2 text-left text-xs text-slate-500">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined mt-0.5 text-base text-indigo-500">auto_awesome</span>
                        <span>Affichage étendu des chapitres et de la progression.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined mt-0.5 text-base text-indigo-500">calculate</span>
                        <span>Formules et graphiques gagnent en lisibilité.</span>
                    </li>
                </ul>
                <div className="mt-7 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleRefreshState}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_20px_40px_rgba(15,23,42,0.28)] transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_46px_rgba(15,23,42,0.32)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        J'ai pivoté l'écran
                    </button>
                    <button
                        type="button"
                        onClick={() => setHasDismissed(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                        Continuer en mode portrait
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MobileOrientationPrompt;
