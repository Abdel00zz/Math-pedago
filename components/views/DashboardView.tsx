import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import OrientationModal from '../OrientationModal';
import HelpModal from '../HelpModal';

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
            className={`relative bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-sm flex flex-col cursor-pointer min-h-[260px] overflow-hidden group transition-all duration-300 ease-out touch-manipulation before:absolute before:inset-0 before:bg-gradient-to-t before:from-slate-600/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                !chapter.isActive 
                    ? 'opacity-60 cursor-not-allowed border-2 border-slate-200' 
                    : 'border-3 border-blue-400 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 active:shadow-sm animate-pulse-subtle'
            }`}
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                boxShadow: chapter.isActive 
                    ? '0 6px 25px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                    : '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}
        >
            {/* Section titre */}
            <div className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 group-hover:from-blue-100/95 group-hover:to-indigo-100/95 transition-all duration-300 border-b-2 border-blue-200/60 group-hover:border-blue-300/80">
                <h3 className="text-xl font-bold font-sans text-slate-900 group-hover:text-blue-900 transition-colors duration-300 leading-tight">{chapter.chapter}</h3>
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
    const [isOrientationModalOpen, setIsOrientationModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    
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
            {/* Bouton d'orientation pédagogique fixe en haut à droite */}
            <button
                onClick={() => setIsOrientationModalOpen(true)}
                className="fixed top-4 right-20 z-50 w-12 h-12 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-slate-200/50 hover:border-slate-300/70"
                title="Orientation pédagogique"
                aria-label="Ouvrir l'orientation pédagogique"
            >
                <span className="material-symbols-outlined text-xl">school</span>
            </button>
            
            {/* Bouton d'aide fixe en haut à droite */}
            <button
                onClick={() => setIsHelpModalOpen(true)}
                className="fixed top-4 right-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-800 border border-slate-200/50 hover:border-slate-300/70"
                title="Aide"
                aria-label="Ouvrir l'aide"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            
            <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">🦉</span>
                <div>
                    <h1 className="text-3xl font-bold font-serif text-dark-gray">
                        {displayText}
                        {isTyping && <span className="animate-cursorBlink text-primary/80 ml-1">|</span>}
                    </h1>
                    {profile && (
                        <p className="text-sm text-gray-500 mt-1">
                            {CLASS_OPTIONS.find(c => c.value === profile.classId)?.label}
                        </p>
                    )}
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
            
            {/* Modal d'orientation pédagogique */}
            <OrientationModal 
                isOpen={isOrientationModalOpen} 
                onClose={() => setIsOrientationModalOpen(false)}
                classId={profile?.classId || ''}
            />
            
            {/* Modal d'aide */}
            <HelpModal 
                isOpen={isHelpModalOpen} 
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
};

export default DashboardView;