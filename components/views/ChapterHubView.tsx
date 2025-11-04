import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { useLessonProgressSafe } from '../../context/LessonProgressContext';
import { CLASS_OPTIONS } from '../../constants';
import ConfirmationModal from '../ConfirmationModal';
import { useNotification } from '../../context/NotificationContext';
import GlobalActionButtons from '../GlobalActionButtons';
import { ExportedProgressFile } from '../../types';
import StandardHeader from '../StandardHeader';
import {
    LESSON_PROGRESS_EVENT,
    readLessonCompletion,
    summarizeLessonRecord,
    type LessonCompletionSummary,
    type LessonProgressEventDetail,
} from '../../utils/lessonProgressHelpers';


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

    return (
        <div className={`learning-step group transition-all duration-300 ${
            isStepDisabled ? 'learning-step--disabled' : ''
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
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                                <div 
                                    className="h-full transition-all duration-700 ease-out rounded-full relative"
                                    style={{ 
                                        width: `${progressPercent}%`, 
                                        background: `linear-gradient(90deg, ${currentStatus.barColor}, ${currentStatus.barColor}dd)`,
                                        boxShadow: progressPercent > 0 ? `0 0 8px ${currentStatus.barColor}40` : 'none'
                                    }}
                                >
                                    {progressPercent > 10 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                     <button
                        onClick={onClick}
                        disabled={isStepDisabled}
                        className={`learning-step__button w-full text-center ${
                            isStepDisabled 
                                ? 'learning-step__button--disabled'
                                : buttonVariant === 'primary' 
                                    ? 'learning-step__button--primary' 
                                    : 'learning-step__button--secondary'
                        }`}
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
    const lessonProgressContext = useLessonProgressSafe();
    const { currentChapterId, activities, progress, profile } = state;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Easter egg: Triple-click on verified badge to resend work
    const [verifiedClickCount, setVerifiedClickCount] = useState(0);
    const verifiedClickTimerRef = useRef<NodeJS.Timeout | null>(null);

    const chapter = useMemo(() => currentChapterId ? activities[currentChapterId] : null, [currentChapterId, activities]);
    const chapterProgress = useMemo(() => currentChapterId ? progress[currentChapterId] : null, [currentChapterId, progress]);
    const lessonId = chapter ? `${chapter.class}-${chapter.chapter}` : null;

    const [lessonCompletion, setLessonCompletion] = useState<LessonCompletionSummary>({
        completed: 0,
        total: 0,
        percentage: 0,
    });

    useEffect(() => {
        if (!lessonId) {
            setLessonCompletion({ completed: 0, total: 0, percentage: 0 });
            return;
        }

        setLessonCompletion(readLessonCompletion(lessonId));

        const handleProgressUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<LessonProgressEventDetail>;
            if (customEvent.detail?.lessonId !== lessonId) {
                return;
            }

            setLessonCompletion(summarizeLessonRecord(customEvent.detail.progress));
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate as EventListener);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate as EventListener);
            }
        };
    }, [lessonId]);
    
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
    const handleStartLesson = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'lesson' } }), [dispatch, chapter?.id]);
    const handleStartQuiz = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'quiz' } }), [dispatch, chapter?.id]);
    const handleReviewQuiz = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'quiz', review: true } }), [dispatch, chapter?.id]);
    const handleStartExercises = useCallback(() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter?.id, subView: 'exercises' } }), [dispatch, chapter?.id]);

    // Easter egg: Triple-click on verified badge to resend work
    const handleVerifiedBadgeClick = () => {
        // Clear existing timer if any
        if (verifiedClickTimerRef.current) {
            clearTimeout(verifiedClickTimerRef.current);
        }

        const newCount = verifiedClickCount + 1;
        setVerifiedClickCount(newCount);

        if (newCount === 3) {
            // Triple-click achieved! Reset counter and resend work
            setVerifiedClickCount(0);
            console.log('Easter egg activated! Resending work...');

            addNotification("Renvoi du travail", 'info', {
                message: "Fonctionnalité cachée activée ! Le travail sera renvoyé.",
                duration: 3000
            });

            // Trigger resubmission (bypassing the canSubmitWork check since work was already submitted)
            if (!isSubmitting && profile && chapter && chapterProgress) {
                handleSubmitWork(true); // Force resend
            }
        } else {
            // Reset counter after 2 seconds if not clicked again
            verifiedClickTimerRef.current = setTimeout(() => {
                setVerifiedClickCount(0);
                verifiedClickTimerRef.current = null;
            }, 2000);
        }
    };

    const handleSubmitWork = async (forceResend: boolean = false) => {
        // Allow resubmission if forceResend is true (easter egg feature)
        const canProceed = forceResend || canSubmitWork;
        if (!canProceed || isSubmitting || !profile || !chapter || !chapterProgress) return;
        setIsSubmitting(true);

        try {
            dispatch({ type: 'SUBMIT_WORK', payload: { chapterId: chapter.id } });
            setConfirmationModalOpen(false);

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

            // Récupérer la progression de la leçon depuis le contexte (si disponible)
            const lessonProgressData = lessonProgressContext?.lessonProgress ?? lessonCompletion;

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
                        ...(lessonProgressData.total > 0 && {
                            lesson: {
                                completed: lessonProgressData.completed,
                                total: lessonProgressData.total,
                                percentage: lessonProgressData.percentage,
                            },
                        }),
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

            // Store submission data locally before attempting to send
            const submissionKey = `pending_submission_${submissionTimestamp}`;
            localStorage.setItem(submissionKey, progressJson);

            // Attempt submission with timeout and retry logic using our own API
            let submitSuccessful = false;
            let lastError: Error | null = null;
            const maxRetries = 3;
            const timeoutMs = 15000; // 15 seconds timeout (our API is faster than FormSubmit.co)

            for (let attempt = 0; attempt < maxRetries && !submitSuccessful; attempt++) {
                try {
                    console.log(`Submission attempt ${attempt + 1}/${maxRetries}...`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                    // Call our Vercel API endpoint
                    const response = await fetch('/api/submit-work', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            studentName: profile.name,
                            chapterTitle: chapter.chapter,
                            progressData: submissionData
                        }),
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const result = await response.json();
                        // Success - remove from pending submissions
                        localStorage.removeItem(submissionKey);
                        submitSuccessful = true;
                        console.log('Submission successful! Message ID:', result.messageId);

                        addNotification("Travail envoyé", 'success', {
                            message: "Votre progression a été enregistrée et envoyée avec succès.",
                            action: {
                                label: 'Tableau de bord',
                                onClick: () => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })
                            }
                        });
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`Server responded with status ${response.status}: ${errorData.error || response.statusText}`);
                    }
                } catch (error) {
                    lastError = error as Error;
                    console.error(`Submission attempt ${attempt + 1} failed:`, error);

                    // Wait before retrying (exponential backoff: 2s, 4s, 8s)
                    if (attempt < maxRetries - 1) {
                        const waitTime = Math.pow(2, attempt + 1) * 1000;
                        console.log(`Waiting ${waitTime / 1000}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }

            if (!submitSuccessful) {
                // All retries failed - notify user and keep in localStorage for manual retry
                const errorMessage = lastError?.name === 'AbortError'
                    ? "Le délai d'envoi a expiré (15s). Vérifiez votre connexion internet."
                    : lastError?.message?.includes('500')
                    ? "Le serveur rencontre des problèmes (erreur 500). Vos données sont sauvegardées."
                    : lastError?.message?.includes('Failed to send email')
                    ? "Erreur lors de l'envoi de l'email. Vos données sont sauvegardées localement."
                    : "Impossible d'envoyer le rapport. Vos données sont sauvegardées localement.";

                console.error('All submission attempts failed. Data stored locally:', submissionKey);
                console.error('Last error details:', lastError);

                addNotification("Échec d'envoi", 'error', {
                    message: errorMessage,
                    action: {
                        label: 'Réessayer',
                        onClick: () => handleSubmitWork()
                    }
                });

                setIsSubmitting(false);
                return;
            }

            setIsSubmitting(false);

        } catch (error) {
            console.error("Erreur lors de la préparation de l'envoi:", error);
            addNotification("Erreur d'envoi", 'error', {
                message: "Une erreur est survenue lors de la préparation. Veuillez réessayer.",
                action: {
                    label: 'Réessayer',
                    onClick: () => {
                        setIsSubmitting(false);
                        setConfirmationModalOpen(true);
                    }
                }
            });
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

    // Calcul de la progression de la leçon
    const hasLesson = !!(chapter.lesson || chapter.lessonFile);
    const lessonMetaProgress = chapterProgress.lesson;
    const isLessonRead = lessonMetaProgress?.isRead || false;
    const lessonScrollProgress = lessonMetaProgress?.scrollProgress || 0;

    const lessonReadPercentage = lessonCompletion.percentage;
    const lessonTotalNodes = lessonCompletion.total;
    const lessonCompletedNodes = lessonCompletion.completed;

    const steps: LearningStepProps[] = [
        // NOUVELLE ÉTAPE : Leçon (en premier)
        {
            icon: 'menu_book',
            title: 'Étape 0 : La Leçon',
            description: hasLesson
                ? 'Consultez le cours complet avec définitions, théorèmes et exemples détaillés.'
                : 'La leçon pour ce chapitre sera bientôt disponible.',
            status: hasLesson
                ? (lessonReadPercentage === 100 ? 'completed' : lessonReadPercentage > 0 ? 'in-progress' : 'todo') as StepStatus
                : 'locked' as StepStatus,
            progressPercent: hasLesson ? lessonReadPercentage : undefined,
            progressInfo: hasLesson && lessonTotalNodes > 0 ? `${lessonCompletedNodes} / ${lessonTotalNodes}` : undefined,
            onClick: hasLesson ? handleStartLesson : () => {},
            disabled: !hasLesson,
            buttonText: hasLesson
                ? (isChapterLocked ? 'Consulter' : lessonReadPercentage === 100 ? 'Relire' : lessonReadPercentage > 0 ? 'Continuer' : 'Commencer')
                : 'À venir',
            buttonVariant: hasLesson
                ? ((isChapterLocked || lessonReadPercentage === 100 ? 'secondary' : 'primary') as ButtonVariant)
                : 'disabled' as ButtonVariant,
        },
        {
            icon: 'play_circle',
            title: 'Étape 1 : Les Vidéos',
            description: hasVideos 
                ? 'Capsules vidéo recommandées pour mieux comprendre le chapitre. Vous pouvez passer directement au quiz si vous le souhaitez.'
                : 'Les vidéos pour ce chapitre seront bientôt disponibles.',
            status: hasVideos 
                ? (areAllVideosWatched ? 'completed' : watchedVideosCount > 0 ? 'in-progress' : 'todo') as StepStatus
                : 'locked' as StepStatus,
            progressPercent: hasVideos ? videosProgressPercent : 0,
            progressInfo: hasVideos ? `${watchedVideosCount} / ${totalVideos}` : undefined,
            onClick: hasVideos ? handleStartVideos : () => {},
            disabled: !hasVideos,
            buttonText: hasVideos 
                ? (isChapterLocked ? 'Consulter' : areAllVideosWatched ? 'Revoir' : watchedVideosCount > 0 ? 'Continuer' : 'Commencer')
                : 'À venir',
            buttonVariant: hasVideos 
                ? ((isChapterLocked || areAllVideosWatched ? 'secondary' : 'primary') as ButtonVariant)
                : 'disabled' as ButtonVariant,
        },
        {
            icon: 'history_edu',
            title: 'Étape 2 : Le Quiz',
            description: lessonReadPercentage < 100 
                ? 'Terminez la leçon à 100% pour débloquer le quiz.'
                : 'Évaluez votre compréhension des concepts fondamentaux du chapitre.',
            status: lessonReadPercentage < 100 
                ? 'locked' 
                : (isQuizCompleted ? 'completed' : answeredQuestionsCount > 0 ? 'in-progress' : 'todo'),
            progressPercent: quizProgressPercent,
            progressInfo: lessonReadPercentage < 100 
                ? `Leçon : ${lessonReadPercentage}%`
                : (isQuizCompleted ? `Score : ${quiz.score}/${totalQuestions}` : `${answeredQuestionsCount} / ${totalQuestions}`),
            onClick: lessonReadPercentage < 100 ? () => {} : (isQuizCompleted ? handleReviewQuiz : handleStartQuiz),
            disabled: lessonReadPercentage < 100,
            buttonText: lessonReadPercentage < 100 
                ? 'Verrouillé'
                : (isChapterLocked ? 'Consulter' : isQuizCompleted ? 'Revoir' : answeredQuestionsCount > 0 ? 'Continuer' : 'Commencer'),
            buttonVariant: lessonReadPercentage < 100 
                ? 'disabled'
                : (isChapterLocked || isQuizCompleted ? 'secondary' : 'primary'),
        },
        {
            icon: 'architecture',
            title: 'Étape 3 : Les Exercices',
            description: 'Mettez en pratique vos connaissances et auto-évaluez votre maîtrise.',
            status: !isQuizCompleted ? 'locked' : areAllExercisesDone ? 'completed' : evaluatedExercisesCount > 0 ? 'in-progress' : 'todo',
            progressPercent: exercisesProgressPercent,
            progressInfo: totalExercises > 0 ? `${evaluatedExercisesCount} / ${totalExercises}` : 'Aucun exercice',
            onClick: handleStartExercises,
            disabled: !isQuizCompleted,
            buttonText: isChapterLocked ? 'Consulter' : areAllExercisesDone ? 'Revoir' : evaluatedExercisesCount > 0 ? 'Continuer' : 'Commencer',
            buttonVariant: !isQuizCompleted ? 'disabled' : (areAllExercisesDone || isChapterLocked) ? 'secondary' : 'primary',
        }
    ];
    
    return (
        <>
            <GlobalActionButtons />
            
            {/* Bouton retour flottant similaire aux leçons */}
            <div className="chapter-hub-back-floating">
                <button
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                    className="standard-header__back-btn standard-header__back-btn--lesson"
                    aria-label="Retour au tableau de bord"
                    title="Retour au tableau de bord"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>
            
            <div className="chapter-hub-container max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 animate-slideInUp pb-20 sm:pb-16 md:pb-12 pt-4 sm:pt-6 md:pt-8">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-50">{[...Array(100)].map((_, i) => <div key={i} className="confetti" style={{left: `${Math.random()*100}%`, animationDuration: `${Math.random()*3+2}s`, animationDelay: `${Math.random()*2}s`, backgroundColor: ['#FF6B35','#10B981','#3B82F6','#F59E0B'][i%4]}} />)}</div>
                )}

                <StandardHeader
                    title={chapter.chapter}
                    badgeText="Plan de travail"
                    className="chapter-hub-header"
                />

                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    {steps.map((step) => <LearningStep key={step.title} {...step} />)}
                </div>

                {/* Bouton de Finalisation (seulement si le chapitre n'est pas verrouillé) */}
                {!isChapterLocked && (
                    <div className="mt-6 sm:mt-8 px-2 sm:px-0">
                        <button
                            onClick={() => setConfirmationModalOpen(true)}
                            disabled={!canSubmitWork || isSubmitting}
                            className={`finalization-button w-full group relative overflow-hidden ${
                                !canSubmitWork || isSubmitting ? '' : ''
                            }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                <span className="material-symbols-outlined !text-xl sm:!text-2xl">
                                    {isSubmitting ? 'hourglass_empty' : 'workspace_premium'}
                                </span>
                                <span className="text-sm sm:text-base font-semibold">
                                    {isSubmitting ? 'Envoi en cours...' : isOutdatedSubmission ? 'Renvoyer mon travail' : 'Finaliser et envoyer'}
                                </span>
                            </span>
                            {canSubmitWork && !isSubmitting && (
                                <div className="finalization-button__shimmer" />
                            )}
                        </button>
                        {isOutdatedSubmission && (
                            <p className="mt-3 text-sm text-orange-600 text-center font-medium">
                                ⚠️ Le contenu a été mis à jour. Veuillez revoir les étapes avant de renvoyer.
                            </p>
                        )}
                        {!canSubmitWork && !isSubmitting && (
                            <p className="mt-3 text-sm text-gray-500 text-center">
                                Terminez le quiz et évaluez tous les exercices pour finaliser votre travail.
                            </p>
                        )}
                    </div>
                )}

                {isChapterLocked && (
                    <div className="mt-8 md:mt-12 text-center border-2 border-dashed border-success/40 bg-gradient-to-br from-success/10 to-success/5 p-6 md:p-10 rounded-2xl md:rounded-3xl animate-fadeIn shadow-glow-success">
                        <div
                            className="mx-auto w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-success/20 rounded-xl md:rounded-2xl text-success mb-4 md:mb-5 shadow-lg cursor-pointer hover:bg-success/30 transition-all duration-200 active:scale-95 select-none"
                            onClick={handleVerifiedBadgeClick}
                            title="Cliquez 3 fois pour renvoyer le travail"
                        >
                            <span className="material-symbols-outlined !text-4xl md:!text-5xl pointer-events-none">verified</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-text mb-2 md:mb-3 tracking-tight">Travail Soumis !</h2>
                        <p className="text-sm md:text-base lg:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed px-4">
                            Félicitations ! Vos réponses ont bien été enregistrées. Nous les examinerons lors de notre prochaine séance.
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