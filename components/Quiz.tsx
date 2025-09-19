import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Chapter, QuizQuestion } from '../types';
import { useNotification } from '../context/NotificationContext';
import { MathJax } from 'better-react-mathjax';

interface QuizProps {
    chapter: Chapter;
    title: string;
}

const Quiz: React.FC<QuizProps> = ({ chapter, title }) => {
    const { state, dispatch } = useContext(AppContext);
    const { addNotification } = useNotification();
    const { currentChapterId, progress, isReviewMode } = state;

    if (!currentChapterId) return null;
    
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
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex p-4 font-sans">
                <div className="w-full max-w-md text-center bg-white rounded-3xl shadow-2xl p-6 transform transition-all duration-500 hover:scale-105 m-auto">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz Terminé !</h3>
                    <p className="text-slate-500 text-base">Votre score</p>
                    <div className={`my-6 flex items-baseline justify-center ${score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        <span className="text-8xl font-bold italic">{score}</span>
                        <span className="text-4xl font-bold">%</span>
                    </div>
                    <div className="flex flex-col gap-4 mt-8">
                        <button onClick={() => dispatch({ type: 'TOGGLE_REVIEW_MODE', payload: true })} className="w-full px-5 py-3 font-bold text-white bg-blue-500 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
                            Réviser mes réponses
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })}
                            className="w-full px-6 py-3 font-semibold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors duration-300 active:scale-95"
                        >
                            Retour à l'activité
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!currentQuestion) return null;

    const userAnswer = userAnswers[currentQuestion.id];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-3xl my-auto mx-auto">
                {/* Header */}
                <header className="relative mb-6 grid grid-cols-3 items-center">
                    <div className="flex justify-start">
                        <button
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })}
                            className="flex items-center justify-center h-11 w-11 text-slate-500 bg-white rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95"
                            aria-label="Retour au hub du chapitre"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-slate-800 truncate">{chapter.chapter}</h2>
                        <p className="text-sm text-slate-500">{title}</p>
                    </div>
                    <div className="text-lg font-bold text-slate-500 text-right">
                        {currentQuizQuestionIndex + 1} / {quizQuestions.length}
                    </div>
                </header>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
                    <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuizQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-lg shadow-xl p-4 mb-8 h-36 flex items-center justify-center">
                    <div className="text-slate-800 text-xl font-semibold text-center leading-relaxed">
                        <MathJax dynamic>{currentQuestion.question}</MathJax>
                    </div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswer === option.text;
                        let optionStyle = 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg';
                        let icon = null;

                        if (isReviewMode) {
                            if (option.isCorrect) {
                                optionStyle = 'bg-green-50 border-green-400 ring-2 ring-green-300 shadow-lg';
                                icon = <span className="text-green-500 material-symbols-outlined">check_circle</span>;
                            } else if (isSelected && !option.isCorrect) {
                                optionStyle = 'bg-red-50 border-red-400 ring-2 ring-red-300 shadow-lg';
                                icon = <span className="text-red-500 material-symbols-outlined">cancel</span>;
                            } else {
                                optionStyle = 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed';
                            }
                        } else if (isSelected) {
                            optionStyle = 'bg-blue-50 border-blue-500 ring-2 ring-blue-400 shadow-xl';
                        }
                        
                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option.text)}
                                disabled={isReviewMode}
                                className={`p-4 rounded-xl text-left transition-all duration-200 border-2 flex justify-between items-center w-full transform hover:-translate-y-1 ${optionStyle}`}
                            >
                                <span className="text-slate-700 font-medium text-base flex-1 pr-4"><MathJax inline dynamic>{option.text}</MathJax></span>
                                {icon && <div className="flex-shrink-0">{icon}</div>}
                            </button>
                        )
                    })}
                </div>
                
                {isReviewMode && currentQuestion.explanation && (
                    <div className="mt-8 p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-700">info</span>
                            Explication
                        </h4>
                        <div className="text-slate-700 leading-relaxed">
                            <MathJax dynamic>{currentQuestion.explanation}</MathJax>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-10">
                    <button
                        onClick={() => handleNavigate('prev')}
                        disabled={currentQuizQuestionIndex === 0}
                        className="font-bold text-slate-500 hover:text-blue-600 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
                        Précédent
                    </button>

                    {currentQuizQuestionIndex === quizQuestions.length - 1 ? (
                        isReviewMode ? (
                            <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub' } })} className="px-6 py-3 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl">
                               Retour à l'activité
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!chapterProgress.quiz.allAnswered}
                                className="px-6 py-3 font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
                            >
                                Terminer le Quiz
                            </button>
                        )
                    ) : (
                        <button
                            onClick={() => handleNavigate('next')}
                            className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-xl active:scale-95 transition-all duration-300 shadow-lg flex items-center gap-2 group"
                        >
                            Suivant
                            <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;