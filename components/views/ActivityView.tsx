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
            <div className="relative text-center mb-8">
                 <button
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'chapter-hub', chapterId: currentChapterId } })}
                    className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-card-bg/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-light-gray transition border border-border-color active:scale-95"
                    aria-label="Retour au hub du chapitre"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Retour au chapitre
                </button>
                <h2 className="text-3xl font-bold font-serif">{title} - {chapter.chapter}</h2>
            </div>
            
            <div>
                {activitySubView === 'quiz' && <Quiz />}
                {activitySubView === 'exercises' && <Exercises />}
            </div>
        </div>
    );
};

export default ActivityView;