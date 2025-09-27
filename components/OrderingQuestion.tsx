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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [touchY, setTouchY] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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

    // --- Touch Handlers for Mobile ---
    const handleTouchStart = (e: React.TouchEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted) return;
        const touch = e.touches[0];
        setTouchY(touch.clientY);
        setDraggingIndex(index);
        setIsDragging(true);
        e.currentTarget.classList.add('scale-105', 'shadow-2xl', 'z-50');
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLLIElement>) => {
        if (isReviewMode || isSubmitted || draggingIndex === null || touchY === null) return;
        
        const touch = e.touches[0];
        const currentY = touch.clientY;
        
        // Find which element we're over
        const targetElement = document.elementFromPoint(touch.clientX, currentY);
        const targetLi = targetElement?.closest('li[data-index]');
        
        if (targetLi) {
            const targetIndex = parseInt(targetLi.getAttribute('data-index') || '0');
            if (targetIndex !== draggingIndex) {
                const reorderedItems = [...items];
                const [draggedItem] = reorderedItems.splice(draggingIndex, 1);
                reorderedItems.splice(targetIndex, 0, draggedItem);
                
                setItems(reorderedItems);
                setDraggingIndex(targetIndex);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLLIElement>) => {
        if (isReviewMode || isSubmitted) return;
        e.currentTarget.classList.remove('scale-105', 'shadow-2xl', 'z-50');
        setDraggingIndex(null);
        setTouchY(null);
        setIsDragging(false);
    };

    // --- Drag and Drop Handlers for Desktop ---
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted) return;
        setDraggingIndex(index);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (isReviewMode || isSubmitted || draggingIndex === null || draggingIndex === index) return;
        
        const reorderedItems = [...items];
        const [draggedItem] = reorderedItems.splice(draggingIndex, 1);
        reorderedItems.splice(index, 0, draggedItem);

        setItems(reorderedItems);
        setDraggingIndex(index);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
        if (isReviewMode || isSubmitted) return;
        e.currentTarget.classList.remove('opacity-50');
        setDraggingIndex(null);
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    };

    // --- Button Controls for Mobile ---
    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (isReviewMode || isSubmitted) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;
        
        const reorderedItems = [...items];
        [reorderedItems[index], reorderedItems[newIndex]] = [reorderedItems[newIndex], reorderedItems[index]];
        
        setItems(reorderedItems);
        setSelectedIndex(newIndex);
    };

    // --- Review Mode UI ---
    if (isReviewMode || isSubmitted) {
        return (
            <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-title mb-4 sm:mb-6 text-text">
                    <MathJax dynamic>{question.question}</MathJax>
                </h3>

                <div className="space-y-6 sm:space-y-8">
                    <div>
                        <h4 className="text-base sm:text-lg font-semibold text-text mb-2 sm:mb-3 font-serif">Votre réponse :</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = correctOrder[index] === item;
                                const stepClass = `flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 ${isCorrect ? 'bg-success/10 border-success' : 'bg-error/10 border-error'}`;
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-success' : 'text-error';

                                return (
                                    <li key={index} className={stepClass}>
                                        <span className="font-bold text-sm sm:text-lg text-text min-w-[1.5rem]">{index + 1}.</span>
                                        <div className="flex-1 text-sm sm:text-base text-text"><MathJax dynamic>{item}</MathJax></div>
                                        <span className={`material-symbols-outlined !text-lg sm:!text-xl mt-0.5 ${iconClass}`}>{icon}</span>
                                    </li>
                                );
                            }) : <li className="text-text-secondary italic p-2 sm:p-3 text-sm sm:text-base">Vous n'avez pas répondu à cette question.</li>}
                        </ul>
                    </div>

                    <div className="pt-4 sm:pt-6 border-t border-border">
                        <h4 className="text-base sm:text-lg font-semibold text-text mb-2 sm:mb-3 font-serif">Réponse correcte :</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {correctOrder.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background border border-border">
                                    <span className="font-bold text-primary text-sm sm:text-lg min-w-[1.5rem]">{index + 1}.</span>
                                    <div className="flex-1 text-sm sm:text-base text-text-secondary"><MathJax dynamic>{item}</MathJax></div>
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
        <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-title mb-4 sm:mb-6 lg:mb-8 text-text text-center px-2">
                <MathJax dynamic>{question.question}</MathJax>
            </h3>

            {/* Instructions for mobile */}
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg sm:hidden">
                <p className="text-xs text-text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined !text-base">info</span>
                    <span>Glissez les éléments ou utilisez les boutons pour réorganiser</span>
                </p>
            </div>

            <ul className="space-y-2 sm:space-y-3 max-w-full sm:max-w-lg mx-auto">
                {items.map((item, index) => (
                    <li
                        key={item}
                        ref={el => itemRefs.current[index] = el}
                        data-index={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={(e) => handleTouchMove(e)}
                        onTouchEnd={(e) => handleTouchEnd(e)}
                        onClick={() => setSelectedIndex(index)}
                        className={`
                            group relative flex items-center gap-2 sm:gap-3 lg:gap-4 
                            p-3 sm:p-4 rounded-lg border-2 bg-background 
                            cursor-grab active:cursor-grabbing transition-all duration-200
                            touch-none select-none
                            ${selectedIndex === index ? 'border-primary shadow-lg' : 'border-border'}
                            ${draggingIndex === index && isDragging ? 'shadow-2xl scale-105 bg-border/50 z-50' : ''}
                            ${!isDragging ? 'hover:border-primary/50' : ''}
                        `}
                    >
                        {/* Drag handle - hidden on mobile when buttons are shown */}
                        <span 
                            className="material-symbols-outlined text-text-secondary touch-none cursor-grab active:cursor-grabbing hidden sm:block !text-xl lg:!text-2xl"
                            aria-label="Déplacer l'élément"
                        >
                            drag_indicator
                        </span>

                        {/* Number */}
                        <span className="font-bold text-base sm:text-lg text-primary min-w-[1.5rem]">{index + 1}.</span>
                        
                        {/* Content */}
                        <div className="flex-1 text-sm sm:text-base text-text font-sans pr-2">
                            <MathJax dynamic>{item}</MathJax>
                        </div>

                        {/* Mobile controls */}
                        <div className="flex flex-col gap-1 sm:hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(index, 'up');
                                }}
                                disabled={index === 0}
                                className={`
                                    p-1 rounded transition-colors
                                    ${index === 0 
                                        ? 'text-text-secondary/30' 
                                        : 'text-text-secondary active:bg-primary/20 hover:text-primary'
                                    }
                                `}
                                aria-label="Monter"
                            >
                                <span className="material-symbols-outlined !text-xl">arrow_upward</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveItem(index, 'down');
                                }}
                                disabled={index === items.length - 1}
                                className={`
                                    p-1 rounded transition-colors
                                    ${index === items.length - 1 
                                        ? 'text-text-secondary/30' 
                                        : 'text-text-secondary active:bg-primary/20 hover:text-primary'
                                    }
                                `}
                                aria-label="Descendre"
                            >
                                <span className="material-symbols-outlined !text-xl">arrow_downward</span>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderingQuestion;