import React, { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Quiz from '../Quiz';
import Exercises from '../Exercises';

const ActivityView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, activitySubView } = state;

    const [highlightBackButton, setHighlightBackButton] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (highlightBackButton) {
            const timer = setTimeout(() => setHighlightBackButton(false), 5000); // Highlight for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [highlightBackButton]);

    const onAllExercisesCompleted = () => {
        setHighlightBackButton(true);
        // Scroll to the top of the view to make the header visible
        if (headerRef.current) {
            headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (!currentChapterId || !activities[currentChapterId]) {
        return <div>Erreur: Chapitre non chargé.</div>;
    }

    const chapter = activities[currentChapterId];
    const subViewTitle = activitySubView === 'quiz' ? 'Quiz' : 'Exercices';

    return (
        <div className="max-w-3xl mx-auto animate-slideInUp">
             <header ref={headerRef} className="relative flex items-center justify-center mb-8">
                 <button 
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan' } })}
                    className={`font-button absolute left-0 flex items-center justify-center w-11 h-11 rounded-full text-secondary bg-surface border border-border hover:bg-background transition-all duration-200 active:scale-95 ${highlightBackButton ? 'animate-pulse bg-primary-light/80' : ''}`}
                    aria-label="Retour au plan de travail"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-5xl font-playfair text-text">{subViewTitle}</h1>
                    <p className="text-primary text-xl font-garamond italic mt-1">{chapter.chapter}</p>
                </div>
            </header>

            {activitySubView === 'quiz' && <Quiz />}
            {activitySubView === 'exercises' && <Exercises onAllCompleted={onAllExercisesCompleted} />}
        </div>
    );
};

export default ActivityView;