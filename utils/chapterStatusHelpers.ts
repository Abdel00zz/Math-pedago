/**
 * Utilitaires pour gérer les statuts des chapitres
 * et vérifier si un chapitre est complété à 100%
 */

import { Chapter, ChapterProgress } from '../types';

/**
 * Vérifie si un chapitre est complété à 100%
 * Un chapitre est considéré comme complété si :
 * - Le quiz est soumis (100%)
 * - Tous les exercices ont un feedback (100%)
 * - La leçon est complétée si elle existe (100%)
 * - Toutes les vidéos sont regardées si elles existent (100%)
 */
export function isChapterCompleted(
    chapter: Chapter,
    progress: ChapterProgress
): boolean {
    // 1. Vérifier le quiz (obligatoire)
    if (!progress.quiz.isSubmitted) {
        return false;
    }

    // 2. Vérifier les exercices (obligatoire)
    const totalExercises = chapter.exercises?.length || 0;
    const completedExercises = Object.keys(progress.exercisesFeedback || {}).length;
    if (totalExercises > 0 && completedExercises < totalExercises) {
        return false;
    }

    // 3. Vérifier la leçon si elle existe
    if (chapter.lesson || chapter.lessonFile) {
        const lessonProg = progress.lesson;
        if (!lessonProg) {
            return false;
        }
        // Considérer la leçon comme complétée si :
        // - Soit checklistPercentage est à 100%
        // - Soit tous les paragraphes sont complétés
        const isLessonComplete =
            lessonProg.checklistPercentage >= 100 ||
            (lessonProg.totalParagraphs > 0 && lessonProg.completedParagraphs >= lessonProg.totalParagraphs);

        if (!isLessonComplete) {
            return false;
        }
    }

    // 4. Vérifier les vidéos si elles existent
    if (chapter.videos && chapter.videos.length > 0) {
        const videoProg = progress.videos;
        if (!videoProg || !videoProg.allWatched) {
            return false;
        }
    }

    // Si toutes les vérifications passent, le chapitre est complété
    return true;
}

/**
 * Calcule le pourcentage de progression global d'un chapitre
 * Retourne un nombre entre 0 et 100
 */
export function calculateOverallProgress(
    chapter: Chapter,
    progress: ChapterProgress
): number {
    const components: number[] = [];

    // 1. Progression leçon (si existe)
    if (chapter.lesson || chapter.lessonFile) {
        const lessonProg = progress.lesson;
        if (lessonProg) {
            components.push(lessonProg.checklistPercentage || 0);
        } else {
            components.push(0);
        }
    }

    // 2. Progression vidéos (si existent)
    if (chapter.videos && chapter.videos.length > 0) {
        const videoProg = progress.videos;
        if (videoProg) {
            const watchedCount = Object.values(videoProg.watched).filter(Boolean).length;
            const videoPercentage = (watchedCount / chapter.videos.length) * 100;
            components.push(videoPercentage);
        } else {
            components.push(0);
        }
    }

    // 3. Progression quiz
    if (progress.quiz.isSubmitted) {
        components.push(100);
    } else {
        const totalQuestions = chapter.quiz?.length || 0;
        const answeredCount = Object.keys(progress.quiz.answers || {}).length;
        const quizPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
        components.push(quizPercentage);
    }

    // 4. Progression exercices
    const totalExercises = chapter.exercises?.length || 0;
    const completedExercises = Object.keys(progress.exercisesFeedback || {}).length;
    const exercisePercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 100;
    components.push(exercisePercentage);

    // Calculer la moyenne
    if (components.length === 0) return 0;
    const totalPercent = components.reduce((sum, percent) => sum + percent, 0);
    const averagePercent = Math.round(totalPercent / components.length);
    return Math.max(0, Math.min(averagePercent, 100));
}

/**
 * Détermine le statut initial d'un chapitre basé sur sa progression
 */
export function determineInitialStatus(
    chapter: Chapter,
    progress: ChapterProgress,
    isCurrentActive: boolean
): 'en-cours' | 'a-venir' | 'acheve' {
    // Si le chapitre est déjà marqué comme soumis et complété, c'est achevé
    if (progress.isWorkSubmitted && isChapterCompleted(chapter, progress)) {
        return 'acheve';
    }

    // Si c'est le chapitre actuellement en cours
    if (isCurrentActive) {
        return 'en-cours';
    }

    // Sinon, à venir par défaut
    return 'a-venir';
}

