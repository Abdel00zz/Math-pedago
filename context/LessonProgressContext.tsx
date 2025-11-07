import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    useRef,
    type ReactNode,
    type RefObject,
} from 'react';
import type {
    LessonContent,
    LessonSection,
    LessonSubsection,
    LessonSubsubsection,
    LessonElement,
    LessonElementPath,
} from '../types';
import {
    lessonProgressService,
    encodeLessonPath,
    type LessonProgressRecord,
} from '../services/lessonProgressService';
import { dispatchLessonProgressUpdate } from '../utils/lessonProgressHelpers';
import { useSectionObserver, useSubsectionObserver } from '../hooks/useSectionObserver';

interface ProgressSummary {
    total: number;
    completed: number;
    percentage: number;
}

export interface LessonOutlineSubsubsection {
    id: string;
    anchor: string;
    title: string;
    path: LessonElementPath;
    paragraphNodeIds: string[];
}

export interface LessonOutlineSubsection {
    id: string;
    anchor: string;
    title: string;
    path: LessonElementPath;
    paragraphNodeIds: string[];
    subsubsections: LessonOutlineSubsubsection[];
}

export interface LessonOutlineSection {
    id: string;
    anchor: string;
    index: number;
    title: string;
    path: LessonElementPath;
    paragraphNodeIds: string[];
    subsections: LessonOutlineSubsection[];
}

interface LessonProgressContextValue {
    lessonId: string;
    outline: LessonOutlineSection[];
    lessonProgress: ProgressSummary;
    allParagraphNodeIds: string[];
    isNodeCompleted: (nodeId: string) => boolean;
    markNode: (nodeId: string, completed: boolean) => void;
    toggleNode: (nodeId: string) => void;
    markAllNodesUpTo: (nodeId: string) => void;
    getProgress: (nodeIds: string[]) => ProgressSummary;
    activeSectionId: string | null;
    activeSubsectionId: string | null;
    setActiveSectionId: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveSubsectionId: (subsectionId: string | null) => void;
    scrollToAnchor: (anchorId: string, options?: { offset?: number }) => void;
}

const LessonProgressContext = createContext<LessonProgressContextValue | undefined>(undefined);

const slugify = (value: string) => {
    return value
        .normalize('NFD')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/[\u0300-\u036F]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
};

const createSectionAnchor = (section: LessonSection, index: number) => {
    const slug = slugify(section.title || `section-${index + 1}`);
    return `section-${index + 1}-${slug || index + 1}`;
};

const createSubsectionAnchor = (
    sectionIndex: number,
    subsection: LessonSubsection,
    subsectionIndex: number
) => {
    const slug = slugify(subsection.title || `part-${subsectionIndex + 1}`);
    return `section-${sectionIndex + 1}-sub-${subsectionIndex + 1}-${slug || subsectionIndex + 1}`;
};

const createSubsubsectionAnchor = (
    sectionIndex: number,
    subsectionIndex: number,
    subsubsection: LessonSubsubsection,
    subsubIndex: number
) => {
    const slug = slugify(subsubsection.title || `item-${subsubIndex + 1}`);
    return `section-${sectionIndex + 1}-sub-${subsectionIndex + 1}-item-${subsubIndex + 1}-${slug || subsubIndex + 1}`;
};

const collectParagraphIdsFromElements = (elements: LessonElement[] | undefined, basePath: LessonElementPath): string[] => {
    if (!elements || elements.length === 0) {
        return [];
    }

    const ids: string[] = [];

    // Types d'éléments à tracker pour la progression
    const trackableTypes = [
        'p',
        'definition-box',
        'theorem-box',
        'proposition-box',
        'property-box',
        'remark-box',
        'example-box',
        'practice-box',
        'explain-box'
    ];

    elements.forEach((element, index) => {
        if (trackableTypes.includes(element.type)) {
            ids.push(encodeLessonPath([...basePath, 'elements', index]));
        }
    });

    return ids;
};

