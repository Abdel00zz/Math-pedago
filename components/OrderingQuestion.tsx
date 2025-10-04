import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Question } from '../types';
import { MathJax } from 'better-react-mathjax';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
    onOptionChange: (answer: string[]) => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: string[]): string[] => {
    if (!array) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ question, userAnswer, isReviewMode, isSubmitted, onOptionChange }) => {
    const correctOrder = useMemo(() => question.steps || [], [question.steps]);

    // Initialize items: use user's answer if available, otherwise shuffle the steps for a new attempt.
    const initialItems = useMemo(() => {
        return (userAnswer && userAnswer.length > 0)
            ? userAnswer
            : shuffleArray(correctOrder);
    }, [correctOrder, userAnswer]);

    const [items, setItems] = useState<string[]>(initialItems);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    // Effect to reset state if the question changes
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Effect to notify parent of changes in order
    useEffect(() => {
        if (!isReviewMode && !isSubmitted) {
            onOptionChange(items);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, isReviewMode, isSubmitted]);

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted) return;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Hide the original element slightly for a better "ghost" effect
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted || draggingIndex === null || draggingIndex === index) return;
        
        // Live reordering logic
        const reorderedItems = [...items];
        const [draggedItem] = reorderedItems.splice(draggingIndex, 1);
        reorderedItems.splice(index, 0, draggedItem);

        setItems(reorderedItems);
        setDraggingIndex(index); // Update the index as the item moves
    };

    const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
        if (isReviewMode || isSubmitted) return;
        e.currentTarget.classList.remove('opacity-50');
        setDraggingIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault(); // This is necessary to allow dropping
    };


    // --- Review Mode UI ---
    if (isReviewMode || isSubmitted) {
        return (
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <h3 className="text-2xl font-title mb-6 text-text">
                    <MathJax dynamic>{question.question}</MathJax>
                </h3>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Votre réponse :</h4>
                        <ul className="space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = correctOrder[index] === item;
                                const stepClass = `flex items-start gap-3 p-3 rounded-lg border-2 ${isCorrect ? 'bg-success/10 border-success' : 'bg-error/10 border-error'}`;
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-success' : 'text-error';

                                return (
                                    <li key={index} className={stepClass}>
                                        <span className="font-bold text-lg text-text">{index + 1}.</span>
                                        <div className="flex-1 text-text"><MathJax dynamic>{item}</MathJax></div>
                                        <span className={`material-symbols-outlined !text-xl mt-0.5 ${iconClass}`}>{icon}</span>
                                    </li>
                                );
                            }) : <li className="text-text-secondary italic p-3">Vous n'avez pas répondu à cette question.</li>}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Réponse correcte :</h4>
                         <ul className="space-y-3">
                            {correctOrder.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                                    <span className="font-bold text-primary text-lg">{index + 1}.</span>
                                    <div className="flex-1 text-text-secondary"><MathJax dynamic>{item}</MathJax></div>
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
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-2xl font-title mb-8 text-text text-center">
                <MathJax dynamic>{question.question}</MathJax>
            </h3>

            <ul className="space-y-3 max-w-lg mx-auto">
                {items.map((item, index) => (
                    <li
                        key={item} // Assuming item text is unique
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        className={`group flex items-center gap-4 p-4 rounded-lg border-2 bg-background cursor-grab active:cursor-grabbing transition-all duration-200 ${draggingIndex === index ? 'shadow-2xl scale-105 bg-border/50' : 'hover:border-primary/50'}`}
                    >
                        <span 
                            className="material-symbols-outlined text-text-secondary touch-none cursor-grab active:cursor-grabbing"
                            aria-label="Déplacer l'élément"
                        >
                            drag_indicator
                        </span>
                        <span className="font-bold text-lg text-primary">{index + 1}.</span>
                        <div className="flex-1 text-text font-sans">
                            <MathJax dynamic>{item}</MathJax>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderingQuestion;
