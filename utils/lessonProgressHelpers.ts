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

/**
 * Interface pour les paramètres de calcul de progression de chapitre
 */
export interface ChapterProgressParams {
    lessonProgress?: LessonCompletionSummary;
    quizTotal?: number;
    quizAnswered?: number;
    quizSubmitted?: boolean;
    exercisesTotal?: number;
    exercisesCompleted?: number;
}

/**
 * Calcule la progression globale d'un chapitre avec coefficients égaux
 * pour les leçons, quiz et exercices.
 *
 * @param params - Paramètres de progression pour chaque composant
 * @returns Pourcentage de progression global (0-100)
 */
export const calculateChapterProgress = (params: ChapterProgressParams): number => {
    const {
        lessonProgress,
        quizTotal = 0,
        quizAnswered = 0,
        quizSubmitted = false,
        exercisesTotal = 0,
        exercisesCompleted = 0,
    } = params;

    const components: number[] = [];

    // Leçon : Ajouter le pourcentage si disponible
    if (lessonProgress && lessonProgress.total > 0) {
        const lessonPercent = Math.max(0, Math.min(lessonProgress.percentage, 100));
        components.push(lessonPercent);
    }

    // Quiz : Ajouter le pourcentage si disponible
    if (quizTotal > 0) {
        const quizPercent = quizSubmitted
            ? 100
            : Math.round((Math.min(quizAnswered, quizTotal) / quizTotal) * 100);
        components.push(quizPercent);
    }

    // Exercices : Ajouter le pourcentage si disponible
    if (exercisesTotal > 0) {
        const exercisePercent = Math.round(
            (Math.min(exercisesCompleted, exercisesTotal) / exercisesTotal) * 100
        );
        components.push(exercisePercent);
    }

    // Si aucun composant, retourner 0%
    if (components.length === 0) {
        return 0;
    }

    // Calcul avec coefficients égaux : moyenne simple
    const totalPercent = components.reduce((sum, percent) => sum + percent, 0);
    const averagePercent = Math.round(totalPercent / components.length);

    return Math.max(0, Math.min(averagePercent, 100));
};
