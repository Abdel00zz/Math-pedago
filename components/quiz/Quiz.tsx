import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { MathJax } from 'better-react-mathjax';
import { Option } from '../../types';
import OrderingQuestion from './OrderingQuestion';
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

    // ✅ OPTIMISATION 5: Fonction getOptionClass mémorisée
    const getOptionClass = useCallback((option: Option, isSelected: boolean) => {
        const base = 'group relative w-full text-left px-5 py-4 rounded-3xl border transition-all duration-300 ease-in-out flex items-start gap-4 font-sans text-lg shadow-[0_18px_38px_rgba(15,23,42,0.28)] backdrop-blur-sm';

        if (isReviewMode || isSubmitted) {
            if (option.isCorrect) {
                return `${base} bg-success/15 border-success/70 text-text`;
            }
            if (isSelected && !option.isCorrect) {
                return `${base} bg-error/15 border-error/70 text-text`;
            }
            return `${base} border-border/60 bg-surface/60 text-text-secondary cursor-default opacity-80`;
        }

        if (isSelected) {
            return `${base} border-primary bg-primary/10 text-text shadow-[0_24px_55px_rgba(59,130,246,0.26)] scale-[1.01]`;
        }
        return `${base} border-border/50 bg-surface/60 hover:border-primary/60 hover:bg-surface/80 cursor-pointer hover:shadow-[0_28px_60px_rgba(59,130,246,0.2)]`;
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
                <div className="bg-surface border border-border rounded-2xl shadow-claude max-w-2xl mx-auto p-8">
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
        <div id="quiz-container" className="font-sans max-w-3xl mx-auto px-2">

            {/* Question Navigator */}
            <div className="mb-8 flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={() => handleWindowShift('prev')}
                    disabled={!canScrollPrev}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-text-secondary transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Afficher les questions précédentes"
                >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <div key={windowStart} className="flex items-center gap-3">
                    {navigationWindow.map(({ id, globalIndex }) => {
                        const isAnswered = !!answers[id];
                        const isCurrent = globalIndex === currentQuestionIndex;
                        const isUnanswered = !isAnswered;

                        const baseClasses = 'flex h-10 w-10 items-center justify-center rounded-full border font-semibold text-sm transition-all duration-300 shadow-[0_12px_22px_rgba(15,23,42,0.18)]';

                        const stateClasses = isCurrent
                            ? 'bg-primary text-[#F8FAFC] border-primary shadow-[0_14px_32px_rgba(59,130,246,0.28)] scale-105'
                            : isAnswered
                            ? 'bg-surface/70 text-[#E2E8F0] border-primary/35 hover:border-primary/60'
                            : 'border-warning/70 bg-warning/30 text-[#F9FAFF] animate-alertBeacon';

                        return (
                            <button
                                key={id}
                                onClick={() => handleNavigate(globalIndex)}
                                className={`${baseClasses} ${stateClasses}`}
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-text-secondary transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
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
                <div className="rounded-3xl border border-border/60 bg-surface/70 backdrop-blur-sm shadow-[0_28px_68px_rgba(15,23,42,0.45)] p-6 sm:p-8 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <p className="text-sm text-text-secondary">
                            Question {currentQuestionIndex + 1} sur {chapter.quiz.length}
                        </p>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/70 border border-border/70 text-xs text-text">
                            <span className="uppercase tracking-[0.28em] text-[9px] text-text-secondary">Timer</span>
                            <span className="font-mono text-sm leading-none">{formattedTime}</span>
                        </span>
                    </div>
                    <h3 className="text-2xl font-display mb-6 text-text leading-snug">
                        <MathJax dynamic>{question.question}</MathJax>
                    </h3>
                    <div className="space-y-4">
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
                                    <div className="flex-shrink-0 mt-1">
                                        {(isReviewMode || isSubmitted) ? (
                                            option.isCorrect ? (
                                                <span className="material-symbols-outlined text-success">check_circle</span>
                                            ) : isSelected ? (
                                                <span className="material-symbols-outlined text-error">cancel</span>
                                            ) : (
                                                <div className="w-7 h-7 border-2 border-text-disabled/40 rounded-full"></div>
                                            )
                                        ) : (
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/15 shadow-[0_12px_24px_rgba(59,130,246,0.3)]' 
                                                    : 'border-border/60 group-hover:border-primary/70 group-hover:shadow-[0_14px_32px_rgba(59,130,246,0.22)]'
                                            }`}>
                                                {isSelected && (
                                                    <div className="w-3.5 h-3.5 bg-primary rounded-full transition-transform duration-300 scale-110"></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex-1">
                                        <MathJax dynamic>{option.text}</MathJax>
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
            {isReviewMode && (
                question.explanation || 
                (question.type === 'mcq' && question.options?.find(o => o.isCorrect)?.explanation)
            ) && (
                <div className="mt-6 p-4 bg-background rounded-lg border border-border animate-fadeIn">
                    <h4 className="font-bold text-text mb-2 text-lg font-serif">Explication :</h4>
                    <p className="text-secondary serif-text">
                        <MathJax dynamic>
                            {question.explanation || question.options?.find(o => o.isCorrect)?.explanation}
                        </MathJax>
                    </p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center">
                <button 
                    onClick={() => handleNavigate(currentQuestionIndex - 1)} 
                    disabled={currentQuestionIndex === 0} 
                    className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Précédent
                </button>
                {currentQuestionIndex === chapter.quiz.length - 1 ? (
                    !isSubmitted && (
                        <button 
                            onClick={handleSubmit} 
                            disabled={!allQuestionsAnswered} 
                            className="font-button px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-warning/40 disabled:text-warning disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                            title={!allQuestionsAnswered ? `Encore ${unansweredQuestions.length} question(s) à compléter` : ''}
                        >
                            {allQuestionsAnswered ? 'Soumettre le Quiz' : `Compléter ${unansweredQuestions.length} question(s)`}
                        </button>
                    )
                ) : (
                    <button 
                        onClick={() => handleNavigate(currentQuestionIndex + 1)} 
                        className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light transition-all"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;