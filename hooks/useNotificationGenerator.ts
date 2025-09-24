import { useMemo } from 'react';
import { AppState } from '../types';

export interface UINotification {
    id: string;
    title: string;
    message: string;
    timestamp?: number;
}

const SESSION_REMINDER_HOURS = 3;
const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';

export const useNotificationGenerator = (state: AppState): UINotification[] => {
    const { profile, activities, progress, chapterOrder } = state;

    return useMemo(() => {
        const notifications: UINotification[] = [];
        if (!profile) return [];

        const now = new Date();
        const nowTs = now.getTime();

        // 1. Get persistent notifications (like content updates) from localStorage
        try {
            const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
            if (stored) {
                const notificationsFromStorage = JSON.parse(stored);
                const oneWeekAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
                
                const freshNotifications = notificationsFromStorage.filter((n: any) => n.timestamp >= oneWeekAgo);

                if (freshNotifications.length < notificationsFromStorage.length) {
                    localStorage.setItem(UI_NOTIFICATIONS_KEY, JSON.stringify(freshNotifications));
                }
                
                freshNotifications.forEach((n: any) => {
                     notifications.push({
                        id: n.id,
                        title: n.title,
                        message: n.message,
                        timestamp: n.timestamp
                    });
                });
            }
        } catch (e) {
            console.error("Could not parse UI notifications from localStorage", e);
        }
        
        const allUserActivities = chapterOrder.map(id => activities[id]).filter(Boolean);

        // 2. Welcome message (will be moved to the end)
        notifications.push({
            id: 'welcome',
            title: `Bienvenue, ${profile.name} !`,
            message: 'Prêt à relever de nouveaux défis aujourd\'hui ?',
            timestamp: nowTs,
        });

        // 3. New Chapter Activated
        const firstToDoChapter = allUserActivities.find(chapter => {
            const p = progress[chapter.id];
            return chapter.isActive && p && !p.isWorkSubmitted && Object.keys(p.quiz.answers).length === 0 && Object.keys(p.exercisesFeedback).length === 0;
        });

        if (firstToDoChapter) {
            notifications.push({
                id: `new-chapter-${firstToDoChapter.id}`,
                title: 'Nouveau chapitre disponible !',
                message: `Un nouveau défi vous attend. Le chapitre "<b>${firstToDoChapter.chapter}</b>" est prêt à être exploré.`,
                timestamp: nowTs,
            });
        }
        
        // 4. Session Reminders
        allUserActivities.forEach(chapter => {
            if (chapter.isActive && chapter.sessionDates && chapter.sessionDates.length > 0) {
                const upcomingSession = chapter.sessionDates
                    .map(d => new Date(d))
                    .find(date => {
                        const timeDiffMs = date.getTime() - now.getTime();
                        return timeDiffMs > 0 && timeDiffMs < SESSION_REMINDER_HOURS * 60 * 60 * 1000;
                    });
                
                if (upcomingSession) {
                    notifications.push({
                        id: `session-reminder-${chapter.id}-${upcomingSession.toISOString()}`,
                        title: 'Séance en direct imminente',
                        message: `Préparez-vous ! Votre séance pour "<b>${chapter.chapter}</b>" commence dans moins de ${SESSION_REMINDER_HOURS} heures.`,
                        timestamp: nowTs,
                    });
                }
            }
        });

        // 5. Encouragement after quizzes (Quiz done, exercises to do)
        const activeChapters = allUserActivities.filter(ch => ch.isActive && !progress[ch.id]?.isWorkSubmitted);
        if (activeChapters.length > 0) {
            const allActiveQuizzesDone = activeChapters.every(ch => progress[ch.id]?.quiz.isSubmitted);

            if (allActiveQuizzesDone) {
                notifications.push({
                    id: 'all-active-quizzes-done',
                    title: 'Quiz terminés !',
                    message: 'Bravo ! Vous avez terminé les quiz pour tous les chapitres actifs. Continuez avec les exercices pour maîtriser les sujets !',
                    timestamp: nowTs,
                });
            }
        }
        
        // 6. Quiz Performance Feedback (ENHANCED)
        const submittedQuizzes = allUserActivities
            .map(chapter => ({ chapter, progress: progress[chapter.id] }))
            .filter(({ progress }) => progress?.quiz.isSubmitted && !progress.isWorkSubmitted);

        submittedQuizzes.forEach(({ chapter, progress }) => {
            const score = progress.quiz.score;
            const total = chapter.quiz.length;
            if (total === 0) return;
            const percentage = (score / total) * 100;

            if (percentage === 100) {
                notifications.push({
                    id: `quiz-perfect-${chapter.id}`,
                    title: `Score Parfait ! 🌟`,
                    message: `Félicitations ! Vous avez obtenu <b>${score}/${total}</b> pour "<b>${chapter.chapter}</b>". C'est un sans-faute !`,
                    timestamp: nowTs,
                });
            } else if (percentage >= 80) {
                notifications.push({
                    id: `quiz-great-${chapter.id}`,
                    title: `Excellent travail sur le quiz !`,
                    message: `Vous avez obtenu <b>${score}/${total}</b> pour "<b>${chapter.chapter}</b>". Continuez sur cette lancée !`,
                    timestamp: nowTs,
                });
            } else if (percentage < 50) {
                notifications.push({
                    id: `quiz-encourage-${chapter.id}`,
                    title: `Un point à revoir ?`,
                    message: `Votre score au quiz de "<b>${chapter.chapter}</b>" est de <b>${score}/${total}</b>. N'hésitez pas à revoir vos réponses pour renforcer votre compréhension.`,
                    timestamp: nowTs,
                });
            }
        });

        // 7. Overall progress (ENHANCED)
        const completedChaptersCount = allUserActivities.filter(chapter => progress[chapter.id]?.isWorkSubmitted).length;
        if (completedChaptersCount === 1) {
            notifications.push({
                id: 'first-chapter-complete',
                title: 'Premier chapitre terminé !',
                message: `Bravo, vous avez terminé votre premier chapitre. C'est un excellent début !`,
                timestamp: nowTs,
            });
        } else if (completedChaptersCount > 1) {
            notifications.push({
                id: 'overall-progress',
                title: 'Quelle progression !',
                message: `Vous avez déjà terminé <b>${completedChaptersCount} chapitres</b>. Votre persévérance porte ses fruits !`,
                timestamp: nowTs,
            });
        }

        // Deduplicate notifications, keeping the last occurrence.
        const uniqueNotifications = Array.from(new Map(notifications.reverse().map(n => [n.id, n])).values()).reverse();

        // Separate welcome message to place it at the end
        const welcomeIndex = uniqueNotifications.findIndex(n => n.id === 'welcome');
        let welcomeMessage = null;
        if (welcomeIndex > -1) {
            [welcomeMessage] = uniqueNotifications.splice(welcomeIndex, 1);
        }

        // Sort by timestamp, most recent first
        uniqueNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Add welcome message at the end
        if (welcomeMessage) {
            uniqueNotifications.push(welcomeMessage);
        }
        
        return uniqueNotifications;

    }, [profile, activities, progress, chapterOrder]);
};