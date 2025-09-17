import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';

const ChapterCard: React.FC<{ chapter: Chapter; progress?: ChapterProgress; onClick: () => void }> = ({ chapter, progress, onClick }) => {
    const isQuizSubmitted = progress?.quiz.isSubmitted || false;
    const totalExercises = chapter.exercises?.length || 0;
    const exercisesFeedback = progress?.exercisesFeedback || {};
    // Terminé si chaque exercice est évalué (même 'Pas travaillé') et le quiz est soumis
    const evaluatedCount = Object.keys(exercisesFeedback).length;
    const allExercisesEvaluated = totalExercises > 0 ? evaluatedCount === totalExercises : true;
    const isCompleted = isQuizSubmitted && allExercisesEvaluated;
    
    const quizScore = progress?.quiz.score || 0;
    const quizIcon = isQuizSubmitted ? 'check_circle' : 'quiz';
    const quizColor = isQuizSubmitted ? 'text-success' : 'text-primary/80';
    const exerciseIcon = allExercisesEvaluated ? 'check_circle' : 'edit_note';
    const exerciseColor = allExercisesEvaluated ? 'text-success' : 'text-primary/80';

    return (
        <div 
            onClick={onClick}
            className={`relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-transparent rounded-none shadow-lg flex flex-col cursor-pointer min-h-[260px] overflow-hidden group transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:rotate-1 active:scale-95 touch-manipulation before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400/0 before:via-purple-400/10 before:to-pink-400/0 before:translate-x-[-100%] before:transition-transform before:duration-1000 hover:before:translate-x-[100%] after:absolute after:inset-0 after:border-2 after:border-gradient-to-r after:from-blue-500 after:via-purple-500 after:to-pink-500 after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100 ${
                !chapter.isActive ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}
        >
            {/* Section titre */}
            <div className="relative p-4 bg-gradient-to-r from-primary/5 to-blue-50 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-blue-100/50 group-hover:to-purple-100/30 transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200 ease-out"></div>
                <h3 className="relative text-xl font-bold font-serif text-primary group-hover:text-blue-600 transition-colors duration-500 group-hover:drop-shadow-sm">{chapter.chapter}</h3>
            </div>
            
            {/* Section badge */}
            <div className="p-3 flex justify-end">
                {isCompleted ? (
                    <span className="px-2 py-0.5 bg-green-100 rounded-full text-green-800 font-medium text-xs whitespace-nowrap">
                        Terminé
                    </span>
                ) : chapter.isActive ? (
                    <span className="px-2 py-0.5 bg-orange-100 rounded-full text-orange-800 font-medium text-xs whitespace-nowrap">
                        Pas encore terminé
                    </span>
                ) : (
                    <span className="text-xs font-bold text-secondary bg-light-gray px-2 py-1 rounded-full text-center whitespace-nowrap">À VENIR</span>
                )}
            </div>
            
            {/* Section statistiques */}
            <div className="p-4 grid grid-cols-2 gap-4">
                {/* Quiz Stat Block */}
                <div className="bg-light-gray/50 rounded-xl p-3 text-center">
                    <span className={`material-symbols-outlined text-3xl ${quizColor}`}>{quizIcon}</span>
                    <p className="font-bold text-dark-gray text-sm mt-1">{chapter.quiz?.length || 0} Question{(chapter.quiz?.length || 0) !== 1 ? 's' : ''}</p>
                    {isQuizSubmitted ? (
                        <div className="flex items-center justify-center gap-1 text-sm text-success font-bold mt-1">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>{quizScore}%</span>
                        </div>
                    ) : (
                        <p className="text-sm text-secondary mt-1">À faire</p>
                    )}
                </div>
                {/* Exercise Stat Block */}
                <div className="bg-light-gray/50 rounded-xl p-3 text-center">
                    <span className={`material-symbols-outlined text-3xl ${exerciseColor}`}>{exerciseIcon}</span>
                    <p className="font-bold text-dark-gray text-sm mt-1">{totalExercises} Exercice{totalExercises !== 1 ? 's' : ''}</p>
                    {allExercisesEvaluated ? (
                        <div className="flex items-center justify-center gap-1 text-sm text-success font-bold mt-1">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Évalués</span>
                        </div>
                    ) : (
                        <p className="text-sm text-secondary mt-1">À faire</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { profile, activities, progress } = state;
    
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    
    const welcomeText = useMemo(() => {
        if (!profile) return '';
        const greeting = 'Bonjour, ';
        return `${greeting}${profile.name} !`;
    }, [profile]);

    useEffect(() => {
        if (welcomeText) {
            setIsTyping(true);
            setDisplayText('');
            
            let i = 0;
            const typingInterval = setInterval(() => {
                setDisplayText(welcomeText.substring(0, i + 1));
                i++;
                
                if (i >= welcomeText.length) {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                }
            }, 70);

            return () => clearInterval(typingInterval);
        }
    }, [welcomeText]);
    
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

    if (!profile) return null;
    
    return (
        <div className="animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 p-4 bg-card-bg/50 backdrop-blur-sm rounded-2xl">
                <span className="text-5xl">🦉</span>
                <div>
                    <h1 className="text-3xl font-bold font-serif min-h-[40px] text-dark-gray">
                        {displayText}
                        {isTyping && <span className="animate-cursorBlink text-primary/80 ml-1">|</span>}
                    </h1>
                </div>
            </div>


            {userChapters.length > 0 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
                        {userChapters.map(chapter => (
                            <ChapterCard
                                key={chapter.id}
                                chapter={chapter}
                                progress={progress[chapter.id]}
                                onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId: chapter.id } })}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-sm">
                     <span className="material-symbols-outlined text-6xl text-secondary/50">library_books</span>
                    <p className="mt-4 font-semibold text-dark-gray text-lg">Aucune activité n'est disponible pour votre classe pour le moment.</p>
                    <p className="text-secondary">Revenez bientôt !</p>
                </div>
            )}
        </div>
    );
};

export default DashboardView;