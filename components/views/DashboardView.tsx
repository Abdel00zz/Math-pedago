import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';

const ChapterCard: React.FC<{ chapter: Chapter; progress: ChapterProgress; onClick: () => void }> = ({ chapter, progress, onClick }) => {
    const quizProgress = progress?.quiz;
    const isQuizDone = quizProgress?.isSubmitted || false;
    const score = quizProgress?.score || 0;

    const allExercisesFeedback = Object.values(progress?.exercisesFeedback || {});
    const isWorkDone = allExercisesFeedback.length > 0 && !allExercisesFeedback.includes('Pas travaillé');
    
    const quizCount = chapter.quiz?.length || 0;
    const exerciseCount = chapter.exercises?.length || 0;

    const cardClasses = `bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-border-color transition-all duration-300 flex flex-col justify-between ${
        chapter.isActive 
            ? 'cursor-pointer transform hover:-translate-y-1.5 hover:shadow-xl hover:border-primary active:scale-[0.98] active:shadow-md' 
            : 'opacity-60 cursor-not-allowed'
    }`;


    return (
        <div 
            onClick={chapter.isActive ? onClick : undefined}
            className={cardClasses}
        >
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold font-serif text-dark-gray">{chapter.chapter}</h3>
                    </div>
                    {!chapter.isActive && (
                        <span className="text-xs font-bold text-secondary bg-light-gray px-2 py-1 rounded-full">À VENIR</span>
                    )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Quiz Stat Block */}
                <div className="bg-light-gray/50 rounded-xl p-3 text-center">
                    <span className="material-symbols-outlined text-3xl text-primary/80">quiz</span>
                    <p className="font-bold text-dark-gray text-sm mt-1">{quizCount} Question{quizCount !== 1 ? 's' : ''}</p>
                    {isQuizDone ? (
                        <div className="flex items-center justify-center gap-1 text-sm text-success font-bold mt-1">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>{score}%</span>
                        </div>
                    ) : (
                        <p className="text-sm text-secondary mt-1">À faire</p>
                    )}
                </div>
                {/* Exercise Stat Block */}
                <div className="bg-light-gray/50 rounded-xl p-3 text-center">
                    <span className="material-symbols-outlined text-3xl text-primary/80">edit_note</span>
                    <p className="font-bold text-dark-gray text-sm mt-1">{exerciseCount} Exercice{exerciseCount !== 1 ? 's' : ''}</p>
                    {isWorkDone ? (
                        <div className="flex items-center justify-center gap-1 text-sm text-success font-bold mt-1">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Travaillés</span>
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
        return Object.values(activities)
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userChapters.map(chapter => (
                        <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            progress={progress[chapter.id]}
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId: chapter.id } })}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-sm">
                     <span className="material-symbols-outlined text-6xl text-secondary/50">library_books</span>
                    <p className="mt-4 font-semibold text-dark-gray text-lg">Aucun chapitre n'est disponible pour votre classe pour le moment.</p>
                    <p className="text-secondary">Revenez bientôt !</p>
                </div>
            )}
        </div>
    );
};

export default DashboardView;