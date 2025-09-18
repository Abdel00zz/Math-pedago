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
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg animate-fadeIn w-full max-w-3xl mx-auto min-h-[calc(100vh-12rem)] landscape:min-h-[calc(100vh-8rem)] flex flex-col justify-between border border-gray-100">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold font-sans text-gray-700 tracking-tight">Question {currentQuizQuestionIndex + 1} sur {quizQuestions.length}</h3>
                     {isReviewMode && (
                        <span className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm font-bold uppercase rounded-full ${currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {currentQuestion.options.find(o => o.text === userAnswer)?.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                    )}
                </div>

                <div className="w-full bg-light-gray rounded-full h-1.5 sm:h-2 md:h-2.5 mb-3 sm:mb-4 md:mb-5">
                    <div className="bg-primary h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-300" style={{width: `${((currentQuizQuestionIndex + 1) / quizQuestions.length) * 100}%`}}></div>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                <div className="mb-6 sm:mb-8 md:mb-10 landscape:mb-3 min-h-[5rem] sm:min-h-[6rem] md:min-h-[7rem] landscape:min-h-[3rem] prose prose-lg sm:prose-xl max-w-none text-gray-800 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-5 md:p-6 landscape:p-3 rounded-2xl shadow-lg backdrop-blur-sm">
                    <div className="text-base sm:text-lg md:text-xl leading-relaxed font-normal text-center">
                        <MathJax dynamic>{currentQuestion.question}</MathJax>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 landscape:gap-2 mb-6 sm:mb-8 md:mb-10 landscape:mb-3">
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
                            className={`p-4 sm:p-5 md:p-6 landscape:p-3 rounded-lg text-left transition-all duration-200 border-2 flex justify-between items-center ${optionStyle} hover:shadow-md min-h-[3.5rem] sm:min-h-[4rem] md:min-h-[4.5rem] landscape:min-h-[2.5rem] touch-manipulation cursor-pointer`}
                        >
                            <span className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed flex-1 pr-3 font-medium"><MathJax inline dynamic>{option.text}</MathJax></span>
                            {icon && <div className="flex-shrink-0">{icon}</div>}
                        </button>
                    )
                })}
            </div>
            
            {isReviewMode && (
                <div className="flex-shrink-0 mt-3 sm:mt-4 md:mt-5 landscape:mt-2 p-3 sm:p-4 md:p-5 landscape:p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl shadow-sm border border-blue-200/50 prose max-w-none">
                    <h4 className="font-bold text-blue-700 not-prose mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span className="material-symbols-outlined text-blue-600 text-lg sm:text-xl">info</span>
                        Explication détaillée
                    </h4>
                    <div className="text-gray-700 text-xs sm:text-sm md:text-base leading-snug">
                        <MathJax dynamic>{currentQuestion.explanation}</MathJax>
                    </div>
                </div>
            )}

            <div className="flex-shrink-0 flex justify-between items-center mt-6 sm:mt-8 md:mt-10 landscape:mt-4 pt-4 sm:pt-6 md:pt-8 landscape:pt-3">
                <button
                    onClick={() => handleNavigate('prev')}
                    disabled={currentQuizQuestionIndex === 0}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 font-medium text-slate-500 bg-white/80 rounded-2xl hover:bg-white hover:text-slate-700 hover:shadow-md active:scale-98 transition-all duration-200 min-w-[80px] sm:min-w-[90px] md:min-w-[100px] text-sm disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-md border border-slate-200/50"
                >
                    Précédent
                </button>

                {currentQuizQuestionIndex === quizQuestions.length - 1 ? (
                     isReviewMode ? (
                        <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })} className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 font-bold text-white bg-primary rounded-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-200 text-xs sm:text-sm touch-manipulation">
                           Retour à l'activité
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!chapterProgress.quiz.allAnswered}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 font-bold text-white bg-success rounded-md hover:bg-success/90 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed animate-pulse active:scale-95 transition-all duration-200 text-xs sm:text-sm touch-manipulation"
                        >
                            Terminer le Quiz
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => handleNavigate('next')}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 font-medium text-white bg-slate-800 rounded-2xl hover:bg-slate-900 hover:shadow-md active:scale-98 transition-all duration-200 min-w-[80px] sm:min-w-[90px] md:min-w-[100px] text-sm backdrop-blur-md"
                    >
                        Suivant
                    </button>
                )}
            </div>
        </div>
    </div>
    );
};

export default Quiz;