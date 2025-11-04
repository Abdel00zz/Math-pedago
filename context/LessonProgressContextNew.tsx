import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
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
import { useAppDispatch } from './AppContext';

type ProgressSummary = {
	total: number;
	completed: number;
	percentage: number;
};

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
	sectionProgress: ProgressSummary;
	sectionSummaries: Record<string, ProgressSummary>;
	subsectionSummaries: Record<string, ProgressSummary>;
	totalSectionsCount: number;
	completedSectionsCount: number;
	totalParagraphsCount: number;
	completedParagraphsCount: number;
	isNodeCompleted: (nodeId: string) => boolean;
	markNode: (nodeId: string, completed: boolean) => void;
	toggleNode: (nodeId: string) => void;
	toggleSection: (sectionId: string, completed?: boolean) => void;
	toggleSubsection: (subsectionId: string, completed?: boolean) => void;
	getProgress: (nodeIds: string[]) => ProgressSummary;
	activeSectionId: string | null;
	activeSubsectionId: string | null;
	setActiveSectionId: (sectionId: string | null) => void;
	setActiveSubsectionId: (subsectionId: string | null) => void;
	scrollToAnchor: (anchorId: string, options?: { offset?: number }) => void;
	scrollContainerRef?: RefObject<HTMLElement>;
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
	subsectionIndex: number,
) => {
	const slug = slugify(subsection.title || `part-${subsectionIndex + 1}`);
	return `section-${sectionIndex + 1}-sub-${subsectionIndex + 1}-${slug || subsectionIndex + 1}`;
};

const createSubsubsectionAnchor = (
	sectionIndex: number,
	subsectionIndex: number,
	subsubsection: LessonSubsubsection,
	subsubIndex: number,
) => {
	const slug = slugify(subsubsection.title || `item-${subsubIndex + 1}`);
	return `section-${sectionIndex + 1}-sub-${subsectionIndex + 1}-item-${subsubIndex + 1}-${slug || subsubIndex + 1}`;
};

