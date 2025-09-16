import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { QuizQuestion } from '../types';
import { useNotification } from '../context/NotificationContext';
import { MathJax } from 'better-react-mathjax';

const Quiz: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { addNotification } = useNotification();
    const { currentChapterId, activities, progress, isReviewMode } = state;

    if (!currentChapterId) return null;
    
    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    
    if (!chapter || !chapterProgress) return null;

    const quizQuestions = chapter.quiz;
    const currentQuizQuestionIndex = chapterProgress.quiz.currentQuestionIndex || 0;
    const currentQuestion: QuizQuestion = quizQuestions[currentQuizQuestionIndex];
    const userAnswers = chapterProgress.quiz.answers;
    const isSubmitted = chapterProgress.quiz.isSubmitted;

    const handleAnswerSelect = (answer: string) => {
        if (isSubmitted) return;
        dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: currentQuestion.id, answer } });
    };

    const handleNavigate = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ? currentQuizQuestionIndex + 1 : currentQuizQuestionIndex - 1;
        if (newIndex >= 0 && newIndex < quizQuestions.length) {
            dispatch({ type: 'NAVIGATE_QUIZ', payload: newIndex });
        }
    };

    const calculateScore = () => {
        let correctAnswers = 0;
        quizQuestions.forEach(q => {
            const correctOption = q.options.find(o => o.isCorrect);
            if(correctOption && userAnswers[q.id] === correctOption.text) {
                correctAnswers++;
            }
        });
        return quizQuestions.length > 0 ? Math.round((correctAnswers / quizQuestions.length) * 100) : 0;
    };

    const handleSubmit = () => {
        if (!chapterProgress.quiz.allAnswered) {
            addNotification('Veuillez répondre à toutes les questions avant de soumettre.', 'error');
            return;
        }
        const score = calculateScore();
        dispatch({ type: 'SUBMIT_QUIZ', payload: { score } });
        addNotification(`Quiz terminé ! Votre score : ${score}%`, 'success');
    };
    
    if (isSubmitted && !isReviewMode) {
        const score = chapterProgress.quiz.score;
        return (
            <div className="bg-card-bg p-6 rounded-2xl shadow-lg animate-fadeIn text-center">
                <h3 className="text-2xl font-bold font-serif mb-2 text-dark-gray">Quiz Terminé !</h3>
                <p className="text-lg text-secondary">Votre score</p>
                <p className={`text-6xl font-bold my-4 ${score >= 70 ? 'text-success' : score >= 40 ? 'text-accent' : 'text-error'}`}>{score}%</p>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button onClick={() => dispatch({ type: 'TOGGLE_REVIEW_MODE', payload: true })} className="px-6 py-3 font-bold text-white bg-primary rounded-lg transition-transform transform hover:-translate-y-1 active:scale-95">
                        Réviser mes réponses
                    </button>
                    <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })} className="px-6 py-2 font-semibold text-secondary bg-light-gray rounded-lg hover:bg-border-color">
                        Retour au Chapitre
                    </button>
                </div>
            </div>
        );
    }
    
    if (!currentQuestion) return null;

    const userAnswer = userAnswers[currentQuestion.id];

    return (
        <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-serif text-dark-gray">Question {currentQuizQuestionIndex + 1}/{quizQuestions.length}</h3>
                 {isReviewMode && (
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                )}
            </div>

            <div className="w-full bg-light-gray rounded-full h-2.5 mb-6">
                <div className="bg-primary h-2.5 rounded-full" style={{width: `${((currentQuizQuestionIndex + 1) / quizQuestions.length) * 100}%`}}></div>
            </div>

            <div className="mb-6 min-h-[6rem] prose prose-lg max-w-none text-dark-gray">
                <MathJax dynamic>{currentQuestion.question}</MathJax>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = userAnswer === option.text;
                    let optionStyle = 'border-border-color bg-light-gray/30 hover:bg-light-gray/70';
                    let icon = null;

                    if (isReviewMode) {
                        if (option.isCorrect) {
                            optionStyle = 'border-success bg-success/10 ring-2 ring-success';
                            icon = (
                                <span className="text-success material-symbols-outlined">check_circle</span>
                            );
                        } else if (isSelected && !option.isCorrect) {
                            optionStyle = 'border-error bg-error/10 ring-2 ring-error';
                             icon = (
                                <span className="text-error material-symbols-outlined">cancel</span>
                            );
                        } else {
                            optionStyle = 'border-border-color bg-light-gray/20 opacity-70';
                        }
                    } else if (isSelected) {
                        optionStyle = 'border-primary bg-primary/10 ring-2 ring-primary';
                    }
                    
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option.text)}
                            disabled={isReviewMode}
                            className={`p-4 rounded-lg text-left transition-all duration-200 border-2 flex justify-between items-center ${optionStyle} active:scale-[0.99]`}
                        >
                            <span className="font-semibold text-dark-gray"><MathJax inline dynamic>{option.text}</MathJax></span>
                            {icon}
                        </button>
                    )
                })}
            </div>
            
            {isReviewMode && (
                <div className="mt-6 p-4 bg-info/10 border-l-4 border-info rounded-r-lg prose max-w-none text-secondary">
                    <h4 className="font-bold text-info not-prose">Explication</h4>
                    <MathJax dynamic>{currentQuestion.explanation}</MathJax>
                </div>
            )}

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={() => handleNavigate('prev')}
                    disabled={currentQuizQuestionIndex === 0}
                    className="px-6 py-2 font-semibold text-secondary bg-light-gray rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color active:scale-95"
                >
                    Précédent
                </button>

                {currentQuizQuestionIndex === quizQuestions.length - 1 ? (
                     isReviewMode ? (
                        <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })} className="px-8 py-3 font-bold text-white bg-primary rounded-lg transition-transform transform hover:-translate-y-1 active:scale-95">
                           Retour au Chapitre
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!chapterProgress.quiz.allAnswered}
                            className="px-8 py-3 font-bold text-white bg-success rounded-lg transition-transform transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed animate-pulse active:scale-95"
                        >
                            Terminer le Quiz
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => handleNavigate('next')}
                        className="px-6 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90 active:scale-95"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;