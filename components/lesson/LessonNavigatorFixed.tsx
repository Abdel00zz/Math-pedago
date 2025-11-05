import React, { useEffect, useCallback, useRef, useState } from 'react';
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
        lessonProgress,
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
    const lastClickTimeRef = useRef<number>(0);
    const lastClickTargetRef = useRef<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleNavigator = useCallback(() => {
        setIsCollapsed((previous) => !previous);
    }, []);

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
        const container = scrollContainerRef.current ?? panelRef.current;

        if (!container || !target) {
            return;
        }

        // Utiliser requestAnimationFrame pour s'assurer que le DOM est à jour
        requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();

            const currentScrollTop = container.scrollTop;
            const containerHeight = containerRect.height;
            const maxScrollTop = container.scrollHeight - containerHeight;

            const targetTop = currentScrollTop + (targetRect.top - containerRect.top);
            const targetBottom = targetTop + targetRect.height;

            const topMargin = 60;
            const bottomMargin = 60;

            const visibleTop = currentScrollTop;
            const visibleBottom = currentScrollTop + containerHeight;

            if (targetTop < visibleTop + topMargin) {
                const newScrollTop = Math.max(0, targetTop - topMargin);
                container.scrollTo({
                    top: newScrollTop,
                    behavior: 'smooth',
                });
            } else if (targetBottom > visibleBottom - bottomMargin) {
                const newScrollTop = Math.min(
                    maxScrollTop,
                    targetBottom - containerHeight + bottomMargin,
                );
                container.scrollTo({
                    top: Math.max(0, newScrollTop),
                    behavior: 'smooth',
                });
            }
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

    useEffect(() => {
        if (isCollapsed) {
            return;
        }

        if (activeSubsectionId) {
            const subsection = subsectionRefs.current.get(activeSubsectionId);
            if (subsection) {
                ensureTargetVisible(subsection);
                return;
            }
        }

        if (activeSectionId) {
            const section = sectionRefs.current.get(activeSectionId);
            if (section) {
                ensureTargetVisible(section);
            }
        }
    }, [isCollapsed, activeSectionId, activeSubsectionId, ensureTargetVisible]);

    if (!outline.length) {
        return null;
    }

    const navigatorClassName = `lesson-navigator${isCollapsed ? ' lesson-navigator--collapsed' : ''}`;

    return (
        <aside className={navigatorClassName}>
            <button
                type="button"
                className="lesson-navigator__toggle"
                onClick={toggleNavigator}
                aria-expanded={!isCollapsed}
                aria-controls="lesson-navigator-panel"
            >
                <div className="lesson-navigator__toggle-header">
                    <span className="lesson-navigator__toggle-title">Sommaire</span>
                    <span className="lesson-navigator__progress-badge">
                        {lessonProgress.completed}/{lessonProgress.total}
                    </span>
                </div>
            </button>

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
                                    <div className="lesson-navigator__section-content">
                                        <MathTitle className="lesson-navigator__section-title">
                                            {section.title}
                                        </MathTitle>
                                        <span className="lesson-navigator__section-progress">
                                            {sectionProgress.completed}/{sectionProgress.total}
                                        </span>
                                    </div>
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
                                                    <div className="lesson-navigator__subsection-content">
                                                        <MathTitle className="lesson-navigator__subsection-title">
                                                            {subsection.title}
                                                        </MathTitle>
                                                        <span className="lesson-navigator__subsection-progress">
                                                            {subsectionProgress.completed}/{subsectionProgress.total}
                                                        </span>
                                                    </div>
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