const collectParagraphIds = (
	elements: LessonElement[] | undefined,
	basePath: LessonElementPath,
): string[] => {
	if (!elements || elements.length === 0) {
		return [];
	}

	const ids: string[] = [];
	elements.forEach((element, index) => {
		if (element.type === 'p') {
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
				const paragraphNodeIds = collectParagraphIds(subsubsection.elements, subsubPath);

				return {
					id: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
					anchor: createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex),
					title: subsubsection.title,
					path: subsubPath,
					paragraphNodeIds,
				};
			});

			const subsectionParagraphs = [
				...collectParagraphIds(subsection.elements, subsectionPath),
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
	const dispatch = useAppDispatch();
	const outline = useMemo(() => buildOutline(lesson), [lesson]);
	const allParagraphNodeIds = useMemo(() => flattenParagraphIds(outline), [outline]);

	const [progress, setProgress] = useState<LessonProgressRecord>(() =>
		lessonProgressService.getLessonProgress(lessonId),
	);
	const [activeSectionId, setActiveSectionId] = useState<string | null>(outline[0]?.id ?? null);
	const [activeSubsectionId, setActiveSubsectionIdState] = useState<string | null>(
		outline[0]?.subsections?.[0]?.id ?? null,
	);

	useEffect(() => {
		setProgress(lessonProgressService.getLessonProgress(lessonId));
	}, [lessonId]);

	useEffect(() => {
		if (outline.length === 0) {
			setActiveSectionId(null);
			setActiveSubsectionIdState(null);
			return;
		}

		setActiveSectionId((current) => current ?? outline[0]?.id ?? null);
		const firstSubsection = outline[0]?.subsections?.[0];
		setActiveSubsectionIdState((current) => current ?? firstSubsection?.id ?? null);
	}, [outline]);

	const updateProgressState = useCallback(
		(updater: (previous: LessonProgressRecord) => LessonProgressRecord) => {
			setProgress((prev) => {
				const next = updater(prev);
				if (next !== prev) {
					lessonProgressService.saveLessonProgress(lessonId, next);
				}
				return next;
			});
		},
		[lessonId],
	);

	const isNodeCompleted = useCallback(
		(nodeId: string) => Boolean(progress[nodeId]?.completed),
		[progress],
	);

	const markNode = useCallback(
		(nodeId: string, completed: boolean) => {
			updateProgressState((prev) => {
				const alreadyCompleted = Boolean(prev[nodeId]?.completed);
				if (alreadyCompleted === completed) {
					return prev;
				}

				const next: LessonProgressRecord = { ...prev };

				if (completed) {
					next[nodeId] = {
						completed: true,
						timestamp: Date.now(),
					};
				} else {
					delete next[nodeId];
				}

				return next;
			});
		},
		[updateProgressState],
	);

	const toggleNode = useCallback(
		(nodeId: string) => {
			const nextCompleted = !isNodeCompleted(nodeId);
			markNode(nodeId, nextCompleted);
		},
		[isNodeCompleted, markNode],
	);

	const getProgress = useCallback(
		(nodeIds: string[]): ProgressSummary => {
			if (!nodeIds || nodeIds.length === 0) {
				return { total: 0, completed: 0, percentage: 0 };
			}

			const total = nodeIds.length;
			const completedCount = nodeIds.reduce((count, id) => {
				return progress[id]?.completed ? count + 1 : count;
			}, 0);

			return {
				total,
				completed: completedCount,
				percentage: total === 0 ? 0 : Math.round((completedCount / total) * 100),
			};
		},
		[progress],
	);

	const sectionSummaries = useMemo(() => {
		const summaries: Record<string, ProgressSummary> = {};
		outline.forEach((section) => {
			summaries[section.id] = getProgress(section.paragraphNodeIds);
		});
		return summaries;
	}, [outline, getProgress]);

	const subsectionSummaries = useMemo(() => {
		const summaries: Record<string, ProgressSummary> = {};
		outline.forEach((section) => {
			section.subsections.forEach((subsection) => {
				summaries[subsection.id] = getProgress(subsection.paragraphNodeIds);
			});
		});
		return summaries;
	}, [outline, getProgress]);

	const setNodesState = useCallback(
		(nodeIds: string[], completed: boolean) => {
			if (!nodeIds || nodeIds.length === 0) {
				return;
			}

			updateProgressState((prev) => {
				let mutated = false;
				const next: LessonProgressRecord = { ...prev };

				nodeIds.forEach((nodeId) => {
					const alreadyCompleted = Boolean(next[nodeId]?.completed);
					if (completed) {
						if (!alreadyCompleted) {
							next[nodeId] = {
								completed: true,
								timestamp: Date.now(),
							};
							mutated = true;
						}
					} else if (alreadyCompleted) {
						delete next[nodeId];
						mutated = true;
					}
				});

				return mutated ? next : prev;
			});
		},
		[updateProgressState],
	);

	const toggleSection = useCallback(
		(sectionId: string, completed?: boolean) => {
			const section = outline.find((candidate) => candidate.id === sectionId);
			if (!section) {
				return;
			}

			const summary = sectionSummaries[sectionId];
			const shouldComplete = completed ?? summary.completed !== summary.total;
			setNodesState(section.paragraphNodeIds, shouldComplete);
		},
		[outline, sectionSummaries, setNodesState],
	);

	const toggleSubsection = useCallback(
		(subsectionId: string, completed?: boolean) => {
			let targetSubsection: LessonOutlineSubsection | undefined;

			outline.some((section) => {
				const found = section.subsections.find((subsection) => subsection.id === subsectionId);
				if (found) {
					targetSubsection = found;
					return true;
				}
				return false;
			});

			if (!targetSubsection) {
				return;
			}

			const summary = subsectionSummaries[subsectionId];
			const shouldComplete = completed ?? summary.completed !== summary.total;
			setNodesState(targetSubsection.paragraphNodeIds, shouldComplete);
		},
		[outline, subsectionSummaries, setNodesState],
	);

	const lessonProgress = useMemo(() => getProgress(allParagraphNodeIds), [allParagraphNodeIds, getProgress]);

	const sectionProgress = useMemo(() => {
		if (outline.length === 0) {
			return { total: 0, completed: 0, percentage: 0 };
		}

		const totals = outline.reduce(
			(acc, section) => {
				const summary = sectionSummaries[section.id];
				const isComplete = summary.total === 0 || summary.completed === summary.total;
				return {
					total: acc.total + 1,
					completed: acc.completed + (isComplete ? 1 : 0),
				};
			},
			{ total: 0, completed: 0 },
		);

		return {
			total: totals.total,
			completed: totals.completed,
			percentage: totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
		};
	}, [outline, sectionSummaries]);

	const totalParagraphsCount = lessonProgress.total;
	const completedParagraphsCount = lessonProgress.completed;
	const totalSectionsCount = sectionProgress.total;
	const completedSectionsCount = sectionProgress.completed;

	useEffect(() => {
		dispatch({
			type: 'UPDATE_LESSON_PROGRESS',
			payload: {
				chapterId: lessonId,
				completedParagraphs: completedParagraphsCount,
				totalParagraphs: totalParagraphsCount,
				completedSections: completedSectionsCount,
				totalSections: totalSectionsCount,
				checklistPercentage: sectionProgress.percentage,
				isRead: totalSectionsCount > 0 ? completedSectionsCount === totalSectionsCount : undefined,
			},
		});
	}, [
		dispatch,
		lessonId,
		completedParagraphsCount,
		totalParagraphsCount,
		completedSectionsCount,
		totalSectionsCount,
		sectionProgress.percentage,
	]);

	const setActiveSubsectionId = useCallback(
		(subsectionId: string | null) => {
			setActiveSubsectionIdState(subsectionId);

			if (!subsectionId) {
				return;
			}

			const parentSection = outline.find((section) =>
				section.subsections.some((subsection) => subsection.id === subsectionId),
			);

			if (parentSection) {
				setActiveSectionId(parentSection.id);
			}
		},
		[outline],
	);

	const scrollToAnchor = useCallback(
		(anchorId: string, options?: { offset?: number }) => {
			const target = document.getElementById(anchorId);
			if (!target) return;

			target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

			const offset = options?.offset ?? 72;
			const container = scrollContainerRef?.current;

			if (container) {
				container.scrollBy({ top: -offset, behavior: 'smooth' });
			} else if (typeof window !== 'undefined') {
				window.scrollBy({ top: -offset, behavior: 'smooth' });
			}
		},
		[scrollContainerRef],
	);

	const value = useMemo<LessonProgressContextValue>(() => ({
		lessonId,
		outline,
		lessonProgress,
		sectionProgress,
		sectionSummaries,
		subsectionSummaries,
		totalSectionsCount,
		completedSectionsCount,
		totalParagraphsCount,
		completedParagraphsCount,
		isNodeCompleted,
		markNode,
		toggleNode,
		toggleSection,
		toggleSubsection,
		getProgress,
		activeSectionId,
		activeSubsectionId,
		setActiveSectionId,
		setActiveSubsectionId,
		scrollToAnchor,
		scrollContainerRef,
	}), [
		lessonId,
		outline,
		lessonProgress,
		sectionProgress,
		sectionSummaries,
		subsectionSummaries,
		totalSectionsCount,
		completedSectionsCount,
		totalParagraphsCount,
		completedParagraphsCount,
		isNodeCompleted,
		markNode,
		toggleNode,
		toggleSection,
		toggleSubsection,
		getProgress,
		activeSectionId,
		activeSubsectionId,
		setActiveSectionId,
		setActiveSubsectionId,
		scrollToAnchor,
		scrollContainerRef,
	]);

	return <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>;
};

export const useLessonProgress = () => {
	const context = useContext(LessonProgressContext);
	if (!context) {
		throw new Error('useLessonProgress doit être utilisé à l’intérieur de LessonProgressProvider');
	}
	return context;
};

export const getParagraphNodeIdFromPath = (path: LessonElementPath) => encodeLessonPath(path);
export const getSectionAnchor = (section: LessonSection, index: number) => createSectionAnchor(section, index);
export const getSubsectionAnchor = (
	sectionIndex: number,
	subsection: LessonSubsection,
	subsectionIndex: number,
) => createSubsectionAnchor(sectionIndex, subsection, subsectionIndex);
export const getSubsubsectionAnchor = (
	sectionIndex: number,
	subsectionIndex: number,
	subsubsection: LessonSubsubsection,
	subsubIndex: number,
) => createSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, subsubIndex);
