import { useMemo } from 'react';
import { AppState, UINotification } from '../types';

const SESSION_REMINDER_HOURS = 3;
const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';

export const useNotificationGenerator = (state: AppState): UINotification[] => {
    const { profile, activities, progress, chapterOrder } = state;

    return useMemo(() => {
        if (!profile) return [];

        const dynamicNotifications: UINotification[] = [];
        const nowTs = Date.now();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 1. Get persistent notifications (new/updated chapters) from localStorage
        let storedNotifications: UINotification[] = [];
        try {
            const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
            if (stored) {
                const notificationsFromStorage = JSON.parse(stored);
                const oneWeekAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
                storedNotifications = notificationsFromStorage.filter((n: any) => n.timestamp >= oneWeekAgo);
            }
        } catch (e) {
            console.error("Could not parse UI notifications from localStorage", e);
        }
        
        const allUserActivities = chapterOrder.map(id => activities[id]).filter(Boolean);

        // 2. Generate DYNAMIC notifications based on current state

        // 2a. URGENT: Session Reminders
        allUserActivities.forEach(chapter => {
            if (chapter.isActive && Array.isArray(chapter.sessionDates) && chapter.sessionDates.length > 0) {
                const upcomingSession = chapter.sessionDates
                    .map(d => new Date(d))
                    .find(date => {
                        const timeDiffMs = date.getTime() - nowTs;
                        return timeDiffMs > 0 && timeDiffMs < SESSION_REMINDER_HOURS * 60 * 60 * 1000;
                    });
                
                if (upcomingSession) {
                    dynamicNotifications.push({
                        id: `session-reminder-${chapter.id}-${upcomingSession.toISOString()}`,
                        title: 'Séance en direct imminente',
                        message: `Préparez-vous ! Votre séance pour "<b>${chapter.chapter}</b>" commence dans moins de ${SESSION_REMINDER_HOURS} heures.`,
                        timestamp: nowTs + 1000000, // Prioritize
                    });
                }
            }
        });

        // 2b. FEEDBACK: Quiz Performance
        const submittedButNotFinished = allUserActivities
            .map(chapter => ({ chapter, progress: progress[chapter.id] }))
            .filter(({ progress }) => progress?.quiz.isSubmitted && !progress.isWorkSubmitted);

        submittedButNotFinished.forEach(({ chapter, progress }) => {
            const score = progress.quiz.score;
            const total = chapter.quiz.length;
            if (total === 0) return;
            const percentage = (score / total) * 100;

            if (percentage < 50) {
                dynamicNotifications.push({
                    id: `quiz-encourage-${chapter.id}`,
                    title: `Un point à revoir ?`,
                    message: `Votre score au quiz de "<b>${chapter.chapter}</b>" est de <b>${score}/${total}</b>. N'hésitez pas à revoir vos réponses pour renforcer votre compréhension.`,
                    timestamp: nowTs + 750000,
                });
            } else if (percentage >= 80) {
                dynamicNotifications.push({
                    id: `quiz-great-${chapter.id}`,
                    title: `Excellent travail sur le quiz !`,
                    message: `Vous avez obtenu <b>${score}/${total}</b> pour "<b>${chapter.chapter}</b>". Continuez sur cette lancée !`,
                    timestamp: nowTs + 700000,
                });
            }
        });
        
        // 2c. PROGRESS: Encouragement
        const activeChapters = allUserActivities.filter(ch => ch.isActive && !progress[ch.id]?.isWorkSubmitted);
        if (activeChapters.length > 0) {
            const allActiveQuizzesDone = activeChapters.every(ch => progress[ch.id]?.quiz.isSubmitted);
            if (allActiveQuizzesDone) {
                dynamicNotifications.push({
                    id: 'all-active-quizzes-done',
                    title: 'Quiz terminés !',
                    message: 'Bravo ! Vous avez terminé les quiz pour tous les chapitres actifs. Continuez avec les exercices !',
                    timestamp: nowTs + 600000,
                });
            }
        }
        
        const completedChaptersCount = allUserActivities.filter(chapter => progress[chapter.id]?.isWorkSubmitted).length;
        if (completedChaptersCount > 0 && completedChaptersCount < 3) {
             dynamicNotifications.push({
                id: 'overall-progress-early',
                title: 'Quelle progression !',
                message: `Vous avez déjà terminé <b>${completedChaptersCount} chapitre${completedChaptersCount > 1 ? 's' : ''}</b>. Votre persévérance porte ses fruits !`,
                timestamp: nowTs + 400000,
            });
        }

        // 2d. WELCOME: Welcome message with a fixed timestamp for the day
        dynamicNotifications.push({
            id: 'welcome',
            title: `Bienvenue, ${profile.name} !`,
            message: 'Prêt à relever de nouveaux défis aujourd\'hui ? Votre parcours d\'apprentissage vous attend.',
            timestamp: startOfDay.getTime(),
        });

        // 3. Combine, Deduplicate, and Sort
        const allNotifications = [...storedNotifications, ...dynamicNotifications];
        
        const uniqueNotifications = Array.from(new Map(allNotifications.map(n => [n.id, n])).values());

        uniqueNotifications.sort((a, b) => b.timestamp - a.timestamp);
        
        return uniqueNotifications;

    }, [profile, activities, progress, chapterOrder]);
};