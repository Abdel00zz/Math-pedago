import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import OrientationModal from '../OrientationModal';
import HelpModal from '../HelpModal';

const ChapterCard: React.FC<{ chapter: Chapter; progress?: ChapterProgress; onClick: () => void; }> = ({ chapter, progress, onClick }) => {
    const totalQuizQuestions = chapter.quiz?.length || 0;
    const totalExercises = chapter.exercises?.length || 0;

    const completedExercises = Object.keys(progress?.exercisesFeedback || {}).length;
    const isQuizDone = progress?.quiz.isSubmitted || false;

    const completionPercentage = useMemo(() => {
        const quizUnit = totalQuizQuestions > 0 ? 1 : 0;
        const totalUnits = quizUnit + totalExercises;
        if (totalUnits === 0) return 100;

        const completedUnits = (isQuizDone ? quizUnit : 0) + completedExercises;
        
        return Math.round((completedUnits / totalUnits) * 100);
    }, [totalQuizQuestions, totalExercises, completedExercises, isQuizDone]);

    const isCompleted = useMemo(() => {
        const quizOk = totalQuizQuestions > 0 ? isQuizDone : true;
        const exercisesOk = completedExercises === totalExercises;
        return chapter.isActive && quizOk && exercisesOk;
    }, [chapter.isActive, totalQuizQuestions, isQuizDone, completedExercises, totalExercises]);

    return (
        <div
            onClick={chapter.isActive ? onClick : undefined}
            className={`font-sans rounded-xl border flex flex-col bg-white transition-all duration-300 group ${
                !chapter.isActive
                    ? 'border-slate-200 bg-slate-50/50 cursor-not-allowed'
                    : 'cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-lg'
            }`}
        >
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                        {chapter.chapter}
                    </h3>
                    {progress?.isWorkSubmitted ? (
                        <span className="px-2.5 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full whitespace-nowrap">Travail soumis</span>
                    ) : isCompleted ? (
                        <span className="px-2.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full whitespace-nowrap">Terminé</span>
                    ) : chapter.isActive ? (
                        <span className="px-2.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full whitespace-nowrap">En cours</span>
                    ) : (
                        <span className="px-2.5 py-0.5 text-xs font-medium text-slate-700 bg-slate-200 rounded-full whitespace-nowrap">À venir</span>
                    )}
                </div>

                
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-blue-500">quiz</span>
                        <span>{totalQuizQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-purple-500">edit_note</span>
                        <span>{totalExercises} Exercices</span>
                    </div>
                </div>
            </div>

            {chapter.isActive && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-600 font-medium whitespace-nowrap">{completionPercentage}%</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const DashboardView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { profile, activities, progress } = state;
    
    const [isOrientationModalOpen, setIsOrientationModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [typingCompleted, setTypingCompleted] = useState(false);

    useEffect(() => {
        if (profile?.name) {
            const fullMessage = `Prêt à relever de nouveaux défis, ${profile.name} ?`;
            let i = 0;
            setWelcomeMessage('');
            setTypingCompleted(false);
    
            const typingInterval = setInterval(() => {
                if (i < fullMessage.length) {
                    setWelcomeMessage(prev => prev + fullMessage.charAt(i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                    setTypingCompleted(true);
                }
            }, 50);
    
            return () => clearInterval(typingInterval);
        }
    }, [profile]);

    const userChapters = useMemo(() => {
        if (!profile) return [];
        return (Object.values(activities) as Chapter[])
            .filter(ch => ch.class === profile.classId)
            .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return a.chapter.localeCompare(b.chapter);
            });
    }, [activities, profile]);

    const { nextChapter, otherChapters } = useMemo(() => {
        const next = userChapters.find(ch => {
            if (!ch.isActive) return false;

            const chProgress = progress[ch.id];
            const totalExercises = ch.exercises?.length || 0;
            const totalQuizQuestions = ch.quiz?.length || 0;
            const completedExercises = Object.keys(chProgress?.exercisesFeedback || {}).length;
            const isQuizDone = chProgress?.quiz.isSubmitted || false;

            const quizOk = totalQuizQuestions > 0 ? isQuizDone : true;
            const exercisesOk = completedExercises === totalExercises;

            return !(quizOk && exercisesOk);
        });

        const others = userChapters.filter(ch => ch.id !== next?.id);

        return { nextChapter: next, otherChapters: others };
    }, [userChapters, progress]);

    const handleChapterClick = (chapterId: string) => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId } });
    };

    if (!profile) return null;
    
    return (
        <main className="animate-fadeIn bg-slate-100 min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 h-9">
                                {welcomeMessage}
                                {!typingCompleted && <span className="animate-pulse ml-1 opacity-70">|</span>}
                            </h1>
                            <p className="text-slate-500 mt-1 text-base">
                                {CLASS_OPTIONS.find(c => c.value === profile.classId)?.label}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsOrientationModalOpen(true)}
                                className="h-10 px-3 sm:px-4 flex items-center justify-center rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-blue-600 transition-colors active:scale-95"
                                title="Orientation pédagogique"
                            >
                                <span className="material-symbols-outlined text-xl">explore</span>
                                <span className="text-sm font-medium hidden sm:inline ml-2">Orientation</span>
                            </button>
                            <button
                                onClick={() => setIsHelpModalOpen(true)}
                                className="h-10 px-3 sm:px-4 flex items-center justify-center rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-blue-600 transition-colors active:scale-95"
                                title="Aide"
                            >
                                <span className="material-symbols-outlined text-xl">help</span>
                                <span className="text-sm font-medium hidden sm:inline ml-2">Aide</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {nextChapter && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-5 text-slate-700">Continuez votre parcours</h2>
                        <div className="max-w-3xl">
                            <ChapterCard
                                chapter={nextChapter}
                                progress={progress[nextChapter.id]}
                                onClick={() => handleChapterClick(nextChapter.id)}
                            />
                        </div>
                    </div>
                )}

                {otherChapters.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-5 text-slate-700">
                            {nextChapter ? 'Autres chapitres' : 'Commencez votre parcours'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherChapters.map(chapter => (
                                <ChapterCard
                                    key={chapter.id}
                                    chapter={chapter}
                                    progress={progress[chapter.id]}
                                    onClick={() => handleChapterClick(chapter.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {userChapters.length === 0 && (
                     <div className="text-center py-16 px-6 bg-white rounded-xl border border-slate-200">
                        <span className="material-symbols-outlined text-5xl text-slate-400" aria-hidden="true">upcoming</span>
                        <h3 className="mt-4 font-bold text-slate-700 text-xl">Aucune activité n'est disponible.</h3>
                        <p className="text-slate-500 mt-1.5">Revenez bientôt pour de nouveaux chapitres !</p>
                    </div>
                )}
            </section>
            
            <OrientationModal 
                isOpen={isOrientationModalOpen} 
                onClose={() => setIsOrientationModalOpen(false)}
                classId={profile.classId}
            />
            
            <HelpModal 
                isOpen={isHelpModalOpen} 
                onClose={() => setIsHelpModalOpen(false)}
            />
        </main>
    );
};

export default DashboardView;