import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Feedback, SubQuestion } from '../types';
import { MathJax } from 'better-react-mathjax';

const FeedbackButton: React.FC<{
    feedback: Feedback;
    currentFeedback: Feedback | undefined;
    onClick: (feedback: Feedback) => void;
    disabled?: boolean;
}> = ({ feedback, currentFeedback, onClick, disabled }) => {
    const isSelected = feedback === currentFeedback;

    // Styles inspired by ChapterHubView's pill-like status badges
    const styles: { [key in Feedback]: { base: string; selected: string } } = {
        'Facile':    { base: 'border-border hover:bg-success/5 hover:border-success/30', selected: 'bg-success/10 text-success border-success/30' },
        'Moyen':     { base: 'border-border hover:bg-warning/5 hover:border-warning/30', selected: 'bg-warning/10 text-warning border-warning/30' },
        'Difficile': { base: 'border-border hover:bg-error/5 hover:border-error/30',    selected: 'bg-error/10 text-error border-error/30' },
        'Non traité':{ base: 'border-border hover:bg-secondary/5 hover:border-secondary/30', selected: 'bg-secondary/10 text-secondary border-secondary/30' },
    };

    return (
        <button
            onClick={() => onClick(feedback)}
            disabled={disabled}
            className={`font-button flex-1 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all duration-200 transform active:scale-95 ${
                isSelected ? styles[feedback].selected : `text-text-secondary ${styles[feedback].base}`
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            {feedback}
        </button>
    );
};

interface ExercisesProps {
    onAllCompleted: () => void;
}

const Exercises: React.FC<ExercisesProps> = ({ onAllCompleted }) => {
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
    
    if (!currentChapterId) return null;
    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const exercisesFeedback = chapterProgress.exercisesFeedback;

    const isOutdatedSubmission = useMemo(() => (
        chapterProgress.isWorkSubmitted &&
        !!chapter.version &&
        !!chapterProgress.submittedVersion &&
        chapter.version !== chapterProgress.submittedVersion
    ), [chapter, chapterProgress]);
    
    const isChapterLocked = chapterProgress.isWorkSubmitted && !isOutdatedSubmission;

    const [expandedExId, setExpandedExId] = useState<string | null>(null);
    const [visibleHints, setVisibleHints] = useState<{ [exId: string]: Set<number> }>({});
    
    const totalExercises = chapter.exercises.length;
    
    const evaluatedExercisesCount = useMemo(() => {
        return Object.keys(exercisesFeedback).length;
    }, [exercisesFeedback]);

    const wasCompleted = useRef(false);
    useEffect(() => {
        const areAllEvaluated = totalExercises > 0 && evaluatedExercisesCount === totalExercises;
        if (areAllEvaluated && !wasCompleted.current) {
            onAllCompleted();
            wasCompleted.current = true;
        } else if (!areAllEvaluated) {
            wasCompleted.current = false;
        }
    }, [evaluatedExercisesCount, totalExercises, onAllCompleted]);


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
        if (isChapterLocked) return;
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
            {chapter.exercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-surface p-6 rounded-lg border border-border">
                    <h3 className="text-3xl font-playfair text-text">{`Exercice ${index + 1} | ${exercise.title}`}</h3>
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
                                    disabled={isChapterLocked}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Exercises;