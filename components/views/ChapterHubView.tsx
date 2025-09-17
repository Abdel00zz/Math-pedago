import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const HubCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="text-center cursor-pointer bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl hover:scale-105 border border-border-color active:scale-95 active:shadow-md min-h-[280px] flex flex-col justify-between group"
    >
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 mx-auto flex items-center justify-center bg-primary/10 rounded-full text-primary mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">{icon}</div>
            <h3 className="text-xl font-bold font-serif mb-3 text-dark-gray group-hover:text-primary transition-colors duration-300">{title}</h3>
        </div>
        <p className="text-secondary text-sm leading-relaxed group-hover:text-dark-gray transition-colors duration-300">{description}</p>
    </div>
);

const ChapterHubView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, activities, progress } = state;

    if (!currentChapterId || !activities[currentChapterId]) {
        // This case should ideally not be reached if navigation is correct
        // Redirecting to dashboard is a safe fallback
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
        return null;
    }

    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const isQuizSubmitted = chapterProgress?.quiz.isSubmitted || false;
    
    const quizIcon = isQuizSubmitted ? (
        <span className="material-symbols-outlined text-5xl">task_alt</span>
    ) : (
        <span className="material-symbols-outlined text-5xl">quiz</span>
    );

    return (
        <div className="animate-fadeIn">
            <div className="relative pt-12 pb-8 text-center">
                 <button
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                    className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-card-bg/80 backdrop-blur-sm border border-border-color rounded-full shadow-sm text-secondary hover:bg-light-gray hover:text-dark-gray transition-all duration-200 active:scale-95"
                    aria-label="Retour au tableau de bord"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <h2 className="text-4xl font-bold text-red-600 mb-4" style={{fontFamily: 'Oswald, sans-serif', letterSpacing: '0.01em', fontWeight: '600'}}>{chapter.chapter}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
                    <HubCard 
                        icon={quizIcon}
                        title={isQuizSubmitted ? "Revoir le Quiz" : "Faire le Quiz"}
                        description={isQuizSubmitted ? "Consultez vos réponses et les explications détaillées." : "Testez vos connaissances et obtenez un score."}
                        onClick={() => dispatch({
                            type: 'CHANGE_VIEW',
                            payload: { 
                                view: 'activity', 
                                subView: 'quiz',
                                review: isQuizSubmitted 
                            } 
                        })}
                    />
                </div>
                <div className="animate-slideInUp" style={{ animationDelay: '250ms' }}>
                    <HubCard 
                        icon={<span className="material-symbols-outlined text-5xl">edit_note</span>} 
                        title="Faire les Exercices" 
                        description="Entraînez-vous sur les concepts clés et donnez votre avis détaillé."
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', subView: 'exercises' } })}
                    />
                </div>
            </div>

            {chapter.sessionDate && (
                <div className="mt-8 max-w-md mx-auto animate-fadeIn">
                    <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-800 bg-green-100/80 px-4 py-2 rounded-full">Séance Live</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-gray-800 text-center">{chapter.sessionDate}</p>
                </div>
            )}
        </div>
    );
};

export default ChapterHubView;