import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch } from '../../context/AppContext';
// StandardHeader removed per concours design change
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
                {/* Geometric motif background (decorative) */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="concoursGradientQuiz" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0.08" />
                            </linearGradient>
                            <filter id="blurSmallQuiz" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="36" />
                            </filter>
                            <pattern id="concours-hex-quiz" width="48" height="48" patternUnits="userSpaceOnUse">
                                <path d="M24 0 L36 12 L24 24 L12 12 Z" fill="white" opacity="0.03" />
                            </pattern>
                        </defs>

                        <rect width="100%" height="100%" fill="url(#concoursGradientQuiz)" />

                        <g filter="url(#blurSmallQuiz)" opacity="0.26">
                            <circle cx="16%" cy="24%" r="140" fill="#ffffff" />
                            <rect x="62%" y="8%" width="280" height="180" rx="28" fill="#ffffff" />
                        </g>

                        <rect width="100%" height="100%" fill="url(#concours-hex-quiz)" opacity="0.05" />
                    </svg>
                </div>

                <div className="max-w-3xl mx-auto px-6 py-12">
                    <div className="border border-gray-200 p-12 text-center">
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
                <div className="absolute inset-0 pointer-events-none" aria-hidden={true}>
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="concoursGradientQuiz2" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0.06" />
                            </linearGradient>
                            <filter id="blurSmallQuiz2" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="36" />
                            </filter>
                            <pattern id="concours-hex-quiz2" width="48" height="48" patternUnits="userSpaceOnUse">
                                <path d="M24 0 L36 12 L24 24 L12 12 Z" fill="white" opacity="0.03" />
                            </pattern>
                        </defs>

                        <rect width="100%" height="100%" fill="url(#concoursGradientQuiz2)" />

                        <g filter="url(#blurSmallQuiz2)" opacity="0.24">
                            <circle cx="16%" cy="24%" r="120" fill="#ffffff" />
                            <rect x="62%" y="8%" width="240" height="160" rx="28" fill="#ffffff" />
                        </g>

                        <rect width="100%" height="100%" fill="url(#concours-hex-quiz2)" opacity="0.05" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 font-sans">
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
