import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Quiz from '../Quiz';
import Exercises from '../Exercises';

const ActivityView: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { currentChapterId, activitySubView, activities } = state;

    if (!currentChapterId || !activities[currentChapterId]) {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
        return null;
    }
    
    const chapter = activities[currentChapterId];
    const title = activitySubView === 'quiz' ? 'Quiz' : 'Exercices';

    return (
        <div className="animate-fadeIn">
            <div className="relative flex justify-center items-center mb-8 h-[42px]">
                <div className="absolute left-0">
                    <button
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId: currentChapterId } })}
                        className="inline-flex items-center justify-center w-10 h-10 text-secondary bg-card-bg/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-light-gray transition border border-border-color active:scale-95"
                        aria-label="Retour au hub de l'activité"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>
               
                <h2 className="text-xl font-medium font-serif text-slate-700 whitespace-nowrap mb-4">{chapter.chapter}</h2>
            </div>
            
            <div>
                {activitySubView === 'quiz' && <Quiz />}
                {activitySubView === 'exercises' && <Exercises />}
            </div>
        </div>
    );
};

export default ActivityView;