/**
 * Vérifie si un chapitre a une session active (en direct maintenant)
 * Une session est considérée comme active si elle est en cours (entre la date de début et 2h après)
 */
export function hasActiveSession(sessionDates: string[]): boolean {
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
        return false;
    }

    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures
    const now = Date.now();

    return sessionDates.some(dateStr => {
        const sessionDate = new Date(dateStr);
        if (isNaN(sessionDate.getTime())) {
            return false;
        }

        const sessionStart = sessionDate.getTime();
        const sessionEnd = sessionStart + SESSION_DURATION_MS;

        return now >= sessionStart && now <= sessionEnd;
    });
}

/**
 * Vérifie si un chapitre a une session à venir (future)
 * Une session est considérée comme à venir si elle n'a pas encore commencé
 */
export function hasUpcomingSession(sessionDates: string[]): boolean {
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
        return false;
    }

    const now = Date.now();

    return sessionDates.some(dateStr => {
        const sessionDate = new Date(dateStr);
        if (isNaN(sessionDate.getTime())) {
            return false;
        }

        const sessionStart = sessionDate.getTime();
        return now < sessionStart;
    });
}

/**
 * Vérifie si toutes les sessions d'un chapitre sont terminées
 * Une session est considérée comme terminée si elle a dépassé la date de fin (début + 2h)
 */
export function hasAllSessionsEnded(sessionDates: string[]): boolean {
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
        return false;
    }

    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures
    const now = Date.now();

    // Vérifier que toutes les sessions sont terminées
    return sessionDates.every(dateStr => {
        const sessionDate = new Date(dateStr);
        if (isNaN(sessionDate.getTime())) {
            return false;
        }

        const sessionStart = sessionDate.getTime();
        const sessionEnd = sessionStart + SESSION_DURATION_MS;

        // La session est terminée si maintenant > fin de session
        return now > sessionEnd;
    });
}

/**
 * Statut de session pour le tri intelligent
 */
type SessionStatus = 'live' | 'upcoming' | 'ended' | 'none';

/**
 * Détermine le statut de session d'un chapitre pour un tri intelligent
 */
function getSessionStatus(sessionDates: string[]): SessionStatus {
    if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
        return 'none';
    }

    // Priorité 1: Session en cours (LIVE)
    if (hasActiveSession(sessionDates)) {
        return 'live';
    }

    // Priorité 2: Session à venir (prochainement)
    if (hasUpcomingSession(sessionDates)) {
        return 'upcoming';
    }

    // Priorité 3: Toutes les sessions sont terminées
    if (hasAllSessionsEnded(sessionDates)) {
        return 'ended';
    }

    return 'none';
}

/**
 * Compare deux chapitres pour les trier intelligemment selon leurs sessions :
 * 🔴 1. Sessions LIVE (actives en ce moment) → EN HAUT ⬆️
 * 🟡 2. Sessions à venir ou pas de session → AU MILIEU
 * ⚫ 3. Sessions terminées (toutes passées) → EN BAS ⬇️
 * 
 * Ce mécanisme garantit que les chapitres avec séance active restent toujours visibles en premier,
 * tandis que ceux avec "séance terminée" sont placés en bas de la liste.
 */
export function sortChaptersByActiveSession(chapters: Chapter[]): Chapter[] {
    return [...chapters].sort((a, b) => {
        const aStatus = getSessionStatus(a.sessionDates || []);
        const bStatus = getSessionStatus(b.sessionDates || []);

        // Ordre de priorité : live > upcoming/none > ended
        const priorityOrder: Record<SessionStatus, number> = {
            'live': 1,          // 🔴 Priorité MAXIMALE - toujours en haut
            'upcoming': 2,      // 🟡 Priorité normale - au milieu
            'none': 2,          // 🟡 Priorité normale - au milieu (même niveau que upcoming)
            'ended': 3          // ⚫ Priorité MINIMALE - toujours en bas
        };

        const aPriority = priorityOrder[aStatus];
        const bPriority = priorityOrder[bStatus];

        // Trier par priorité (plus petit = plus haut dans la liste)
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Si même priorité, garder l'ordre original (stable sort)
        return 0;
    });
}
