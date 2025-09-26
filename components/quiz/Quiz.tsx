import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import ActiveQuiz from './ActiveQuiz';
import QuizResult from './QuizResult';

const Quiz: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress, isReviewMode } = state;
    
    const [timeSpent, setTimeSpent] = useState(0);
    
    const chapter = useMemo(() => currentChapterId ? activities[currentChapterId] : null, [currentChapterId, activities]);
    const quizProgress = useMemo(() => currentChapterId ? progress[currentChapterId]?.quiz : null, [currentChapterId, progress]);
    
    useEffect(() => {
        if (isReviewMode || quizProgress?.isSubmitted) return;
        const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [isReviewMode, quizProgress?.isSubmitted]);

    const { isSubmitted, currentQuestionIndex } = quizProgress || {};
    const handleOptionChange = useCallback((answer: string | string[]) => {
        if (isSubmitted || !chapter) return;
        const currentQuestion = chapter.quiz[currentQuestionIndex];
        dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: currentQuestion.id, answer } });
    }, [dispatch, chapter, isSubmitted, currentQuestionIndex]);

    const handleNavigate = useCallback((index: number) => {
        if (index >= 0 && chapter && index < chapter.quiz.length) {
            dispatch({ type: 'NAVIGATE_QUIZ', payload: index });
        }
    }, [dispatch, chapter]);

    const handleSubmit = useCallback(() => {
        if (!chapter || !quizProgress) return;
        const { answers } = quizProgress;
        const finalScore = chapter.quiz.reduce((acc, q) => {
            const userAnswer = answers[q.id];
            if (!q.type || q.type === 'mcq') {
                const correctOption = q.options?.find(opt => opt.isCorrect)?.text;
                if (typeof userAnswer === 'string' && userAnswer === correctOption) {
                    return acc + 1;
                }
            } 
            else if (q.type === 'ordering') {
                if (Array.isArray(userAnswer) && q.steps && JSON.stringify(userAnswer) === JSON.stringify(q.steps)) {
                    return acc + 1;
                }
            }
            return acc;
        }, 0);
        dispatch({ type: 'SUBMIT_QUIZ', payload: { score: finalScore, duration: timeSpent, hintsUsed: quizProgress.hintsUsed || 0 } });
    }, [chapter, quizProgress, dispatch, timeSpent]);


    if (!chapter || !quizProgress) {
        return <div>Chargement du quiz...</div>;
    }

    if (quizProgress.isSubmitted && !isReviewMode) {
        return <QuizResult chapter={chapter} quizProgress={quizProgress} />;
    }
    
    return (
        <ActiveQuiz
            chapter={chapter}
            quizProgress={quizProgress}
            isReviewMode={isReviewMode}
            onNavigate={handleNavigate}
            onSubmit={handleSubmit}
            onOptionChange={handleOptionChange}
        />
    );
};

export default Quiz;
