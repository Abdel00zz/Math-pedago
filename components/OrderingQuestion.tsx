import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { Question } from '../types';
import { MathJax } from 'better-react-mathjax';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
}

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ question, userAnswer, isReviewMode, isSubmitted }) => {
    const dispatch = useAppDispatch();
    const [orderedSteps, setOrderedSteps] = useState<string[]>([]);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    // Initialize or shuffle steps
    useEffect(() => {
        if (userAnswer && Array.isArray(userAnswer)) {
            setOrderedSteps(userAnswer);
        } else if (question.steps) {
            const shuffled = [...question.steps].sort(() => Math.random() - 0.5);
            setOrderedSteps(shuffled);
            dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: question.id, answer: shuffled } });
        }
    }, [question.id, question.steps, dispatch]);

    const handleDragStart = (index: number) => {
        dragItemIndex.current = index;
    };
    
    const handleDragEnter = (index: number) => {
        dragOverItemIndex.current = index;
    };
    
    const handleDragEnd = () => {
        if (dragItemIndex.current === null || dragOverItemIndex.current === null || dragItemIndex.current === dragOverItemIndex.current) {
            return;
        }
        
        const newOrderedSteps = [...orderedSteps];
        const draggedItemContent = newOrderedSteps.splice(dragItemIndex.current, 1)[0];
        newOrderedSteps.splice(dragOverItemIndex.current, 0, draggedItemContent);
        
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;

        setOrderedSteps(newOrderedSteps);
        dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: question.id, answer: newOrderedSteps } });
    };

    const isCorrect = useMemo(() => {
        if (!userAnswer || !question.steps) return false;
        return JSON.stringify(userAnswer) === JSON.stringify(question.steps);
    }, [userAnswer, question.steps]);

    return (
        <>
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <p className="text-sm text-secondary mb-4">Question {question.id.split('_').pop()} / ...</p>
                <h3 className="text-2xl font-serif mb-6 text-text">
                    <MathJax dynamic>{question.question}</MathJax>
                </h3>
                
                {isReviewMode && (
                    <div className={`p-3 rounded-lg mb-6 text-base font-semibold text-center ${isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {isCorrect ? 'Votre ordre est correct !' : 'Votre ordre est incorrect.'}
                    </div>
                )}
                
                <p className="text-sm font-semibold text-text-secondary mb-3">
                    {isSubmitted || isReviewMode ? 'Votre réponse :' : 'Réorganisez les étapes suivantes dans le bon ordre :'}
                </p>
                
                <ol className="space-y-3">
                    {orderedSteps.map((step, index) => (
                        <li
                            key={`${question.id}-step-${index}`}
                            draggable={!isSubmitted && !isReviewMode}
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 font-lato text-lg bg-surface ${isSubmitted || isReviewMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                        >
                            <span className="font-bold text-primary select-none">{index + 1}.</span>
                            <span className="flex-1"><MathJax dynamic>{step}</MathJax></span>
                             {!isSubmitted && !isReviewMode && (
                                <span className="material-symbols-outlined text-text-disabled select-none">drag_indicator</span>
                             )}
                        </li>
                    ))}
                </ol>
            </div>
            
            {(isReviewMode && !isCorrect) && (
                <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                    <h4 className="font-bold text-text mb-2 text-lg font-serif">Ordre correct :</h4>
                    <ol className="space-y-2">
                        {question.steps?.map((step, index) => (
                            <li key={`correct-step-${index}`} className="flex items-start gap-3 p-3 rounded-md">
                                <span className="font-bold text-success">{index + 1}.</span>
                                <MathJax dynamic>{step}</MathJax>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </>
    );
};

export default OrderingQuestion;