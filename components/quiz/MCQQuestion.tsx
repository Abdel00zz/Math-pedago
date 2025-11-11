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
        const base = 'group relative w-full text-left px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ease-in-out flex items-center gap-2 sm:gap-3 md:gap-4 font-sans backdrop-blur-sm active:scale-[0.99] touch-manipulation';

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
            return `${base} border-blue-500 bg-blue-50 text-[#000000] shadow-[0_12px_40px_rgba(59,130,246,0.3)] scale-[1.02] font-medium ring-2 ring-blue-200`;
        }
        return `${base} border-slate-300 bg-white text-[#1a1a1a] hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] sm:hover:scale-[1.01]`;
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
            <div className="bg-surface p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border coursera-shadow-card animate-fadeIn quiz-content">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 coursera-shadow-soft">
                    <h3 className="quiz-question-text font-title leading-relaxed font-semibold text-coursera-black text-base sm:text-lg md:text-xl">
                        <FormattedText text={question.question} />
                    </h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {question.options?.map((option, index) => {
                        const isSelected = userAnswer === option.text;
                        const optionClass = getOptionClass(option, isSelected);

                        return (
                            <Fragment key={index}>
                                <button onClick={() => onOptionChange(option.text)} className={optionClass} disabled={isSubmitted || isReviewMode}>
                                    <div className="flex-shrink-0 flex items-center justify-center">
                                        {(isReviewMode || isSubmitted) ? (
                                            option.isCorrect ? (
                                                <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                                                    <span className="material-symbols-outlined text-green-600 relative z-10 drop-shadow-lg text-xl sm:text-2xl">check_circle</span>
                                                </div>
                                            ) : isSelected ? (
                                                <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-red-500 relative z-10 drop-shadow-lg text-xl sm:text-2xl">cancel</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-text-disabled/40 rounded-full"></div>
                                            )
                                        ) : (
                                            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                                    : 'border-slate-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            }`}>
                                                {isSelected && (
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-[scaleIn_0.3s_ease-out]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex-1 text-left text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-medium flex items-center"><FormattedText text={option.text} /></span>
                                </button>
                                {(isReviewMode || isSubmitted) && isSelected && !option.isCorrect && option.explanation && (
                                    <div className="pl-10 sm:pl-14 -mt-2 sm:-mt-3 mb-1 sm:mb-2 text-xs sm:text-sm text-red-600/90 animate-fadeIn serif-text italic">
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