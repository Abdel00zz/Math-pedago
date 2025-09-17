import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { Chapter } from '../types';
import { CLASS_OPTIONS } from '../constants';
import ConfirmationModal from './ConfirmationModal';
import Confetti from './Confetti';

const GlobalWorkSubmit: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { addNotification } = useNotification();
    const { activities, progress, profile } = state;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const activeChapter = useMemo<Chapter | undefined>(() => {
        if (!profile) return undefined;
        const chapters = Object.values(activities) as Chapter[]; // ensure proper typing
        return chapters.find(ch => ch.class === profile.classId && ch.isActive);
    }, [activities, profile]);

    // Ne pas afficher sur la page principale (dashboard)
    if (!profile || state.view === 'dashboard') return null;

    if (!activeChapter) {
        return (
           <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-20">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-gray-200 rounded-full animate-fadeIn border border-border-color shadow-sm" title="Il n'y a pas de chapitre actif à soumettre pour le moment.">
                   <span className="material-symbols-outlined">hourglass_empty</span>
                   <span>Aucun travail à envoyer</span>
               </div>
           </div>
        );
    }

    const chapterProgress = progress[activeChapter.id];
    const isWorkSubmitted = chapterProgress?.isWorkSubmitted || false;
    
    const isQuizFinished = chapterProgress?.quiz.isSubmitted;

    // FIX: Corrected typo from `active-Chapter` to `activeChapter`.
    const totalExercises = activeChapter.exercises?.length || 0;
    const exercisesFeedback = chapterProgress?.exercisesFeedback || {};
    const workedOnExercisesCount = Object.values(exercisesFeedback).filter(f => f !== 'Pas travaillé').length;
    const allExercisesWorked = totalExercises > 0 ? workedOnExercisesCount === totalExercises : true;

    const canSubmit = isQuizFinished && allExercisesWorked && !isWorkSubmitted;

    const getTooltipText = (): string => {
        if (isWorkSubmitted) return `Votre travail pour l'activité "${activeChapter.chapter}" a déjà été envoyé.`;
        if (canSubmit) return `Prêt à envoyer votre travail pour l'activité "${activeChapter.chapter}" !`;
        
        // This part is not currently reachable as the button is hidden, but kept for clarity
        const reasons: string[] = [];
        if (!isQuizFinished) reasons.push(`terminez le quiz`);
        
        const unevaluatedCount = totalExercises - Object.keys(exercisesFeedback).length;
        const notWorkedCount = Object.keys(exercisesFeedback).length - workedOnExercisesCount;
        
        if (unevaluatedCount > 0) reasons.push(`évaluez ${unevaluatedCount} exercice(s)`);
        if (notWorkedCount > 0) reasons.push(`terminez ${notWorkedCount} exercice(s) 'Pas travaillé'`);
        
        if (reasons.length > 0) return `Pour envoyer : ${reasons.join(' et ')}.`;
        return 'Envoyer votre travail finalisé';
    };
    
    const handleSubmitWork = async () => {
        if (!canSubmit || isSubmitting || !profile || !activeChapter || !chapterProgress) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('_template', 'table');
            formData.append('_captcha', 'false');
            formData.append('_next', window.location.href);
            formData.append('_subject', `Nouveau travail soumis: ${profile.name} - ${activeChapter.chapter}`);

            const classLabel = CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || profile.classId;
            const submissionDate = new Date();
            const resume = `Quiz: ${chapterProgress.quiz.score}%. Exercices: ${workedOnExercisesCount}/${totalExercises} travaillés.`;
            
            formData.append('eleve', profile.name);
            formData.append('classe', classLabel);
            formData.append('chapitre', activeChapter.chapter);
            formData.append('chapitreId', activeChapter.id);
            formData.append('submittedAt', submissionDate.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }));
            formData.append('resume', resume);

            const progressJson = JSON.stringify(chapterProgress, null, 2);
            const blob = new Blob([progressJson], { type: 'application/json' });
            const sanitizedName = profile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `progression_${sanitizedName}_${activeChapter.id}.json`;
            formData.append('attachment', blob, filename);
            
            const response = await fetch('https://formsubmit.co/bdh.malek@gmail.com', {
              method: 'POST',
              mode: 'no-cors',
              body: formData,
            });
            // Logs détaillés de diagnostic (opaque en no-cors, lecture souvent impossible)
            try {
                const respText = await response.clone().text();
                console.debug('[FormSubmit] Type:', response.type);
                console.debug('[FormSubmit] Status:', response.status, response.statusText);
                console.debug('[FormSubmit] Body (500 chars):', respText.slice(0, 500));
            } catch (e) {
                console.debug('[FormSubmit] Réponse non lisible (probablement no-cors/opaque):', e);
            }

            // En mode no-cors, la réponse est opaque (status 0). On considère la soumission comme effectuée si aucune erreur réseau n’a été levée.
            if (response.type !== 'opaque' && !response.ok) throw new Error('La soumission a échoué.');

            dispatch({ type: 'SUBMIT_WORK', payload: { chapterId: activeChapter.id } });
            addNotification(`Travail pour l'activité "${activeChapter.chapter}" envoyé avec succès !`, 'success');
            setIsConfirmationModalOpen(false);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts 5 seconds

        } catch (error) {
            console.error("Erreur d'envoi:", error);
            addNotification("Une erreur est survenue. Veuillez réessayer.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {showConfetti && <Confetti />}
            <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-20">
                {isWorkSubmitted ? (
                     <div 
                         className="relative px-4 py-2 bg-card-bg/50 backdrop-blur-sm rounded-2xl shadow-sm border border-border-color" 
                         title={getTooltipText()}
                     >
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-success text-base">check_circle</span>
                             <span className="text-xs font-bold text-dark-gray">Travail Envoyé</span>
                         </div>
                     </div>
                ) : canSubmit ? (
                    <button
                        onClick={() => setIsConfirmationModalOpen(true)}
                        title={getTooltipText()}
                        className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-primary to-blue-700 rounded-2xl shadow-lg transition-all duration-300 transform hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                        <div className="relative flex items-center gap-2">
                            <span className="material-symbols-outlined text-white text-lg animate-pulse">send</span>
                            <span className="font-bold text-white drop-shadow-sm">Envoyer mon travail</span>
                        </div>
                    </button>
                ) : null}
            </div>

            <ConfirmationModal 
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onSubmit={handleSubmitWork}
                isSubmitting={isSubmitting}
                activityTitle={activeChapter.chapter}
            />
        </>
    );
};

export default GlobalWorkSubmit;