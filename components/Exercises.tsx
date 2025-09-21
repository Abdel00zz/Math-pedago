import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Feedback, Exercise } from '../types';
import { MathJax } from 'better-react-mathjax';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';

const FeedbackButtons: React.FC<{ exId: string }> = React.memo(({ exId }) => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const progress = state.progress[state.currentChapterId!];
    const currentFeedback = progress.exercisesFeedback[exId];

    const feedbacks: { label: Feedback, color: string }[] = [
        { label: 'Réussi facilement', color: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
        { label: 'J\'ai réfléchi', color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
        { label: 'C\'était un défi', color: 'bg-error/10 text-error border-error/20 hover:bg-error/20' },
        { label: 'Non traité', color: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20' },
    ];

    const handleFeedback = useCallback((feedback: Feedback) => {
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId, feedback } });
    }, [dispatch, exId]);

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm font-medium text-text-secondary shrink-0">Comment avez-vous trouvé cet exercice ?</p>
            <div className="flex flex-wrap gap-1.5 justify-start">
                {feedbacks.map(({ label, color }) => (
                    <button
                        key={label}
                        onClick={() => handleFeedback(label)}
                        className={`font-button px-2.5 py-1 text-[11px] leading-tight font-semibold border rounded-md transition-transform active:scale-95 ${currentFeedback === label ? color + ' ring-2 ring-offset-2 ring-offset-surface ring-current' : color}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
});

const HintModal: React.FC<{ exercise: Exercise, isOpen: boolean, onClose: () => void }> = ({ exercise, isOpen, onClose }) => {
    if (!exercise.hint || exercise.hint.length === 0) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Indice pour: ${exercise.title || 'Exercice'}`}>
            <div className="mt-4 flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">lightbulb</span>
                <div className="text-secondary space-y-2">
                    {exercise.hint.map((h, i) => (
                        <div key={i}><MathJax dynamic>{h.text}</MathJax></div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

const ExerciseItem = React.memo(({ exercise, index, onOpenHint }: { exercise: Exercise; index: number; onOpenHint: (ex: Exercise) => void }) => {
    return (
        <div className="bg-surface p-6 rounded-lg border border-border">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-text flex items-center flex-wrap">
                   <span className="font-bold font-libertinus">Exercice {index + 1}</span>
                   {exercise.title && (
                    <>
                        <span className="mx-2 text-border font-light">|</span>
                        <span>{exercise.title}</span>
                    </>
                   )}
                </h3>
                {exercise.hint && (
                    <button 
                        onClick={() => onOpenHint(exercise)} 
                        className="font-button flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary bg-primary-light rounded-lg hover:bg-primary/20 transition"
                        >
                        <span className="material-symbols-outlined text-base">lightbulb</span>
                        Indice
                    </button>
                )}
            </div>
            
            <div className="text-text-secondary space-y-2 prose max-w-none">
                <MathJax dynamic>{exercise.statement}</MathJax>
                {exercise.sub_questions && (
                    <ol className="list-decimal pl-5 space-y-3 antique-list mt-4">
                        {exercise.sub_questions.map((sq, i) => (
                            <li key={i} className="pl-2"><MathJax dynamic>{sq.text}</MathJax></li>
                        ))}
                    </ol>
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
                <FeedbackButtons exId={exercise.id} />
            </div>
        </div>
    )
});

const Exercises: React.FC = () => {
    const state = useAppState();
    const { addNotification } = useNotification();
    const { currentChapterId, activities, progress } = state;
    const [hintModalState, setHintModalState] = useState<{ isOpen: boolean; exercise: Exercise | null }>({ isOpen: false, exercise: null });

    if (!currentChapterId || !activities[currentChapterId] || !progress[currentChapterId]) return null;
    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];

    const totalExercises = chapter.exercises.length;
    const completedExercises = Object.values(chapterProgress.exercisesFeedback).length;

    const prevCompletedExercises = useRef(completedExercises);

    useEffect(() => {
        if (completedExercises > 0 && completedExercises === totalExercises && prevCompletedExercises.current < totalExercises) {
            addNotification("Étape 2 terminée ! Vous pouvez maintenant soumettre votre travail.", 'info');
        }
        prevCompletedExercises.current = completedExercises;
    }, [completedExercises, totalExercises, addNotification]);

    const openHintModal = useCallback((exercise: Exercise) => {
        setHintModalState({ isOpen: true, exercise });
    }, []);
    
    const closeHintModal = useCallback(() => {
        setHintModalState({ isOpen: false, exercise: null });
    }, []);

    return (
        <div className="space-y-6">
            {chapter.exercises.map((ex, index) => (
                <ExerciseItem 
                    key={ex.id}
                    exercise={ex}
                    index={index}
                    onOpenHint={openHintModal}
                />
            ))}
            {hintModalState.exercise && (
                 <HintModal 
                    exercise={hintModalState.exercise}
                    isOpen={hintModalState.isOpen}
                    onClose={closeHintModal}
                />
            )}
        </div>
    );
};

export default Exercises;