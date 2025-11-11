import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import StandardHeader from '../StandardHeader';
import MCQQuestion from '../quiz/MCQQuestion';
import OrderingQuestion from '../quiz/OrderingQuestion';
import FormattedText from '../FormattedText';
import type { ConcoursData, ConcoursQuestion } from '../../types';

const ConcoursQuizView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [concoursData, setConcoursData] = useState<ConcoursData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [qId: string]: string | string[] }>({});
    const [timeSpent, setTimeSpent] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const concoursFile = sessionStorage.getItem('currentConcoursFile');
        if (!concoursFile) {
            dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
            return;
        }

        fetch(concoursFile)
            .then(res => res.json())
            .then((data: ConcoursData) => {
                setConcoursData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors du chargement du concours:', err);
                setLoading(false);
            });
    }, [dispatch]);

    // Timer
    useEffect(() => {
        if (isFinished) return;

        timerRef.current = window.setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isFinished]);

    const handleBackClick = () => {
        const confirmLeave = window.confirm(
            'Êtes-vous sûr de vouloir quitter le quiz ? Votre progression ne sera pas sauvegardée.'
        );
        if (confirmLeave) {
            dispatch({
                type: 'CHANGE_VIEW',
                payload: { view: 'concours-resume' },
            });
        }
    };

    const handleAnswerChange = (questionId: string, answer: string | string[]) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNextQuestion = () => {
        if (concoursData && currentQuestionIndex < concoursData.quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowHint(false);
            setCurrentHintIndex(0);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setShowHint(false);
            setCurrentHintIndex(0);
        }
    };

    const handleQuestionClick = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowHint(false);
        setCurrentHintIndex(0);
    };

    const handleShowHint = () => {
        if (!showHint) {
            setHintsUsed(prev => prev + 1);
        }
        setShowHint(true);
    };

    const handleNextHint = () => {
        if (currentQuestion?.hints && currentHintIndex < currentQuestion.hints.length - 1) {
            setCurrentHintIndex(prev => prev + 1);
        }
    };

    const handlePreviousHint = () => {
        if (currentHintIndex > 0) {
            setCurrentHintIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        if (!concoursData) return 0;

        let correctCount = 0;
        concoursData.quiz.forEach((q: ConcoursQuestion) => {
            const userAnswer = answers[q.id];
            if (!userAnswer) return;

            if (q.type === 'ordering') {
                // Pour les questions d'ordre, comparer les tableaux
                const correctOrder = q.steps || [];
                const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
                if (JSON.stringify(correctOrder) === JSON.stringify(userOrder)) {
                    correctCount++;
                }
            } else {
                // Pour les MCQ
                const correctOption = q.options?.find(opt => opt.isCorrect);
                if (correctOption && userAnswer === correctOption.text) {
                    correctCount++;
                }
            }
        });

        return Math.round((correctCount / concoursData.quiz.length) * 100);
    };

    const handleFinishQuiz = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setIsFinished(true);
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeSpent(0);
        setHintsUsed(0);
        setIsFinished(false);
        setScore(0);
        setShowHint(false);
        setCurrentHintIndex(0);
    };

    const handleBackToResume = () => {
        dispatch({
            type: 'CHANGE_VIEW',
            payload: { view: 'concours-resume' },
        });
    };

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
        const seconds = (timeSpent % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [timeSpent]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du quiz...</p>
                </div>
            </div>
        );
    }

    if (!concoursData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Quiz introuvable</p>
                </div>
            </div>
        );
    }

    const currentQuestion = concoursData.quiz[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = concoursData.quiz.length;

    // Results View
    if (isFinished) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <StandardHeader
                    onBack={handleBackToResume}
                    title="Résultats du quiz"
                />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="text-center">
                            <div className="text-6xl mb-4">
                                {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {score >= 80 ? 'Excellent !' : score >= 60 ? 'Bien joué !' : 'Continue tes efforts !'}
                            </h1>
                            <div className="text-6xl font-bold text-primary my-6">{score}%</div>
                            <p className="text-xl text-gray-600">
                                {answeredCount} / {totalQuestions} questions répondues
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-primary mb-2">timer</span>
                                <div className="text-2xl font-bold text-gray-900">{formattedTime}</div>
                                <div className="text-sm text-gray-600">Temps passé</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-success mb-2">check_circle</span>
                                <div className="text-2xl font-bold text-gray-900">
                                    {Math.round((score / 100) * totalQuestions)} / {totalQuestions}
                                </div>
                                <div className="text-sm text-gray-600">Bonnes réponses</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-warning mb-2">lightbulb</span>
                                <div className="text-2xl font-bold text-gray-900">{hintsUsed}</div>
                                <div className="text-sm text-gray-600">Indices utilisés</div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button
                                onClick={handleRetry}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined mr-2">refresh</span>
                                Recommencer le quiz
                            </button>
                            <button
                                onClick={handleBackToResume}
                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined mr-2">description</span>
                                Revoir le résumé
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz View
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <StandardHeader
                onBack={handleBackClick}
                title={`Quiz - ${concoursData.theme}`}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="material-symbols-outlined text-primary">quiz</span>
                            <span className="font-semibold text-gray-900">
                                Question {currentQuestionIndex + 1} / {totalQuestions}
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <span className="material-symbols-outlined text-success">check_circle</span>
                                <span className="text-sm font-medium text-gray-600">
                                    {answeredCount} / {totalQuestions}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="material-symbols-outlined text-primary">timer</span>
                                <span className="text-sm font-medium text-gray-600">{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <span className="material-symbols-outlined mr-2">grid_view</span>
                                Navigation
                            </h3>
                            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                                {concoursData.quiz.map((q: ConcoursQuestion, index: number) => (
                                    <button
                                        key={q.id}
                                        onClick={() => handleQuestionClick(index)}
                                        className={`aspect-square rounded-lg font-semibold text-sm transition-all duration-200 ${
                                            index === currentQuestionIndex
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md scale-110'
                                                : answers[q.id]
                                                ? 'bg-success text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="mb-6">
                                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                                    Thème : {currentQuestion.theme}
                                </div>
                                <div className="text-lg text-gray-800 leading-relaxed">
                                    <FormattedText content={currentQuestion.question} />
                                </div>
                            </div>

                            {currentQuestion.type === 'ordering' ? (
                                <OrderingQuestion
                                    question={currentQuestion}
                                    userAnswer={answers[currentQuestion.id] as string[] || []}
                                    onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                                    isReviewMode={false}
                                />
                            ) : (
                                <MCQQuestion
                                    question={currentQuestion}
                                    userAnswer={answers[currentQuestion.id] as string || ''}
                                    onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                                    isReviewMode={false}
                                />
                            )}

                            {/* Hints */}
                            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                <div className="mt-6">
                                    {!showHint ? (
                                        <button
                                            onClick={handleShowHint}
                                            className="w-full bg-yellow-50 border-2 border-yellow-200 text-yellow-700 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-200 flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined mr-2">lightbulb</span>
                                            Afficher un indice
                                        </button>
                                    ) : (
                                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                                            <div className="flex items-start mb-4">
                                                <span className="material-symbols-outlined text-yellow-600 mr-3">lightbulb</span>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-yellow-800 mb-2">
                                                        Indice {currentHintIndex + 1} / {currentQuestion.hints.length}
                                                    </div>
                                                    <div className="text-yellow-700">
                                                        <FormattedText content={currentQuestion.hints[currentHintIndex]} />
                                                    </div>
                                                </div>
                                            </div>
                                            {currentQuestion.hints.length > 1 && (
                                                <div className="flex justify-between mt-4">
                                                    <button
                                                        onClick={handlePreviousHint}
                                                        disabled={currentHintIndex === 0}
                                                        className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Indice précédent
                                                    </button>
                                                    <button
                                                        onClick={handleNextHint}
                                                        disabled={currentHintIndex === currentQuestion.hints.length - 1}
                                                        className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Indice suivant
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <span className="material-symbols-outlined mr-2">arrow_back</span>
                                Précédent
                            </button>

                            {currentQuestionIndex === totalQuestions - 1 ? (
                                <button
                                    onClick={handleFinishQuiz}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
                                >
                                    <span className="material-symbols-outlined mr-2">check_circle</span>
                                    Terminer le quiz
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
                                >
                                    Suivant
                                    <span className="material-symbols-outlined ml-2">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcoursQuizView;
