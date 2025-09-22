import { useMemo } from 'react';
import { AppState } from '../types';

export interface UINotification {
    title: string;
    message: string;
}

const SESSION_REMINDER_HOURS = 3;

export const useNotificationGenerator = (state: AppState): UINotification[] => {
    const { profile, activities, progress, chapterOrder } = state;

    return useMemo(() => {
        const notifications: UINotification[] = [];
        if (!profile) return [];
        
        const now = new Date();
        const allUserActivities = chapterOrder.map(id => activities[id]).filter(Boolean);

        // 1. Welcome message
        notifications.push({
            title: `Bienvenue, ${profile.name} !`,
            message: 'Prêt à relever de nouveaux défis aujourd\'hui ?'
        });

        // 2. New Chapter Activated
        const firstToDoChapter = allUserActivities.find(chapter => {
            const p = progress[chapter.id];
            return chapter.isActive && p && !p.isWorkSubmitted && Object.keys(p.quiz.answers).length === 0 && Object.keys(p.exercisesFeedback).length === 0;
        });

        if (firstToDoChapter) {
            notifications.push({
                title: 'Nouveau chapitre disponible !',
                message: `Un nouveau défi vous attend. Le chapitre "<b>${firstToDoChapter.chapter}</b>" est prêt à être exploré.`
            });
        }
        
        // 3. Session Reminders
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
                        title: 'Séance en direct imminente',
                        message: `Préparez-vous ! Votre séance pour "<b>${chapter.chapter}</b>" commence dans moins de ${SESSION_REMINDER_HOURS} heures.`
                    });
                }
            }
        });

        // 4. Encouragement after quizzes
        const activeChapters = allUserActivities.filter(ch => ch.isActive && !progress[ch.id]?.isWorkSubmitted);
        if (activeChapters.length > 0) {
            const allActiveQuizzesDone = activeChapters.every(ch => progress[ch.id]?.quiz.isSubmitted);

            if (allActiveQuizzesDone) {
                notifications.push({
                    title: 'Quiz terminés !',
                    message: 'Bravo ! Vous avez terminé les quiz pour tous les chapitres actifs. Continuez avec les exercices pour maîtriser les sujets !'
                });
            }
        }

        return notifications;

    }, [profile, activities, progress, chapterOrder]);
};