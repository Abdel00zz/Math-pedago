import React, { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Quiz from '../quiz/Quiz';
import Exercises from '../Exercises';
import VideoCapsules from '../VideoCapsules';
import BackButton from '../BackButton';

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
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary text-lg">Chargement du chapitre...</p>
                </div>
            </div>
        );
    }

    const chapter = activities[currentChapterId];
    const subViewTitle = activitySubView === 'videos' ? 'Vidéos' : activitySubView === 'quiz' ? 'Quiz' : 'Exercices';

    return (
        <div className="max-w-4xl mx-auto animate-slideInUp px-4 sm:px-6">
            <header ref={headerRef} className="mb-6 sm:mb-10">
                {/* Bouton retour fixe à l'extrême gauche */}
                <div className={`fixed left-4 top-4 z-50 sm:absolute sm:left-0 sm:top-0 transition-all duration-300 ${highlightBackButton ? 'animate-pulse' : ''}`}>
                    <BackButton
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan' } })}
                        label="Retour au plan de travail"
                        showLabel={false}
                        className={highlightBackButton ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                    />
                </div>

                {/* Titre centré */}
                <div className="text-center pt-2 sm:pt-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-title text-text tracking-tight">{subViewTitle}</h1>
                    <p className="text-primary text-base sm:text-lg md:text-xl font-sans italic mt-2 px-4">{chapter.chapter}</p>
                </div>
            </header>

            {activitySubView === 'videos' && <VideoCapsules />}
            {activitySubView === 'quiz' && <Quiz />}
            {activitySubView === 'exercises' && <Exercises onAllCompleted={onAllExercisesCompleted} />}
        </div>
    );
};

export default ActivityView;