import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { MathJax } from 'better-react-mathjax';
import { Option } from '../types';

const Quiz: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress, isReviewMode } = state;
    
    const [timeSpent, setTimeSpent] = useState(0);
    const [unlockedHintIndexes, setUnlockedHintIndexes] = useState<Set<number>>(new Set());
    const [totalHintsUsed, setTotalHintsUsed] = useState(0);
    
    // Memoized values for stability
    const chapter = useMemo(() => currentChapterId ? activities[currentChapterId] : null, [currentChapterId, activities]);
    const quizProgress = useMemo(() => currentChapterId ? progress[currentChapterId]?.quiz : null, [currentChapterId, progress]);
    
    const { currentQuestionIndex = 0, answers = {}, isSubmitted = false, allAnswered = false, score = 0, hintsUsed = 0 } = quizProgress || {};
    const question = useMemo(() => chapter?.quiz[currentQuestionIndex], [chapter, currentQuestionIndex]);

    // Timer effect
    useEffect(() => {
        if (isReviewMode || isSubmitted) return;
        const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [isReviewMode, isSubmitted]);
    
    // Reset local state when question changes
    useEffect(() => {
        setUnlockedHintIndexes(new Set());
    }, [currentQuestionIndex]);

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
        const finalScore = chapter.quiz.reduce((acc, q) => {
            const correctOption = q.options.find(opt => opt.isCorrect)?.text;
            return answers[q.id] === correctOption ? acc + 1 : acc;
        }, 0);
        dispatch({ type: 'SUBMIT_QUIZ', payload: { score: finalScore, duration: timeSpent, hintsUsed: totalHintsUsed } });
    }, [chapter, answers, dispatch, timeSpent, totalHintsUsed]);

    const handleUnlockHint = useCallback(() => {
        if (!question?.hints || unlockedHintIndexes.size >= question.hints.length) return;
        
        const newUnlocked = new Set(unlockedHintIndexes);
        newUnlocked.add(unlockedHintIndexes.size);
        setUnlockedHintIndexes(newUnlocked);
        setTotalHintsUsed(prev => prev + 1);
    }, [question, unlockedHintIndexes]);

    const getOptionClass = useCallback((option: Option, isSelected: boolean) => {
        const base = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 font-lato text-lg';
        
        if (isReviewMode || isSubmitted) {
            const isCorrect = option.isCorrect;
            if (isCorrect) return `${base} bg-success/10 border-success text-success`;
            if (isSelected && !isCorrect) return `${base} bg-error/10 border-error text-error`;
            return `${base} border-border/70 bg-gray-50 text-text-disabled cursor-default`;
        }
        
        if (isSelected) return `${base} bg-primary-light border-primary ring-2 ring-primary/30 shadow-md`;
        return `${base} bg-surface border-border hover:border-primary/50 hover:bg-primary-light/50 cursor-pointer`;
    }, [isReviewMode, isSubmitted]);

    if (!chapter || !quizProgress || !question) {
        return <div>Loading quiz...</div>;
    }

    // --- RENDER LOGIC ---

    if (isSubmitted && !isReviewMode) {
        const percentage = Math.round((score / chapter.quiz.length) * 100);
        const { color, message } = percentage >= 80 ? { color: 'text-success', message: 'Excellent travail !' }
            : percentage >= 50 ? { color: 'text-warning', message: 'Bien joué !' }
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
                            <p className="font-bold text-text text-xl">{Math.floor(quizProgress.duration / 60)}m {quizProgress.duration % 60}s</p>
                            <p className="text-secondary text-sm">Temps écoulé</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <p className="font-bold text-text text-xl">{hintsUsed}</p>
                            <p className="text-secondary text-sm">Indices utilisés</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
                        <button 
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'exercises' } })}
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
        <div className="font-lato max-w-3xl mx-auto">
            {/* Question Navigator */}
            <div className="flex justify-center gap-2 mb-8">
                {chapter.quiz.map((q, index) => (
                    <button 
                        key={q.id}
                        onClick={() => handleNavigate(index)}
                        className={`w-7 h-2 rounded-full transition-colors ${
                            index === currentQuestionIndex ? 'bg-primary' : answers[q.id] ? 'bg-primary/50' : 'bg-border'
                        }`}
                        aria-label={`Aller à la question ${index + 1}`}
                    />
                ))}
            </div>

            {/* Question Card */}
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <p className="text-sm text-secondary mb-4">Question {currentQuestionIndex + 1} / {chapter.quiz.length}</p>
                <h3 className="text-2xl font-serif mb-6 text-text">
                    <MathJax dynamic>{question.question}</MathJax>
                </h3>
                <div className="space-y-4">
                    {question.options.map((option, index) => {
                        const isSelected = answers[question.id] === option.text;
                        const optionClass = getOptionClass(option, isSelected);
                        const Icon = () => {
                             if (isReviewMode || isSubmitted) {
                                return option.isCorrect 
                                    ? <span className="material-symbols-outlined">check_circle</span>
                                    : isSelected ? <span className="material-symbols-outlined">cancel</span> : null
                             }
                             return <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-text-disabled'}`}><div className="w-2 h-2 bg-white rounded-full"></div></div>;
                        }
                        
                        return (
                            <button key={index} onClick={() => handleOptionChange(option.text)} className={optionClass} disabled={isSubmitted}>
                                <Icon/>
                                <span className="flex-1"><MathJax dynamic>{option.text}</MathJax></span>
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* Hints & Explanation Section */}
            {(question.hints || (isReviewMode && question.explanation)) && (
                <div className="mt-6 animate-fadeIn">
                    {!isReviewMode && question.hints && question.hints.length > 0 && (
                        <div className="bg-surface p-4 rounded-xl border border-border">
                           {Array.from({ length: unlockedHintIndexes.size }).map((_, i) => (
                                <div key={i} className="p-3 mb-2 bg-background rounded-md serif-text text-secondary animate-fadeIn">
                                    <MathJax dynamic>{question.hints![i]}</MathJax>
                                </div>
                           ))}
                            {unlockedHintIndexes.size < question.hints.length && (
                                <button onClick={handleUnlockHint} className="font-button text-sm text-info font-semibold flex items-center gap-2 hover:underline p-2">
                                    <span className="material-symbols-outlined text-base">lightbulb</span> 
                                    Afficher un indice ({unlockedHintIndexes.size + 1}/{question.hints.length})
                                </button>
                            )}
                        </div>
                    )}
                    {isReviewMode && (question.explanation || question.options.find(o => o.isCorrect)?.explanation) && (
                         <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                            <h4 className="font-bold text-text mb-2 text-lg font-serif">Explication :</h4>
                            <p className="text-secondary serif-text"><MathJax dynamic>{question.explanation || question.options.find(o => o.isCorrect)?.explanation}</MathJax></p>
                        </div>
                    )}
                </div>
            )}


            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center">
                <button onClick={() => handleNavigate(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                {currentQuestionIndex === chapter.quiz.length - 1 ? (
                    !isSubmitted && (
                        <button onClick={handleSubmit} disabled={!allAnswered} className="font-button px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all">
                            Soumettre le Quiz
                        </button>
                    )
                ) : (
                    <button onClick={() => handleNavigate(currentQuestionIndex + 1)} disabled={!answers[question.id]} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                )}
            </div>
        </div>
    );
};

export default Quiz;