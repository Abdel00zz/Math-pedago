import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Option } from '../../types';
import OrderingQuestion from './OrderingQuestion';
import FormattedText from '../FormattedText';
import { useMathJax } from '../../hooks/useMathJax';

const Quiz: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress, isReviewMode } = state;

    const windowSize = 7;

    // Références pour le timer et la fenêtre de navigation
    const timerRef = useRef<number | null>(null);
    const latestTimeRef = useRef<number>(0);

    // ✅ OPTIMISATION 1: Références stables mémorisées
    const chapter = useMemo(() => 
        currentChapterId ? activities[currentChapterId] : null, 
        [currentChapterId, activities]
    );

    const quizProgress = useMemo(() => 
        currentChapterId ? progress[currentChapterId]?.quiz : null, 
        [currentChapterId, progress]
    );
    
    const { 
        currentQuestionIndex = 0, 
        answers = {},
        isSubmitted = false,
        allAnswered = false, 
        score = 0, 
        hintsUsed = 0, 
        duration: persistedDuration = 0
    } = quizProgress || {};

    const [timeSpent, setTimeSpent] = useState(() => persistedDuration);

    useEffect(() => {
        setTimeSpent(persistedDuration);
        latestTimeRef.current = persistedDuration;
    }, [persistedDuration]);

    useEffect(() => {
        latestTimeRef.current = timeSpent;
    }, [timeSpent]);

    const question = useMemo(() => 
        chapter?.quiz[currentQuestionIndex], 
        [chapter, currentQuestionIndex]
    );

    const [windowStart, setWindowStart] = useState(() => Math.max(0, Math.floor(currentQuestionIndex / windowSize) * windowSize));

    useEffect(() => {
        if (!chapter) return;
        const total = chapter.quiz.length;
        const maxStart = Math.max(0, total - windowSize);
        const desiredStart = Math.min(Math.max(0, Math.floor(currentQuestionIndex / windowSize) * windowSize), maxStart);
        setWindowStart(prev => (prev === desiredStart ? prev : desiredStart));
    }, [chapter, currentQuestionIndex]);

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

    const navigationWindow = useMemo(() => {
        if (!chapter) return [] as { id: string; globalIndex: number }[];
        return chapter.quiz.slice(windowStart, windowStart + windowSize).map((q, localIndex) => ({
            id: q.id,
            globalIndex: windowStart + localIndex,
        }));
    }, [chapter, windowStart]);

    const canScrollPrev = windowStart > 0;
    const canScrollNext = useMemo(() => {
        if (!chapter) return false;
        return windowStart + windowSize < chapter.quiz.length;
    }, [chapter, windowStart]);

    const handleWindowShift = useCallback((direction: 'prev' | 'next') => {
        if (!chapter) return;
        const total = chapter.quiz.length;
        const maxStart = Math.max(0, total - windowSize);
        setWindowStart(prev => {
            if (direction === 'prev') {
                return Math.max(0, prev - windowSize);
            }
            return Math.min(maxStart, prev + windowSize);
        });
    }, [chapter]);

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
        const seconds = (timeSpent % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [timeSpent]);
    useEffect(() => {
        // Ne démarrer le timer que si nécessaire
        if (isReviewMode || isSubmitted) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }
        
        timerRef.current = window.setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isReviewMode, isSubmitted]);

    useEffect(() => {
        if (!chapter) return;
        return () => {
            dispatch({
                type: 'SET_QUIZ_DURATION',
                payload: { chapterId: chapter.id, duration: latestTimeRef.current },
            });
        };
    }, [chapter, dispatch]);

    useEffect(() => {
        if (!chapter) return;
        const handleBeforeUnload = () => {
            dispatch({
                type: 'SET_QUIZ_DURATION',
                payload: { chapterId: chapter.id, duration: latestTimeRef.current },
            });
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [chapter, dispatch]);

    useEffect(() => {
        if (!chapter) return;
        if (isReviewMode || isSubmitted) {
            dispatch({
                type: 'SET_QUIZ_DURATION',
                payload: { chapterId: chapter.id, duration: latestTimeRef.current },
            });
        }
    }, [chapter, dispatch, isReviewMode, isSubmitted]);

    // Hook MathJax optimisé pour le rendu des questions
    useMathJax(
        [question, isSubmitted, isReviewMode], 
        { 
            delay: 100,
            containerId: 'quiz-container',
            onSuccess: () => console.log('✅ Question rendue avec MathJax'),
            onError: (error) => console.error('❌ Erreur MathJax Quiz:', error)
        }
    );

    // ✅ OPTIMISATION 3: Handlers mémorisés avec useCallback
    const handleOptionChange = useCallback((answer: string) => {
        if (isSubmitted || !question) return;
        dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: question.id, answer } });
    }, [dispatch, isSubmitted, question]);

    const handleNavigate = useCallback((index: number) => {
        if (index >= 0 && chapter && index < chapter.quiz.length) {
            dispatch({ type: 'NAVIGATE_QUIZ', payload: index });
        }
    }, [dispatch, chapter]);

    // ✅ Calculer les questions non répondues
    const unansweredQuestions = useMemo(() => {
        if (!chapter) return [];
        return chapter.quiz.filter(q => !answers[q.id]);
    }, [chapter, answers]);

    const allQuestionsAnswered = useMemo(() => {
        return unansweredQuestions.length === 0;
    }, [unansweredQuestions]);

    const handleSubmit = useCallback(() => {
        if (!chapter || !allQuestionsAnswered) return;

        // ✅ OPTIMISATION 4: Calcul de score optimisé
        const finalScore = chapter.quiz.reduce((acc, q) => {
            const userAnswer = answers[q.id];

            if (!q.type || q.type === 'mcq') {
                const correctOption = q.options?.find(opt => opt.isCorrect)?.text;
                return (typeof userAnswer === 'string' && userAnswer === correctOption) ? acc + 1 : acc;
            }

            if (q.type === 'ordering') {
                const isCorrect = Array.isArray(userAnswer) &&
                                 q.steps &&
                                 JSON.stringify(userAnswer) === JSON.stringify(q.steps);
                return isCorrect ? acc + 1 : acc;
            }

            return acc;
        }, 0);

        dispatch({
            type: 'SUBMIT_QUIZ',
            payload: { score: finalScore, duration: timeSpent, hintsUsed: 0 }
        });
    }, [chapter, answers, dispatch, timeSpent]);

    // ✅ AMÉLIORATION: Navigation au clavier (flèches gauche/droite et touches 1-4 pour les options)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (isSubmitted || isReviewMode) return;

            // Navigation avec flèches
            if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
                handleNavigate(currentQuestionIndex - 1);
            } else if (e.key === 'ArrowRight' && currentQuestionIndex < (chapter?.quiz.length || 0) - 1) {
                handleNavigate(currentQuestionIndex + 1);
            }

            // Sélection rapide avec touches numériques (1-4)
            if (question && (!question.type || question.type === 'mcq') && question.options) {
                const numKey = parseInt(e.key);
                if (numKey >= 1 && numKey <= question.options.length) {
                    const selectedOption = question.options[numKey - 1];
                    handleOptionChange(selectedOption.text);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentQuestionIndex, chapter, question, isSubmitted, isReviewMode, handleNavigate, handleOptionChange]);

    // ✅ OPTIMISATION 5: Fonction getOptionClass mémorisée avec couleurs pédagogiques et lisibilité améliorée - Optimisé pour mobile
    const getOptionClass = useCallback((option: Option, isSelected: boolean) => {
        const base = 'group relative w-full text-left px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ease-in-out flex items-start gap-2 sm:gap-3 md:gap-4 font-sans backdrop-blur-sm active:scale-[0.99] touch-manipulation';

        if (isReviewMode || isSubmitted) {
            if (option.isCorrect) {
                return `${base} bg-green-50 border-green-500 text-[#1a1a1a] shadow-[0_8px_30px_rgba(34,197,94,0.25)]`;
            }
            if (isSelected && !option.isCorrect) {
                return `${base} bg-red-50 border-red-400 text-[#1a1a1a] shadow-[0_8px_30px_rgba(239,68,68,0.25)]`;
            }
            return `${base} border-gray-200 bg-gray-50 text-gray-600 cursor-default opacity-70`;
        }

        if (isSelected) {
            return `${base} border-blue-500 bg-blue-50 text-[#000000] shadow-[0_12px_40px_rgba(59,130,246,0.3)] scale-[1.02] font-medium ring-2 ring-blue-200`;
        }
        return `${base} border-slate-300 bg-white text-[#1a1a1a] hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] sm:hover:scale-[1.01]`;
    }, [isReviewMode, isSubmitted]);

    if (!chapter || !quizProgress || !question) {
        return <div>Loading quiz...</div>;
    }

    // --- RENDER LOGIC ---

    if (isSubmitted && !isReviewMode) {
        const percentage = Math.round((score / chapter.quiz.length) * 100);
        const { color, message } = percentage >= 80 
            ? { color: 'text-success', message: 'Excellent travail !' }
            : percentage >= 50 
            ? { color: 'text-warning', message: 'Bien joué !' }
            : { color: 'text-error', message: 'Continuez vos efforts !' };

        return (
            <div className="text-center p-6 animate-fadeIn">
                <div className="bg-surface border border-border rounded-2xl coursera-shadow-card max-w-2xl mx-auto p-8">
                    <h2 className="text-4xl font-playfair text-text mb-2">{message}</h2>
                    <p className="text-secondary serif-text text-lg">Votre score au quiz est de :</p>
                    <p className={`text-7xl font-bold my-4 ${color}`}>{percentage}%</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <p className="font-bold text-text text-xl">{score} / {chapter.quiz.length}</p>
                            <p className="text-secondary text-sm">Bonnes réponses</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <p className="font-bold text-text text-xl">
                                {Math.floor(quizProgress.duration / 60)}m {quizProgress.duration % 60}s
                            </p>
                            <p className="text-secondary text-sm">Temps écoulé</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <p className="font-bold text-text text-xl">{hintsUsed}</p>
                            <p className="text-secondary text-sm">Indices utilisés</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
                        <button 
                            onClick={() => dispatch({ 
                                type: 'CHANGE_VIEW', 
                                payload: { view: 'activity', chapterId: chapter.id, subView: 'exercises' } 
                            })}
                            className="font-button w-full sm:w-auto px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-transform transform hover:-translate-y-px active:scale-95 text-lg"
                        >
                            Passer aux exercices
                        </button>
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_REVIEW_MODE', payload: true })}
                            className="font-button w-full sm:w-auto px-6 py-2 font-semibold text-primary border border-primary rounded-lg hover:bg-primary-light"
                        >
                            Revoir mes réponses
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <style>{`
                @keyframes scaleIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
            <div id="quiz-container" className="font-sans max-w-3xl mx-auto px-3 sm:px-4 md:px-6">

            {/* Question Navigator - Optimisé pour mobile */}
            <div className="mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-4">
                <button
                    type="button"
                    onClick={() => handleWindowShift('prev')}
                    disabled={!canScrollPrev}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-text-secondary transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0"
                    aria-label="Afficher les questions précédentes"
                >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <div key={windowStart} className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full px-1">
                    {navigationWindow.map(({ id, globalIndex }) => {
                        const isAnswered = !!answers[id];
                        const isCurrent = globalIndex === currentQuestionIndex;
                        const isUnanswered = !isAnswered;

                        const baseClasses = 'quiz-nav-dot';

                        const stateClasses = isCurrent
                            ? ' quiz-nav-dot--current'
                            : isAnswered
                            ? ' quiz-nav-dot--answered'
                            : ' quiz-nav-dot--pending';

                        return (
                            <button
                                key={id}
                                onClick={() => handleNavigate(globalIndex)}
                                className={`${baseClasses}${stateClasses}`}
                                title={isUnanswered ? `Question ${globalIndex + 1} non répondue` : `Question ${globalIndex + 1}`}
                                aria-label={`Aller à la question ${globalIndex + 1}${isUnanswered ? ' (non répondue)' : ''}`}
                                disabled={isCurrent}
                            >
                                <span>{globalIndex + 1}</span>
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => handleWindowShift('next')}
                    disabled={!canScrollNext}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-text-secondary transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0"
                    aria-label="Afficher les questions suivantes"
                >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
            </div>
            
            {/* Alerte questions non répondues */}
            {!allQuestionsAnswered && currentQuestionIndex === chapter.quiz.length - 1 && (
                <div className="mb-6 px-5 py-4 rounded-2xl border border-warning/35 bg-warning/5 backdrop-blur-sm shadow-[0_12px_30px_rgba(245,158,11,0.12)] animate-alertCard">
                    <p className="text-sm text-warning">Encore {unansweredQuestions.length} question(s) à compléter avant l'envoi.</p>
                    <p className="text-text-secondary text-sm mt-2">
                        Rejoignez-les via les pastilles lumineuses ci-dessus.
                    </p>
                </div>
            )}

            {(!question.type || question.type === 'mcq') && (
                <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-surface/70 backdrop-blur-sm shadow-[0_28px_68px_rgba(15,23,42,0.45)] p-4 sm:p-6 md:p-8 animate-fadeIn quiz-content">
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Question {currentQuestionIndex + 1} sur {chapter.quiz.length}
                        </p>
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-background/70 border border-border/70 text-xs text-text">
                            <span className="uppercase tracking-[0.28em] text-[8px] sm:text-[9px] text-text-secondary">Timer</span>
                            <span className="font-mono text-xs sm:text-sm leading-none">{formattedTime}</span>
                        </span>
                    </div>
                    <div className="quiz-question-panel">
                        <h3 className="quiz-question-text font-display leading-relaxed font-semibold text-base sm:text-lg md:text-xl">
                            <FormattedText text={question.question} />
                        </h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {question.options?.map((option, index) => {
                            const isSelected = answers[question.id] === option.text;
                            const optionClass = getOptionClass(option, isSelected);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionChange(option.text)}
                                    className={optionClass}
                                    disabled={isSubmitted}
                                >
                                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                                        {(isReviewMode || isSubmitted) ? (
                                            option.isCorrect ? (
                                                <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                                                    <span className="material-symbols-outlined text-green-600 relative z-10 drop-shadow-lg text-xl sm:text-2xl">check_circle</span>
                                                </div>
                                            ) : isSelected ? (
                                                <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-red-500 relative z-10 drop-shadow-lg text-xl sm:text-2xl">cancel</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-text-disabled/40 rounded-full"></div>
                                            )
                                        ) : (
                                            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                                    : 'border-slate-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            }`}>
                                                {isSelected && (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-[scaleIn_0.3s_ease-out]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex-1 text-left quiz-choice-text leading-relaxed font-medium text-sm sm:text-base">
                                        <FormattedText text={option.text} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {question.type === 'ordering' && (
                <OrderingQuestion
                    key={question.id}
                    question={question}
                    userAnswer={answers[question.id] as string[] | undefined}
                    isReviewMode={isReviewMode}
                    isSubmitted={isSubmitted}
                    onOptionChange={(answer) => dispatch({ 
                        type: 'UPDATE_QUIZ_ANSWER', 
                        payload: { qId: question.id, answer } 
                    })}
                />
            )}

            {/* Explanation Section */}
            {(() => {
                const correctOption = question.options?.find(o => o.isCorrect);
                const explanationText = question.explanation || correctOption?.explanation;
                const userAnswer = answers[question.id];
                const selectedOption = question.options?.find(o => o.text === userAnswer);
                
                // 🔍 DEBUG LOG
                console.log('[Quiz Explanation Debug]', {
                    questionId: question.id,
                    isReviewMode,
                    isSubmitted,
                    hasExplanation: !!explanationText,
                    explanationText,
                    correctOption: correctOption?.text,
                    userAnswer,
                    selectedOption: selectedOption?.text,
                    isCorrect: selectedOption?.isCorrect
                });
                
                // Afficher l'explication si en mode révision OU si le quiz est soumis
                if ((isReviewMode || isSubmitted) && explanationText) {
                    return (
                        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50/50 rounded-lg sm:rounded-xl border-2 border-blue-200 animate-fadeIn shadow-sm">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <span className="material-symbols-outlined text-blue-600 mt-0.5 sm:mt-1 text-xl sm:text-2xl">info</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg font-serif">
                                        Explication
                                    </h4>
                                    <div className="text-gray-700 serif-text exercise-text leading-relaxed text-sm sm:text-base">
                                        <FormattedText text={explanationText} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Navigation Buttons - Optimisé pour mobile */}
            <div className="mt-6 sm:mt-8 flex justify-between items-center gap-2 sm:gap-4">
                <button
                    onClick={() => handleNavigate(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="font-button px-4 py-2 sm:px-6 sm:py-2.5 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                >
                    Précédent
                </button>
                {currentQuestionIndex === chapter.quiz.length - 1 ? (
                    !isSubmitted && (
                        <button
                            onClick={handleSubmit}
                            disabled={!allQuestionsAnswered}
                            className="font-button px-4 py-2.5 sm:px-8 sm:py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-warning/40 disabled:text-warning disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all text-sm sm:text-base touch-manipulation"
                            title={!allQuestionsAnswered ? `Encore ${unansweredQuestions.length} question(s) à compléter` : ''}
                        >
                            <span className="hidden sm:inline">{allQuestionsAnswered ? 'Soumettre le Quiz' : `Compléter ${unansweredQuestions.length} question(s)`}</span>
                            <span className="inline sm:hidden">{allQuestionsAnswered ? 'Soumettre' : `Compléter (${unansweredQuestions.length})`}</span>
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => handleNavigate(currentQuestionIndex + 1)}
                        className="font-button px-4 py-2 sm:px-6 sm:py-2.5 font-semibold text-primary rounded-lg hover:bg-primary-light transition-all text-sm sm:text-base touch-manipulation"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
        </>
    );
};

export default Quiz;