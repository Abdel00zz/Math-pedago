import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Chapter, ChapterProgress } from '../../types';
import { CLASS_OPTIONS } from '../../constants';
import OrientationModal from '../OrientationModal';
import HelpModal from '../HelpModal';


const ChapterCard: React.FC<{ chapter: Chapter; progress?: ChapterProgress; onClick: () => void; onLiveClick?: (sessionDate: string) => void }> = ({ chapter, progress, onClick, onLiveClick }) => {
    const isQuizSubmitted = progress?.quiz.isSubmitted || false;
    const totalExercises = chapter.exercises?.length || 0;
    const exercisesFeedback = progress?.exercisesFeedback || {};
    // Terminé si chaque exercice est évalué (même 'Pas travaillé') et le quiz est soumis
    const evaluatedCount = Object.keys(exercisesFeedback).length;
    const allExercisesEvaluated = totalExercises > 0 ? evaluatedCount === totalExercises : true;
    const isCompleted = isQuizSubmitted && allExercisesEvaluated;
    
    const quizScore = progress?.quiz.score || 0;
    const quizIcon = isQuizSubmitted ? 'check_circle' : 'quiz';
    const quizColor = isQuizSubmitted ? 'text-emerald-600' : 'text-blue-600';
    const exerciseIcon = allExercisesEvaluated ? 'check_circle' : 'edit_note';
    const exerciseColor = allExercisesEvaluated ? 'text-emerald-600' : 'text-purple-600';

    return (
        <div 
            onClick={chapter.isActive ? onClick : undefined}
            className={`relative bg-white rounded-xl shadow-lg flex flex-col min-h-[140px] overflow-hidden group transition-all duration-500 ease-out ${
                !chapter.isActive 
                    ? 'opacity-60 cursor-not-allowed border border-gray-200' 
                    : 'cursor-pointer hover:scale-[1.02] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98]'
            }`}
        >
            {/* Header hyper compact */}
            <header className="relative p-3 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2">
                     <hgroup className="flex-1 min-w-0">
                         <h3 className="text-sm font-extrabold text-gray-900 leading-tight group-hover:text-blue-900 transition-all duration-300 truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 drop-shadow-sm">{chapter.chapter}</h3>
                     </hgroup>
                     <nav className="flex items-center gap-2" aria-label="Statut du chapitre">
                            {isCompleted ? (
                                <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm border bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 hover:shadow-md transition-all duration-200">
                                    ✓ Terminé
                                </span>
                            ) : chapter.isActive ? (
                                <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm border bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 hover:shadow-md transition-all duration-200">
                                    ⏱ En cours
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm border bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200 transition-all duration-200">
                                     🔒 À venir
                                 </span>
                             )}
                         </nav>
                 </div>
            </header>
            
            {/* Section statistiques optimisée */}
             <main className="flex-1 p-2 grid grid-cols-2 gap-2">
                 {/* Carte Quiz */}
                 <article className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200/50 hover:border-blue-300 transition-all duration-300 group/quiz flex flex-col items-center text-center justify-between">
                     <header className="flex flex-col items-center">
                         <h4 className="font-bold text-gray-800 text-sm mb-2" role="heading" aria-level="4">
                             <span className="sr-only">Quiz: </span>{chapter.quiz?.length || 0} questions
                         </h4>
                     </header>
                     
                     <footer className="mt-2">
                         {isQuizSubmitted ? (
                             <span className="flex items-center gap-1 text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-1 rounded">
                                 ✓ {quizScore}%
                             </span>
                         ) : (
                             <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">À faire</span>
                         )}
                     </footer>
                 </article>
                 
                 {/* Carte Exercices */}
                 <article className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200/50 hover:border-purple-300 transition-all duration-300 group/exercise flex flex-col items-center text-center justify-between">
                     <header className="flex flex-col items-center">
                         <h4 className="font-bold text-gray-800 text-sm mb-2" role="heading" aria-level="4">
                             <span className="sr-only">Exercices: </span>{totalExercises} exercices
                         </h4>
                     </header>
                     
                     <footer className="mt-2">
                         {allExercisesEvaluated ? (
                             <span className="flex items-center gap-1 text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-1 rounded">
                                 ✓ OK
                             </span>
                         ) : (
                             <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium">À faire</span>
                         )}
                     </footer>
                 </article>
             </main>
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
    const [selectedSessionDate, setSelectedSessionDate] = useState('');
    
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
        <main className="animate-fadeIn">
            {/* Boutons d'action en haut à droite */}
            <nav className="fixed top-6 right-4 z-50 flex gap-3" role="navigation" aria-label="Actions principales">
                <button
                    onClick={() => setIsOrientationModalOpen(true)}
                    className="w-12 h-12 bg-gradient-to-br from-gray-50/90 to-slate-50/90 hover:from-gray-100/95 hover:to-slate-100/95 text-gray-500 hover:text-gray-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-gray-100/60 hover:border-gray-200/80"
                    title="Orientation pédagogique"
                    aria-label="Ouvrir l'orientation pédagogique"
                >
                    <span className="material-symbols-outlined text-xl">school</span>
                </button>
                
                <button
                     onClick={() => setIsHelpModalOpen(true)}
                     className="w-12 h-12 bg-gradient-to-br from-gray-50/90 to-slate-50/90 hover:from-gray-100/95 hover:to-slate-100/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-600 border border-gray-100/60 hover:border-gray-200/80"
                     title="Aide"
                     aria-label="Ouvrir l'aide"
                 >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                     </svg>
                 </button>
            </nav>
            

            
            {/* Contenu principal avec espacement amélioré */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="flex justify-center mb-8">
                    <hgroup className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold font-serif text-dark-gray mb-2">
                            {displayText}
                            {isTyping && <span className="animate-cursorBlink text-primary/80 ml-1">|</span>}
                        </h2>
                        {profile && (
                            <p className="text-lg text-gray-500">
                                {CLASS_OPTIONS.find(c => c.value === profile.classId)?.label}
                            </p>
                        )}
                    </hgroup>
                </header>


                {userChapters.length > 0 ? (
                    <section className="space-y-4" aria-label="Chapitres disponibles">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-8 px-2 sm:px-0" role="list">
                            {userChapters.map(chapter => (
                                <ChapterCard
                                    key={chapter.id}
                                    chapter={chapter}
                                    progress={progress[chapter.id]}
                                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId: chapter.id } })}
                                    onLiveClick={(sessionDate) => {
                                        setSelectedSessionDate(sessionDate);
                                        
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="text-center py-16 px-6 bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-sm" aria-label="Aucun contenu disponible">
                        <span className="material-symbols-outlined text-6xl text-secondary/50" aria-hidden="true">library_books</span>
                        <h3 className="mt-4 font-semibold text-dark-gray text-lg">Aucune activité n'est disponible pour votre classe pour le moment.</h3>
                        <p className="text-secondary">Revenez bientôt !</p>
                    </section>
                )}
            </section>
            
            {/* Modales */}
            <OrientationModal 
                isOpen={isOrientationModalOpen} 
                onClose={() => setIsOrientationModalOpen(false)}
                classId={profile?.classId || ''}
            />
            
            <HelpModal 
                isOpen={isHelpModalOpen} 
                onClose={() => setIsHelpModalOpen(false)}
            />
            

        </main>
    );
};

export default DashboardView;