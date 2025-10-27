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
            className="w-full sm:max-w-6xl relative bg-surface text-text pt-12 px-4 sm:px-6"
            hideHeaderBorder={true}
            titleClassName="sr-only"
            closePosition="right"
        >
            {/* Extreme top centered pill (overlapping the modal) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-30">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-300 to-amber-200 text-gray-900 px-3 py-1.5 rounded-full ring-1 ring-black/5">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-amber-700">
                        <span className="material-symbols-outlined text-base">lightbulb</span>
                    </div>
                    <span className="font-medium text-sm">Indice</span>
                </div>
            </div>

            {/* Content area: modern glass cards with subtle accent - All hints fully expanded */}
            <div className="mt-8 sm:mt-10 max-h-[70vh] overflow-y-auto space-y-3 sm:space-y-4 px-2 sm:px-4 pb-6">
                {exercise.hint.map((hint, index) => {
                    return (
                        <div
                            key={index}
                            className="relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-surface/95 border border-amber-50 rounded-xl"
                        >
                            {/* Number circle (aligned to top) */}
                            <div className="flex-shrink-0 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-amber-300 text-gray-900 rounded-full text-sm font-semibold">
                                {index + 1}
                            </div>

                            {/* Hint content: fully displayed, harmonized font size with MathJax */}
                            <div className="flex-1 z-10 text-sm sm:text-base text-text leading-relaxed">
                                <MathJax dynamic>
                                    <span className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: parseMarkdown(hint.text) }} />
                                </MathJax>
                                {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer actions */}
            <div className="mt-4 flex justify-end px-2 sm:px-0">
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-300 to-amber-200 text-gray-900 rounded-lg font-medium text-sm sm:text-base ring-1 ring-amber-100 hover:opacity-95 transition"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default HintModal;