import React from 'react';
import Modal from './Modal';
import { Exercise, SubQuestion } from '../types';
import { MathJax } from 'better-react-mathjax';

interface HintModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: Exercise | null | undefined;
}

const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => (
    <ol className="list-decimal pl-5 mt-2 space-y-2 antique-list text-text-secondary serif-text">
        {subQuestions?.map((sq, index) => (
            <li key={index}><MathJax dynamic>{sq.text}</MathJax></li>
        ))}
    </ol>
);

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise || !exercise.hint || exercise.hint.length === 0) {
        return null;
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title=""
            className="sm:max-w-2xl"
        >
            <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-amber-500/10 rounded-full text-amber-500 mb-4">
                    <span className="material-symbols-outlined text-4xl">lightbulb</span>
                </div>
                <h2 className="text-3xl font-playfair text-text">Indice</h2>
                <p className="text-base text-text-secondary font-garamond italic mt-1">
                    {`Pour l'exercice : "${exercise.title}"`}
                </p>
            </div>
            
            <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {exercise.hint.map((hint, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border serif-text text-text-secondary">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-amber-500/20 rounded-full mt-1">
                            <span className="material-symbols-outlined !text-sm text-amber-500">spark</span>
                        </div>
                        <div className="flex-1">
                            <MathJax dynamic>{hint.text}</MathJax>
                            {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                        </div>
                    </li>
                ))}
            </ul>
            
             <div className="mt-6 text-right">
                <button
                    onClick={onClose}
                    className="font-button px-6 py-2 font-semibold text-primary bg-primary-light rounded-lg hover:bg-primary/20"
                >
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default HintModal;