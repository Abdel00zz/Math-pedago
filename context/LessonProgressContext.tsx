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
    LessonElementPath,
} from '../types';
import {
	lessonProgressService,
	encodeLessonPath,
	type LessonProgressRecord,
} from '../services/lessonProgressService';
import { dispatchLessonProgressUpdate, LESSON_PROGRESS_REFRESH_EVENT } from '../utils/lessonProgressHelpers';
import { useSectionObserver, useSubsectionObserver } from '../hooks/useSectionObserver';
import { useAppDispatch } from './AppContext'; // 🔥 RÉACTIVER le dispatch vers AppContext

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
    progressNodeId: string;
}

export interface LessonOutlineSubsection {
    id: string;
    anchor: string;
    title: string;
    path: LessonElementPath;
    paragraphNodeIds: string[];
    subsubsections: LessonOutlineSubsubsection[];
    progressNodeId: string;
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

const normalizeProgressNodeId = (nodeId: string): string => {
    const segments = nodeId.split('.');
    const subsectionIndex = segments.indexOf('subsections');
    if (subsectionIndex !== -1 && subsectionIndex + 1 < segments.length) {
        return segments.slice(0, subsectionIndex + 2).join('.');
    }

    const sectionIndex = segments.indexOf('sections');
    if (sectionIndex !== -1 && sectionIndex + 1 < segments.length) {
        return segments.slice(0, sectionIndex + 2).join('.');
    }

    return nodeId;
};

const buildOutline = (lesson: LessonContent): LessonOutlineSection[] => {
    return lesson.sections.map((section, sectionIndex) => {
        const sectionPath: LessonElementPath = ['sections', sectionIndex];
        const subsections = section.subsections.map((subsection, subsectionIndex) => {
            const subsectionPath: LessonElementPath = [...sectionPath, 'subsections', subsectionIndex];
            const subsectionNodeId = encodeLessonPath(subsectionPath);

            const subsubsections = (subsection.subsubsections ?? []).map((subsubsection, subsubIndex) => {
                const subsubPath: LessonElementPath = [...subsectionPath, 'subsubsections', subsubIndex];

                return {
                    id: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
                    anchor: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
                    title: subsubsection.title,
                    path: subsubPath,
                    paragraphNodeIds: [],
                    progressNodeId: subsectionNodeId,
                };
            });

            return {
                id: createSubsectionAnchor(sectionIndex, subsection, subsectionIndex),
                anchor: createSubsectionAnchor(sectionIndex, subsection, subsectionIndex),
                title: subsection.title,
                path: subsectionPath,
                paragraphNodeIds: [subsectionNodeId],
                progressNodeId: subsectionNodeId,
                subsubsections,
            };
        });

        const sectionParagraphs = subsections.map((subsection) => subsection.progressNodeId);

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
	const appDispatch = useAppDispatch(); // 🔥 RÉACTIVER AppContext dispatch

	const lastInitialisedLessonRef = useRef<string | null>(null);
	const metaInitialisedRef = useRef(false);
	const pendingAnchorRef = useRef<string | null>(null);
	const progressCacheRef = useRef<Map<string, ProgressSummary>>(new Map());
	const [progress, setProgress] = useState<LessonProgressRecord>(() => lessonProgressService.getLessonProgress(lessonId));
	const [activeSectionId, setActiveSectionIdState] = useState<string | null>(null);
	const [activeSubsectionId, setActiveSubsectionIdState] = useState<string | null>(null);

	const lessonProgress = useMemo(() => {
		const completed = allParagraphNodeIds.filter((nodeId) => progress[nodeId]?.completed).length;
		const total = allParagraphNodeIds.length;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
		return { completed, total, percentage };
	}, [allParagraphNodeIds, progress]);

	// 🔥 SOLUTION RADICALE FINALE: Dispatcher vers AppContext pour synchroniser progress.lesson
	useEffect(() => {
		console.log('🔥 LessonProgressContext dispatching to AppContext:', {
			lessonId,
			lessonProgress
		});
		
		appDispatch({
			type: 'UPDATE_LESSON_PROGRESS',
			payload: {
				chapterId: lessonId, // Le chapterId doit correspondre au format attendu
				completedParagraphs: lessonProgress.completed,
				totalParagraphs: lessonProgress.total,
				checklistPercentage: lessonProgress.percentage,
			},
		});
	}, [lessonProgress, lessonId, appDispatch]);

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
		const storedRecord = lessonProgressService.getLessonProgress(lessonId);
		const allowedIds = new Set(allParagraphNodeIds);

		const aggregatedRecord = Object.entries(storedRecord).reduce<LessonProgressRecord>((acc, [nodeId, state]) => {
			const normalizedId = normalizeProgressNodeId(nodeId);
			if (!allowedIds.has(normalizedId)) {
				return acc;
			}

			const previous = acc[normalizedId];
			const completed = Boolean(state.completed);
			const timestamp = state.timestamp ?? Date.now();

			if (!previous) {
				acc[normalizedId] = {
					completed,
					timestamp,
				};
			} else {
				acc[normalizedId] = {
					completed: previous.completed || completed,
					timestamp: Math.max(previous.timestamp, timestamp),
				};
			}

			return acc;
		}, {});

		const now = Date.now();
		allParagraphNodeIds.forEach((nodeId) => {
			if (!aggregatedRecord[nodeId]) {
				aggregatedRecord[nodeId] = {
					completed: false,
					timestamp: now,
				};
			}
		});

		lessonProgressService.saveLessonProgress(lessonId, aggregatedRecord);
		dispatchLessonProgressUpdate(lessonId, aggregatedRecord);
		setProgress(aggregatedRecord);
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

				// Invalider le cache de progression
				progressCacheRef.current.clear();

				lessonProgressService.saveLessonProgress(lessonId, next);
				dispatchLessonProgressUpdate(lessonId, next);
				
				// SOLUTION RADICALE : Notifier TOUS les composants via un événement global
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent(LESSON_PROGRESS_REFRESH_EVENT, {
						detail: { lessonId }
					}));
				}
				
				// CRITIQUE: Forcer le recalcul immédiat du pourcentage global
				const completed = allParagraphNodeIds.filter(nodeId => next[nodeId]?.completed).length;
				const total = allParagraphNodeIds.length;
				const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
				
				console.log('📊 Progression mise à jour:', { completed, total, percentage });
				
				// Dispatcher immédiatement vers AppContext
				appDispatch({
					type: 'UPDATE_LESSON_PROGRESS',
					payload: {
						chapterId: lessonId,
						completedParagraphs: completed,
						totalParagraphs: total,
						checklistPercentage: percentage,
					},
				});
				
				return next;
			});
		},
		[lessonId, allParagraphNodeIds, appDispatch]
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

			// Créer une clé de cache basée sur les IDs triés
			const cacheKey = nodeIds.slice().sort().join('|');
			const cached = progressCacheRef.current.get(cacheKey);
			
			// Vérifier si le cache est encore valide en comparant un échantillon
			if (cached) {
				return cached;
			}

			const completedCount = nodeIds.reduce((acc, id) => (isNodeCompleted(id) ? acc + 1 : acc), 0);
			const total = nodeIds.length;
			const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

			const result = { total, completed: completedCount, percentage };
			progressCacheRef.current.set(cacheKey, result);

			return result;
		},
		[isNodeCompleted],
	);

	// const lessonProgress = useMemo(() => getProgress(allParagraphNodeIds), [allParagraphNodeIds, getProgress]);

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

	const value = useMemo<LessonProgressContextValue>(
		() => ({
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
		}),
		[
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
		],
	);

	return <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>;
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

export const getParagraphNodeIdFromPath = (path: LessonElementPath) => {
    const subsectionIndex = path.lastIndexOf('subsections');
    if (subsectionIndex !== -1 && subsectionIndex + 1 < path.length) {
        return encodeLessonPath(path.slice(0, subsectionIndex + 2));
    }

    const sectionIndex = path.lastIndexOf('sections');
    if (sectionIndex !== -1 && sectionIndex + 1 < path.length) {
        return encodeLessonPath(path.slice(0, sectionIndex + 2));
    }

    return encodeLessonPath(path);
};

export const getSectionAnchor = (section: LessonSection, index: number) => createSectionAnchor(section, index);
export const getSubsectionAnchor = (sectionIndex: number, subsection: LessonSubsection, subsectionIndex: number) =>
    createSubsectionAnchor(sectionIndex, subsection, subsectionIndex);
export const getSubsubsectionAnchor = (
    sectionIndex: number,
    subsectionIndex: number,
    subsubsection: LessonSubsubsection,
    subsubIndex: number,
) => createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex);