const buildOutline = (lesson: LessonContent): LessonOutlineSection[] => {
    return lesson.sections.map((section, sectionIndex) => {
        const sectionPath: LessonElementPath = ['sections', sectionIndex];
        const subsections = section.subsections.map((subsection, subsectionIndex) => {
            const subsectionPath: LessonElementPath = [...sectionPath, 'subsections', subsectionIndex];

            const subsubsections = (subsection.subsubsections ?? []).map((subsubsection, subsubIndex) => {
                const subsubPath: LessonElementPath = [...subsectionPath, 'subsubsections', subsubIndex];
                const paragraphNodeIds = collectParagraphIdsFromElements(subsubsection.elements, subsubPath);

                return {
                    id: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
                    anchor: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
                    title: subsubsection.title,
                    path: subsubPath,
                    paragraphNodeIds,
                };
            });

            const subsectionParagraphs = [
                ...collectParagraphIdsFromElements(subsection.elements, subsectionPath),
                ...subsubsections.flatMap((s) => s.paragraphNodeIds),
            ];

            return {
                id: createSubsectionAnchor(sectionIndex, subsection, subsectionIndex),
                anchor: createSubsectionAnchor(sectionIndex, subsection, subsectionIndex),
                title: subsection.title,
                path: subsectionPath,
                paragraphNodeIds: subsectionParagraphs,
                subsubsections,
            };
        });

        const sectionParagraphs = subsections.flatMap((subsection) => subsection.paragraphNodeIds);

        return {
            id: createSectionAnchor(section, sectionIndex),
            anchor: createSectionAnchor(section, sectionIndex),
            index: sectionIndex,
            title: section.title,
            path: sectionPath,
            paragraphNodeIds: sectionParagraphs,
            subsections,
        };
    });
};

const flattenParagraphIds = (outline: LessonOutlineSection[]): string[] => {
    return outline.flatMap((section) => section.paragraphNodeIds);
};

export const LessonProgressProvider: React.FC<{
    lessonId: string;
    lesson: LessonContent;
    scrollContainerRef?: RefObject<HTMLElement>;
    children: ReactNode;
}> = ({ lessonId, lesson, scrollContainerRef, children }) => {
    const outline = useMemo(() => buildOutline(lesson), [lesson]);
    const allParagraphNodeIds = useMemo(() => flattenParagraphIds(outline), [outline]);

    const lastInitialisedLessonRef = useRef<string | null>(null);
    const metaInitialisedRef = useRef(false);
    const pendingAnchorRef = useRef<string | null>(null);
    const [progress, setProgress] = useState<LessonProgressRecord>(() => lessonProgressService.getLessonProgress(lessonId));
    const [activeSectionId, setActiveSectionIdState] = useState<string | null>(null);
    const [activeSubsectionId, setActiveSubsectionIdState] = useState<string | null>(null);

    const findParentSectionId = useCallback(
        (subsectionId: string | null) => {
            if (!subsectionId) {
                return null;
            }

            const parentSection = outline.find((section) =>
                section.subsections.some((subsection) => subsection.id === subsectionId)
            );

            return parentSection?.id ?? null;
        },
        [outline]
    );

    const ensureValidActiveIds = useCallback(
        (sectionId: string | null, subsectionId: string | null) => {
            if (outline.length === 0) {
                return { sectionId: null, subsectionId: null };
            }

            let nextSectionId = sectionId && outline.some((section) => section.id === sectionId)
                ? sectionId
                : outline[0].id;

            const parentFromSubsection = findParentSectionId(subsectionId);
            if (parentFromSubsection) {
                nextSectionId = parentFromSubsection;
            }

            const section = outline.find((item) => item.id === nextSectionId);

            let nextSubsectionId: string | null = null;
            if (subsectionId && section?.subsections.some((sub) => sub.id === subsectionId)) {
                nextSubsectionId = subsectionId;
            } else {
                nextSubsectionId = section?.subsections?.[0]?.id ?? null;
            }

            return {
                sectionId: nextSectionId ?? null,
                subsectionId: nextSubsectionId,
            };
        },
        [outline, findParentSectionId]
    );

    useEffect(() => {
        if (lastInitialisedLessonRef.current !== lessonId) {
            lastInitialisedLessonRef.current = lessonId;
            metaInitialisedRef.current = false;
        }
    }, [lessonId]);

    useEffect(() => {
        if (!outline.length) {
            setActiveSectionIdState(null);
            setActiveSubsectionIdState(null);
            pendingAnchorRef.current = null;
            return;
        }

        if (!metaInitialisedRef.current) {
            const meta = lessonProgressService.getLastVisited(lessonId);
            const initialIds = ensureValidActiveIds(meta?.lastSectionId ?? null, meta?.lastSubsectionId ?? null);
            setActiveSectionIdState(initialIds.sectionId);
            setActiveSubsectionIdState(initialIds.subsectionId);
            pendingAnchorRef.current = initialIds.subsectionId ?? initialIds.sectionId ?? null;
            metaInitialisedRef.current = true;
            return;
        }

        const validatedIds = ensureValidActiveIds(activeSectionId, activeSubsectionId);
        if (validatedIds.sectionId !== activeSectionId) {
            setActiveSectionIdState(validatedIds.sectionId);
        }
        if (validatedIds.subsectionId !== activeSubsectionId) {
            setActiveSubsectionIdState(validatedIds.subsectionId);
        }
    }, [outline, lessonId, ensureValidActiveIds, activeSectionId, activeSubsectionId]);

    // Synchroniser l'état lorsque le lessonId change
    useEffect(() => {
        const initialized = lessonProgressService.ensureLessonNodes(lessonId, allParagraphNodeIds);
        setProgress(initialized);
    }, [lessonId, allParagraphNodeIds]);

    useEffect(() => {
        if (!metaInitialisedRef.current) {
            return;
        }

        lessonProgressService.setLastVisited(lessonId, {
            lastSectionId: activeSectionId ?? undefined,
            lastSubsectionId: activeSubsectionId ?? undefined,
        });
    }, [lessonId, activeSectionId, activeSubsectionId]);

    const setActiveSectionId = useCallback<React.Dispatch<React.SetStateAction<string | null>>>(
        (value) => {
            setActiveSectionIdState((current) => {
                const nextValue = typeof value === 'function'
                    ? (value as (prev: string | null) => string | null)(current)
                    : value;

                return current === nextValue ? current : nextValue;
            });
        },
        []
    );

    const setActiveSubsectionId = useCallback(
        (subsectionId: string | null) => {
            setActiveSubsectionIdState((current) => {
                if (current === subsectionId) {
                    return current;
                }
                return subsectionId;
            });

            if (!subsectionId) {
                return;
            }

            const parentSectionId = findParentSectionId(subsectionId);
            if (parentSectionId) {
                setActiveSectionId(parentSectionId);
            }
        },
        [findParentSectionId, setActiveSectionId]
    );

    const isNodeCompleted = useCallback(
        (nodeId: string) => Boolean(progress[nodeId]?.completed),
        [progress]
    );

    const updateProgress = useCallback(
        (mutate: (draft: LessonProgressRecord, timestamp: number) => boolean) => {
            setProgress((prev) => {
                const next: LessonProgressRecord = { ...prev };
                const timestamp = Date.now();
                const changed = mutate(next, timestamp);

                if (!changed) {
                    return prev;
                }

                lessonProgressService.saveLessonProgress(lessonId, next);
                dispatchLessonProgressUpdate(lessonId, next);
                return next;
            });
        },
        [lessonId]
    );

    const markNode = useCallback(
        (nodeId: string, completed: boolean) => {
            updateProgress((draft, timestamp) => {
                const previous = draft[nodeId];
                if (previous?.completed === completed) {
                    return false;
                }

                draft[nodeId] = {
                    completed,
                    timestamp,
                };
                return true;
            });
        },
        [updateProgress]
    );

    const toggleNode = useCallback(
        (nodeId: string) => {
            updateProgress((draft, timestamp) => {
                const previousCompleted = draft[nodeId]?.completed ?? false;
                draft[nodeId] = {
                    completed: !previousCompleted,
                    timestamp,
                };
                return true;
            });
        },
        [updateProgress]
    );

    const markAllNodesUpTo = useCallback(
        (targetNodeId: string) => {
            const targetIndex = allParagraphNodeIds.indexOf(targetNodeId);
            if (targetIndex === -1) {
                return;
            }

            updateProgress((draft, timestamp) => {
                let mutated = false;

                for (let i = 0; i <= targetIndex; i++) {
                    const nodeId = allParagraphNodeIds[i];
                    if (!draft[nodeId]?.completed) {
                        draft[nodeId] = {
                            completed: true,
                            timestamp,
                        };
                        mutated = true;
                    }
                }

                return mutated;
            });
        },
        [allParagraphNodeIds, updateProgress]
    );

    const getProgress = useCallback(
        (nodeIds: string[]): ProgressSummary => {
            if (!nodeIds || nodeIds.length === 0) {
                return { total: 0, completed: 0, percentage: 0 };
            }

            const completedCount = nodeIds.reduce((acc, id) => (isNodeCompleted(id) ? acc + 1 : acc), 0);
            const total = nodeIds.length;
            const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

            return { total, completed: completedCount, percentage };
        },
        [isNodeCompleted]
    );

    const lessonProgress = useMemo(() => getProgress(allParagraphNodeIds), [allParagraphNodeIds, getProgress]);

    // Utiliser l'observateur pour suivre automatiquement les sections actives
    const handleObserverSectionChange = useCallback((sectionId: string | null) => {
        setActiveSectionId(sectionId);
    }, [setActiveSectionId]);

    const handleObserverSubsectionChange = useCallback((subsectionId: string | null) => {
        setActiveSubsectionId(subsectionId);
    }, [setActiveSubsectionId]);

    useSectionObserver(scrollContainerRef ?? { current: null }, {
        onActiveChange: handleObserverSectionChange,
    });

    useSubsectionObserver(scrollContainerRef ?? { current: null }, {
        onActiveChange: handleObserverSubsectionChange,
    });

    const scrollToAnchor = useCallback(
        (anchorId: string, options?: { offset?: number }) => {
            const target = document.getElementById(anchorId);
            if (!target) return;

            const behavior: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start', inline: 'nearest' };
            target.scrollIntoView(behavior);

            const offset = options?.offset ?? 72;
            const container = scrollContainerRef?.current;

            if (container) {
                container.scrollBy({ top: -offset, behavior: 'smooth' });
            } else if (typeof window !== 'undefined') {
                window.scrollBy({ top: -offset, behavior: 'smooth' });
            }
        },
        [scrollContainerRef]
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!metaInitialisedRef.current) {
            return;
        }

        if (!pendingAnchorRef.current) {
            return;
        }

        let attempts = 0;
        let timeoutId: number | null = null;
        let frameId: number | null = null;

        const attemptScroll = () => {
            const anchorId = pendingAnchorRef.current;
            if (!anchorId) {
                return;
            }

            const target = document.getElementById(anchorId);
            if (target) {
                frameId = window.requestAnimationFrame(() => {
                    pendingAnchorRef.current = null;
                    scrollToAnchor(anchorId, { offset: 96 });
                });
                return;
            }

            attempts += 1;
            if (attempts < 5) {
                timeoutId = window.setTimeout(attemptScroll, 200);
            }
        };

        attemptScroll();

        return () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        };
    }, [outline, lessonId, scrollToAnchor]);

    const value = useMemo<LessonProgressContextValue>(() => ({
        lessonId,
        outline,
        lessonProgress,
        allParagraphNodeIds,
        isNodeCompleted,
        markNode,
        toggleNode,
        markAllNodesUpTo,
        getProgress,
        activeSectionId,
        activeSubsectionId,
        setActiveSectionId,
        setActiveSubsectionId,
        scrollToAnchor,
    }), [
        lessonId,
        outline,
        lessonProgress,
    allParagraphNodeIds,
        isNodeCompleted,
        markNode,
        toggleNode,
        markAllNodesUpTo,
        getProgress,
        activeSectionId,
        activeSubsectionId,
        setActiveSectionId,
        setActiveSubsectionId,
        scrollToAnchor,
    ]);

    return (
        <LessonProgressContext.Provider value={value}>
            {children}
        </LessonProgressContext.Provider>
    );
};

export const useLessonProgress = () => {
    const context = useContext(LessonProgressContext);
    if (!context) {
        throw new Error("useLessonProgress must be used inside LessonProgressProvider");
    }
    return context;
};

export const useLessonProgressSafe = () => {
    const context = useContext(LessonProgressContext);
    return context;
};

export const getParagraphNodeIdFromPath = (path: LessonElementPath) => encodeLessonPath(path);

export const getSectionAnchor = (section: LessonSection, index: number) => createSectionAnchor(section, index);
export const getSubsectionAnchor = (sectionIndex: number, subsection: LessonSubsection, subsectionIndex: number) =>
    createSubsectionAnchor(sectionIndex, subsection, subsectionIndex);
export const getSubsubsectionAnchor = (
    sectionIndex: number,
    subsectionIndex: number,
    subsubsection: LessonSubsubsection,
    subsubIndex: number,
) => createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex);
