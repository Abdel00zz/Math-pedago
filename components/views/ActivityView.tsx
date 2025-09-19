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
        <main className="animate-fadeIn bg-slate-50 min-h-screen font-sans">
            <div >
                {activitySubView === 'quiz' && <Quiz chapter={chapter} title={title} />}
                {activitySubView === 'exercises' && <Exercises chapter={chapter} title={title} />}
            </div>
        </main>
    );
};

export default ActivityView;