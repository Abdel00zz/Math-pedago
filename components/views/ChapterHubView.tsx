import React, { useState, useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../constants';
import ConfirmationModal from '../ConfirmationModal';
import { useNotification } from '../../context/NotificationContext';
import GlobalActionButtons from '../GlobalActionButtons';
import { ExportedProgressFile } from '../../types';


// --- TYPES ---
type StepStatus = 'locked' | 'todo' | 'in-progress' | 'completed';
type ButtonVariant = 'primary' | 'secondary' | 'disabled';

interface LearningStepProps {
    status: StepStatus;
    icon: string;
    title: string;
    description: string;
    progressInfo?: string;
    progressPercent?: number;
    onClick: () => void;
    disabled?: boolean;
    buttonText: string;
    buttonVariant: ButtonVariant;
}


// --- CONFIGURATION STATIQUE ---
const statusConfig: { [key in StepStatus]: { ringColor: string; textColor: string; barColor: string; icon: string; } } = {
    locked: { ringColor: 'ring-border', textColor: 'text-text-disabled', barColor: '#E5E5E5', icon: 'lock' },
    todo: { ringColor: 'ring-secondary/50', textColor: 'text-text', barColor: '#737373', icon: 'lock_open' },
    'in-progress': { ringColor: 'ring-primary', textColor: 'text-primary', barColor: '#FF6B35', icon: 'pending' },
    completed: { ringColor: 'ring-success', textColor: 'text-success', barColor: '#10B981', icon: 'check_circle' },
};


// --- COMPOSANT DE CARTE D'ÉTAPE UNIFIÉ ---
const LearningStep: React.FC<LearningStepProps> = ({
    status, icon, title, description, progressInfo, progressPercent,
    onClick, disabled, buttonText, buttonVariant
}) => {
    const currentStatus = statusConfig[status];
    const isStepDisabled = status === 'locked' || disabled;

    const buttonStyles: { [key in ButtonVariant]: string } = {
        primary: 'bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/80 text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40',
        secondary: 'bg-surface/50 text-text hover:bg-surface border-2 border-border/50 hover:border-border',
        disabled: 'bg-border/30 text-text-disabled cursor-not-allowed border-2 border-transparent'
    };

    return (
        <div className={`group p-6 md:p-8 rounded-2xl border transition-all duration-300 ${
            isStepDisabled
                ? 'opacity-60 border-border/50 bg-surface/50'
                : 'border-border/70 bg-surface/80 backdrop-blur-sm hover:border-border shadow-soft hover:shadow-medium hover:bg-surface'
        }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
                {/* Left Side: Icon, Title, Description */}
                <div className="flex-grow flex items-start gap-4 md:gap-5">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ring-2 ${currentStatus.ringColor} bg-gradient-to-br from-background to-background/50 shrink-0 transition-all duration-300 ${!isStepDisabled && 'group-hover:scale-105'}`}>
                        <span className={`material-symbols-outlined !text-3xl md:!text-4xl transition-colors ${currentStatus.textColor}`}>
                            {currentStatus.icon}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-display font-bold text-text mb-1.5 tracking-tight">{title}</h2>
                        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl">{description}</p>
                    </div>
                </div>

                {/* Right Side: Progress & Button */}
                <div className="w-full lg:w-auto lg:min-w-[240px] flex-shrink-0 flex flex-col items-stretch lg:items-end gap-4">
                    {typeof progressPercent !== 'undefined' && status !== 'locked' && (
                        <div className="w-full">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-xs md:text-sm font-sans font-medium text-text-secondary tracking-wide">{progressInfo}</span>
                                {status !== 'completed' &&
                                    <span className="text-sm md:text-base font-display font-bold tabular-nums" style={{color: currentStatus.barColor}}>
                                        {Math.round(progressPercent)}%
                                    </span>
                                }
                            </div>
                            <div className="h-2 w-full bg-border/30 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: currentStatus.barColor }}></div>
                            </div>
                        </div>
                    )}
                     <button
                        onClick={onClick}
                        disabled={isStepDisabled}
                        className={`font-sans font-bold px-8 py-3.5 rounded-xl text-xs md:text-sm tracking-wider transition-all duration-300 whitespace-nowrap w-full text-center active:scale-95 shadow-sm ${buttonStyles[buttonVariant]}`}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ChapterHubView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const { currentChapterId, activities, progress, profile } = state;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const chapter = useMemo(() => currentChapterId ? activities[currentChapterId] : null, [currentChapterId, activities]);
    const chapterProgress = useMemo(() => currentChapterId ? progress[currentChapterId] : null, [currentChapterId, progress]);
    
    const {
        quiz,
        totalQuestions,
        answeredQuestionsCount,
        totalExercises,
        evaluatedExercisesCount,
        isQuizCompleted,
        areAllExercisesDone,
        canSubmitWork,
        quizProgressPercent,
        exercisesProgressPercent,
        isOutdatedSubmission,
        isChapterLocked
    } = useMemo(() => {
        const prog = currentChapterId ? progress[currentChapterId] : null;
        const chap = currentChapterId ? activities[currentChapterId] : null;

    const q = prog?.quiz || { answers: {}, isSubmitted: false, score: 0, allAnswered: false, currentQuestionIndex: 0, duration: 0, hintsUsed: 0, isTimerPaused: true };
        const tq = chap?.quiz?.length || 0;
        const aqc = Object.keys(q.answers).length;
        const te = chap?.exercises?.length || 0;
        const eec = Object.keys(prog?.exercisesFeedback || {}).length;

        const iqc = q.isSubmitted;
        const aed = te > 0 ? eec === te : true;

        // Les vidéos sont optionnelles - ne pas les inclure dans canSubmitWork
        // Seuls le quiz et les exercices sont nécessaires pour la finalisation

        const outdated = prog?.isWorkSubmitted && !!chap?.version && !!prog?.submittedVersion && chap.version !== prog.submittedVersion;
        const locked = prog?.isWorkSubmitted && !outdated;

        let csw = false;
        if (outdated) {
            csw = iqc && aed;
        } else {
            csw = iqc && aed && !prog?.isWorkSubmitted;
        }

        return {
            quiz: q,
            totalQuestions: tq,
            answeredQuestionsCount: aqc,
            totalExercises: te,
            evaluatedExercisesCount: eec,
            isQuizCompleted: iqc,
            areAllExercisesDone: aed,
            canSubmitWork: csw,
            quizProgressPercent: iqc ? 100 : (tq > 0 ? (Math.min(aqc, tq) / tq) * 100 : 0),
            exercisesProgressPercent: te > 0 ? (Math.min(eec, te) / te) * 100 : 100,
            isOutdatedSubmission: outdated,
            isChapterLocked: locked
        };
    }, [currentChapterId, activities, progress]);

    const handleStartVideos = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'videos' } }), [dispatch, chapter?.id]);
    const handleStartQuiz = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'quiz' } }), [dispatch, chapter?.id]);
    const handleReviewQuiz = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'quiz', review: true } }), [dispatch, chapter?.id]);
    const handleStartExercises = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'exercises' } }), [dispatch, chapter?.id]);

    const handleSubmitWork = () => {
        if (!canSubmitWork || isSubmitting || !profile || !chapter || !chapterProgress) return;
        setIsSubmitting(true);
    
        try {
            dispatch({ type: 'SUBMIT_WORK', payload: { chapterId: chapter.id } });
            setConfirmationModalOpen(false);
            
            const form = document.createElement('form');
            form.action = 'https://formsubmit.co/bdh.malek@gmail.com';
            form.method = 'POST';
            form.enctype = 'multipart/form-data';
            form.style.display = 'none';
    
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
    
            const className = CLASS_OPTIONS.find(c => c.value === profile.classId)?.label || profile.classId;
            const quizScorePercentage = totalQuestions > 0 ? (quiz.score / totalQuestions) * 100 : 0;
            
            const quizAnswersForExport: { [qId: string]: number | number[] } = {};
            Object.keys(quiz.answers).forEach(qId => {
                const question = chapter.quiz.find(q => q.id === qId);
                const userAnswer = quiz.answers[qId];

                if (question) {
                    if (question.type === 'ordering' && Array.isArray(userAnswer) && question.steps) {
                        const correctSteps = question.steps;
                        const answerIndices = (userAnswer as string[]).map(stepText => correctSteps.indexOf(stepText));
                        if (!answerIndices.includes(-1)) {
                            quizAnswersForExport[qId] = answerIndices;
                        }
                    } 
                    else if ((!question.type || question.type === 'mcq') && typeof userAnswer === 'string' && question.options) {
                        const answerIndex = question.options.findIndex(opt => opt.text === userAnswer);
                        if (answerIndex !== -1) {
                            quizAnswersForExport[qId] = answerIndex;
                        }
                    }
                }
            });

            const submissionTimestamp = Date.now();
            const submissionDate = new Date(submissionTimestamp).toLocaleString('fr-FR', {
                dateStyle: 'full', timeStyle: 'medium', timeZone: 'UTC'
            });

            // Préparer les données d'export des vidéos si le chapitre en contient
            const videosExport = chapter.videos && chapter.videos.length > 0 && chapterProgress.videos ? {
                watchedCount: Object.values(chapterProgress.videos.watched || {}).filter(Boolean).length,
                totalCount: chapter.videos.length,
                allWatched: chapterProgress.videos.allWatched,
                durationSeconds: chapterProgress.videos.duration || 0,
            } : undefined;

            const videosDuration = chapterProgress.videos?.duration || 0;

            const submissionData: ExportedProgressFile = {
                studentName: profile.name,
                studentLevel: className,
                submissionDate,
                timestamp: submissionTimestamp,
                results: [
                    {
                        chapter: chapter.chapter,
                        version: chapter.version,
                        ...(videosExport && { videos: videosExport }),
                        quiz: {
                            score: parseFloat(quizScorePercentage.toFixed(2)),
                            scoreRaw: `${quiz.score} / ${totalQuestions}`,
                            durationSeconds: chapterProgress.quiz.duration || 0,
                            hintsUsed: chapterProgress.quiz.hintsUsed || 0,
                            answers: quizAnswersForExport,
                        },
                        exercisesFeedback: chapterProgress.exercisesFeedback,
                        exercisesDurationSeconds: chapterProgress.exercisesDuration || 0,
                        totalDurationSeconds: videosDuration + (chapterProgress.quiz.duration || 0) + (chapterProgress.exercisesDuration || 0),
                    }
                ]
            };
            
            const progressJson = JSON.stringify(submissionData, null, 2);
            const blob = new Blob([progressJson], { type: 'application/json' });
            const sanitizedName = profile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `progression_${sanitizedName}_${chapter.id}.json`;
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'attachment';
            fileInput.style.display = 'none';
            
            const file = new File([blob], filename, { type: 'application/json' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            form.appendChild(fileInput);
            document.body.appendChild(form);
            form.submit();
            
            setTimeout(() => {
                if (document.body.contains(form)) {
                    document.body.removeChild(form);
                }
                addNotification("Travail envoyé", 'success', {
                    message: "Votre progression a été enregistrée et envoyée.",
                    action: {
                        label: 'Tableau de bord',
                        onClick: () => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })
                    }
                });
            }, 2000);
            
        } catch (error) {
            console.error("Erreur lors de la préparation de l'envoi:", error);
            addNotification("Erreur d'envoi", 'error', { message: "Une erreur est survenue avant l'envoi. Veuillez réessayer." });
            setIsSubmitting(false);
        }
    };
    
    if (!chapter || !chapterProgress || !profile) {
        console.log('ChapterHubView - Debug info:', {
            hasChapter: !!chapter,
            hasChapterProgress: !!chapterProgress,
            hasProfile: !!profile,
            currentChapterId,
            activitiesKeys: Object.keys(activities),
            progressKeys: Object.keys(progress),
            profile
        });
        
        // Affichage plus informatif selon le problème
        if (!profile) {
            return <div className="text-center p-12">
                <div className="text-lg mb-2">Chargement du profil...</div>
                <div className="text-sm text-secondary">Veuillez patienter</div>
            </div>;
        }
        
        if (!currentChapterId) {
            return <div className="text-center p-12">
                <div className="text-lg mb-2">Aucun chapitre sélectionné</div>
                <div className="text-sm text-secondary">Retournez au tableau de bord pour sélectionner un chapitre</div>
            </div>;
        }
        
        if (!chapter) {
            // Si un chapitre est sélectionné mais n'existe pas dans les activités chargées,
            // rediriger vers le dashboard
            if (Object.keys(activities).length > 0) {
                console.log(`ChapterHubView - Le chapitre '${currentChapterId}' n'existe pas pour la classe '${profile?.classId}'. Redirection vers le dashboard.`);
                dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
                return <div className="text-center p-12">
                    <div className="text-lg mb-2">Chapitre introuvable</div>
                    <div className="text-sm text-secondary">Redirection vers le tableau de bord...</div>
                </div>;
            }
            
            return <div className="text-center p-12">
                <div className="text-lg mb-2">Chargement du chapitre...</div>
                <div className="text-sm text-secondary">ID: {currentChapterId}</div>
            </div>;
        }
        
        return <div className="text-center p-12">
            <div className="text-lg mb-2">Initialisation de la progression...</div>
            <div className="text-sm text-secondary">Chapitre: {chapter.chapter}</div>
        </div>;
    }
    
    // Calcul de la progression des vidéos
    const hasVideos = chapter.videos && chapter.videos.length > 0;
    const videosProgress = chapterProgress.videos;
    const totalVideos = chapter.videos?.length || 0;
    const watchedVideosCount = videosProgress ? Object.values(videosProgress.watched || {}).filter(Boolean).length : 0;
    const areAllVideosWatched = videosProgress?.allWatched || false;
    const videosProgressPercent = totalVideos > 0 ? (watchedVideosCount / totalVideos) * 100 : 0;

    const steps: LearningStepProps[] = [
        ...(hasVideos ? [{
            icon: 'play_circle',
            title: 'Étape 1 : Les Vidéos (optionnel)',
            description: 'Capsules vidéo recommandées pour mieux comprendre le chapitre. Vous pouvez passer directement au quiz si vous le souhaitez.',
            status: (areAllVideosWatched ? 'completed' : watchedVideosCount > 0 ? 'in-progress' : 'todo') as StepStatus,
            progressPercent: videosProgressPercent,
            progressInfo: `${watchedVideosCount} / ${totalVideos}`,
            onClick: handleStartVideos,
            buttonText: isChapterLocked ? 'Consulter' : areAllVideosWatched ? 'Revoir' : watchedVideosCount > 0 ? 'Continuer' : 'Commencer',
            buttonVariant: (isChapterLocked || areAllVideosWatched ? 'secondary' : 'primary') as ButtonVariant,
        }] : []),
        {
            icon: 'history_edu',
            title: hasVideos ? 'Étape 2 : Le Quiz' : 'Étape 1 : Le Quiz',
            description: 'Évaluez votre compréhension des concepts fondamentaux du chapitre.',
            status: isQuizCompleted ? 'completed' : answeredQuestionsCount > 0 ? 'in-progress' : 'todo',
            progressPercent: quizProgressPercent,
            progressInfo: isQuizCompleted ? `Score : ${quiz.score}/${totalQuestions}` : `${answeredQuestionsCount} / ${totalQuestions}`,
            onClick: isQuizCompleted ? handleReviewQuiz : handleStartQuiz,
            buttonText: isChapterLocked ? 'Consulter' : isQuizCompleted ? 'Revoir' : answeredQuestionsCount > 0 ? 'Continuer' : 'Commencer',
            buttonVariant: isChapterLocked || isQuizCompleted ? 'secondary' : 'primary',
        },
        {
            icon: 'architecture',
            title: hasVideos ? 'Étape 3 : Les Exercices' : 'Étape 2 : Les Exercices',
            description: 'Mettez en pratique vos connaissances et auto-évaluez votre maîtrise.',
            status: !isQuizCompleted ? 'locked' : areAllExercisesDone ? 'completed' : evaluatedExercisesCount > 0 ? 'in-progress' : 'todo',
            progressPercent: exercisesProgressPercent,
            progressInfo: totalExercises > 0 ? `${evaluatedExercisesCount} / ${totalExercises}` : 'Aucun exercice',
            onClick: handleStartExercises,
            disabled: !isQuizCompleted,
            buttonText: isChapterLocked ? 'Consulter' : areAllExercisesDone ? 'Revoir' : evaluatedExercisesCount > 0 ? 'Continuer' : 'Commencer',
            buttonVariant: !isQuizCompleted ? 'disabled' : (areAllExercisesDone || isChapterLocked) ? 'secondary' : 'primary',
        },
        ...(!isChapterLocked ? [{
            icon: 'workspace_premium',
            title: hasVideos ? 'Étape 4 : Finalisation' : 'Étape 3 : Finalisation',
            description: isOutdatedSubmission 
                ? 'Le contenu a été mis à jour. Veuillez revoir les étapes avant de renvoyer.' 
                : 'Une fois les étapes terminées, envoyez votre travail pour validation.',
            status: (canSubmitWork ? 'todo' : 'locked') as StepStatus,
            onClick: () => setConfirmationModalOpen(true), disabled: !canSubmitWork || isSubmitting,
            buttonText: isSubmitting ? 'Envoi...' : isOutdatedSubmission ? 'Renvoyer' : 'Finaliser',
            buttonVariant: (canSubmitWork ? 'primary' : 'disabled') as ButtonVariant,
        }] : [])
    ];
    
    return (
        <>
            <GlobalActionButtons />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-slideInUp pb-24 sm:pb-12">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-50">{[...Array(100)].map((_, i) => <div key={i} className="confetti" style={{left: `${Math.random()*100}%`, animationDuration: `${Math.random()*3+2}s`, animationDelay: `${Math.random()*2}s`, backgroundColor: ['#FF6B35','#10B981','#3B82F6','#F59E0B'][i%4]}} />)}</div>
                )}

                <header className="mb-10 sm:mb-16">
                    <div className="relative flex items-center justify-between sm:justify-center mb-6 sm:mb-8">
                        <button
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-text-secondary bg-surface/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:scale-105 transition-all duration-300 active:scale-95 shadow-soft hover:shadow-medium"
                            aria-label="Retour au tableau de bord"
                        >
                            <span className="material-symbols-outlined !text-xl sm:!text-2xl">arrow_back</span>
                        </button>
                        <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                                <span className="material-symbols-outlined !text-sm text-primary">assignment</span>
                                <p className="font-display text-primary tracking-wider uppercase text-xs font-bold">Plan de travail</p>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl text-text font-display font-bold tracking-tight">{chapter.chapter}</h1>
                        </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </header>

                <div className="space-y-5 md:space-y-6">
                    {steps.map((step) => <LearningStep key={step.title} {...step} />)}
                </div>

                {isChapterLocked && (
                    <div className="mt-12 text-center border-2 border-dashed border-success/40 bg-gradient-to-br from-success/10 to-success/5 p-10 md:p-12 rounded-3xl animate-fadeIn shadow-glow-success">
                        <div className="mx-auto w-20 h-20 flex items-center justify-center bg-success/20 rounded-2xl text-success mb-5 shadow-lg">
                            <span className="material-symbols-outlined !text-5xl">verified</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-text mb-3 tracking-tight">Travail Soumis !</h2>
                        <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Félicitations ! Vos réponses ont bien été enregistrées. Nous les examinerons ensemble lors de notre prochaine séance.
                        </p>
                    </div>
                )}
            </div>

            <ConfirmationModal isOpen={isConfirmationModalOpen} onClose={() => setConfirmationModalOpen(false)} onSubmit={handleSubmitWork} isSubmitting={isSubmitting} chapterTitle={chapter.chapter ?? ''} />
            <style>{`.confetti { position: absolute; width: 10px; height: 10px; opacity: 0; animation: confetti-fall 5s ease-in-out infinite; } @keyframes confetti-fall { 0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; } }`}</style>
        </>
    );
};

export default ChapterHubView;