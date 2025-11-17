import React, { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Quiz from '../quiz/Quiz';
import Exercises from '../Exercises';
import VideoCapsules from '../VideoCapsules';
import LessonView from './LessonView';
import StandardHeader from '../StandardHeader';
import { LessonStage } from '../lesson/LessonStageNavigation';
import StageBreadcrumb from '../StageBreadcrumb';
import {
    LESSON_PROGRESS_EVENT,
    readLessonCompletion,
    summarizeLessonRecord,
    type LessonCompletionSummary,
    type LessonProgressEventDetail,
} from '../../utils/lessonProgressHelpers';

const ActivityView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, activitySubView, progress } = state;

    const [highlightBackButton, setHighlightBackButton] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    
    // ✅ TOUS LES HOOKS AVANT LE PREMIER RETURN
    const [lessonCompletion, setLessonCompletion] = useState<LessonCompletionSummary>({
        completed: 0,
        total: 0,
        percentage: 0,
    });

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

    // Calculer chapter et lessonId AVANT le return
    const chapter = currentChapterId ? activities[currentChapterId] : null;
    const chapterProgress = currentChapterId ? progress[currentChapterId] : null;
    const activeStage: LessonStage = (activitySubView || 'lesson') as LessonStage;
    const lessonId = chapter ? `${chapter.class}-${chapter.chapter}` : null;

    useEffect(() => {
        if (!lessonId) {
            setLessonCompletion({ completed: 0, total: 0, percentage: 0 });
            return;
        }

        setLessonCompletion(readLessonCompletion(lessonId));

        const handleProgressUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<LessonProgressEventDetail>;
            if (customEvent.detail?.lessonId !== lessonId) {
                return;
            }

            setLessonCompletion(summarizeLessonRecord(customEvent.detail.progress));
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate as EventListener);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(LESSON_PROGRESS_EVENT, handleProgressUpdate as EventListener);
            }
        };
    }, [lessonId]);

    // ✅ RETURN CONDITIONNEL APRÈS TOUS LES HOOKS
    if (!currentChapterId || !chapter) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary text-lg">Chargement du chapitre...</p>
                </div>
            </div>
        );
    }
    
    const subViewTitle = activitySubView === 'lesson' ? 'Leçon' : activitySubView === 'videos' ? 'Vidéos' : activitySubView === 'quiz' ? 'Quiz' : 'Exercices';

    const handleStageSelect = (stage: LessonStage) => {
        if (!chapter) return;
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: stage } });
    };

    const handleNavigateHome = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
    };

    const handleNavigateSteps = () => {
        if (!chapter) return;
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId: chapter.id } });
    };

    // Si c'est la vue leçon, on utilise le composant spécialisé
    if (activitySubView === 'lesson') {
        return <LessonView />;
    }

    const renderQuizContent = () => {
        if (lessonCompletion.percentage < 100) {
            return (
                <div className="font-sans max-w-3xl mx-auto px-4 py-12">
                    <div className="bg-surface border border-border rounded-2xl coursera-shadow-card p-8 text-center">
                        <div className="mb-6">
                            <svg className="w-20 h-20 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-playfair text-text mb-4">Quiz en attente</h2>
                        <p className="text-secondary text-lg mb-6">
                            Terminez la leçon à 100% pour accéder au quiz.
                        </p>
                        <div className="bg-background p-6 rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-secondary">Progression de la leçon</span>
                                <span className="text-text font-bold">{lessonCompletion.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${lessonCompletion.percentage}%` }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'lesson' } })}
                            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            Retourner à la leçon
                        </button>
                    </div>
                </div>
            );
        }

        return <Quiz />;
    };

    return (
        <div className="max-w-4xl mx-auto animate-slideInUp px-4 sm:px-6">
            <StageBreadcrumb
                currentStage={activeStage}
                onNavigateHome={handleNavigateHome}
                onNavigateSteps={handleNavigateSteps}
                onSelectStage={handleStageSelect}
                disabledStages={(() => {
                    const disabled: LessonStage[] = [];
                    const hasLesson = !!(chapter.lesson || chapter.lessonFile);
                    const lessonMeta = chapterProgress?.lesson;
                    const lessonPercent = Math.max(lessonMeta?.scrollProgress ?? 0, lessonMeta?.checklistPercentage ?? 0);
                    const isLessonDone = !!lessonMeta?.isRead || lessonPercent >= 95;
                    const quizDone = !!chapterProgress?.quiz?.isSubmitted;
                    
                    if (!hasLesson) disabled.push('lesson');
                    if (!isLessonDone) disabled.push('quiz', 'exercises');
                    else if (!quizDone) disabled.push('exercises');
                    
                    return disabled;
                })()}
            />
            <StandardHeader
                title={subViewTitle}
                subtitle={chapter.chapter}
                onBack={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan' } })}
                backLabel="Retour au plan de travail"
                className={highlightBackButton ? 'animate-pulse' : ''}
            />

            {activitySubView === 'videos' && <VideoCapsules />}
            {activitySubView === 'quiz' && renderQuizContent()}
            {activitySubView === 'exercises' && <Exercises onAllCompleted={onAllExercisesCompleted} />}
        </div>
    );
};

export default ActivityView;