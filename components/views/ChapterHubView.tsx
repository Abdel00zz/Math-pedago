import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const HubCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="text-center cursor-pointer bg-card-bg/80 backdrop-blur-sm rounded-2xl shadow-sm p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-border-color active:scale-[0.98] active:shadow-lg"
    >
        <div className="w-16 h-16 mx-auto flex items-center justify-center bg-primary/10 rounded-full text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-bold font-serif mb-2 text-dark-gray">{title}</h3>
        <p className="text-secondary">{description}</p>
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
        <span className="material-symbols-outlined text-4xl">task_alt</span>
    ) : (
        <span className="material-symbols-outlined text-4xl">quiz</span>
    );

    return (
        <div className="animate-fadeIn">
            <div className="relative text-center mb-8">
                 <button
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                    className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-card-bg/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-light-gray transition border border-border-color active:scale-95"
                    aria-label="Retour au tableau de bord"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Tous les chapitres
                </button>
                <h2 className="text-3xl font-bold font-serif">{chapter.chapter}</h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <HubCard 
                    icon={quizIcon}
                    title={isQuizSubmitted ? "Revoir le Quiz" : "Faire le Quiz"}
                    description={isQuizSubmitted ? "Consultez vos réponses et les explications." : "Testez vos connaissances et obtenez un score."}
                    onClick={() => dispatch({
                        type: 'CHANGE_VIEW',
                        payload: { 
                            view: 'activity', 
                            subView: 'quiz',
                            review: isQuizSubmitted 
                        } 
                    })}
                />
                <HubCard 
                    icon={<span className="material-symbols-outlined text-4xl">edit_note</span>} 
                    title="Faire les Exercices" 
                    description="Entraînez-vous sur les concepts clés et donnez votre avis."
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', subView: 'exercises' } })}
                />
            </div>

            {chapter.sessionDate && (
                <div className="bg-success/10 backdrop-blur-sm border-2 border-success/30 p-4 rounded-xl mt-8 text-center animate-fadeIn shadow-sm">
                    <div className="flex items-center justify-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                        <span className="text-lg font-bold uppercase tracking-wider text-green-800">Séance Live</span>
                    </div>
                    <p className="mt-1 text-xl font-serif font-semibold text-dark-gray">{chapter.sessionDate}</p>
                </div>
            )}
        </div>
    );
};

export default ChapterHubView;