import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Question } from '../../types';
import FormattedText from '../FormattedText';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
    onOptionChange: (answer: string[]) => void;
}

// Fisher-Yates shuffle optimisé
const shuffleArray = (array: string[]): string[] => {
    if (!array || array.length === 0) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Cache pour éviter reshuffle constant
const shuffleCache = new Map<string, string[]>();

const getShuffledSteps = (steps: string[], cacheKey: string): string[] => {
    if (shuffleCache.has(cacheKey)) {
        return shuffleCache.get(cacheKey)!;
    }

    const shuffled = shuffleArray(steps);
    shuffleCache.set(cacheKey, shuffled);

    // Limiter la taille du cache
    if (shuffleCache.size > 20) {
        const firstKey = shuffleCache.keys().next().value;
        shuffleCache.delete(firstKey);
    }

    return shuffled;
};

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
    question,
    userAnswer,
    isReviewMode,
    isSubmitted,
    onOptionChange
}) => {
    // Mémorisation de l'ordre correct
    const correctOrder = useMemo(() => question.steps || [], [question.steps]);

    // Initialisation avec cache
    const initialItems = useMemo(() => {
        if (userAnswer && userAnswer.length > 0) {
            return userAnswer;
        }

        const cacheKey = `${question.id}-shuffle`;
        return getShuffledSteps(correctOrder, cacheKey);
    }, [correctOrder, userAnswer, question.id]);

    const [items, setItems] = useState<string[]>(initialItems);
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

    // Reset state si la question change
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Notification parent avec debounce
    useEffect(() => {
        if (isReviewMode || isSubmitted) return;

        const timer = setTimeout(() => {
            onOptionChange(items);
        }, 100);

        return () => clearTimeout(timer);
    }, [items, isReviewMode, isSubmitted, onOptionChange]);

    // Move item up
    const moveUp = useCallback((index: number) => {
        if (index === 0 || isReviewMode || isSubmitted) return;

        setAnimatingIndex(index);
        setTimeout(() => {
            setItems(prevItems => {
                const newItems = [...prevItems];
                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                return newItems;
            });
            setTimeout(() => setAnimatingIndex(null), 300);
        }, 150);
    }, [isReviewMode, isSubmitted]);

    // Move item down
    const moveDown = useCallback((index: number) => {
        if (index === items.length - 1 || isReviewMode || isSubmitted) return;

        setAnimatingIndex(index);
        setTimeout(() => {
            setItems(prevItems => {
                const newItems = [...prevItems];
                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                return newItems;
            });
            setTimeout(() => setAnimatingIndex(null), 300);
        }, 150);
    }, [items.length, isReviewMode, isSubmitted]);

    const handleReset = useCallback(() => {
        if (isReviewMode || isSubmitted) return;
        setItems([...initialItems]);
    }, [initialItems, isReviewMode, isSubmitted]);

    // --- REVIEW/SUBMITTED MODE ---
    if (isReviewMode || isSubmitted) {
        return (
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <div className="bg-black text-white px-6 py-4 rounded-xl mb-6 shadow-lg">
                    <h3 className="text-[23px] md:text-[25px] font-title leading-relaxed font-semibold">
                        <FormattedText text={question.question} />
                    </h3>
                </div>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-semibold text-text mb-3">Votre réponse :</h4>
                        <ul className="space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = correctOrder[index] === item;
                                const stepClass = `flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                                    isCorrect
                                        ? 'bg-green-50 border-green-500 shadow-[0_4px_12px_rgba(34,197,94,0.15)]'
                                        : 'bg-red-50 border-red-400 shadow-[0_4px_12px_rgba(239,68,68,0.15)]'
                                }`;
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-green-600' : 'text-red-500';

                                return (
                                    <li key={index} className={stepClass}>
                                        <span className="font-bold text-lg text-[#1a1a1a] min-w-[24px]">{index + 1}.</span>
                                        <div className="flex-1 text-[#1a1a1a] text-[18px] leading-relaxed">
                                            <FormattedText text={item} />
                                        </div>
                                        <span className={`material-symbols-outlined !text-2xl ${iconClass}`}>
                                            {icon}
                                        </span>
                                    </li>
                                );
                            }) : (
                                <li className="text-text-secondary italic p-4 text-center">
                                    Vous n'avez pas répondu à cette question.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h4 className="text-lg font-semibold text-text mb-3">Réponse correcte :</h4>
                        <ul className="space-y-3">
                            {correctOrder.map((item, index) => (
                                <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-surface border-2 border-primary/30">
                                    <span className="font-bold text-primary text-lg min-w-[24px]">{index + 1}.</span>
                                    <div className="flex-1 text-text text-[18px] leading-relaxed">
                                        <FormattedText text={item} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTIVE MODE - BUTTON-BASED REORDERING ---
    return (
        <>
            <style>{`
                @keyframes slideUp {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-8px); opacity: 0.7; }
                    100% { transform: translateY(0); }
                }
                @keyframes slideDown {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(8px); opacity: 0.7; }
                    100% { transform: translateY(0); }
                }
                .animating {
                    animation: slideUp 0.3s ease-in-out;
                }
            `}</style>
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <div className="bg-black text-white px-6 py-4 rounded-xl mb-4 shadow-lg">
                    <h3 className="text-[23px] md:text-[25px] font-title text-center leading-relaxed font-semibold">
                        <FormattedText text={question.question} />
                    </h3>
                </div>
                <p className="text-[16px] text-text-secondary text-center mb-6 leading-relaxed">
                    ⬆️ Utilisez les flèches pour réordonner les étapes ⬇️
                </p>

                <ul className="space-y-3 max-w-2xl mx-auto">
                    {items.map((item, index) => (
                        <li
                            key={item}
                            className={`group flex items-center gap-3 p-4 sm:p-5 rounded-xl border-2 bg-white transition-all duration-200 shadow-md hover:shadow-lg ${
                                animatingIndex === index ? 'animating scale-[1.02]' : ''
                            } border-slate-300 hover:border-blue-400`}
                        >
                            {/* Numéro */}
                            <span className="font-bold text-xl text-primary min-w-[32px] text-center">{index + 1}</span>

                            {/* Texte */}
                            <div className="flex-1 text-[#1a1a1a] text-[18px] sm:text-[19px] leading-relaxed font-medium px-2">
                                <FormattedText text={item} />
                            </div>

                            {/* Boutons Up/Down */}
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                    className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                        index === 0
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg'
                                    }`}
                                    aria-label="Déplacer vers le haut"
                                >
                                    <span className="material-symbols-outlined !text-2xl">arrow_upward</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveDown(index)}
                                    disabled={index === items.length - 1}
                                    className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                        index === items.length - 1
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg'
                                    }`}
                                    aria-label="Déplacer vers le bas"
                                >
                                    <span className="material-symbols-outlined !text-2xl">arrow_downward</span>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border-2 border-border text-text hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md text-sm font-medium"
                    >
                        <span className="material-symbols-outlined !text-xl">refresh</span>
                        Réinitialiser l'ordre
                    </button>
                </div>
            </div>
        </>
    );
};

// Fonction pour nettoyer le cache
export const clearShuffleCache = () => {
    shuffleCache.clear();
};

export default OrderingQuestion;
