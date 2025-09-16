import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Exercise, Feedback, SubQuestion } from '../types';
import { MathJax } from 'better-react-mathjax';
import Modal from './Modal';

const SubQuestionDisplay: React.FC<{ subQuestions: SubQuestion[]; level: number }> = ({ subQuestions, level }) => {
    if (!subQuestions || subQuestions.length === 0) return null;

    const listStyleType = level === 1 ? 'decimal' : level === 2 ? 'lower-alpha' : 'lower-roman';

    return (
        <ol style={{ listStyleType }} className={`pl-6 mt-2 styled-list`}>
            {subQuestions.map((sq, index) => (
                <li key={index} className="mb-2">
                    <MathJax inline dynamic>{sq.text}</MathJax>
                    {sq.sub_questions && <SubQuestionDisplay subQuestions={sq.sub_questions} level={level + 1} />}
                </li>
            ))}
        </ol>
    );
};


const ExerciseCard: React.FC<{ exercise: Exercise; exerciseNumber: number }> = ({ exercise, exerciseNumber }) => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, progress } = state;
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);
    
    if (!currentChapterId) return null;

    const chapterProgress = progress[currentChapterId];
    const currentFeedback = chapterProgress?.exercisesFeedback[exercise.id];

    const handleFeedback = (feedback: Feedback) => {
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId: exercise.id, feedback } });
    };

    const feedbackOptions: { label: Feedback, style: string, activeStyle: string }[] = [
        { 
            label: 'Facile', 
            style: 'bg-green-100 text-green-800 hover:bg-green-200', 
            activeStyle: 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600',
        },
        { 
            label: 'Moyen', 
            style: 'bg-amber-100 text-amber-800 hover:bg-amber-200', 
            activeStyle: 'bg-amber-500 text-white ring-2 ring-offset-2 ring-amber-500',
        },
        { 
            label: 'Difficile', 
            style: 'bg-red-100 text-red-800 hover:bg-red-200', 
            activeStyle: 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600',
        },
        { 
            label: 'Pas travaillé', 
            style: 'bg-gray-100 text-gray-800 hover:bg-gray-200', 
            activeStyle: 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600',
        },
    ];

    return (
        <>
            <div className="bg-card-bg p-4 sm:p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold font-serif text-dark-gray">
                        <span className="text-primary mr-2">Exercice {exerciseNumber}</span>
                        {exercise.title && <span className="text-secondary font-normal text-xl">| {exercise.title}</span>}
                    </h2>
                    {exercise.hint && (
                        <button
                            onClick={() => setIsHintModalOpen(true)}
                            className="flex-shrink-0 flex items-center justify-center h-10 w-10 text-amber-600 bg-amber-100 rounded-full hover:bg-amber-200 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            title="Afficher l'indice"
                            aria-label="Afficher l'indice"
                        >
                            <span className="material-symbols-outlined text-2xl">lightbulb</span>
                        </button>
                    )}
                </div>

                <div className="prose max-w-none text-dark-gray">
                    <MathJax dynamic>{exercise.statement}</MathJax>
                    {exercise.sub_questions && <SubQuestionDisplay subQuestions={exercise.sub_questions} level={1} />}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-end">
                    <div className="flex gap-2 flex-wrap justify-end">
                        {feedbackOptions.map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => handleFeedback(opt.label)}
                                className={`px-3 py-1.5 text-sm font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 ${
                                    currentFeedback === opt.label
                                        ? opt.activeStyle
                                        : opt.style
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {exercise.hint && (
                <Modal
                    isOpen={isHintModalOpen}
                    onClose={() => setIsHintModalOpen(false)}
                    title="Indice"
                >
                    <div className="mt-4 prose max-w-none text-dark-gray">
                        <SubQuestionDisplay subQuestions={exercise.hint} level={1} />
                    </div>
                </Modal>
            )}
        </>
    );
};

const Exercises: React.FC = () => {
    const { state } = useContext(AppContext);
    const { currentChapterId, activities } = state;

    if (!currentChapterId) return null;
    
    const chapter = activities[currentChapterId];
    if (!chapter || !chapter.exercises || chapter.exercises.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-card-bg rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-6xl text-secondary/50">info</span>
                <p className="mt-4 font-semibold text-dark-gray">Il n'y a pas d'exercices dans ce chapitre.</p>
                <p className="text-secondary">Passez au quiz ou revenez plus tard.</p>
            </div>
        );
    }

    return (
        <div>
            {chapter.exercises.map((ex, index) => (
                <ExerciseCard key={ex.id} exercise={ex} exerciseNumber={index + 1} />
            ))}
        </div>
    );
};

export default Exercises;