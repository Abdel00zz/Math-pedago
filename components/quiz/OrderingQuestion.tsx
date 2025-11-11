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
    const correctOrder = useMemo(() => question.steps || [], [question.steps]);

    const initialItems = useMemo(() => {
        if (userAnswer && userAnswer.length > 0) {
            return userAnswer;
        }

        const cacheKey = `${question.id}-shuffle`;
        return getShuffledSteps(correctOrder, cacheKey);
    }, [correctOrder, userAnswer, question.id]);

    const [items, setItems] = useState<string[]>(initialItems);
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        if (isReviewMode || isSubmitted) return;

        const timer = setTimeout(() => {
            onOptionChange(items);
        }, 100);

        return () => clearTimeout(timer);
    }, [items, isReviewMode, isSubmitted, onOptionChange]);

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

    // --- REVIEW/SUBMITTED MODE - Optimisé pour mobile ---
    if (isReviewMode || isSubmitted) {
        return (
            <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border coursera-shadow-card animate-fadeIn quiz-content">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 coursera-shadow-soft">
                    <h3 className="quiz-question-text font-title leading-relaxed font-semibold text-coursera-black text-base sm:text-lg md:text-xl">
                        <FormattedText text={question.question} />
                    </h3>
                </div>                <div className="space-y-6 sm:space-y-8">
                    <div>
                        <h4 className="text-base sm:text-lg font-semibold text-text mb-2 sm:mb-3">Votre réponse :</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = correctOrder[index] === item;
                                const stepClass = `flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                                    isCorrect
                                        ? 'bg-green-50 border-green-500 shadow-[0_4px_12px_rgba(34,197,94,0.15)]'
                                        : 'bg-red-50 border-red-400 shadow-[0_4px_12px_rgba(239,68,68,0.15)]'
                                }`;
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-green-600' : 'text-red-500';

                                return (
                                    <li key={index} className={stepClass}>
                                        <span className="font-bold text-base sm:text-lg text-[#1a1a1a] min-w-[20px] sm:min-w-[24px]">{index + 1}.</span>
                                        <div className="flex-1 text-[#1a1a1a] text-sm sm:text-base md:text-lg leading-relaxed flex items-center">
                                            <FormattedText text={item} />
                                        </div>
                                        <span className={`material-symbols-outlined !text-xl sm:!text-2xl ${iconClass} flex-shrink-0`}>
                                            {icon}
                                        </span>
                                    </li>
                                );
                            }) : (
                                <li className="text-text-secondary italic p-3 sm:p-4 text-center text-sm sm:text-base">
                                    Vous n'avez pas répondu à cette question.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-4 sm:pt-6 border-t border-border">
                        <h4 className="text-base sm:text-lg font-semibold text-text mb-2 sm:mb-3">Réponse correcte :</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {correctOrder.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface border-2 border-primary/30">
                                    <span className="font-bold text-primary text-base sm:text-lg min-w-[20px] sm:min-w-[24px]">{index + 1}.</span>
                                    <div className="flex-1 text-text text-sm sm:text-base md:text-lg leading-relaxed flex items-center">
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

    // --- ACTIVE MODE - MINIMALIST DESIGN - Optimisé pour mobile ---
    return (
        <>
            <style>{`
                @keyframes softSlide {
                    0% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(-8px); opacity: 0.7; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animating {
                    animation: softSlide 0.35s ease-out;
                }
            `}</style>

        <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border coursera-shadow-card animate-fadeIn quiz-content">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 coursera-shadow-soft">
                <h3 className="quiz-question-text font-title leading-relaxed font-semibold text-coursera-black text-base sm:text-lg md:text-xl">
                    <FormattedText text={question.question} />
                </h3>
            </div>                <div className="text-center mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm md:text-[15px] text-text-secondary leading-relaxed">
                        Cliquez sur les flèches pour réorganiser
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <ul className="space-y-2 sm:space-y-3">
                        {items.map((item, index) => (
                            <li
                                key={item}
                                className={`relative group ${
                                    animatingIndex === index ? 'animating' : ''
                                }`}
                            >
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                    {/* Carte d'élément */}
                                    <div className="flex-1 flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-border bg-surface/50 hover:bg-surface transition-all duration-200 hover:border-primary/30 touch-manipulation">
                                        {/* Petit numéro doux */}
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="font-medium text-xs sm:text-sm md:text-base text-primary">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Texte */}
                                        <div className="flex-1 text-text text-sm sm:text-base md:text-lg leading-relaxed flex items-center">
                                            <FormattedText text={item} />
                                        </div>
                                    </div>

                                    {/* Flèches minimalistes - À DROITE - Optimisé pour touch */}
                                    <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className={`p-2 sm:p-2.5 transition-all duration-200 rounded-lg touch-manipulation ${
                                                index === 0
                                                    ? 'text-text-disabled/40 cursor-not-allowed'
                                                    : 'text-text-secondary hover:text-primary active:scale-90 hover:scale-110 hover:bg-primary/10'
                                            }`}
                                            aria-label="Déplacer vers le haut"
                                        >
                                            <span className="material-symbols-outlined !text-lg sm:!text-xl md:!text-2xl">
                                                arrow_upward
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => moveDown(index)}
                                            disabled={index === items.length - 1}
                                            className={`p-2 sm:p-2.5 transition-all duration-200 rounded-lg touch-manipulation ${
                                                index === items.length - 1
                                                    ? 'text-text-disabled/40 cursor-not-allowed'
                                                    : 'text-text-secondary hover:text-primary active:scale-90 hover:scale-110 hover:bg-primary/10'
                                            }`}
                                            aria-label="Déplacer vers le bas"
                                        >
                                            <span className="material-symbols-outlined !text-lg sm:!text-xl md:!text-2xl">
                                                arrow_downward
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-center mt-6 sm:mt-8">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-text-secondary hover:text-primary transition-all text-xs sm:text-sm font-medium hover:scale-105 active:scale-95 touch-manipulation hover:bg-primary/10"
                    >
                        <span className="material-symbols-outlined !text-base sm:!text-lg">refresh</span>
                        Réinitialiser
                    </button>
                </div>
            </div>
        </>
    );
};

export const clearShuffleCache = () => {
    shuffleCache.clear();
};

export default OrderingQuestion;
