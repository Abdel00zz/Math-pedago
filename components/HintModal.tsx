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

// Fonction pour parser le markdown simple
const parseMarkdown = (text: string): string => {
    // **texte** ou __texte__ -> <strong>texte</strong>
    let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // *texte* ou _texte_ -> <em>texte</em>
    parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/_(.+?)_/g, '<em>$1</em>');

    return parsed;
};

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise || !exercise.hint || exercise.hint.length === 0) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            className="sm:max-w-xl"
        >
            {/* Header compact et moderne */}
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                    <span className="material-symbols-outlined text-2xl text-amber-600">lightbulb</span>
                </div>
                <h2 className="text-2xl font-semibold text-text mb-1">Indices</h2>
                <p className="text-sm text-text-secondary">
                    {exercise.title}
                </p>
            </div>

            {/* Liste des indices - compact et moderne */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {exercise.hint.map((hint, index) => (
                    <div key={index} className="flex gap-3 p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/60">
                        {/* Numéro moderne et minimal */}
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-xs font-semibold">
                            {index + 1}
                        </div>

                        {/* Contenu de l'indice */}
                        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
                            <MathJax dynamic>
                                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(hint.text) }} />
                            </MathJax>
                            {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bouton fermer compact */}
            <div className="mt-4 text-center">
                <button
                    onClick={onClose}
                    className="font-button px-5 py-2 text-sm font-semibold text-amber-600 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                >
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default HintModal;