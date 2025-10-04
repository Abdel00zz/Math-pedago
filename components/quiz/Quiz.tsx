import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { MathJax } from 'better-react-mathjax';
import { Option } from '../../types';
import OrderingQuestion from './OrderingQuestion';

const Quiz: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress, isReviewMode } = state;
    
    const [timeSpent, setTimeSpent] = useState(0);
    
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
        hintsUsed = 0 
    } = quizProgress || {};
    
    const question = useMemo(() => 
        chapter?.quiz[currentQuestionIndex], 
        [chapter, currentQuestionIndex]
    );

    // ✅ OPTIMISATION 2: Timer optimisé avec useRef
    const timerRef = useRef<number | null>(null);
    
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

    const handleSubmit = useCallback(() => {
        if (!chapter) return;
        
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
        const base = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ease-in-out flex items-start gap-4 font-sans text-lg';

        if (isReviewMode || isSubmitted) {
            if (option.isCorrect) {
                return `${base} bg-success/10 border-success text-text`;
            }
            if (isSelected && !option.isCorrect) {
                return `${base} bg-error/10 border-error text-text`;
            }
            return `${base} border-border bg-surface text-text-disabled cursor-default opacity-70`;
        }

        if (isSelected) {
            return `${base} bg-primary/10 border-primary text-text ring-2 ring-primary/30 transform scale-[1.01]`;
        }
        return `${base} bg-surface border-border hover:border-primary/70 hover:bg-background cursor-pointer transform hover:scale-[1.01]`;
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
        <div className="font-sans max-w-3xl mx-auto">
            {/* Question Navigator */}
            <div className="flex justify-center gap-2 mb-8">
                {chapter.quiz.map((q, index) => (
                    <button 
                        key={q.id}
                        onClick={() => handleNavigate(index)}
                        className={`w-7 h-2 rounded-full transition-colors ${
                            index === currentQuestionIndex 
                                ? 'bg-primary' 
                                : answers[q.id] 
                                ? 'bg-primary/50' 
                                : 'bg-border'
                        }`}
                        aria-label={`Aller à la question ${index + 1}`}
                    />
                ))}
            </div>

            {(!question.type || question.type === 'mcq') && (
                <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                    <p className="text-sm text-secondary mb-4">
                        Question {currentQuestionIndex + 1} / {chapter.quiz.length}
                    </p>
                    <h3 className="text-2xl font-serif mb-6 text-text">
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
                                                <div className="w-6 h-6 border-2 border-text-disabled/50 rounded-full"></div>
                                            )
                                        ) : (
                                            <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/10' 
                                                    : 'border-text-secondary group-hover:border-primary'
                                            }`}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 bg-primary rounded-full transition-transform duration-300 scale-100"></div>
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
                            disabled={!allAnswered} 
                            className="font-button px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                        >
                            Soumettre le Quiz
                        </button>
                    )
                ) : (
                    <button 
                        onClick={() => handleNavigate(currentQuestionIndex + 1)} 
                        disabled={!answers[question.id]} 
                        className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;