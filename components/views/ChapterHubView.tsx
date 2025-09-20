import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import GlobalWorkSubmit from '../GlobalWorkSubmit';

const ChapterHubView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;

    if (!currentChapterId || !activities[currentChapterId] || !progress[currentChapterId]) {
        return <div>Chargement du chapitre...</div>;
    }

    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const quizProgress = chapterProgress.quiz;

    const totalQuizQuestions = chapter.quiz.length;
    const answeredQuestions = Object.keys(quizProgress.answers).length;
    const quizCompletionPercent = totalQuizQuestions > 0 ? (answeredQuestions / totalQuizQuestions) * 100 : 0;
    
    const quizScore = quizProgress.score;
    const isQuizCompleted = quizProgress.isSubmitted;

    const totalExercises = chapter.exercises.length;
    const completedExercises = Object.values(chapterProgress.exercisesFeedback).filter(
        feedback => feedback !== 'Pas encore fait'
    ).length;

    const exerciseCompletionPercent = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
    const isWorkReady = isQuizCompleted && completedExercises === totalExercises;

    const navigateTo = (subView: 'quiz' | 'exercises', review: boolean = false) => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: currentChapterId, subView, review } });
    };


    return (
        <div className="max-w-4xl mx-auto animate-slideInUp">
            <header className="relative flex items-center justify-center mb-8">
                <button 
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                    className="font-button absolute left-0 flex items-center justify-center w-10 h-10 rounded-full text-secondary bg-transparent border border-transparent hover:bg-surface hover:border-border transition-all duration-200 active:scale-95"
                    aria-label="Retour au tableau de bord"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text font-title">{chapter.chapter}</h1>
                    <p className="text-secondary mt-1">Prêt à relever le défi ?</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz Section */}
                <div className="relative overflow-hidden p-6 bg-surface border border-border rounded-lg flex flex-col h-full transition-all duration-300 hover:shadow-claude hover:-translate-y-1">
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-primary/5 opacity-50 rotate-[-15deg]">quiz</span>
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-text">Étape 1: Le Quiz</h2>
                        <p className="text-secondary mt-1 mb-4">Vérifiez votre compréhension des points clés du cours.</p>
                        {isQuizCompleted ? (
                             <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-text">Score</span>
                                    <span className="text-success">{quizScore}/{totalQuizQuestions}</span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2">
                                    <div className="bg-success h-2 rounded-full" style={{width: `${(quizScore/totalQuizQuestions)*100}%`}}></div>
                                </div>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-text">Progression</span>
                                    <span className="text-text-secondary">
                                        {answeredQuestions}/{totalQuizQuestions} questions répondues
                                    </span>
                                </div>
                                 <div className="w-full bg-border rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 bg-primary`} 
                                        style={{width: `${quizCompletionPercent}%`}}>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigateTo('quiz', isQuizCompleted)}
                        className="w-full sm:w-auto mt-6 px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-[1.03] active:scale-[0.98] font-button self-end"
                    >
                        {isQuizCompleted ? 'Revoir le Quiz' : 'Commencer le Quiz'}
                    </button>
                </div>

                {/* Exercises Section */}
                 <div className={`relative overflow-hidden p-6 bg-surface border border-border rounded-lg flex flex-col h-full transition-all duration-300 ${!isQuizCompleted ? 'opacity-70 bg-background' : 'hover:shadow-claude hover:-translate-y-1'}`}>
                     <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-primary/5 opacity-50 rotate-[-15deg]">edit_note</span>
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-text">Étape 2: Les Exercices</h2>
                        <p className="text-secondary mt-1 mb-4">Mettez en pratique vos connaissances et évaluez votre aisance.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-text">Progression</span>
                                <span className={completedExercises === totalExercises ? 'text-success' : 'text-text-secondary'}>
                                    {completedExercises}/{totalExercises} exercices évalués
                                </span>
                            </div>
                             <div className="w-full bg-border rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${completedExercises === totalExercises ? 'bg-success' : 'bg-warning'}`} 
                                    style={{width: `${exerciseCompletionPercent}%`}}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 self-end w-full sm:w-auto text-right">
                        <div className="relative group inline-block">
                            <button
                                onClick={() => navigateTo('exercises')}
                                disabled={!isQuizCompleted}
                                className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-[1.03] active:scale-[0.98] disabled:bg-secondary/50 disabled:cursor-not-allowed font-button"
                            >
                                {!isQuizCompleted && <span className="material-symbols-outlined text-base mr-1 align-bottom">lock</span>}
                                Accéder aux exercices
                            </button>
                            {!isQuizCompleted && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-text text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                    Terminez le quiz pour débloquer
                                    <svg className="absolute text-text left-0 top-full h-2 w-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <GlobalWorkSubmit 
                    isReady={isWorkReady}
                    isSubmitted={chapterProgress.isWorkSubmitted}
                    chapterId={currentChapterId}
                    chapterTitle={chapter.chapter}
                />
            </div>
        </div>
    );
};

export default ChapterHubView;