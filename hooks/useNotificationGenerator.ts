import { useMemo } from 'react';
import { AppState, UINotification } from '../types';

const SESSION_REMINDER_HOURS = 3;
const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';

// ✅ Cache pour éviter lectures localStorage répétées
let cachedNotifications: UINotification[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

const getStoredNotifications = (): UINotification[] => {
    const now = Date.now();
    
    if (cachedNotifications && (now - lastCacheTime) < CACHE_TTL) {
        return cachedNotifications;
    }

    try {
        const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
        if (stored) {
            const notificationsFromStorage = JSON.parse(stored);
            const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
            
            cachedNotifications = notificationsFromStorage.filter(
                (n: any) => n.timestamp >= oneWeekAgo
            );
            lastCacheTime = now;
            
            return cachedNotifications;
        }
    } catch (e) {
        console.error("Could not parse UI notifications from localStorage", e);
    }
    
    cachedNotifications = [];
    lastCacheTime = now;
    return [];
};

// ✅ AMÉLIORATION 1: Fonction pour vérifier si un chapitre a été commencé
const hasUserStartedChapter = (chapterId: string, progress: AppState['progress']): boolean => {
    const chapterProgress = progress[chapterId];
    if (!chapterProgress) return false;
    
    const hasAnsweredQuiz = Object.keys(chapterProgress.quiz.answers).length > 0;
    const hasEvaluatedExercises = Object.keys(chapterProgress.exercisesFeedback).length > 0;
    const hasSubmittedWork = chapterProgress.isWorkSubmitted;
    
    return hasAnsweredQuiz || hasEvaluatedExercises || hasSubmittedWork;
};

// ✅ AMÉLIORATION 2: Fonction pour vérifier si une notification existe déjà
const notificationExists = (notificationId: string, storedNotifications: UINotification[]): boolean => {
    return storedNotifications.some(n => n.id === notificationId);
};

export const useNotificationGenerator = (state: AppState): UINotification[] => {
    const { profile, activities, progress, chapterOrder } = state;

    return useMemo(() => {
        if (!profile) return [];

        const dynamicNotifications: UINotification[] = [];
        const nowTs = Date.now();
        
        // Récupérer les notifications déjà stockées
        const storedNotifications = getStoredNotifications();
        
        const allUserActivities = chapterOrder
            .map(id => activities[id])
            .filter(Boolean);

        // ════════════════════════════════════════════════════════════
        // SECTION 1: NOTIFICATIONS URGENTES (Priorité haute)
        // ════════════════════════════════════════════════════════════
        
        // 1a. ⚡ URGENT: Session en direct imminente (< 3h)
        allUserActivities.forEach(chapter => {
            if (chapter.isActive && Array.isArray(chapter.sessionDates) && chapter.sessionDates.length > 0) {
                const upcomingSession = chapter.sessionDates
                    .map(d => new Date(d))
                    .find(date => {
                        const timeDiffMs = date.getTime() - nowTs;
                        return timeDiffMs > 0 && timeDiffMs < SESSION_REMINDER_HOURS * 60 * 60 * 1000;
                    });
                
                if (upcomingSession) {
                    const notifId = `session-reminder-${chapter.id}-${upcomingSession.toISOString()}`;
                    
                    // ✅ Ne pas régénérer si existe déjà
                    if (!notificationExists(notifId, storedNotifications)) {
                        dynamicNotifications.push({
                            id: notifId,
                            title: 'Séance en direct imminente',
                            message: `Préparez-vous ! Votre séance pour "<b>${chapter.chapter}</b>" commence dans moins de ${SESSION_REMINDER_HOURS} heures.`,
                            timestamp: nowTs + 1000000, // Très haute priorité
                        });
                    }
                }
            }
        });

        // ════════════════════════════════════════════════════════════
        // SECTION 2: FEEDBACK & ENCOURAGEMENTS (Priorité moyenne-haute)
        // ════════════════════════════════════════════════════════════
        
        // 2a. 📊 Feedback sur quiz soumis (mais chapitre pas finalisé)
        const submittedButNotFinished = allUserActivities
            .map(chapter => ({ chapter, progress: progress[chapter.id] }))
            .filter(({ chapter, progress }) => {
                // ✅ CORRECTION: Vérifier que le quiz est soumis ET que le chapitre n'est pas finalisé
                return progress?.quiz.isSubmitted && !progress.isWorkSubmitted && chapter.isActive;
            });

        submittedButNotFinished.forEach(({ chapter, progress }) => {
            const score = progress.quiz.score;
            const total = chapter.quiz.length;
            if (total === 0) return;
            
            const percentage = (score / total) * 100;
            
            if (percentage < 50) {
                const notifId = `quiz-encourage-${chapter.id}`;
                if (!notificationExists(notifId, storedNotifications)) {
                    dynamicNotifications.push({
                        id: notifId,
                        title: `Quiz à améliorer`,
                        message: `Votre score de <b>${score}/${total}</b> pour "<b>${chapter.chapter}</b>" peut être amélioré. Consultez les explications pour progresser.`,
                        timestamp: nowTs + 800000,
                    });
                }
            } else if (percentage >= 80) {
                const notifId = `quiz-great-${chapter.id}`;
                if (!notificationExists(notifId, storedNotifications)) {
                    dynamicNotifications.push({
                        id: notifId,
                        title: `Excellent travail sur le quiz !`,
                        message: `Score de <b>${score}/${total}</b> pour "<b>${chapter.chapter}</b>". Continuez comme ça !`,
                        timestamp: nowTs + 750000,
                    });
                }
            }
        });
        
        // 2b. 🎯 Encouragement: Tous les quiz actifs terminés
        const activeChapters = allUserActivities.filter(ch => ch.isActive);
        const activeChaptersNotFinished = activeChapters.filter(ch => !progress[ch.id]?.isWorkSubmitted);
        
        if (activeChaptersNotFinished.length > 0) {
            const allActiveQuizzesDone = activeChaptersNotFinished.every(ch => 
                progress[ch.id]?.quiz.isSubmitted
            );
            
            if (allActiveQuizzesDone) {
                const notifId = 'all-active-quizzes-done';
                if (!notificationExists(notifId, storedNotifications)) {
                    dynamicNotifications.push({
                        id: notifId,
                        title: 'Tous les quiz terminés !',
                        message: 'Bravo ! Place aux exercices pour finaliser votre travail.',
                        timestamp: nowTs + 700000,
                    });
                }
            }
        }
        
        // 2c. 🏆 Progression globale (premiers chapitres complétés)
        const completedChaptersCount = allUserActivities.filter(
            chapter => progress[chapter.id]?.isWorkSubmitted
        ).length;
        
        if (completedChaptersCount > 0 && completedChaptersCount <= 3) {
            const notifId = `progress-milestone-${completedChaptersCount}`;
            if (!notificationExists(notifId, storedNotifications)) {
                dynamicNotifications.push({
                    id: notifId,
                    title: 'Progression remarquable !',
                    message: `<b>${completedChaptersCount} chapitre${completedChaptersCount > 1 ? 's' : ''} terminé${completedChaptersCount > 1 ? 's' : ''}</b>. Votre travail porte ses fruits !`,
                    timestamp: nowTs + 650000,
                });
            }
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 3: CHAPITRES À FAIRE (Priorité moyenne)
        // ════════════════════════════════════════════════════════════
        
        // 3a. 📚 Chapitres actifs non commencés
        const activeNotStarted = activeChapters.filter(chapter => {
            const hasStarted = hasUserStartedChapter(chapter.id, progress);
            const isFinished = progress[chapter.id]?.isWorkSubmitted;
            return !hasStarted && !isFinished;
        });
        
        if (activeNotStarted.length > 0) {
            activeNotStarted.forEach(chapter => {
                const notifId = `chapter-pending-${chapter.id}`;
                if (!notificationExists(notifId, storedNotifications)) {
                    dynamicNotifications.push({
                        id: notifId,
                        title: 'Chapitre en attente',
                        message: `Le chapitre "<b>${chapter.chapter}</b>" est disponible et attend votre attention.`,
                        timestamp: nowTs + 600000,
                    });
                }
            });
        }
        
        // 3b. ⚠️ Chapitres en cours mais incomplets
        const inProgressIncomplete = activeChapters.filter(chapter => {
            const chapterProgress = progress[chapter.id];
            if (!chapterProgress || chapterProgress.isWorkSubmitted) return false;
            
            const hasStarted = hasUserStartedChapter(chapter.id, progress);
            const quizDone = chapterProgress.quiz.isSubmitted;
            const allExercisesDone = chapter.exercises.length > 0 
                ? Object.keys(chapterProgress.exercisesFeedback).length === chapter.exercises.length
                : true;
            
            return hasStarted && !(quizDone && allExercisesDone);
        });
        
        if (inProgressIncomplete.length > 0) {
            inProgressIncomplete.forEach(chapter => {
                const notifId = `chapter-incomplete-${chapter.id}`;
                if (!notificationExists(notifId, storedNotifications)) {
                    const chapterProgress = progress[chapter.id];
                    const quizDone = chapterProgress.quiz.isSubmitted;
                    
                    const message = !quizDone 
                        ? `Terminez le quiz du chapitre "<b>${chapter.chapter}</b>" pour débloquer les exercices.`
                        : `Il reste des exercices à évaluer pour le chapitre "<b>${chapter.chapter}</b>".`;
                    
                    dynamicNotifications.push({
                        id: notifId,
                        title: 'Travail à finaliser',
                        message,
                        timestamp: nowTs + 550000,
                    });
                }
            });
        }

        // ════════════════════════════════════════════════════════════
        // SECTION 4: MESSAGE DE BIENVENUE (Priorité basse)
        // ════════════════════════════════════════════════════════════
        
        // 4a. 👋 Message de bienvenue quotidien
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const welcomeNotifId = `welcome-${startOfDay.getTime()}`;
        
        if (!notificationExists(welcomeNotifId, storedNotifications)) {
            dynamicNotifications.push({
                id: welcomeNotifId,
                title: `Bienvenue, ${profile.name} !`,
                message: 'Prêt à relever de nouveaux défis aujourd\'hui ?',
                timestamp: startOfDay.getTime(), // Timestamp du début de journée
            });
        }

        // ════════════════════════════════════════════════════════════
        // COMBINAISON & TRI FINAL
        // ════════════════════════════════════════════════════════════
        
        // Combiner notifications stockées et nouvelles
        const allNotifications = [...storedNotifications, ...dynamicNotifications];
        
        // Dédupliquer par ID
        const uniqueMap = new Map<string, UINotification>();
        for (const notif of allNotifications) {
            uniqueMap.set(notif.id, notif);
        }

        // Trier par timestamp décroissant (plus récent = plus haut)
        return Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp);

    }, [profile, activities, progress, chapterOrder]);
};

// Fonction d'invalidation du cache
export const invalidateNotificationCache = () => {
    cachedNotifications = null;
    lastCacheTime = 0;
};