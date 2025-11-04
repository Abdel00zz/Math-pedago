import { lessonProgressService, type LessonProgressRecord } from '../services/lessonProgressService';

export const LESSON_PROGRESS_EVENT = 'lesson-progress:update';

export interface LessonCompletionSummary {
    completed: number;
    total: number;
    percentage: number;
}

export interface LessonProgressEventDetail {
    lessonId: string;
    progress: LessonProgressRecord;
}

export const summarizeLessonRecord = (record: LessonProgressRecord): LessonCompletionSummary => {
    const entries = Object.values(record);
    const total = entries.length;
    const completed = entries.filter((node) => node.completed).length;
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
