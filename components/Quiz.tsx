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
                        Retour à l'activité
                    </button>
                </div>
            </div>
        );
    }
    
    if (!currentQuestion) return null;

    const userAnswer = userAnswers[currentQuestion.id];

    return (
        <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg animate-fadeIn max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-serif text-dark-gray">Question {currentQuizQuestionIndex + 1}/{quizQuestions.length}</h3>
                 {isReviewMode && (
                    <span className={`px-4 py-2 text-sm font-bold uppercase rounded-full ${currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                )}
            </div>

            <div className="w-full bg-light-gray rounded-full h-3 mb-8">
                <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{width: `${((currentQuizQuestionIndex + 1) / quizQuestions.length) * 100}%`}}></div>
            </div>

            <div className="mb-10 min-h-[10rem] prose prose-xl max-w-none text-dark-gray bg-gradient-to-br from-blue-50/30 to-indigo-50/30 p-6 rounded-xl border border-blue-100/50">
                <div className="text-xl md:text-2xl leading-relaxed font-medium">
                    <MathJax dynamic>{currentQuestion.question}</MathJax>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            className={`p-5 rounded-xl text-left transition-all duration-200 border-2 flex justify-between items-center ${optionStyle} active:scale-[0.98] hover:shadow-md min-h-[4rem]`}
                        >
                            <span className="text-dark-gray text-lg leading-relaxed flex-1 pr-3"><MathJax inline dynamic>{option.text}</MathJax></span>
                            {icon && <div className="flex-shrink-0">{icon}</div>}
                        </button>
                    )
                })}
            </div>
            
            {isReviewMode && (
                <div className="mt-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md border border-blue-200/50 prose max-w-none">
                    <h4 className="font-bold text-blue-700 not-prose mb-4 flex items-center gap-3 text-lg">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                        Explication détaillée
                    </h4>
                    <div className="text-gray-700 text-lg leading-relaxed">
                        <MathJax dynamic>{currentQuestion.explanation}</MathJax>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200/50">
                <button
                    onClick={() => handleNavigate('prev')}
                    disabled={currentQuizQuestionIndex === 0}
                    className="px-8 py-3 font-semibold text-secondary bg-light-gray rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border-color active:scale-95 transition-all duration-200 min-w-[120px]"
                >
                    Précédent
                </button>

                {currentQuizQuestionIndex === quizQuestions.length - 1 ? (
                     isReviewMode ? (
                        <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })} className="px-10 py-4 font-bold text-white bg-primary rounded-xl transition-transform transform hover:-translate-y-1 active:scale-95 shadow-lg">
                           Retour à l'activité
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!chapterProgress.quiz.allAnswered}
                            className="px-10 py-4 font-bold text-white bg-success rounded-xl transition-transform transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed animate-pulse active:scale-95 shadow-lg"
                        >
                            Terminer le Quiz
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => handleNavigate('next')}
                        className="px-8 py-3 font-semibold text-white bg-primary rounded-xl hover:bg-opacity-90 active:scale-95 transition-all duration-200 min-w-[120px]"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;