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
        primary: 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20',
        secondary: 'bg-surface text-text hover:bg-border border border-border',
        disabled: 'bg-border text-text-disabled cursor-not-allowed'
    };

    return (
        <div className={`p-6 rounded-xl border border-border transition-all duration-200 bg-surface ${isStepDisabled ? 'opacity-70' : 'shadow-sm'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Left Side: Icon, Title, Description */}
                <div className="flex-grow flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ${currentStatus.ringColor} bg-background shrink-0`}>
                        <span className={`material-symbols-outlined !text-2xl transition-colors ${currentStatus.textColor}`}>
                            {currentStatus.icon}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-title text-text">{title}</h2>
                        <p className="text-secondary text-sm mt-1 font-sans italic max-w-md">{description}</p>
                    </div>
                </div>

                {/* Right Side: Progress & Button */}
                <div className="w-full sm:w-auto sm:max-w-sm flex-shrink-0 flex flex-col items-end gap-4">
                    {typeof progressPercent !== 'undefined' && status !== 'locked' && (
                        <div className="w-full">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-button font-semibold text-secondary">{progressInfo}</span>
                                {status !== 'completed' && 
                                    <span className="text-sm font-button font-bold" style={{color: currentStatus.barColor}}>
                                        {Math.round(progressPercent)}%
                                    </span>
                                }
                            </div>
                            <div className="h-2.5 w-full bg-border/50 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: currentStatus.barColor }}></div>
                            </div>
                        </div>
                    )}
                     <button
                        onClick={onClick}
                        disabled={isStepDisabled}
                        className={`font-button font-semibold px-6 py-2 rounded-lg text-sm transition-all duration-200 whitespace-nowrap w-full text-center active:scale-95 ${buttonStyles[buttonVariant]}`}
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

        // Vérifier si les vidéos sont complétées (si le chapitre en a)
        const hasVids = chap?.videos && chap.videos.length > 0;
        const areVideosCompleted = hasVids ? (prog?.videos?.allWatched || false) : true;

        const outdated = prog?.isWorkSubmitted && !!chap?.version && !!prog?.submittedVersion && chap.version !== prog.submittedVersion;
        const locked = prog?.isWorkSubmitted && !outdated;

        let csw = false;
        if (outdated) {
            csw = iqc && aed && areVideosCompleted;
        } else {
            csw = iqc && aed && areVideosCompleted && !prog?.isWorkSubmitted;
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
            title: 'Étape 1 : Les Vidéos',
            description: 'Visionnez les capsules vidéo pour comprendre les concepts clés du chapitre.',
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
            <div className="max-w-3xl mx-auto animate-slideInUp pb-24 sm:pb-8">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-50">{[...Array(100)].map((_, i) => <div key={i} className="confetti" style={{left: `${Math.random()*100}%`, animationDuration: `${Math.random()*3+2}s`, animationDelay: `${Math.random()*2}s`, backgroundColor: ['#FF6B35','#10B981','#3B82F6','#F59E0B'][i%4]}} />)}</div>
                )}
                
                <header className="mb-8 sm:mb-12">
                    <div className="relative flex items-center justify-center h-12">
                        <div className="absolute left-0">
                            <button 
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })} 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-text-secondary bg-surface border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md" 
                                aria-label="Retour au tableau de bord"
                            >
                                <span className="material-symbols-outlined !text-2xl">arrow_back</span>
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="font-brand text-primary tracking-[0.2em] uppercase text-xs mb-2">Plan de travail</p>
                            <h1 className="text-2xl sm:text-3xl text-text font-title">{chapter.chapter}</h1>
                            <div className="w-24 h-px bg-border mx-auto mt-4"></div>
                        </div>
                    </div>
                </header>

                <div className="space-y-6">
                    {steps.map((step) => <LearningStep key={step.title} {...step} />)}
                </div>

                {isChapterLocked && (
                    <div className="mt-12 text-center border-2 border-dashed border-success/50 bg-success/5 p-8 rounded-2xl animate-fadeIn">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-success/10 rounded-full text-success mb-4">
                            <span className="material-symbols-outlined !text-4xl">verified</span>
                        </div>
                        <h2 className="text-3xl font-title text-text">Travail Soumis !</h2>
                        <p className="text-lg text-secondary mt-2 font-sans italic">
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