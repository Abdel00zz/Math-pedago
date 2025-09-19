import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const HubCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    isCompleted?: boolean;
}> = ({ icon, title, description, onClick, isCompleted }) => (
    <div
        onClick={onClick}
        className="group relative flex items-center gap-6 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer border border-slate-100"
    >
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${isCompleted ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'} text-white shadow-md transition-all duration-300 group-hover:scale-110`}>
            <span className="material-symbols-outlined text-4xl">{icon}</span>
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 font-fira">{description}</p>
        </div>
        <span className="material-symbols-outlined absolute top-4 right-4 text-slate-300 transition-transform duration-300 group-hover:translate-x-1">
            arrow_forward
        </span>
    </div>
);

const ChapterHubView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, activities, progress } = state;

    if (!currentChapterId || !activities[currentChapterId]) {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
        return null;
    }

    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const isQuizSubmitted = chapterProgress?.quiz.isSubmitted || false;
    const totalExercises = chapter.exercises?.length || 0;
    const completedExercises = Object.keys(chapterProgress?.exercisesFeedback || {}).length;
    const allExercisesCompleted = totalExercises > 0 ? completedExercises === totalExercises : true;

    return (
        <main className="animate-fadeIn bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="relative mb-10 flex items-center justify-center">
                    <button
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } })}
                        className="absolute left-0 flex items-center justify-center h-11 w-11 text-slate-500 bg-white rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95"
                        aria-label="Retour au tableau de bord"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">
                        {chapter.chapter}
                    </h2>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <HubCard
                        icon="quiz"
                        title={isQuizSubmitted ? "Revoir le Quiz" : "Faire le Quiz"}
                        description={isQuizSubmitted ? "Consultez vos réponses et les explications." : "Testez vos connaissances."}
                        isCompleted={isQuizSubmitted}
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
                        icon="edit_note"
                        title="Faire les Exercices"
                        description="Entraînez-vous sur les concepts clés."
                        isCompleted={allExercisesCompleted}
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', subView: 'exercises' } })}
                    />
                </div>
            </div>
        </main>
    );
};

export default ChapterHubView;