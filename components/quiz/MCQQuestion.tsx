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
        const base = 'group relative w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-200 ease-in-out flex items-start gap-4 font-sans backdrop-blur-sm active:scale-[0.99]';

        if (isReviewMode || isSubmitted) {
            const isCorrect = option.isCorrect;
            if (isCorrect) {
                return `${base} bg-green-50 border-green-500 text-[#1a1a1a] shadow-[0_8px_30px_rgba(34,197,94,0.25)]`;
            }
            if (isSelected && !isCorrect) {
                return `${base} bg-red-50 border-red-400 text-[#1a1a1a] shadow-[0_8px_30px_rgba(239,68,68,0.25)]`;
            }
            return `${base} border-gray-200 bg-gray-50 text-gray-600 cursor-default opacity-70`;
        }

        if (isSelected) {
            return `${base} border-green-500 bg-green-50 text-[#000000] shadow-[0_12px_40px_rgba(34,197,94,0.3)] scale-[1.02] font-medium ring-2 ring-green-200`;
        }
        return `${base} border-slate-300 bg-white text-[#1a1a1a] hover:border-green-400 hover:bg-green-50/50 cursor-pointer hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] hover:scale-[1.01]`;
    }, [isReviewMode, isSubmitted]);

    return (
        <>
            <style>{`
                @keyframes scaleIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
            <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-claude animate-fadeIn">
                <div className="bg-black text-white px-6 py-4 rounded-xl mb-6 shadow-lg">
                    <h3 className="text-[22px] font-title leading-relaxed font-semibold">
                        <FormattedText text={question.question} />
                    </h3>
                </div>
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
                                                <div className="relative w-7 h-7 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                                                    <span className="material-symbols-outlined text-green-600 relative z-10 drop-shadow-lg">check_circle</span>
                                                </div>
                                            ) : isSelected ? (
                                                <div className="relative w-7 h-7 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-red-500 relative z-10 drop-shadow-lg">cancel</span>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 border-2 border-text-disabled/40 rounded-full"></div>
                                            )
                                        ) : (
                                            <div className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-green-500 bg-green-50 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                    : 'border-slate-300 bg-white group-hover:border-green-400 group-hover:bg-green-50/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                            }`}>
                                                {isSelected && (
                                                    <svg
                                                        className="w-5 h-5 text-green-600 animate-[scaleIn_0.3s_ease-out]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex-1 text-left text-[17px] leading-relaxed"><FormattedText text={option.text} /></span>
                                </button>
                                {(isReviewMode || isSubmitted) && isSelected && !option.isCorrect && option.explanation && (
                                    <div className="pl-14 -mt-3 mb-2 text-sm text-red-600/90 animate-fadeIn serif-text italic">
                                        <FormattedText text={option.explanation} />
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default MCQQuestion;