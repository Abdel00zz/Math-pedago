import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
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

// Optimized scroll utility with debouncing
const useOptimizedScroll = (container: HTMLElement | null) => {
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const scrollToElement = useCallback((target: HTMLElement | null, options?: { offset?: number }) => {
        if (!container || !target) return;
        
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            
            const currentScrollTop = container.scrollTop;
            const targetTop = currentScrollTop + (targetRect.top - containerRect.top);
            const offset = options?.offset || 40;
            
            const newScrollTop = Math.max(0, targetTop - offset);
            
            container.scrollTo({
                top: newScrollTop,
                behavior: 'smooth',
            });
        }, 50); // Debounce scroll requests
        
    }, [container]);
    
    return scrollToElement;
};

export const LessonNavigatorOptimized: React.FC = () => {
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
    
    // Optimized scroll management
    const scrollToElement = useOptimizedScroll(scrollContainerRef.current);
    
    // Double click handling with improved state management
    const [doubleClickState, setDoubleClickState] = useState<{
        lastClickTime: number;
        lastClickTarget: string | null;
    }>({ lastClickTime: 0, lastClickTarget: null });
    
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleNavigator = useCallback(() => {
        setIsCollapsed((previous) => !previous);
    }, []);

    // Memoized ref registration functions
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

    const handleSectionClick = useCallback((sectionAnchor: string, sectionId: string) => {
        setActiveSectionId(sectionId);
        scrollToAnchor(sectionAnchor, { offset: 96 });
    }, [setActiveSectionId, scrollToAnchor]);

    const handleSubsectionClick = useCallback((_sectionId: string, subsectionAnchor: string, subsectionId: string) => {
        setActiveSubsectionId(subsectionId);
        scrollToAnchor(subsectionAnchor, { offset: 96 });
    }, [setActiveSubsectionId, scrollToAnchor]);

    const handleSubsectionDoubleClick = useCallback((subsectionId: string, subsectionTitle: string, paragraphNodeIds: string[]) => {
        const now = Date.now();
        const timeDiff = now - doubleClickState.lastClickTime;
        
        if (timeDiff < 500 && doubleClickState.lastClickTarget === subsectionId) {
            // Double-click detected
            const lastParagraphOfSubsection = paragraphNodeIds[paragraphNodeIds.length - 1];
            
            if (lastParagraphOfSubsection) {
                markAllNodesUpTo(lastParagraphOfSubsection);
                
                addNotification('Progression sauvegardée', 'info', {
                    message: `Paragraphes marqués jusqu'à "${subsectionTitle}".`,
                    duration: 2000,
                });
            }
            
            // Reset to avoid multiple clicks
            setDoubleClickState({ lastClickTime: 0, lastClickTarget: null });
        } else {
            // First click or click on different element
            setDoubleClickState({ lastClickTime: now, lastClickTarget: subsectionId });
        }
    }, [doubleClickState, markAllNodesUpTo, addNotification]);

    // Optimized scroll-to-active logic with reduced complexity
    useEffect(() => {
        if (isCollapsed) return;
        
        let targetElement: HTMLButtonElement | null = null;
        
        if (activeSubsectionId) {
            targetElement = subsectionRefs.current.get(activeSubsectionId) || null;
        } else if (activeSectionId) {
            targetElement = sectionRefs.current.get(activeSectionId) || null;
        }
        
        if (targetElement) {
            scrollToElement(targetElement);
        }
    }, [activeSectionId, activeSubsectionId, isCollapsed, scrollToElement]);

    // Memoized progress calculations for performance
    const sectionProgressData = useMemo(() => {
        const data = new Map();
        outline.forEach((section) => {
            const sectionProgress = getProgress(section.paragraphNodeIds);
            data.set(section.id, sectionProgress);
            
            section.subsections.forEach((subsection) => {
                const subsectionProgress = getProgress(subsection.paragraphNodeIds);
                data.set(subsection.id, subsectionProgress);
            });
        });
        return data;
    }, [outline, getProgress]);

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
                        const sectionProgress = sectionProgressData.get(section.id) || { total: 0, completed: 0, percentage: 0 };
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
                                        const subsectionProgress = sectionProgressData.get(subsection.id) || { total: 0, completed: 0, percentage: 0 };
                                        const subsectionComplete = subsectionProgress.total > 0 && subsectionProgress.completed === subsectionProgress.total;
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