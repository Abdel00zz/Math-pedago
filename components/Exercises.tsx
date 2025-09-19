import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Chapter, Exercise, Feedback, SubQuestion } from '../types';
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


const ExerciseCard: React.FC<{ exercise: Exercise; exerciseNumber: number; isWorkSubmitted: boolean }> = ({ exercise, exerciseNumber, isWorkSubmitted }) => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, progress } = state;
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);
    
    if (!currentChapterId) return null;

    const chapterProgress = progress[currentChapterId];
    const currentFeedback = chapterProgress?.exercisesFeedback[exercise.id];

    const handleFeedback = (feedback: Feedback) => {
        if (isWorkSubmitted) return;
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId: exercise.id, feedback } });
    };

    const feedbackOptions: { label: Feedback, style: string, activeStyle: string }[] = [
        { 
            label: 'Facile', 
            style: 'bg-white border-slate-200 hover:border-green-400 text-slate-700', 
            activeStyle: 'bg-green-50 border-green-500 ring-2 ring-green-400 text-green-800 font-bold',
        },
        { 
            label: 'Moyen', 
            style: 'bg-white border-slate-200 hover:border-amber-400 text-slate-700', 
            activeStyle: 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 text-amber-800 font-bold',
        },
        { 
            label: 'Difficile', 
            style: 'bg-white border-slate-200 hover:border-red-400 text-slate-700', 
            activeStyle: 'bg-red-50 border-red-500 ring-2 ring-red-400 text-red-800 font-bold',
        },
        { 
            label: 'Pas travaillé', 
            style: 'bg-white border-slate-200 hover:border-gray-400 text-slate-700', 
            activeStyle: 'bg-gray-100 border-gray-500 ring-2 ring-gray-400 text-gray-800 font-bold',
        },
    ];

    return (
        <>
            <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        <span className="text-blue-500 mr-3">Exercice {exerciseNumber}</span>
                        {exercise.title && <span className="text-slate-500 font-normal text-xl">| {exercise.title}</span>}
                    </h2>
                    {exercise.hint && (
                        <button
                            onClick={() => setIsHintModalOpen(true)}
                            className="flex-shrink-0 flex items-center justify-center h-11 w-11 text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            title="Afficher l'indice"
                            aria-label="Afficher l'indice"
                        >
                            <span className="material-symbols-outlined text-2xl">lightbulb</span>
                        </button>
                    )}
                </div>

                <div className="prose max-w-none text-slate-700 leading-relaxed">
                    <MathJax dynamic>{exercise.statement}</MathJax>
                    {exercise.sub_questions && <SubQuestionDisplay subQuestions={exercise.sub_questions} level={1} />}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end">
                    <div className="flex gap-3 flex-wrap justify-end">
                        {feedbackOptions.map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => handleFeedback(opt.label)}
                                disabled={isWorkSubmitted}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all border-2 ${
                                    currentFeedback === opt.label
                                        ? opt.activeStyle
                                        : opt.style
                                } ${isWorkSubmitted ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5 active:scale-95'}`}
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

interface ExercisesProps {
    chapter: Chapter;
    title: string;
}

const Exercises: React.FC<ExercisesProps> = ({ chapter, title }) => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, progress } = state;

    if (!currentChapterId) return null;
    
    const chapterProgress = progress[currentChapterId];

    if (!chapter || !chapter.exercises || chapter.exercises.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-card-bg rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-6xl text-secondary/50">info</span>
                <p className="mt-4 font-semibold text-dark-gray">Il n'y a pas d'exercices dans cette activité.</p>
                <p className="text-secondary">Passez au quiz ou revenez plus tard.</p>
            </div>
        );
    }

    const isWorkSubmitted = chapterProgress?.isWorkSubmitted || false;

    return (
        <div className="w-full max-w-3xl my-auto mx-auto">
            <header className="relative mb-6 grid grid-cols-3 items-center">
                <div className="flex justify-start">
                    <button
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })}
                        className="flex items-center justify-center h-11 w-11 text-slate-500 bg-white rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95"
                        aria-label="Retour au hub du chapitre"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-slate-800 truncate">{chapter.chapter}</h2>
                    <p className="text-sm text-slate-500">{title}</p>
                </div>
                <div />
            </header>
            {chapter.exercises.map((ex, index) => (
                <ExerciseCard key={ex.id} exercise={ex} exerciseNumber={index + 1} isWorkSubmitted={isWorkSubmitted} />
            ))}
        </div>
    );
};

export default Exercises;