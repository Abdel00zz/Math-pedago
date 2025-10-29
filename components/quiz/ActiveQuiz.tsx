import React, { useMemo } from 'react';
import { Chapter, QuizProgress } from '../../types';
import MCQQuestion from './MCQQuestion';
import OrderingQuestion from './OrderingQuestion';
import MathContent from '../MathContent';

interface ActiveQuizProps {
    chapter: Chapter;
    quizProgress: QuizProgress;
    isReviewMode: boolean;
    onNavigate: (index: number) => void;
    onSubmit: () => void;
    onOptionChange: (answer: string | string[]) => void;
}

const ActiveQuiz: React.FC<ActiveQuizProps> = ({ 
    chapter, 
    quizProgress, 
    isReviewMode,
    onNavigate,
    onSubmit,
    onOptionChange
}) => {
    const { currentQuestionIndex, answers, allAnswered, isSubmitted } = quizProgress;
    const question = chapter.quiz[currentQuestionIndex];

    const explanationText = useMemo(() => {
        if (!question) return null;
    
        // For MCQs, prioritize the explanation on the correct option.
        if (!question.type || question.type === 'mcq') {
            const correctOption = question.options?.find(o => o.isCorrect);
            if (correctOption?.explanation) {
                return correctOption.explanation;
            }
        }
        
        // Fallback to the general question explanation.
        // This will be used for ordering questions or MCQs without option-specific explanations.
        return question.explanation || null;
    }, [question]);

    return (
        <div className="font-sans max-w-3xl mx-auto">
            <div className="flex justify-center gap-2 mb-8">
                {chapter.quiz.map((q, index) => (
                    <button 
                        key={q.id}
                        onClick={() => onNavigate(index)}
                        className={`w-7 h-2 rounded-full transition-colors ${
                            index === currentQuestionIndex ? 'bg-primary' : answers[q.id] ? 'bg-primary/50' : 'bg-border'
                        }`}
                        aria-label={`Aller à la question ${index + 1}`}
                    />
                ))}
            </div>

            <p className="text-sm text-secondary mb-4 text-center">Question {currentQuestionIndex + 1} / {chapter.quiz.length}</p>

            {(!question.type || question.type === 'mcq') && (
                <MCQQuestion 
                    question={question}
                    userAnswer={answers[question.id] as string | undefined}
                    isReviewMode={isReviewMode}
                    isSubmitted={isSubmitted}
                    onOptionChange={onOptionChange}
                />
            )}
            
            {question.type === 'ordering' && (
                 <OrderingQuestion
                    key={question.id}
                    question={question}
                    userAnswer={answers[question.id] as string[] | undefined}
                    isReviewMode={isReviewMode}
                    isSubmitted={isSubmitted}
                    onOptionChange={onOptionChange}
                />
            )}

            {isReviewMode && explanationText && (
                <div className="mt-10 p-6 bg-surface rounded-lg border-2 shadow-lg animate-fadeIn animate-gentleGlow">
                    <h4 className="font-brand text-2xl text-primary mb-4 animate-textGlow">Explication Clé</h4>
                    <div className="text-text font-sans text-lg leading-relaxed space-y-2">
                        <MathContent content={explanationText} inline={false} />
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between items-center">
                <button onClick={() => onNavigate(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                {currentQuestionIndex === chapter.quiz.length - 1 ? (
                    !isSubmitted && !isReviewMode && (
                        <button onClick={onSubmit} disabled={!allAnswered} className="font-button px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all">
                            Soumettre le Quiz
                        </button>
                    )
                ) : (
                    <button onClick={() => onNavigate(currentQuestionIndex + 1)} disabled={!isReviewMode && !answers[question.id]} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                )}
            </div>
        </div>
    );
};

export default ActiveQuiz;