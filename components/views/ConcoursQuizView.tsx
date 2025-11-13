import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch } from '../../context/AppContext';
// StandardHeader removed per concours design change
import MCQQuestion from '../quiz/MCQQuestion';
import OrderingQuestion from '../quiz/OrderingQuestion';
import FormattedText from '../FormattedText';
import ConcoursBackground from '../ConcoursBackground';
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

    // Pour l'en-tête
    const concoursName = localStorage.getItem('currentConcoursType')?.toUpperCase() || 'CONCOURS';
    const concoursYear = localStorage.getItem('currentConcoursYear') || concoursData?.annee || '';

    useEffect(() => {
        const quizMode = localStorage.getItem('concoursQuizMode');

        if (quizMode === 'year') {
            // Mode année : charger plusieurs fichiers et agréger les questions
            const filesJson = localStorage.getItem('concoursQuizFiles');
            const quizYear = localStorage.getItem('concoursQuizYear');
            const concoursType = localStorage.getItem('currentConcoursType');

            if (!filesJson) {
                dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours' } });
                return;
            }

            const files: string[] = JSON.parse(filesJson);

            // Charger tous les fichiers en parallèle
            Promise.all(files.map(file => fetch(file).then(r => r.json())))
                .then((allData: ConcoursData[]) => {
                    // Agréger toutes les questions
                    const allQuestions: ConcoursQuestion[] = [];
                    allData.forEach(data => {
                        if (data.quiz) {
                            allQuestions.push(...data.quiz);
                        }
                    });

                    // Créer un objet ConcoursData agrégé
                    const aggregatedData: ConcoursData = {
                        id: `quiz-global-${quizYear}`,
                        concours: allData[0]?.concours || concoursType || 'Concours',
                        annee: quizYear || '',
                        theme: `Quiz complet ${quizYear}`,
                        resume: allData[0]?.resume || { title: '', introduction: '', sections: [] },
                        quiz: allQuestions
                    };

                    setConcoursData(aggregatedData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Erreur lors du chargement des quiz:', err);
                    setLoading(false);
                });
        } else {
            // Mode thème : charger un seul fichier
            const concoursFile = localStorage.getItem('currentConcoursFile');
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
        }
    }, [dispatch]);

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

    const handleAnswerChange = (questionId: string, answer: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNavigate = (index: number) => {
        if (index >= 0 && concoursData && index < concoursData.quiz.length) {
            setCurrentQuestionIndex(index);
            setShowHint(false);
            setCurrentHintIndex(0);
        }
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
                const correctOrder = q.steps || [];
                const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
                if (JSON.stringify(correctOrder) === JSON.stringify(userOrder)) {
                    correctCount++;
                }
            } else {
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
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'concours-resume' } });
    };

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
        const seconds = (timeSpent % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [timeSpent]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!concoursData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Quiz introuvable</p>
            </div>
        );
    }

    const currentQuestion = concoursData.quiz[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = concoursData.quiz.length;
    const allAnswered = answeredCount === totalQuestions;

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white relative overflow-hidden">
                <ConcoursBackground variant="resume" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
                    {/* En-tête du quiz */}
                    <div className="mb-8 flex justify-center">
                        <div className="inline-block mb-4">
                            <div className="border border-gray-200 rounded-md px-5 py-3 bg-white inline-flex items-center gap-3 text-center">
                                <div className="text-sm text-gray-500">Concours</div>
                                <div className="text-lg font-medium text-gray-900">{concoursName} {concoursYear}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-12 text-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl">
                        <div className="text-6xl font-light text-gray-900 mb-8">{score}%</div>
                        <p className="text-lg text-gray-600 font-light mb-12">
                            {answeredCount} / {totalQuestions} questions répondues
                        </p>

                        <div className="grid grid-cols-3 gap-8 mb-12 text-center">
                            <div>
                                <div className="text-3xl font-light text-gray-900 mb-2">{formattedTime}</div>
                                <div className="text-xs text-gray-500">Temps passé</div>
                            </div>
                            <div>
                                <div className="text-3xl font-light text-gray-900 mb-2">
                                    {Math.round((score / 100) * totalQuestions)} / {totalQuestions}
                                </div>
                                <div className="text-xs text-gray-500">Bonnes réponses</div>
                            </div>
                            <div>
                                <div className="text-3xl font-light text-gray-900 mb-2">{hintsUsed}</div>
                                <div className="text-xs text-gray-500">Indices utilisés</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleRetry}
                                className="w-full bg-gray-900 text-white px-8 py-3 text-sm font-light hover:bg-gray-700 transition-colors"
                            >
                                Recommencer le quiz
                            </button>
                            <button
                                onClick={handleBackToResume}
                                className="w-full border border-gray-200 text-gray-700 px-8 py-3 text-sm font-light hover:border-gray-900 transition-colors"
                            >
                                Revoir le résumé
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
            <div className="min-h-screen bg-white relative overflow-hidden">
                <ConcoursBackground variant="resume" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 font-sans">
                {/* En-tête du quiz */}
                <div className="mb-8 text-center">
                    <div className="inline-block px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg">
                        Concours {concoursName} {concoursYear}
                    </div>
                </div>
                {/* Progress */}
                <div className="flex justify-center gap-2 mb-8">
                    {concoursData.quiz.map((q, index) => (
                        <button
                            key={q.id}
                            onClick={() => handleNavigate(index)}
                            className={`w-8 h-2 rounded-full transition-colors ${
                                index === currentQuestionIndex
                                    ? 'bg-gray-900'
                                    : answers[q.id]
                                    ? 'bg-gray-400'
                                    : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex justify-between items-center mb-8 text-sm text-gray-500">
                    <span>Question {currentQuestionIndex + 1} / {totalQuestions}</span>
                    <div className="flex gap-6">
                        <span>{answeredCount} / {totalQuestions}</span>
                        <span>{formattedTime}</span>
                    </div>
                </div>

                {/* Question */}
                {(!currentQuestion.type || currentQuestion.type === 'mcq') && (
                    <MCQQuestion
                        question={currentQuestion}
                        userAnswer={answers[currentQuestion.id] as string | undefined}
                        isReviewMode={false}
                        isSubmitted={false}
                        onOptionChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                    />
                )}

                {currentQuestion.type === 'ordering' && (
                    <OrderingQuestion
                        question={currentQuestion}
                        userAnswer={answers[currentQuestion.id] as string[] | undefined}
                        isReviewMode={false}
                        isSubmitted={false}
                        onOptionChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                    />
                )}

                {/* Hints */}
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <div className="mt-8">
                        {!showHint ? (
                            <button
                                onClick={handleShowHint}
                                className="w-full border border-gray-200 text-gray-700 px-6 py-3 text-sm font-light hover:border-gray-900 transition-colors"
                            >
                                Afficher un indice
                            </button>
                        ) : (
                            <div className="border border-gray-200 p-6">
                                <div className="text-xs text-gray-500 mb-2">
                                    Indice {currentHintIndex + 1} / {currentQuestion.hints.length}
                                </div>
                                <div className="text-sm text-gray-700 mb-4">
                                    <FormattedText text={currentQuestion.hints[currentHintIndex]} />
                                </div>
                                {currentQuestion.hints.length > 1 && (
                                    <div className="flex justify-between">
                                        <button
                                            onClick={handlePreviousHint}
                                            disabled={currentHintIndex === 0}
                                            className="px-4 py-2 text-sm text-gray-600 disabled:opacity-30"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            onClick={handleNextHint}
                                            disabled={currentHintIndex === currentQuestion.hints.length - 1}
                                            className="px-4 py-2 text-sm text-gray-600 disabled:opacity-30"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-12 flex justify-between">
                    <button
                        onClick={() => handleNavigate(currentQuestionIndex - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-2 text-sm text-gray-600 disabled:opacity-30"
                    >
                        Précédent
                    </button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleFinishQuiz}
                            disabled={!allAnswered}
                            className="bg-gray-900 text-white px-8 py-2 text-sm font-light hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                            Terminer le quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => handleNavigate(currentQuestionIndex + 1)}
                            disabled={!answers[currentQuestion.id]}
                            className="px-6 py-2 text-sm text-gray-600 disabled:opacity-30"
                        >
                            Suivant
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConcoursQuizView;
