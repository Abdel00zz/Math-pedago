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

    const handleSubsectionCheckbox = useCallback((e: React.MouseEvent, subsectionId: string, subsectionTitle: string, paragraphNodeIds: string[]) => {
        e.stopPropagation(); // Empêcher le clic de déclencher la navigation
        
        if (paragraphNodeIds.length === 0) return;
        
        // Vérifier l'état actuel des paragraphes de cette sous-section
        const completedCount = paragraphNodeIds.filter(nodeId => isNodeCompleted(nodeId)).length;
        const totalParagraphs = paragraphNodeIds.length;
        const allCompleted = completedCount === totalParagraphs;
        
        const subsectionTitleClean = subsectionTitle.replace(/<[^>]*>/g, '');
        
        // Debug temporaire - à supprimer en production
        if (process.env.NODE_ENV === 'development') {
            console.log('Debug handleSubsectionCheckbox:', {
                subsectionTitle: subsectionTitleClean,
                totalParagraphs,
                completedCount,
                allCompleted,
                paragraphNodeIds: paragraphNodeIds.length
            });
        }
        
        // Utiliser setTimeout pour attendre que les changements soient appliqués avant d'afficher la notification
        const showNotificationAfterUpdate = (modifiedCount: number, action: 'coché' | 'décoché') => {
            setTimeout(() => {
                // Recalculer la progression globale après les modifications
                const globalProgress = getProgress(allParagraphNodeIds);
                const progressText = globalProgress.total > 0 
                    ? ` · Progression totale: ${globalProgress.percentage}%`
                    : '';
                
                const actionText = action === 'coché' ? 'validé' : 'décoché';
                
                // Logique correcte : on coche/décoche UNE sous-section (= 1 paragraphe dans l'interface)
                // Mais cette sous-section peut contenir plusieurs éléments HTML <p> (paragraphNodeIds)
                const title = action === 'coché' ? 'Paragraphe validé' : 'Paragraphe décoché';
                const type = action === 'coché' ? 'success' : 'info';
                
                // Message plus précis : on parle du paragraphe (sous-section) validé, pas des éléments HTML internes
                // Exemple de test avec formules mathématiques pour certaines sections
                let mathExample = '';
                if (subsectionTitleClean.toLowerCase().includes('équation') || 
                    subsectionTitleClean.toLowerCase().includes('calcul') ||
                    subsectionTitleClean.toLowerCase().includes('formule')) {
                    mathExample = ` · Ex: $E = mc^2$`;
                } else if (subsectionTitleClean.toLowerCase().includes('géométrie') ||
                          subsectionTitleClean.toLowerCase().includes('triangle')) {
                    mathExample = ` · Ex: $a^2 + b^2 = c^2$`;
                } else if (Math.random() < 0.3) { // 30% de chance pour tester
                    mathExample = ` · Score: $\\frac{${globalProgress.completed}}{${globalProgress.total}}$`;
                }
                
                // Durée plus longue pour les notifications avec formules mathématiques
                const notificationDuration = mathExample ? 4500 : 2500;
                
                addNotification(title, type, {
                    message: `<strong>${subsectionTitleClean}</strong> ${actionText}${progressText}${mathExample}`,
                    duration: notificationDuration,
                });
            }, 100); // Délai plus long pour s'assurer de la synchronisation
        };
        
        if (allCompleted) {
            // Si tous sont complétés, les décocher tous (seulement ceux de cette sous-section)
            paragraphNodeIds.forEach(nodeId => {
                markNode(nodeId, false);
            });
            
            // On décoche 1 paragraphe (= cette sous-section), peu importe le nombre d'éléments HTML qu'elle contient
            showNotificationAfterUpdate(1, 'décoché');
        } else {
            // Cocher seulement les paragraphes de cette sous-section qui ne sont pas encore cochés
            const uncompleted = paragraphNodeIds.filter(nodeId => !isNodeCompleted(nodeId));
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Éléments HTML non complétés à cocher:', uncompleted.length, 'sur', totalParagraphs, 'dans le paragraphe:', subsectionTitleClean);
            }
            
            uncompleted.forEach(nodeId => {
                markNode(nodeId, true);
            });
            
            if (uncompleted.length > 0) {
                // On coche 1 paragraphe (= cette sous-section), peu importe le nombre d'éléments HTML qu'elle contient
                showNotificationAfterUpdate(1, 'coché');
            } else {
                // Tous étaient déjà cochés (cas rare mais possible)
                // Test avec formule mathématique pour les sections déjà validées
                const mathTest = Math.random() < 0.5 ? ` · Status: $\\checkmark$` : '';
                
                addNotification('Déjà validé', 'info', {
                    message: `<strong>${subsectionTitleClean}</strong> · Paragraphe déjà validé${mathTest}`,
                    duration: 2000,
                });
            }
        }
    }, [isNodeCompleted, markNode, addNotification, getProgress, allParagraphNodeIds]);



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
                                                        onClick={(e) => handleSubsectionCheckbox(e, subsection.id, subsection.title, subsection.paragraphNodeIds)}
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
