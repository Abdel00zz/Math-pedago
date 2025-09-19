import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { Chapter } from '../types';
import { CLASS_OPTIONS } from '../constants';
import { generateStudentProgressSubmission } from '../utils/utils';
import ConfirmationModal from './ConfirmationModal';
import Confetti from './Confetti';
import Tooltip from './Tooltip';

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

    // We only want to show the submit button on the activity pages ('quiz' or 'exercises')
    if (state.view !== 'activity') return null;

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
    // Nombre d'exercices pour lesquels un feedback est saisi (incluant 'Pas travaillé')
    const evaluatedCount = Object.keys(exercisesFeedback).length;
    const allExercisesEvaluated = totalExercises > 0 ? evaluatedCount === totalExercises : true;
    // Nombre d'exercices réellement travaillés (excluant 'Pas travaillé') pour le récapitulatif uniquement
    const workedOnExercisesCount = Object.values(exercisesFeedback).filter(f => f !== 'Pas travaillé').length;

    // On autorise la soumission si le quiz est terminé et si tous les exercices sont évalués (même 'Pas travaillé')
    const canSubmit = isQuizFinished && allExercisesEvaluated && !isWorkSubmitted;

    const getTooltipText = (): string => {
        if (isWorkSubmitted) return `Votre travail pour l'activité "${activeChapter.chapter}" a déjà été envoyé.`;
        if (canSubmit) return `Prêt à envoyer votre travail pour l'activité "${activeChapter.chapter}" !`;
        
        // This part is not currently reachable as the button is hidden, but kept for clarity
        const reasons: string[] = [];
        if (!isQuizFinished) reasons.push(`terminez le quiz`);
        
        const unevaluatedCount = totalExercises - evaluatedCount;
        
        if (unevaluatedCount > 0) reasons.push(`évaluez ${unevaluatedCount} exercice(s)`);
        
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
            const resume = `Quiz: ${chapterProgress.quiz.score}%. Exercices: ${evaluatedCount}/${totalExercises} évalués.`;
            
            // Générer la structure JSON selon les spécifications
            const progressSubmission = generateStudentProgressSubmission(
                profile.name,
                classLabel,
                [{
                    chapterName: activeChapter.chapter,
                    quizScore: chapterProgress.quiz.score,
                    quizAnswers: chapterProgress.quiz.answers,
                    exercisesFeedback: chapterProgress.exercisesFeedback,
                    quizQuestions: activeChapter.quiz
                }]
            );
            
            formData.append('eleve', profile.name);
            formData.append('classe', classLabel);
            formData.append('chapitre', activeChapter.chapter);
            formData.append('chapitreId', activeChapter.id);
            formData.append('submittedAt', submissionDate.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }));
            formData.append('resume', resume);

            // Inclure les données JSON directement dans le message ET dans des champs séparés
            const progressJson = JSON.stringify(progressSubmission, null, 2);
            
            // Méthode 1: JSON complet dans le message
            formData.append('message', `Données de progression de l'élève:\n\n${progressJson}`);
            
            // Méthode 2: Données importantes dans des champs séparés pour garantir la réception
            formData.append('donnees_json', progressJson);
            formData.append('score_quiz', chapterProgress.quiz.score.toString());
            formData.append('reponses_quiz', JSON.stringify(chapterProgress.quiz.answers));
            formData.append('feedback_exercices', JSON.stringify(chapterProgress.exercisesFeedback));
            
            // Méthode 3: Essayer aussi avec une pièce jointe (peut ne pas fonctionner avec AJAX)
            try {
                const blob = new Blob([progressJson], { type: 'application/json' });
                const sanitizedName = profile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `progression_${sanitizedName}_${activeChapter.id}.json`;
                formData.append('attachment', blob, filename);
            } catch (e) {
                console.warn('Impossible d\'ajouter la pièce jointe:', e);
            }
            
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
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 z-20">
                {canSubmit ? (
                    <Tooltip text={getTooltipText()}>
                        <button
                            onClick={() => setIsConfirmationModalOpen(true)}
                            className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-200 animate-pulse"
                        >
                            Soumettre mon travail
                        </button>
                    </Tooltip>
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