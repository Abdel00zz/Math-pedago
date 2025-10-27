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

    // --- ACTIVE MODE - CREATIVE BUTTON LAYOUT ---
    return (
        <>
            <style>{`
                @keyframes slideUpItem {
                    0% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(-12px); opacity: 0.6; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDownItem {
                    0% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(12px); opacity: 0.6; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animating-up {
                    animation: slideUpItem 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .animating-down {
                    animation: slideDownItem 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* Ligne de connexion entre les éléments */
                .connection-line {
                    position: absolute;
                    left: 32px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(to bottom,
                        transparent 0%,
                        rgba(255, 107, 53, 0.15) 20%,
                        rgba(255, 107, 53, 0.15) 80%,
                        transparent 100%
                    );
                }
            `}</style>

            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 rounded-xl mb-4 shadow-lg">
                    <h3 className="text-[23px] md:text-[25px] font-title text-center leading-relaxed font-semibold text-white">
                        <FormattedText text={question.question} />
                    </h3>
                </div>

                <div className="text-center mb-6 px-4">
                    <p className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            Cliquez sur les flèches pour réorganiser
                        </span>
                    </p>
                </div>

                <div className="max-w-3xl mx-auto relative">
                    {/* Ligne de connexion verticale */}
                    {items.length > 1 && <div className="connection-line hidden sm:block"></div>}

                    <ul className="space-y-4">
                        {items.map((item, index) => (
                            <li
                                key={item}
                                className={`relative group ${
                                    animatingIndex === index ? 'animating-up' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* Boutons de contrôle - À GAUCHE */}
                                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                                                index === 0
                                                    ? 'bg-surface border-2 border-border text-text-disabled cursor-not-allowed opacity-40'
                                                    : 'bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white hover:shadow-xl hover:shadow-primary/30 active:scale-95 hover:scale-105 border-2 border-primary/20'
                                            }`}
                                            aria-label="Déplacer vers le haut"
                                        >
                                            <span className="material-symbols-outlined !text-3xl sm:!text-4xl font-bold">
                                                arrow_upward
                                            </span>
                                            {index !== 0 && (
                                                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => moveDown(index)}
                                            disabled={index === items.length - 1}
                                            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                                                index === items.length - 1
                                                    ? 'bg-surface border-2 border-border text-text-disabled cursor-not-allowed opacity-40'
                                                    : 'bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white hover:shadow-xl hover:shadow-primary/30 active:scale-95 hover:scale-105 border-2 border-primary/20'
                                            }`}
                                            aria-label="Déplacer vers le bas"
                                        >
                                            <span className="material-symbols-outlined !text-3xl sm:!text-4xl font-bold">
                                                arrow_downward
                                            </span>
                                            {index !== items.length - 1 && (
                                                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Carte d'élément */}
                                    <div className="flex-1 flex items-center gap-4 p-5 sm:p-6 rounded-xl border-2 border-border bg-surface/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-200 hover:border-primary/40 group-hover:scale-[1.01]">
                                        {/* Badge numéro */}
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                                            <span className="font-bold text-xl sm:text-2xl text-white">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Texte */}
                                        <div className="flex-1 text-text text-[17px] sm:text-[19px] leading-relaxed font-medium">
                                            <FormattedText text={item} />
                                        </div>

                                        {/* Indicateur de drag (visuel) */}
                                        <div className="hidden sm:flex flex-col gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                                            <div className="w-1 h-1 rounded-full bg-text-secondary"></div>
                                            <div className="w-1 h-1 rounded-full bg-text-secondary"></div>
                                            <div className="w-1 h-1 rounded-full bg-text-secondary"></div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-center mt-8">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border-2 border-border text-text hover:text-primary hover:border-primary transition-all shadow-soft hover:shadow-md text-sm font-semibold uppercase tracking-wide hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined !text-xl">refresh</span>
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
