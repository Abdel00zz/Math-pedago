import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../../types';
import { MathJax } from 'better-react-mathjax';

interface OrderingQuestionProps {
    question: Question;
    userAnswer: string[] | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
    onOptionChange: (newOrder: string[]) => void;
}

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
    const totalSteps = useMemo(() => question.steps?.length || 0, [question.steps]);
    const allSteps = useMemo(() => question.steps || [], [question.steps]);

    const [selectedItems, setSelectedItems] = useState<string[]>(userAnswer || []);
    
    // We want to shuffle the initial available items ONLY if it's a new attempt
    const [availableItems, setAvailableItems] = useState<string[]>(() => {
        const selectedSet = new Set(userAnswer || []);
        const remaining = allSteps.filter(step => !selectedSet.has(step));
        return (userAnswer && userAnswer.length > 0) ? remaining : shuffleArray(remaining);
    });

    useEffect(() => {
        if (!isReviewMode && !isSubmitted) {
            onOptionChange(selectedItems);
        }
    }, [selectedItems, onOptionChange, isReviewMode, isSubmitted]);

    const handleSelectAvailable = (item: string) => {
        if (isSubmitted || isReviewMode) return;
        setSelectedItems(prev => [...prev, item]);
        setAvailableItems(prev => prev.filter(i => i !== item));
    };

    const handleRemoveSelected = (index: number) => {
        if (isSubmitted || isReviewMode) return;
        
        const itemsToReturn = selectedItems.slice(index);
        const newSelectedItems = selectedItems.slice(0, index);

        setSelectedItems(newSelectedItems);
        // Put the returned items back into availableItems, but don't shuffle them, just add them.
        setAvailableItems(prev => [...prev, ...itemsToReturn]);
    };

    // Review Mode UI
    if (isReviewMode || isSubmitted) {
        return (
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <h3 className="text-2xl font-title mb-6 text-text">
                    <MathJax dynamic>{question.question}</MathJax>
                </h3>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Votre réponse :</h4>
                        <ul className="space-y-3">
                            {(userAnswer && userAnswer.length > 0) ? userAnswer.map((item, index) => {
                                const isCorrect = question.steps && question.steps[index] === item;
                                const stepClass = `flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${isCorrect ? 'bg-success/10 border-success' : 'bg-error/10 border-error'}`;
                                const textClass = isCorrect ? 'text-text' : 'text-text';
                                const icon = isCorrect ? 'check_circle' : 'cancel';
                                const iconClass = isCorrect ? 'text-success' : 'text-error';
                                
                                return (
                                    <li key={index} className={stepClass}>
                                        <span className={`font-bold text-lg ${textClass}`}>{index + 1}.</span>
                                        <div className={`flex-1 ${textClass}`}><MathJax dynamic>{item}</MathJax></div>
                                        <span className={`material-symbols-outlined !text-xl mt-0.5 ${iconClass}`}>{icon}</span>
                                    </li>
                                );
                            }) : <li className="text-text-secondary italic">Vous n'avez pas répondu à cette question.</li>}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <h4 className="text-lg font-semibold text-text mb-3 font-serif">Réponse correcte :</h4>
                         <ul className="space-y-3">
                            {allSteps.map((item, index) => (
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
    
    // Active Quiz UI
    return (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-2xl font-title mb-6 text-text">
                <MathJax dynamic>{question.question}</MathJax>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {/* Available Items */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-secondary text-center font-sans">Options disponibles</h4>
                    <div className="flex flex-col gap-3 min-h-[200px] p-2 bg-background/50 rounded-lg">
                    {availableItems.length > 0 ? availableItems.map((item) => (
                        <button 
                            key={item}
                            onClick={() => handleSelectAvailable(item)}
                            className="w-full text-left p-3 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-background/80 transition-all duration-200 transform hover:scale-105 active:scale-100"
                        >
                            <MathJax dynamic>{item}</MathJax>
                        </button>
                    )) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-center text-text-disabled italic p-4">
                                {selectedItems.length === totalSteps ? 'Toutes les options ont été placées !' : 'Aucune option disponible.'}
                            </p>
                        </div>
                    )}
                    </div>
                </div>
                
                {/* Selected Items */}
                <div className="space-y-4">
                     <h4 className="font-semibold text-secondary text-center font-sans">Votre ordre</h4>
                    <ul className="space-y-3">
                        {[...Array(totalSteps)].map((_, index) => {
                            const item = selectedItems[index];
                            if (item) {
                                return (
                                    <li key={item + index}>
                                        <button 
                                            onClick={() => handleRemoveSelected(index)}
                                            className="w-full flex items-start gap-3 text-left p-3 rounded-lg border-2 border-primary bg-primary-light/10 hover:bg-error/10 hover:border-error transition-all duration-200 group"
                                            aria-label={`Retirer l'étape ${index + 1}`}
                                        >
                                            <span className="font-bold text-primary text-lg pt-px">{index + 1}.</span>
                                            <div className="flex-1"><MathJax dynamic>{item}</MathJax></div>
                                            <span className="material-symbols-outlined !text-xl text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">backspace</span>
                                        </button>
                                    </li>
                                );
                            }
                            return (
                                <li key={index} className="flex items-center gap-3 p-3 rounded-lg border-2 border-border bg-background/50 h-[58px]">
                                     <span className="font-bold text-text-disabled text-lg">{index + 1}.</span>
                                     <span className="text-text-disabled italic">Cliquez sur une option...</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OrderingQuestion;