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

const LessonNavigatorComponent: React.FC = () => {
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
        isNodeCompleted,
        markNode,
        allParagraphNodeIds,
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

    const handleSubsectionCheckbox = useCallback((
        e: React.MouseEvent,
        subsectionId: string,
        subsectionTitle: string,
        paragraphNodeIds: string[],
        fallbackNodeId?: string
    ) => {
        e.stopPropagation();

        const safeNodeIds = paragraphNodeIds.length > 0
            ? paragraphNodeIds
            : fallbackNodeId
                ? [fallbackNodeId]
                : [];

        if (safeNodeIds.length === 0) {
            addNotification('Progression indisponible', 'warning', {
                message: 'Impossible de retrouver cet élément dans la progression.',
                duration: 3000,
            });
            return;
        }

        const subsectionTitleClean = subsectionTitle.replace(/<[^>]*>/g, '');

        // Logique radicalement simplifiée :
        // - Si tout est coché : tout décocher
        // - Sinon : tout cocher
        const allCompleted = safeNodeIds.every(nodeId => isNodeCompleted(nodeId));

        try {
            if (allCompleted) {
                // Décocher tous les nodes
                safeNodeIds.forEach(nodeId => markNode(nodeId, false));

                // Notification immédiate avec le pourcentage actuel (sera mis à jour automatiquement)
                addNotification('Paragraphe décoché', 'info', {
                    message: `<strong>${subsectionTitleClean}</strong> · Progression mise à jour`,
                    duration: 2000,
                });
            } else {
                // Cocher tous les nodes (même ceux déjà cochés pour être sûr)
                safeNodeIds.forEach(nodeId => markNode(nodeId, true));

                // Vérifier si la leçon est maintenant complète (100%)
                const totalCompleted = allParagraphNodeIds.filter(nodeId => {
                    // Après avoir coché les nodes, vérifier leur état
                    return safeNodeIds.includes(nodeId) || isNodeCompleted(nodeId);
                }).length;

                const isLessonComplete = totalCompleted === allParagraphNodeIds.length;

                if (isLessonComplete) {
                    // Notification spéciale pour progression complète
                    addNotification('🎉 Leçon terminée !', 'success', {
                        message: `<strong>${subsectionTitleClean}</strong> · Félicitations ! Vous avez terminé cette leçon.`,
                        duration: 4000,
                    });
                } else {
                    // Notification normale pour validation partielle
                    addNotification('Paragraphe validé', 'success', {
                        message: `<strong>${subsectionTitleClean}</strong> · Progression mise à jour`,
                        duration: 2000,
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la progression:', error);
            addNotification('Erreur de progression', 'error', {
                message: 'Impossible de mettre à jour la progression de ce paragraphe.',
                duration: 3000,
            });
        }
    }, [isNodeCompleted, markNode, addNotification, allParagraphNodeIds]);



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
                        const sectionComplete = section.subsections.every((subsection) => {
                            const nodes = subsection.paragraphNodeIds?.length > 0 ? subsection.paragraphNodeIds : [subsection.progressNodeId];
                            const prog = getProgress(nodes);
                            return prog.total > 0 && prog.completed === prog.total;
                        });
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
                                        const subsectionParagraphNodes = subsection.paragraphNodeIds && subsection.paragraphNodeIds.length > 0
                                            ? subsection.paragraphNodeIds
                                            : [subsection.progressNodeId];
                                        const subsectionProgress = getProgress(subsectionParagraphNodes);
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
                                                <div className="lesson-navigator__subsection-wrapper">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleSubsectionClick(section.id, subsection.anchor, subsection.id);
                                                        }}
                                                        className="lesson-navigator__subsection-trigger"
                                                        ref={registerSubsectionRef(subsection.id)}
                                                    >
                                                        <span className="lesson-navigator__subsection-index">{subsectionIndex + 1}</span>
                                                        <MathTitle className="lesson-navigator__subsection-title">
                                                            {subsection.title}
                                                        </MathTitle>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleSubsectionCheckbox(
                                                            e,
                                                            subsection.id,
                                                            subsection.title,
                                                            subsectionParagraphNodes,
                                                            subsection.progressNodeId
                                                        )}
                                                        className={`lesson-navigator__subsection-checkbox${subsectionComplete ? ' is-checked' : ''}`}
                                                        title={subsectionComplete 
                                                            ? `Décocher ce paragraphe`
                                                            : `Marquer ce paragraphe comme lu`
                                                        }
                                                        aria-label={subsectionComplete 
                                                            ? `Décocher le paragraphe "${subsection.title.replace(/<[^>]*>/g, '')}"`
                                                            : `Marquer le paragraphe "${subsection.title.replace(/<[^>]*>/g, '')}" comme lu`
                                                        }
                                                    >
                                                        <span className="material-symbols-outlined !text-base">
                                                            {subsectionComplete ? 'check_box' : 'check_box_outline_blank'}
                                                        </span>
                                                    </button>
                                                </div>
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

// Exporter directement sans React.memo pour garantir les re-renders nécessaires
export const LessonNavigator = LessonNavigatorComponent;
