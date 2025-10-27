import React, { useState } from 'react';
import Modal from './Modal';
import { Exercise, SubQuestion } from '../types';
import { MathJax } from 'better-react-mathjax';

interface HintModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: Exercise | null | undefined;
}

const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => (
    <ol className="list-decimal pl-5 mt-2 space-y-2 antique-list text-gray-100 serif-text">
        {subQuestions?.map((sq, index) => (
            <li key={index}><MathJax dynamic>{autoWrapTeX(sq.text)}</MathJax></li>
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

// If a string contains TeX control sequences like \forall without delimiters,
// wrap them in inline math delimiters so MathJax will typeset them.
const autoWrapTeX = (text: string): string => {
    if (!text) return text;
    // If the text already contains explicit math delimiters, leave it as-is.
    if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) return text;

    // Replace occurrences of \command or \command{...} with $\command$ or $\command{...}$
    return text.replace(/\\([a-zA-Z]+(?:\{[^}]*\})?)/g, (m) => `$${m}$`);
};

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise || !exercise.hint || exercise.hint.length === 0) {
        return null;
    }

    // Open all hints by default so students see indices without clicking
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    // When modal opens or exercise changes, expand all indices
    React.useEffect(() => {
        if (isOpen && exercise?.hint) {
            setOpenIndexes(exercise.hint.map((_, i) => i));
        }
    }, [isOpen, exercise]);

    const toggleIndex = (i: number) => {
        setOpenIndexes(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            // On mobile use a large, nearly full-screen modal so hints are fully visible;
            // on desktop keep a wide modal.
            className="sm:max-w-4xl relative bg-surface text-black pt-12 px-4 sm:px-6 h-[90vh] sm:h-auto"
            hideHeaderBorder={true}
            titleClassName="sr-only"
            closePosition="right"
        >
            {/* Extreme top centered pill (overlapping the modal) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-30">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-300 to-amber-200 text-black px-3 py-1.5 rounded-full ring-1 ring-black/5">
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-amber-700">
                        <span className="material-symbols-outlined text-base">lightbulb</span>
                    </div>
                    <span className="font-medium text-sm">Indice</span>
                </div>
            </div>

            {/* Content area: modern glass cards with subtle accent */}
            <div className="mt-10 max-h-[72vh] sm:max-h-[64vh] overflow-y-auto space-y-4 px-2 sm:px-4 pb-6">
                {exercise.hint.map((hint, index) => {
                    const open = openIndexes.includes(index);
                    return (
                        <div
                                    key={index}
                                    className={`relative flex items-center gap-4 p-3 bg-surface/95 border border-amber-50 rounded-xl transition-shadow duration-150 ${open ? 'ring-1 ring-amber-100' : ''}`}
                                    onClick={() => toggleIndex(index)}
                                    role="button"
                                    aria-expanded={open}
                                >
                            {/* Number circle (centered vertically) */}
                            <div className="flex-shrink-0 z-10 w-8 h-8 flex items-center justify-center bg-amber-300 text-black rounded-full text-sm font-semibold">
                                {index + 1}
                            </div>


                            {/* Hint content: harmonize font size with MathJax; collapse elegantly to 3 lines when closed */}
                            <div className="flex-1 z-10 text-sm sm:text-base text-gray-100 leading-relaxed relative">
                                <div>
                                    {/* Render raw hint text through MathJax so TeX/LaTeX is compiled correctly. */}
                                    <MathJax dynamic>
                                        {autoWrapTeX(hint.text)}
                                    </MathJax>
                                    {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                                </div>
                            </div>

                            {/* no chevron: clean minimalist display */}
                        </div>
                    );
                })}
            </div>

            {/* Footer actions */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-300 to-amber-200 text-black rounded-lg font-medium ring-1 ring-amber-100 hover:opacity-95 transition"
                >
                    <span className="material-symbols-outlined">close</span>
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default HintModal;