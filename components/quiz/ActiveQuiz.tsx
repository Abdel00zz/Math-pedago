import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { Chapter, QuizProgress } from '../../types';
import MCQQuestion from './MCQQuestion';
import OrderingQuestion from './OrderingQuestion';

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
                    onOrderChange={onOptionChange}
                />
            )}

            {isReviewMode && (question.explanation || (question.type === 'mcq' && question.options?.find(o => o.isCorrect)?.explanation)) && (
                 <div className="mt-6 p-4 bg-background rounded-lg border border-border animate-fadeIn">
                    <h4 className="font-bold text-text mb-2 text-lg font-serif">Explication :</h4>
                    <p className="text-secondary serif-text"><MathJax dynamic>{question.explanation || question.options?.find(o => o.isCorrect)?.explanation}</MathJax></p>
                </div>
            )}

            <div className="mt-8 flex justify-between items-center">
                <button onClick={() => onNavigate(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                {currentQuestionIndex === chapter.quiz.length - 1 ? (
                    !isSubmitted && (
                        <button onClick={onSubmit} disabled={!allAnswered} className="font-button px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all">
                            Soumettre le Quiz
                        </button>
                    )
                ) : (
                    <button onClick={() => onNavigate(currentQuestionIndex + 1)} disabled={!answers[question.id]} className="font-button px-6 py-2 font-semibold text-primary rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                )}
            </div>
        </div>
    );
};

export default ActiveQuiz;
