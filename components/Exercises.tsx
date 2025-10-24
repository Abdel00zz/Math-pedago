import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Feedback, SubQuestion, Exercise } from '../types';
import { MathJax } from 'better-react-mathjax';
import HintModal from './HintModal';
import { useMathJax } from '../hooks/useMathJax';
import VideoPlayer from './VideoPlayer';

const feedbackConfig: { [key in Feedback]: { base: string; selected: string } } = {
    'Facile':    { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-success text-white border-success' },
    'Moyen':     { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-warning text-white border-warning' },
    'Difficile': { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-error text-white border-error' },
    'Non traité':{ base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-secondary text-white border-secondary' },
};


const FeedbackButton: React.FC<{
    feedback: Feedback;
    currentFeedback: Feedback | undefined;
    onClick: (feedback: Feedback) => void;
    disabled?: boolean;
}> = ({ feedback, currentFeedback, onClick, disabled }) => {
    const isSelected = feedback === currentFeedback;
    const config = feedbackConfig[feedback];

    return (
        <button
            onClick={() => onClick(feedback)}
            disabled={disabled}
            className={`font-button px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 transform active:scale-95 ${
                isSelected ? config.selected : config.base
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            <span>{feedback}</span>
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
    const [hintModalExerciseId, setHintModalExerciseId] = useState<string | null>(null);

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

    const handleOpenHintModal = (exId: string) => {
        setHintModalExerciseId(exId);
    };
    
    const handleFeedback = (exId: string, feedback: Feedback) => {
        if (isChapterLocked) return;
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId, feedback } });
    };

    // Hook MathJax optimisé pour le rendu des formules
    useMathJax(
        [chapter, exercisesFeedback], 
        { 
            delay: 150,
            containerId: 'exercises-container',
            onSuccess: () => console.log('✅ Formules mathématiques rendues'),
            onError: (error) => console.error('❌ Erreur rendu MathJax:', error)
        }
    );

    // Fonction pour formater le texte HTML (gras, italique, etc.)
    const formatText = (text: string) => {
        // Remplacer les balises <br> par des sauts de ligne
        let formatted = text.replace(/<br\s*\/?>/gi, '\n');
        
        // Convertir le Markdown **texte** en <strong>
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Convertir le Markdown *texte* en <em>
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Convertir le Markdown __texte__ en <strong>
        formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Convertir le Markdown _texte_ en <em>
        formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
        
        return formatted;
    };

    const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => {
        if (!subQuestions || subQuestions.length === 0) return null;
        
        return (
            <ol className="list-decimal pl-6 mt-4 space-y-4 text-gray-800">
                {subQuestions.map((sq, index) => (
                    <li key={index} className="pl-2 text-base leading-relaxed">
                        <div className="font-medium text-gray-900">
                            <MathJax dynamic>
                                <span dangerouslySetInnerHTML={{ __html: formatText(sq.text) }} />
                            </MathJax>
                        </div>
                        
                        {sq.sub_sub_questions && sq.sub_sub_questions.length > 0 && (
                            <ol 
                                className="list-none pl-0 mt-2 space-y-2"
                                style={{ 
                                    counterReset: 'subsub-counter',
                                    marginLeft: '1.5rem'
                                }}
                            >
                                {sq.sub_sub_questions.map((ssq, ssqIndex) => (
                                    <li 
                                        key={ssqIndex} 
                                        className="relative pl-8 text-sm leading-relaxed text-gray-700"
                                        style={{
                                            counterIncrement: 'subsub-counter',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span 
                                            className="absolute left-0 top-0 font-medium text-gray-600"
                                            style={{
                                                content: 'counter(subsub-counter, lower-alpha) ". "',
                                            }}
                                        >
                                            {String.fromCharCode(97 + ssqIndex)}.
                                        </span>
                                        <MathJax dynamic>
                                            <span dangerouslySetInnerHTML={{ __html: formatText(ssq.text) }} />
                                        </MathJax>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </li>
                ))}
            </ol>
        );
    };

    const hintExercise = useMemo(() => {
        if (!hintModalExerciseId) return null;
        return chapter.exercises.find(ex => ex.id === hintModalExerciseId);
    }, [hintModalExerciseId, chapter.exercises]);

    return (
        <div id="exercises-container" className="space-y-4 pb-4">
            {chapter.exercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-amber-50 p-6 rounded-lg border border-amber-200 shadow-lg shadow-amber-900/5">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-title text-gray-900 pr-4">
                            <span className="text-blue-600 font-bold">{`Exercice ${index + 1}`}</span>
                            <span className="text-lg text-gray-700 font-normal">{` | ${exercise.title}`}</span>
                        </h3>
                        {exercise.hint && exercise.hint.length > 0 && (
                            <button 
                                onClick={() => handleOpenHintModal(exercise.id)}
                                className="font-button flex-shrink-0 w-10 h-10 text-info bg-info/10 rounded-full flex items-center justify-center hover:bg-info/20 transition-colors active:scale-95"
                                aria-label={`Voir l'indice pour l'exercice ${index + 1}`}
                            >
                                <span className="material-symbols-outlined text-base">lightbulb</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Vidéo pédagogique si disponible */}
                    {exercise.video && (
                        <div className="mb-6">
                            <VideoPlayer video={exercise.video} />
                        </div>
                    )}

                    <div className="text-gray-800 text-base leading-relaxed">
                        <MathJax dynamic>{exercise.statement}</MathJax>
                    </div>

                    {exercise.sub_questions && renderSubQuestions(exercise.sub_questions)}

                    <div className="mt-6 border-t border-amber-200 pt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                        <p className="text-sm font-semibold text-gray-800 serif-text">Comment vous êtes-vous senti face à cet exercice ?</p>
                        <div className="flex flex-wrap gap-2 shrink-0">
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
            <HintModal
                isOpen={!!hintModalExerciseId}
                onClose={() => setHintModalExerciseId(null)}
                exercise={hintExercise}
            />
        </div>
    );
};

export default Exercises;