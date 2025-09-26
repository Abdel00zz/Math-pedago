import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { Question } from '../types';
import { MathJax } from 'better-react-mathjax';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
}

// Fisher-Yates shuffle
const shuffleArray = (array: string[]): string[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ question, userAnswer, isReviewMode, isSubmitted }) => {
    const dispatch = useAppDispatch();
    
    const [orderedItems, setOrderedItems] = useState<string[]>(() => {
        if (userAnswer && userAnswer.length > 0 && question.steps && userAnswer.length === question.steps.length) {
            return userAnswer;
        }
        return question.steps ? shuffleArray(question.steps) : [];
    });

    const initialUserAnswer = useRef(userAnswer);
    const dragItem = useRef<number | null>(null);

    useEffect(() => {
        // Do not dispatch if the current state is the same as the initial state that came from props.
        if (initialUserAnswer.current && JSON.stringify(initialUserAnswer.current) === JSON.stringify(orderedItems)) {
            return;
        }

        if (!isReviewMode && !isSubmitted) {
            dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: question.id, answer: orderedItems } });
        }
    }, [orderedItems, dispatch, question.id, isReviewMode, isSubmitted]);
    

    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        if (dragItem.current === null || index === dragItem.current) return;
        
        const listCopy = [...orderedItems];
        const dragItemContent = listCopy[dragItem.current];
        listCopy.splice(dragItem.current, 1);
        listCopy.splice(index, 0, dragItemContent);
        dragItem.current = index;
        setOrderedItems(listCopy);
    };
    
    const handleDragEnd = () => {
        dragItem.current = null;
    };
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (isSubmitted || isReviewMode) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= orderedItems.length) return;
        
        const listCopy = [...orderedItems];
        const item = listCopy.splice(index, 1)[0];
        listCopy.splice(newIndex, 0, item);
        setOrderedItems(listCopy);
    };

    const getStepClass = useCallback((item: string, index: number) => {
        const base = `flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200`;
        
        if (isReviewMode || isSubmitted) {
            const isCorrect = question.steps && question.steps[index] === item;
            if (isCorrect) {
                return `${base} bg-success/10 border-success text-success cursor-default`;
            }
            return `${base} bg-error/10 border-error text-error cursor-default`;
        }
        
        return `${base} bg-surface border-border hover:bg-background`;
    }, [isReviewMode, isSubmitted, question.steps]);

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-2xl font-serif mb-6 text-text">
                <MathJax dynamic>{question.question}</MathJax>
            </h3>

            <ul className="space-y-3">
                {orderedItems.map((item, index) => (
                    <li
                        key={item}
                        draggable={!isSubmitted && !isReviewMode}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={getStepClass(item, index)}
                    >
                        <span className={`material-symbols-outlined text-text-secondary hidden sm:inline ${!isSubmitted && !isReviewMode ? 'cursor-grab active:cursor-grabbing' : 'opacity-50'}`}>drag_indicator</span>
                        
                        <div className="flex-1 flex items-start gap-3">
                            <span className="font-bold text-primary text-lg pt-0.5">{index + 1}.</span>
                            <div className="flex-1"><MathJax dynamic>{item}</MathJax></div>
                        </div>

                        <div className="sm:hidden flex flex-col -my-2 ml-2">
                            <button
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0 || isSubmitted || isReviewMode}
                                className="p-2 text-text-secondary hover:text-primary rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 active:bg-border"
                                aria-label="Monter l'élément"
                            >
                                <span className="material-symbols-outlined !text-3xl">expand_less</span>
                            </button>
                            <button
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === orderedItems.length - 1 || isSubmitted || isReviewMode}
                                className="p-2 text-text-secondary hover:text-primary rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 active:bg-border"
                                aria-label="Descendre l'élément"
                            >
                                <span className="material-symbols-outlined !text-3xl">expand_more</span>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderingQuestion;