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
        markNode,
        isNodeCompleted,
        toggleNode,
    } = useLessonProgress();
    const { addNotification } = useNotification();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const subsectionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
                        const sectionComplete = section.subsections.every(
                            (subsection) =>
                                getProgress(subsection.paragraphNodeIds).completed === getProgress(subsection.paragraphNodeIds).total
                        );
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

                                        const handleCheckboxToggle = (e: React.MouseEvent) => {
                                            e.stopPropagation();

                                            // Si déjà complète, on décoche tout
                                            if (subsectionComplete) {
                                                subsection.paragraphNodeIds.forEach((nodeId) => {
                                                    markNode(nodeId, false);
                                                });
                                                addNotification('Progression mise à jour', 'info', {
                                                    message: `Section "${subsection.title}" décochée.`,
                                                    duration: 2000,
                                                });
                                            } else {
                                                // Sinon, on coche tout
                                                subsection.paragraphNodeIds.forEach((nodeId) => {
                                                    markNode(nodeId, true);
                                                });
                                                addNotification('Progression sauvegardée', 'success', {
                                                    message: `Section "${subsection.title}" validée !`,
                                                    duration: 2000,
                                                });
                                            }
                                        };

                                        return (
                                            <li
                                                key={subsection.id}
                                                className={`lesson-navigator__subsection${subsectionActive ? ' is-active' : ''}${
                                                    subsectionComplete ? ' is-complete' : ''
                                                }`}
                                            >
                                                <div className="lesson-navigator__subsection-wrapper">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSubsectionClick(section.id, subsection.anchor, subsection.id)}
                                                        className="lesson-navigator__subsection-trigger"
                                                        ref={registerSubsectionRef(subsection.id)}
                                                        title="Cliquer pour naviguer vers cette section"
                                                    >
                                                        <span className="lesson-navigator__subsection-index">{subsectionIndex + 1}</span>
                                                        <MathTitle className="lesson-navigator__subsection-title">
                                                            {subsection.title}
                                                        </MathTitle>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleCheckboxToggle}
                                                        className={`lesson-navigator__subsection-checkbox${subsectionComplete ? ' is-checked' : ''}`}
                                                        title={subsectionComplete ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                                        aria-label={subsectionComplete ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                                        aria-checked={subsectionComplete}
                                                        role="checkbox"
                                                    >
                                                        {subsectionComplete && (
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="lesson-navigator__checkbox-icon"
                                                            >
                                                                <path d="M18 6L6 18M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Liste des paragraphes individuels */}
                                                {subsection.paragraphNodeIds.length > 0 && (
                                                    <ul className="lesson-navigator__paragraphs">
                                                        {subsection.paragraphNodeIds.map((nodeId, paragraphIndex) => {
                                                            const isParagraphComplete = isNodeCompleted(nodeId);

                                                            const handleParagraphCheckbox = (e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                toggleNode(nodeId);
                                                            };

                                                            return (
                                                                <li
                                                                    key={nodeId}
                                                                    className={`lesson-navigator__paragraph${isParagraphComplete ? ' is-complete' : ''}`}
                                                                >
                                                                    <div className="lesson-navigator__paragraph-wrapper">
                                                                        <span className="lesson-navigator__paragraph-label">
                                                                            Paragraphe {paragraphIndex + 1}
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={handleParagraphCheckbox}
                                                                            className={`lesson-navigator__paragraph-checkbox${isParagraphComplete ? ' is-checked' : ''}`}
                                                                            title={isParagraphComplete ? 'Marquer comme non lu' : 'Marquer comme lu'}
                                                                            aria-label={`Paragraphe ${paragraphIndex + 1}: ${isParagraphComplete ? 'Lu' : 'Non lu'}`}
                                                                            aria-checked={isParagraphComplete}
                                                                            role="checkbox"
                                                                        >
                                                                            {isParagraphComplete && (
                                                                                <svg
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="3"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    className="lesson-navigator__checkbox-icon"
                                                                                >
                                                                                    <path d="M5 12l5 5L20 7" />
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
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
