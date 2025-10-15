import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Question } from '../../types';
import { useMathJax } from '../../hooks/useMathJax';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
    onOptionChange: (answer: string[]) => void;
}

// ✅ OPTIMISATION 1: Fisher-Yates shuffle optimisé
const shuffleArray = (array: string[]): string[] => {
    if (!array || array.length === 0) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// ✅ OPTIMISATION 2: Cache pour éviter reshuffle constant
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
    // ✅ OPTIMISATION 3: Mémorisation de l'ordre correct
    const correctOrder = useMemo(() => question.steps || [], [question.steps]);

    // ✅ OPTIMISATION 4: Initialisation avec cache
    const initialItems = useMemo(() => {
        if (userAnswer && userAnswer.length > 0) {
            return userAnswer;
        }
        
        // Utiliser un cache basé sur l'ID de la question
        const cacheKey = `${question.id}-shuffle`;
        return getShuffledSteps(correctOrder, cacheKey);
    }, [correctOrder, userAnswer, question.id]);

    const [items, setItems] = useState<string[]>(initialItems);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const containerId = useMemo(() => `ordering-question-${question.id}`, [question.id]);

    useMathJax(
        [question, userAnswer, isReviewMode, isSubmitted, items],
        {
            containerId,
            delay: 80,
            onError: (error) => console.error('❌ Erreur MathJax OrderingQuestion:', error),
        }
    );

    // Reset state si la question change
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // ✅ OPTIMISATION 5: Notification parent avec debounce
    useEffect(() => {
        if (isReviewMode || isSubmitted) return;
        
        // Petit délai pour éviter trop d'appels
        const timer = setTimeout(() => {
            onOptionChange(items);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [items, isReviewMode, isSubmitted, onOptionChange]);

    // ✅ OPTIMISATION 6: Handlers mémorisés
    const handleDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted) return;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-50');
    }, [isReviewMode, isSubmitted]);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted || draggingIndex === null || draggingIndex === index) return;
        
        // Live reordering
        setItems(prevItems => {
            const reorderedItems = [...prevItems];
            const [draggedItem] = reorderedItems.splice(draggingIndex, 1);
            reorderedItems.splice(index, 0, draggedItem);
            return reorderedItems;
        });
        
        setDraggingIndex(index);
        setHoverIndex(index);
    }, [isReviewMode, isSubmitted, draggingIndex]);

    const handleDragEnd = useCallback((e: React.DragEvent<HTMLLIElement>) => {
        if (isReviewMode || isSubmitted) return;
        e.currentTarget.classList.remove('opacity-50');
        setDraggingIndex(null);
        setHoverIndex(null);
    }, [isReviewMode, isSubmitted]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    }, []);

    const handleDragLeave = useCallback(() => {
        if (isReviewMode || isSubmitted) return;
        setHoverIndex(null);
    }, [isReviewMode, isSubmitted]);

    const handleReset = useCallback(() => {
        if (isReviewMode || isSubmitted) return;
        const nextOrder = [...initialItems];
        setItems(nextOrder);
        setHoverIndex(null);
    }, [initialItems, isReviewMode, isSubmitted]);

    // --- RENDER LOGIC ---

    if (isReviewMode || isSubmitted) {
        return (
            <div id={containerId} className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <h3 className="text-2xl font-title mb-6 text-text">
                    {question.question}
                </h3>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Votre réponse :</h4>
                        <ul className="space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = correctOrder[index] === item;
                                const stepClass = `flex items-start gap-3 p-3 rounded-lg border-2 ${
                                    isCorrect ? 'bg-success/10 border-success' : 'bg-error/10 border-error'
                                }`;
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-success' : 'text-error';

                                return (
                                    <li key={index} className={stepClass}>
                                        <span className="font-bold text-lg text-text">{index + 1}.</span>
                                        <div className="flex-1 text-text">{item}</div>
                                        <span className={`material-symbols-outlined !text-xl mt-0.5 ${iconClass}`}>
                                            {icon}
                                        </span>
                                    </li>
                                );
                            }) : (
                                <li className="text-text-secondary italic p-3">
                                    Vous n'avez pas répondu à cette question.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Réponse correcte :</h4>
                        <ul className="space-y-3">
                            {correctOrder.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                                    <span className="font-bold text-primary text-lg">{index + 1}.</span>
                                    <div className="flex-1 text-text-secondary">
                                        {item}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // --- Active Drag-and-Drop UI ---
    return (
        <div id={containerId} className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-2xl font-title mb-4 text-text text-center">
                {question.question}
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
                Maintenez, glissez et déposez les étapes pour construire la démarche correcte.
            </p>

            <ul className="space-y-3 max-w-lg mx-auto">
                {items.map((item, index) => (
                    <li
                        key={item}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`group flex items-center gap-4 p-4 rounded-lg border-2 bg-background cursor-grab active:cursor-grabbing transition-all duration-200 ${
                            draggingIndex === index 
                                ? 'shadow-2xl scale-105 bg-border/50' 
                                : hoverIndex === index
                                ? 'border-warning bg-warning/15 shadow-[0_8px_24px_rgba(245,158,11,0.15)]'
                                : 'hover:border-primary/50'
                        }`}
                    >
                        <span 
                            className="material-symbols-outlined text-text-secondary touch-none cursor-grab active:cursor-grabbing"
                            aria-label="Déplacer l'élément"
                        >
                            drag_indicator
                        </span>
                        <span className="font-bold text-lg text-primary">{index + 1}.</span>
                        <div className="flex-1 text-text font-sans">{item}</div>
                    </li>
                ))}
            </ul>

            <div className="text-center mt-6">
                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text hover:border-primary/60 transition-colors text-sm"
                >
                    Réinitialiser le mélange
                </button>
            </div>
        </div>
    );
};

// ✅ OPTIMISATION 7: Fonction pour nettoyer le cache
export const clearShuffleCache = () => {
    shuffleCache.clear();
};

export default OrderingQuestion;