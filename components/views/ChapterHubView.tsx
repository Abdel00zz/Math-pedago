import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import ConfirmationModal from '../ConfirmationModal';
import { useNotification } from '../../context/NotificationContext';
import TypingEffect from '../TypingEffect';
import { ExportedProgressFile } from '../../types';

type BadgeStatus = 'completed' | 'in-progress' | 'todo' | 'ready' | 'locked';

// Configuration FormSubmit centralisée
const FORMSUBMIT_CONFIG = {
    endpoint: 'https://formsubmit.co/bdh.malek@gmail.com', // Endpoint standard pour supporter les pièces jointes
    options: {
        _captcha: 'false',
        _template: 'table',
        // Fix: Use double quotes for the string to correctly handle the apostrophe.
        _autoresponse: "Votre travail a été reçu avec succès. Nous l'examinerons dans les plus brefs délais.",
        _next: window.location.href, // Rediriger vers la même page après soumission
    }
};

const ChapterHubView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const { currentChapterId, activities, progress, profile } = state;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const chapter = useMemo(() => {
        if (!currentChapterId) return null;
        return activities[currentChapterId];
    }, [currentChapterId, activities]);

    const chapterProgress = useMemo(() => {
        if (!currentChapterId) return null;
        return progress[currentChapterId];
    }, [currentChapterId, progress]);
    
    const className = useMemo(() => {
        if (!profile) return '';
        return CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || profile.classId;
    }, [profile]);

    // Calculer les valeurs dérivées avec des valeurs par défaut pour éviter les erreurs
    const quiz = chapterProgress?.quiz || { isSubmitted: false, answers: {} };
    const totalExercises = chapter?.exercises?.length || 0;
    const evaluatedExercisesCount = chapterProgress ? Object.keys(chapterProgress.exercisesFeedback || {}).length : 0;

    const quizProgressPercent = useMemo(() => {
        if (quiz.isSubmitted) return 100;
        if (!chapter || chapter.quiz.length === 0) return 0;
        return (Object.keys(quiz.answers).length / chapter.quiz.length) * 100;
    }, [quiz.answers, quiz.isSubmitted, chapter?.quiz?.length]);
    
    const exercisesProgressPercent = useMemo(() => {
        if (totalExercises === 0) return 100;
        return (evaluatedExercisesCount / totalExercises) * 100;
    }, [evaluatedExercisesCount, totalExercises]);

    if (!chapter || !chapterProgress || !profile) {
        return (
            <div className="text-center p-12">
                <h2 className="text-xl font-semibold">Chargement du plan de travail...</h2>
                <p className="text-secondary mt-2">Veuillez patienter un instant.</p>
            </div>
        );
    }

    const isQuizCompleted = quiz.isSubmitted;
    const areExercisesEvaluated = evaluatedExercisesCount === totalExercises;
    const canSubmitWork = isQuizCompleted && areExercisesEvaluated && !chapterProgress.isWorkSubmitted;

    const handleStartQuiz = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'quiz' } });
    };

    const handleReviewQuiz = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'quiz', review: true } });
    };

    const handleStartExercises = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'exercises' } });
    };
    
    const handleSubmitWork = async () => {
        if (!canSubmitWork || isSubmitting || !profile || !chapter || !chapterProgress) return;

        setIsSubmitting(true);
        
        try {
            // Créer un formulaire HTML temporaire pour contourner les problèmes CORS
            const form = document.createElement('form');
            form.action = 'https://formsubmit.co/bdh.malek@gmail.com';
            form.method = 'POST';
            form.enctype = 'multipart/form-data';
            form.style.display = 'none';
            
            // Configuration FormSubmit
            const addHiddenField = (name: string, value: string) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
            };
            
            addHiddenField('_template', 'table');
            addHiddenField('_captcha', 'false');
            addHiddenField('_next', window.location.href);
            addHiddenField('_subject', `✅ Nouveau travail soumis: ${profile.name} - ${chapter.chapter}`);
            addHiddenField('_autoresponse', "Votre travail a été reçu avec succès. Nous l'examinerons dans les plus brefs délais.");
            
            const submissionDate = new Date();
            const quizScorePercentage = chapter.quiz.length > 0 ? (quiz.score / chapter.quiz.length) * 100 : 100;
            const resume = `Quiz: ${quiz.score}/${chapter.quiz.length} (${quizScorePercentage.toFixed(1)}%). Exercices: ${evaluatedExercisesCount}/${totalExercises} évalués.`;
            
            // Informations principales
            addHiddenField('eleve', profile.name);
            addHiddenField('classe', className);
            addHiddenField('chapitre', chapter.chapter);
            addHiddenField('chapitreId', chapter.id);
            addHiddenField('submittedAt', submissionDate.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }));
            addHiddenField('resume', resume);
            
            // Find the index of the selected answer for each question
            const quizAnswersWithIndices: { [qId: string]: number } = {};
            Object.keys(quiz.answers).forEach(qId => {
                const question = chapter.quiz.find(q => q.id === qId);
                if (question) {
                    const answerIndex = question.options.findIndex(opt => opt.text === quiz.answers[qId]);
                    if (answerIndex !== -1) {
                        quizAnswersWithIndices[qId] = answerIndex;
                    }
                }
            });

            // Construire la structure de données pour la soumission
            const submissionData: ExportedProgressFile = {
                studentName: profile.name,
                studentLevel: className,
                timestamp: Date.now(),
                results: [
                    {
                        chapter: chapter.chapter,
                        quiz: {
                            score: parseFloat(quizScorePercentage.toFixed(2)),
                            answers: quizAnswersWithIndices,
                        },
                        exercisesFeedback: chapterProgress.exercisesFeedback,
                        durationSeconds: (chapterProgress.quiz.duration || 0) + (chapterProgress.exercisesDuration || 0),
                    }
                ]
            };
            
            // Créer et attacher le fichier JSON
            const progressJson = JSON.stringify(submissionData, null, 2);
            const blob = new Blob([progressJson], { type: 'application/json' });
            const sanitizedName = profile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `progression_${sanitizedName}_${chapter.id}.json`;
            
            // Créer un input file pour la pièce jointe
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'attachment';
            fileInput.style.display = 'none';
            
            // Créer un fichier à partir du blob
            const file = new File([blob], filename, { type: 'application/json' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            form.appendChild(fileInput);
            document.body.appendChild(form);
            
            // Soumettre le formulaire
            form.submit();
            
            // Nettoyer le formulaire après un délai
            setTimeout(() => {
                document.body.removeChild(form);
            }, 1000);
            
            // Marquer le travail comme soumis
            dispatch({ type: 'SUBMIT_WORK', payload: { chapterId: chapter.id } });
            
            // Notification de succès
            addNotification(`Travail pour "${chapter.chapter}" envoyé avec succès !`, 'success');
            
            // Fermer la modal de confirmation
            setConfirmationModalOpen(false);
            
            // Effet confetti pour célébrer
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            
        } catch (error) {
            console.error("Erreur d'envoi:", error);
            addNotification("Une erreur est survenue. Veuillez réessayer.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Fonction pour formater le corps de l'email
    const formatEmailBody = (data: any): string => {
        const { studentProfile, chapterDetails, quizResults, exercisesSelfAssessment } = data;
        
        // Calculer les statistiques nécessaires
        const correctAnswers = quizResults.answers.filter((a: any) => a.isCorrect).length;
        const incorrectAnswers = quizResults.answers.length - correctAnswers;
        const averageExerciseScore = exercisesSelfAssessment.feedback.length > 0 
            ? (exercisesSelfAssessment.feedback.reduce((sum: number, ex: any) => sum + (ex.studentFeedback?.score || 0), 0) / exercisesSelfAssessment.feedback.length).toFixed(1)
            : '0';
        
        const formatDuration = (seconds: number) => {
            if (seconds < 60) return `${seconds}s`;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        };
        
        return `
📚 NOUVEAU TRAVAIL SOUMIS
========================

👤 ÉTUDIANT
-----------
Nom: ${studentProfile.name}
Classe: ${studentProfile.className}
Date de soumission: ${new Date().toLocaleString('fr-FR')}

📖 CHAPITRE
-----------
${chapterDetails.title}
ID: ${chapterDetails.id}

📊 RÉSULTATS
------------
Quiz: ${quizResults.score}/${quizResults.totalQuestions} (${quizResults.percentage.toFixed(1)}%)
Exercices évalués: ${exercisesSelfAssessment.feedback.length}/${exercisesSelfAssessment.totalExercises}
Note moyenne des exercices: ${averageExerciseScore}/5

🎯 DÉTAILS DU QUIZ
------------------
Questions réussies: ${correctAnswers}
Questions échouées: ${incorrectAnswers}
Temps passé: ${formatDuration(quizResults.durationInSeconds)}

💪 AUTO-ÉVALUATION DES EXERCICES
---------------------------------
${exercisesSelfAssessment.feedback.map((ex: any) => 
    `• ${ex.exerciseTitle}: ${ex.studentFeedback?.score || 'N/A'}/5 - ${ex.studentFeedback?.feedback || 'Pas de commentaire'}`
).join('\n')}

📎 Voir le fichier JSON joint pour plus de détails.
        `.trim();
    };
    
    // Fonction pour sauvegarder une copie locale (optionnel)
    const saveLocalBackup = (data: any, filename: string) => {
        try {
            const backupKey = `submission_backup_${chapter.id}_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify({
                filename,
                data,
                timestamp: new Date().toISOString()
            }));
            
            // Nettoyer les anciennes sauvegardes (garder seulement les 5 dernières)
            cleanOldBackups();
        } catch (error) {
            console.warn('Impossible de sauvegarder localement:', error);
        }
    };
    
    const cleanOldBackups = () => {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('submission_backup_'))
            .sort()
            .reverse();
        
        // Garder seulement les 5 sauvegardes les plus récentes
        backupKeys.slice(5).forEach(key => {
            localStorage.removeItem(key);
        });
    };
    
    const getQuizStatus = (): { text: string; status: BadgeStatus } => {
        if (quiz.isSubmitted) return { text: 'Terminé', status: 'completed' };
        if (Object.keys(quiz.answers).length > 0) return { text: 'En cours', status: 'in-progress' };
        return { text: 'À commencer', status: 'todo' };
    };

    const getExercisesStatus = (): { text: string; status: BadgeStatus } => {
        if (areExercisesEvaluated) return { text: 'Terminé', status: 'completed' };
        if (evaluatedExercisesCount > 0) return { text: 'En cours', status: 'in-progress' };
        return { text: 'À commencer', status: 'todo' };
    };

    const getSubmissionStatus = (): { text: string; status: BadgeStatus } => {
        if (chapterProgress.isWorkSubmitted) return { text: 'Travail soumis', status: 'completed' };
        if (canSubmitWork) return { text: 'Prêt à être soumis', status: 'ready' };
        return { text: 'Verrouillé', status: 'locked' };
    };

    const quizStatus = getQuizStatus();
    const exercisesStatus = getExercisesStatus();
    const submissionStatus = getSubmissionStatus();
    const isSubmissionUnlocked = canSubmitWork || chapterProgress.isWorkSubmitted;
    
    const getStatusBadge = (status: BadgeStatus, text: string) => {
        const styles: Record<BadgeStatus, string> = {
            completed: 'px-2.5 py-1 text-xs font-semibold rounded-full bg-success/10 text-success',
            'in-progress': 'px-2.5 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning',
            todo: 'px-2 py-0.5 text-[11px] font-normal font-garamond rounded border border-border text-text-secondary bg-surface',
            ready: 'px-2.5 py-1 text-xs font-semibold rounded-full bg-info/10 text-info',
            locked: 'px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary',
        };
        return <span className={`${styles[status]}`}>{text}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <header className="relative flex items-center justify-center mb-8">
                <button 
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                    className="font-button absolute left-0 flex items-center justify-center w-12 h-12 rounded-full text-secondary bg-transparent hover:bg-surface/50 transition-all duration-200 active:scale-95"
                    aria-label="Retour au tableau de bord"
                >
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-600 font-title">
                        Plan de travail
                    </h1>
                    <p className="text-secondary">{chapter.chapter}</p>
                </div>
            </header>
            
            <div className="space-y-6">
                {/* Étape 1: Quiz */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-12 h-12 bg-primary-light text-primary rounded-full font-bold text-xl shrink-0">
                                    <span className="material-symbols-outlined text-2xl">lock_open</span>
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-text">Étape 1 : Le Quiz</h2>
                                </div>
                            </div>
                            <p className="text-secondary mt-3 pl-14 text-sm max-w-md">
                                {isQuizCompleted ? 'Quiz terminé. Vous pouvez maintenant passer aux exercices.' : 'Vérifiez votre compréhension des concepts clés du chapitre.'}
                            </p>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-[240px] flex-shrink-0 flex flex-col gap-3 self-stretch">
                            <div className="flex-grow flex flex-col justify-center w-full">
                                <div className="flex items-baseline justify-between w-full mb-1">
                                    <span className="text-sm font-semibold text-text-secondary">{isQuizCompleted ? 'Score' : 'Progression'}</span>
                                    {isQuizCompleted 
                                        ? <span className="font-bold text-lg text-primary">{quiz.score}/{chapter.quiz.length}</span> 
                                        : getStatusBadge(quizStatus.status, quizStatus.text)}
                                </div>
                                <div className="w-full bg-border/50 rounded-full h-3">
                                    <div className={`h-3 rounded-full transition-all duration-500 ${isQuizCompleted ? 'bg-success' : 'bg-primary'}`} style={{ width: `${quizProgressPercent}%` }} />
                                </div>
                            </div>
                             <div className="w-full sm:w-auto">
                                {isQuizCompleted ? (
                                    <button onClick={handleReviewQuiz} className="font-button w-full px-6 py-2 font-semibold text-primary bg-primary-light border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                                        Revoir le Quiz
                                    </button>
                                ) : (
                                    <button onClick={handleStartQuiz} className="font-button w-full px-6 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-transform transform hover:-translate-y-px active:scale-95">
                                        {Object.keys(quiz.answers).length > 0 ? 'Continuer le Quiz' : 'Commencer le Quiz'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Étape 2: Exercices */}
                <div className={`bg-surface p-5 rounded-xl border border-border shadow-sm transition-opacity ${!isQuizCompleted && 'opacity-60'}`}>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-12 h-12 bg-primary-light text-primary rounded-full font-bold text-xl shrink-0">
                                    <span className="material-symbols-outlined text-2xl">{isQuizCompleted ? 'lock_open' : 'lock'}</span>
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-text">Étape 2 : Les Exercices</h2>
                                </div>
                            </div>
                             <p className="text-secondary mt-3 pl-14 text-sm max-w-md">
                                {areExercisesEvaluated ? 'Tous les exercices ont été auto-évalués.' : 'Mettez en pratique vos connaissances et évaluez votre maîtrise.'}
                            </p>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-[240px] flex-shrink-0 flex flex-col gap-3 self-stretch">
                            <div className="flex-grow flex flex-col justify-center w-full">
                                <div className="flex items-baseline justify-between w-full mb-1">
                                    <span className="text-sm font-semibold text-text-secondary">Progression</span>
                                    {getStatusBadge(exercisesStatus.status, `${evaluatedExercisesCount}/${totalExercises}`)}
                                </div>
                                <div className="w-full bg-border/50 rounded-full h-3">
                                    <div className={`h-3 rounded-full transition-all duration-500 ${areExercisesEvaluated ? 'bg-success' : 'bg-primary'}`} style={{ width: `${exercisesProgressPercent}%` }} />
                                </div>
                            </div>
                             <div className="w-full sm:w-auto">
                                <button 
                                    onClick={handleStartExercises} 
                                    disabled={!isQuizCompleted || chapterProgress.isWorkSubmitted} 
                                    className="font-button w-full px-6 py-2 font-semibold text-primary bg-primary-light border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-light"
                                >
                                    {evaluatedExercisesCount > 0 ? 'Continuer les exercices' : 'Commencer les exercices'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Étape 3: Soumission */}
                <div className={`bg-surface p-5 rounded-xl border border-border shadow-sm transition-opacity ${!isSubmissionUnlocked && 'opacity-60'}`}>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-4">
                               <span className="flex items-center justify-center w-12 h-12 bg-primary-light text-primary rounded-full font-bold text-xl shrink-0">
                                    <span className="material-symbols-outlined text-2xl">{isSubmissionUnlocked ? 'lock_open' : 'lock'}</span>
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-text">Étape 3 : Soumission</h2>
                                </div>
                            </div>
                             <p className="text-secondary mt-3 pl-14 text-sm max-w-md">
                                {chapterProgress.isWorkSubmitted ? 'Excellent travail ! Votre progression a été enregistrée et envoyée.' : 'Une fois les étapes 1 et 2 terminées, vous pourrez envoyer votre travail.'}
                             </p>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-[240px] flex-shrink-0 flex flex-col items-end gap-3 self-stretch">
                            <div className="flex-grow flex flex-col items-end justify-center w-full">
                               <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-semibold text-text-secondary">Statut</span>
                                    {getStatusBadge(submissionStatus.status, submissionStatus.text)}
                                </div>
                            </div>
                             <div className="w-full sm:w-auto">
                                {chapterProgress.isWorkSubmitted ? (
                                    <div className="flex items-center justify-center gap-2 w-full px-6 py-2 rounded-lg font-semibold bg-success/10 text-success">
                                        <span className="material-symbols-outlined text-xl">check_circle</span>
                                        <span>Travail Envoyé</span>
                                    </div>
                                ) : (
                                    <div className="relative group w-full">
                                        <button
                                            onClick={() => setConfirmationModalOpen(true)}
                                            disabled={!canSubmitWork || isSubmitting}
                                            className="font-button w-full px-8 py-3 font-bold text-white bg-primary rounded-lg hover:bg-primary-hover transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-secondary/50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="animate-spin">⏳</span>
                                                    Envoi en cours...
                                                </span>
                                            ) : (
                                                'Envoyer le travail'
                                            )}
                                        </button>
                                        {(!canSubmitWork && !chapterProgress.isWorkSubmitted) && (
                                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-text text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <ul className="list-none text-left space-y-1">
                                                    {!isQuizCompleted && <li>✓ Terminez le quiz</li>}
                                                    {!areExercisesEvaluated && <li>✓ Évaluez tous les exercices</li>}
                                                </ul>
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-text"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => !isSubmitting && setConfirmationModalOpen(false)}
                onSubmit={handleSubmitWork}
                isSubmitting={isSubmitting}
                chapterTitle={chapter.chapter}
            />
            
            {/* Effet confetti pour célébrer la soumission */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    <div className="confetti-container">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)]
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterHubView;