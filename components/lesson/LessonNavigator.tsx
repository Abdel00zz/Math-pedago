import React, { useEffect, useCallback, useRef } from 'react';
import { useLessonProgress } from '../../context/LessonProgressContext';
import { useNotification } from '../../context/NotificationContext';
import { MathTitle } from './MathTitle';

const toAlphabetic = (index: number) => {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (index < base.length) {
        return base[index];
    }
    const quotient = Math.floor(index / base.length);
    const remainder = index % base.length;
    return `${base[quotient - 1]}${base[remainder]}`;
};

export const LessonNavigator: React.FC = () => {
    const {
        outline,
        getProgress,
        activeSectionId,
        activeSubsectionId,
        setActiveSectionId,
        setActiveSubsectionId,
        scrollToAnchor,
        markAllNodesUpTo,
    } = useLessonProgress();
    const { addNotification } = useNotification();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const subsectionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // États pour le double-clic
    const doubleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastClickTimeRef = useRef<number>(0);
    const lastClickTargetRef = useRef<string | null>(null);

    const registerSectionRef = useCallback(
        (sectionId: string) => (element: HTMLButtonElement | null) => {
            if (!element) {
                sectionRefs.current.delete(sectionId);
            } else {
                sectionRefs.current.set(sectionId, element);
            }
        },
        []
    );

    const registerSubsectionRef = useCallback(
        (subsectionId: string) => (element: HTMLButtonElement | null) => {
            if (!element) {
                subsectionRefs.current.delete(subsectionId);
            } else {
                subsectionRefs.current.set(subsectionId, element);
            }
        },
        []
    );

    const handleSectionClick = (sectionAnchor: string, sectionId: string) => {
        setActiveSectionId(sectionId);
        scrollToAnchor(sectionAnchor, { offset: 96 });
    };

    const handleSubsectionClick = (_sectionId: string, subsectionAnchor: string, subsectionId: string) => {
        setActiveSubsectionId(subsectionId);
        scrollToAnchor(subsectionAnchor, { offset: 96 });
    };

    const handleSubsectionDoubleClick = useCallback((subsectionId: string, subsectionTitle: string, paragraphNodeIds: string[]) => {
        const now = Date.now();
        const timeDiff = now - lastClickTimeRef.current;
        
        if (timeDiff < 500 && lastClickTargetRef.current === subsectionId) {
            // Double-clic détecté
            const lastParagraphOfSubsection = paragraphNodeIds[paragraphNodeIds.length - 1];
            
            if (lastParagraphOfSubsection) {
                // Valider tous les paragraphes jusqu'à celui-ci (inclus)
                markAllNodesUpTo(lastParagraphOfSubsection);
                
                addNotification('Progression sauvegardée', 'info', {
                    message: `Paragraphes marqués jusqu'à "${subsectionTitle}".`,
                    duration: 2000,
                });
            }
            
            // Reset pour éviter les clics multiples
            lastClickTimeRef.current = 0;
            lastClickTargetRef.current = null;
        } else {
            // Premier clic ou clic sur un autre élément
            lastClickTimeRef.current = now;
            lastClickTargetRef.current = subsectionId;
        }
    }, [markAllNodesUpTo, addNotification]);



    const ensureTargetVisible = useCallback((target: HTMLElement | null | undefined) => {
        const panel = panelRef.current;
        if (!panel || !target) {
            return;
        }

        // Utiliser requestAnimationFrame pour s'assurer que le DOM est à jour
        requestAnimationFrame(() => {
            const panelRect = panel.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            
            const panelScrollTop = panel.scrollTop;
            const panelHeight = panelRect.height;
            const panelScrollHeight = panel.scrollHeight;
            
            // Position de l'élément relative au scroll du panneau
            const targetOffsetTop = target.offsetTop;
            const targetHeight = targetRect.height;
            
            // Position actuelle visible
            const visibleTop = panelScrollTop;
            const visibleBottom = panelScrollTop + panelHeight;
            
            // Marges de sécurité
            const topMargin = 60; // Espace en haut
            const bottomMargin = 60; // Espace en bas
            
            // Déterminer si l'élément est visible
            const isAboveView = targetOffsetTop < visibleTop + topMargin;
            const isBelowView = (targetOffsetTop + targetHeight) > visibleBottom - bottomMargin;
            
            if (isAboveView) {
                // L'élément est au-dessus, scroller vers le haut pour le centrer
                const newScrollTop = Math.max(0, targetOffsetTop - topMargin);
                panel.scrollTo({ 
                    top: newScrollTop, 
                    behavior: 'smooth' 
                });
            } else if (isBelowView) {
                // L'élément est en dessous, scroller vers le bas pour le centrer
                const newScrollTop = Math.min(
                    panelScrollHeight - panelHeight,
                    targetOffsetTop - panelHeight + targetHeight + bottomMargin
                );
                panel.scrollTo({ 
                    top: newScrollTop, 
                    behavior: 'smooth' 
                });
            }
            // Sinon, l'élément est déjà visible, pas besoin de scroller
        });
    }, []);

    useEffect(() => {
        if (!activeSectionId) return;
        
        // Nettoyer le timeout précédent
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        // Scroller immédiatement vers la section active
        const target = sectionRefs.current.get(activeSectionId);
        if (target) {
            ensureTargetVisible(target);
        }
    }, [activeSectionId, ensureTargetVisible]);

    useEffect(() => {
        if (!activeSubsectionId) return;
        
        // Nettoyer le timeout précédent
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        // Scroller immédiatement vers la sous-section active
        const target = subsectionRefs.current.get(activeSubsectionId);
        if (target) {
            ensureTargetVisible(target);
        }
    }, [activeSubsectionId, ensureTargetVisible]);

    if (!outline.length) {
        return null;
    }

    return (
        <aside className="lesson-navigator">
            <div
                id="lesson-navigator-panel"
                className="lesson-navigator__panel"
                ref={panelRef}
            >
                <div 
                    className="lesson-navigator__scroll-container"
                    ref={scrollContainerRef}
                >
                    <div className="lesson-navigator__sections" role="navigation" aria-label="Sommaire des sections">
                    {outline.map((section) => {
                        const sectionProgress = getProgress(section.paragraphNodeIds);
                        const sectionComplete = sectionProgress.total > 0 && sectionProgress.completed === sectionProgress.total;
                        const sectionActive = activeSectionId === section.id;

                        return (
                            <div
                                key={section.id}
                                className={`lesson-navigator__section${sectionActive ? ' is-active' : ''}${sectionComplete ? ' is-complete' : ''}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleSectionClick(section.anchor, section.id)}
                                    className="lesson-navigator__section-trigger"
                                    ref={registerSectionRef(section.id)}
                                >
                                    <span className="lesson-navigator__section-index">{toAlphabetic(section.index)}</span>
                                    <MathTitle className="lesson-navigator__section-title">
                                        {section.title}
                                    </MathTitle>
                                </button>

                                <ul className="lesson-navigator__subsections">
                                    {section.subsections.map((subsection, subsectionIndex) => {
                                        const subsectionProgress = getProgress(subsection.paragraphNodeIds);
                                        const subsectionComplete =
                                            subsectionProgress.total > 0 && subsectionProgress.completed === subsectionProgress.total;
                                        const subsectionActive = activeSubsectionId === subsection.id;

                                        return (
                                            <li
                                                key={subsection.id}
                                                className={`lesson-navigator__subsection${subsectionActive ? ' is-active' : ''}${
                                                    subsectionComplete ? ' is-complete' : ''
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleSubsectionClick(section.id, subsection.anchor, subsection.id);
                                                        handleSubsectionDoubleClick(subsection.id, subsection.title, subsection.paragraphNodeIds);
                                                    }}
                                                    className="lesson-navigator__subsection-trigger"
                                                    ref={registerSubsectionRef(subsection.id)}
                                                    title="Double-cliquer pour valider tous les paragraphes jusqu'ici"
                                                >
                                                    <span className="lesson-navigator__subsection-index">{subsectionIndex + 1}</span>
                                                    <MathTitle className="lesson-navigator__subsection-title">
                                                        {subsection.title}
                                                    </MathTitle>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
        </aside>
    );
};
