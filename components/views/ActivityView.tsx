

import React, { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Quiz from '../Quiz';
import Exercises from '../Exercises';

const ActivityView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, activitySubView, shouldBlinkBackButton } = state;

    // Effet pour arrêter le clignotement après 5 secondes
    useEffect(() => {
        if (shouldBlinkBackButton) {
            const timer = setTimeout(() => {
                dispatch({ type: 'STOP_BACK_BUTTON_BLINK' });
            }, 5000); // 5 secondes de clignotement

            return () => clearTimeout(timer);
        }
    }, [shouldBlinkBackButton, dispatch]);

    if (!currentChapterId || !activities[currentChapterId]) {
        return <div>Erreur: Chapitre non chargé.</div>;
    }

    const chapter = activities[currentChapterId];
    const subViewTitle = activitySubView === 'quiz' ? 'Quiz' : 'Exercices';

    return (
        <div className="max-w-4xl mx-auto animate-slideInUp">
             <header className="relative flex items-center justify-center mb-8">
                 <button 
                    onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan' } })}
                    className={`font-button absolute left-0 flex items-center justify-center w-10 h-10 rounded-full text-secondary bg-transparent border border-transparent hover:bg-surface hover:border-border transition-all duration-200 active:scale-95 ${
                        shouldBlinkBackButton ? 'animate-elegant-blink bg-gradient-to-br from-amber-50/30 to-amber-100/40 border-amber-300/60 shadow-lg shadow-amber-200/30 ring-2 ring-amber-200/50' : ''
                    }`}
                    aria-label="Retour au plan de travail"
                    style={shouldBlinkBackButton ? {
                        animation: 'elegant-blink 1.5s ease-in-out infinite alternate, gentle-glow 2s ease-in-out infinite'
                    } : {}}
                >
                    <span className={`material-symbols-outlined transition-all duration-300 ${
                        shouldBlinkBackButton ? 'text-amber-700 drop-shadow-sm' : ''
                    }`}>arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-5xl font-playfair text-text">{subViewTitle}</h1>
                    <p className="text-primary text-xl font-garamond italic mt-1">{chapter.chapter}</p>
                </div>
            </header>

            {activitySubView === 'quiz' && <Quiz />}
            {activitySubView === 'exercises' && <Exercises />}
        </div>
    );
};

export default ActivityView;