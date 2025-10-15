import React, { useCallback, Fragment } from 'react';
import { Question, Option } from '../../types';
import FormattedText from '../FormattedText';

interface MCQQuestionProps {
    question: Question;
    userAnswer: string | undefined;
    isReviewMode: boolean;
    isSubmitted: boolean;
    onOptionChange: (answer: string) => void;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({ question, userAnswer, isReviewMode, isSubmitted, onOptionChange }) => {

    const getOptionClass = useCallback((option: Option, isSelected: boolean) => {
        const base = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ease-in-out flex items-start gap-4 font-sans text-lg';

        if (isReviewMode || isSubmitted) {
            const isCorrect = option.isCorrect;
            if (isCorrect) {
                return `${base} bg-success/10 border-success text-text`;
            }
            if (isSelected && !isCorrect) {
                return `${base} bg-error/10 border-error text-text`;
            }
            return `${base} border-border bg-surface text-text-disabled cursor-default opacity-70`;
        }

        if (isSelected) {
            return `${base} bg-primary/10 border-primary text-text ring-2 ring-primary/30 transform scale-[1.01]`;
        }
        return `${base} bg-surface border-border hover:border-primary/70 hover:bg-background cursor-pointer transform hover:scale-[1.01]`;
    }, [isReviewMode, isSubmitted]);

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
            <h3 className="text-2xl font-title mb-6 text-text">
                <FormattedText text={question.question} />
            </h3>
            <div className="space-y-4">
                {question.options?.map((option, index) => {
                    const isSelected = userAnswer === option.text;
                    const optionClass = getOptionClass(option, isSelected);
                    
                    return (
                        <Fragment key={index}>
                            <button onClick={() => onOptionChange(option.text)} className={optionClass} disabled={isSubmitted || isReviewMode}>
                                <div className="flex-shrink-0 mt-1">
                                    {(isReviewMode || isSubmitted) ? (
                                        option.isCorrect ? (
                                            <span className="material-symbols-outlined text-success">check_circle</span>
                                        ) : isSelected ? (
                                            <span className="material-symbols-outlined text-error">cancel</span>
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-text-disabled/50 rounded-full"></div>
                                        )
                                    ) : (
                                        <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-text-secondary group-hover:border-primary'}`}>
                                            {isSelected && <div className="w-3 h-3 bg-primary rounded-full transition-transform duration-300 scale-100"></div>}
                                        </div>
                                    )}
                                </div>
                                <span className="flex-1"><FormattedText text={option.text} /></span>
                            </button>
                            {(isReviewMode || isSubmitted) && isSelected && !option.isCorrect && option.explanation && (
                                <div className="pl-14 -mt-3 mb-2 text-sm text-error/90 animate-fadeIn serif-text italic">
                                    <FormattedText text={option.explanation} />
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default MCQQuestion;