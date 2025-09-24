import React, { useState, useMemo, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Feedback, SubQuestion } from '../types';
import { MathJax } from 'better-react-mathjax';

const FeedbackButton: React.FC<{
    feedback: Feedback;
    currentFeedback: Feedback | undefined;
    onClick: (feedback: Feedback) => void;
    disabled?: boolean;
}> = ({ feedback, currentFeedback, onClick, disabled = false }) => {
    const isSelected = feedback === currentFeedback;
    const styles: { [key in Feedback]: { base: string; selected: string } } = {
        'Facile': { base: 'border-success/50 hover:bg-success/10', selected: 'bg-success/10 border-success text-success' },
        'Moyen': { base: 'border-warning/50 hover:bg-warning/10', selected: 'bg-warning/10 border-warning text-warning' },
        'Difficile': { base: 'border-error/50 hover:bg-error/10', selected: 'bg-error/10 border-error text-error' },
        'Non traité': { base: 'border-secondary/50 hover:bg-secondary/10', selected: 'bg-secondary/10 border-secondary text-secondary' },
    };

    return (
        <button
            onClick={() => onClick(feedback)}
            disabled={disabled}
            className={`font-button flex-1 px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all transform active:scale-95 ${
                isSelected ? styles[feedback].selected : styles[feedback].base
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            {feedback}
        </button>
    );
};


const Exercises: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const endTime = Date.now();
            const durationInSeconds = Math.round((endTime - startTime) / 1000);
            if (durationInSeconds > 0 && currentChapterId) {
                dispatch({ type: 'UPDATE_EXERCISES_DURATION', payload: { duration: durationInSeconds } });
            }
        };
    }, [dispatch, currentChapterId]);

    // Effet pour détecter la complétion de tous les exercices
    useEffect(() => {
        if (!currentChapterId) return;
        
        const chapter = activities[currentChapterId];
        const chapterProgress = progress[currentChapterId];
        if (!chapter || !chapterProgress) return;

        const isOutdated = chapter.version && chapterProgress.submittedVersion && chapter.version !== chapterProgress.submittedVersion;
        // Don't trigger blink effect on re-evaluation.
        if (chapterProgress.isWorkSubmitted && !isOutdated) return;

        const exercisesFeedback = chapterProgress.exercisesFeedback;
        const totalExercises = chapter.exercises.length;
        const evaluatedExercisesCount = Object.keys(exercisesFeedback).length;
        
        // Vérifier si tous les exercices ont été évalués
        if (totalExercises > 0 && evaluatedExercisesCount === totalExercises) {
            // Scroll vers le haut de la page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Déclencher l'effet de clignotement du bouton retour
            dispatch({ type: 'TRIGGER_BACK_BUTTON_BLINK' });
        }
    }, [currentChapterId, activities, progress, dispatch]);
    
    if (!currentChapterId) return null;
    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const exercisesFeedback = chapterProgress.exercisesFeedback;

    const isReevaluating = useMemo(() => {
        if (!chapter || !chapterProgress) return false;
        return (
            !!chapterProgress.isWorkSubmitted &&
            !!chapterProgress.submittedVersion &&
            !!chapter.version &&
            chapterProgress.submittedVersion !== chapter.version
        );
    }, [chapter, chapterProgress]);

    const [expandedExId, setExpandedExId] = useState<string | null>(null);
    const [visibleHints, setVisibleHints] = useState<{ [exId: string]: Set<number> }>({});
    
    const totalExercises = chapter.exercises.length;
    
    const evaluatedExercisesCount = useMemo(() => {
        return Object.keys(exercisesFeedback).length;
    }, [exercisesFeedback]);

    const progressPercentage = totalExercises > 0 ? (evaluatedExercisesCount / totalExercises) * 100 : 0;


    const handleToggleExercise = (exId: string) => {
        setExpandedExId(prevId => (prevId === exId ? null : exId));
    };

    const handleShowHint = (exId: string, hintIndex: number) => {
        setVisibleHints(prev => ({
            ...prev,
            [exId]: new Set(prev[exId] || []).add(hintIndex),
        }));
    };
    
    const handleFeedback = (exId: string, feedback: Feedback) => {
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId, feedback } });
    };

    const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => (
        <ol className="list-decimal pl-5 mt-4 space-y-2 antique-list text-text-secondary serif-text">
            {subQuestions?.map((sq, index) => (
                <li key={index}><MathJax dynamic>{sq.text}</MathJax></li>
            ))}
        </ol>
    );
    
    const renderHints = (exId: string, hints: { text: string; sub_questions?: SubQuestion[] }[] | undefined) => (
        <div className="mt-4 space-y-2">
            {hints?.map((hint, index) => {
                 const isVisible = visibleHints[exId]?.has(index);
                 return (
                    <div key={index}>
                        {!isVisible ? (
                            <button onClick={() => handleShowHint(exId, index)} className="font-button text-sm text-info font-semibold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-base">lightbulb</span> Afficher l'indice {index + 1}
                            </button>
                        ) : (
                            <div className="p-3 bg-background rounded-md border border-border serif-text">
                                <MathJax dynamic>{hint.text}</MathJax>
                                {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                            </div>
                        )}
                    </div>
                 );
            })}
        </div>
    );

    return (
        <div className="space-y-4 pb-4">
            {chapter.exercises.map((exercise, index) => {
                const hasExistingFeedback = !!exercisesFeedback[exercise.id];
                const areButtonsDisabled = isReevaluating && hasExistingFeedback;

                return (
                    <div key={exercise.id} className="bg-surface p-6 rounded-lg border border-border">
                        <h3 className="text-3xl font-playfair text-text">
                            {`Exercice ${index + 1} | `}
                            <span className="text-gray-500" style={{ fontSize: '0.7em' }}>
                                {exercise.title}
                            </span>
                        </h3>
                        <div className="mt-4 text-text-secondary serif-text">
                            <MathJax dynamic>{exercise.statement}</MathJax>
                        </div>
                        
                        {exercise.sub_questions && renderSubQuestions(exercise.sub_questions)}
                        {exercise.hint && renderHints(exercise.id, exercise.hint)}

                        <div className="mt-6 border-t border-border pt-4">
                            <p className="text-sm font-semibold text-text mb-3 serif-text">Comment vous êtes-vous senti face à cet exercice ?</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                               {(['Facile', 'Moyen', 'Difficile', 'Non traité'] as Feedback[]).map(f => (
                                    <FeedbackButton 
                                        key={f} 
                                        feedback={f}
                                        currentFeedback={exercisesFeedback[exercise.id]}
                                        onClick={(fb) => handleFeedback(exercise.id, fb)}
                                        disabled={areButtonsDisabled}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Exercises;