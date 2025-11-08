import { lessonProgressService, type LessonProgressRecord } from '../services/lessonProgressService';

export const LESSON_PROGRESS_EVENT = 'lesson-progress:update';
export const LESSON_PROGRESS_REFRESH_EVENT = 'lesson-progress-changed';

export interface LessonCompletionSummary {
    completed: number;
    total: number;
    percentage: number;
}

export interface LessonProgressEventDetail {
    lessonId: string;
    progress: LessonProgressRecord;
}

const normalizeNodeId = (nodeId: string): string => {
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

export const summarizeLessonRecord = (record: LessonProgressRecord): LessonCompletionSummary => {
    const aggregated = Object.entries(record).reduce<Map<string, boolean>>((acc, [nodeId, state]) => {
        const normalizedId = normalizeNodeId(nodeId);
        const previous = acc.get(normalizedId);
        if (previous === undefined) {
            acc.set(normalizedId, Boolean(state.completed));
        } else {
            acc.set(normalizedId, previous || Boolean(state.completed));
        }
        return acc;
    }, new Map());

    const total = aggregated.size;
    const completed = Array.from(aggregated.values()).filter(Boolean).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        completed,
        total,
        percentage,
    };
};

export const readLessonCompletion = (lessonId: string): LessonCompletionSummary => {
    const record = lessonProgressService.getLessonProgress(lessonId);
    return summarizeLessonRecord(record);
};

// Compatibilité temporaire : certaines vues historisent encore cet export
export const readLessonCompletionFromFile = (lessonId: string): LessonCompletionSummary => {
    return readLessonCompletion(lessonId);
};

export const dispatchLessonProgressUpdate = (
    lessonId: string,
    progress: LessonProgressRecord,
) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<LessonProgressEventDetail>(LESSON_PROGRESS_EVENT, {
            detail: {
                lessonId,
                progress,
            },
        }),
    );
};
