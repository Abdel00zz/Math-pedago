import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { LessonDisplay } from '../lesson/LessonDisplay';
import { HighlightableContent } from '../lesson/HighlightableContent';
import { LessonNavigator } from '../lesson/LessonNavigator';
import { LessonProgressProvider } from '../../context/LessonProgressContext';
import type { LessonContent } from '../../types';

const LessonView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;
    
    const [startTime] = useState(Date.now());
    const [scrollProgress, setScrollProgress] = useState(0);
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

    const chapter = currentChapterId ? activities[currentChapterId] : null;
    const chapterProgress = currentChapterId ? progress[currentChapterId] : null;

    const handleBack = useCallback(() => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan' } });
    }, [dispatch]);

    // Charger la leçon (inline ou depuis fichier)
    useEffect(() => {
        const loadLesson = async () => {
            if (!chapter) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Si la leçon est inline dans le chapitre
                if (chapter.lesson) {
                    setLesson(chapter.lesson);
                    setIsLoading(false);
                    return;
                }

                // Sinon, charger depuis le fichier lessonFile
                if (chapter.lessonFile) {
                    const lessonPath = `/chapters/${chapter.class}/${chapter.lessonFile}`;
                    const response = await fetch(lessonPath);
                    
                    if (!response.ok) {
                        throw new Error(`Impossible de charger la leçon depuis ${lessonPath}`);
                    }
                    
                    const lessonData = await response.json();
                    setLesson(lessonData);
                    setIsLoading(false);
                    return;
                }

                // Aucune leçon disponible
                setLesson(null);
                setIsLoading(false);
            } catch (err) {
                console.error('Erreur lors du chargement de la leçon:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
                setIsLoading(false);
            }
        };

        loadLesson();
    }, [chapter]);

    // Restaurer la position de scroll sauvegardée
    useEffect(() => {
        if (!scrollContainerRef.current || !currentChapterId) return;
        
        const savedPosition = chapterProgress?.lesson?.scrollProgress || 0;
        if (savedPosition > 0) {
            const container = scrollContainerRef.current;
            const maxScroll = container.scrollHeight - container.clientHeight;
            const targetScroll = (savedPosition / 100) * maxScroll;
            
            // Restaurer la position avec un léger délai pour laisser le contenu se charger
            setTimeout(() => {
                container.scrollTop = targetScroll;
            }, 100);
        }
    }, [lesson, currentChapterId, chapterProgress]);

    // Calcul du scroll progress
    const updateScrollProgress = useCallback(() => {
        if (!scrollContainerRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const maxScroll = scrollHeight - clientHeight;
        
        if (maxScroll > 0) {
            const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
            setScrollProgress(progress);
            
            // Mise à jour du progress dans le state (debounced)
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
            }
            
            updateTimerRef.current = setTimeout(() => {
                const duration = Math.floor((Date.now() - startTime) / 1000);
                const isRead = progress >= 95; // Considéré comme lu si 95% scrollé
                
                dispatch({
                    type: 'UPDATE_LESSON_PROGRESS',
                    payload: {
                        chapterId: currentChapterId!,
                        scrollProgress: Math.round(progress),
                        isRead,
                        duration
                    }
                });
            }, 1000); // Update après 1s d'inactivité
        }
    }, [currentChapterId, dispatch, startTime]);

    // Listener de scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress(); // Initial calculation

        return () => {
            container.removeEventListener('scroll', updateScrollProgress);
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
            }
        };
    }, [updateScrollProgress]);

    // Sauvegarder la durée finale au démontage
    useEffect(() => {
        return () => {
            if (currentChapterId) {
                const duration = Math.floor((Date.now() - startTime) / 1000);
                dispatch({
                    type: 'UPDATE_LESSON_PROGRESS',
                    payload: {
                        chapterId: currentChapterId,
                        scrollProgress: Math.round(scrollProgress),
                        isRead: scrollProgress >= 95,
                        duration
                    }
                });
            }
        };
    }, [currentChapterId, dispatch, scrollProgress, startTime]);

    // Affichage du chargement
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined !text-6xl text-primary mb-4 animate-spin">refresh</span>
                    <p className="text-text-secondary text-lg">Chargement de la leçon...</p>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined !text-6xl text-error mb-4">error</span>
                    <p className="text-text-primary text-xl font-bold mb-2">Erreur de chargement</p>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                    >
                        Retour au chapitre
                    </button>
                </div>
            </div>
        );
    }

    if (!chapter || !lesson) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined !text-6xl text-text-disabled mb-4">menu_book</span>
                    <p className="text-text-secondary text-lg">Leçon non disponible</p>
                    <button
                        onClick={handleBack}
                        className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                    >
                        Retour au chapitre
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollContainerRef} className="lesson-shell">
            <div className="lesson-shell__body">
                <LessonProgressProvider
                    lessonId={`${chapter.class}-${chapter.chapter}`}
                    lesson={lesson}
                    scrollContainerRef={scrollContainerRef}
                >
                    <div className="lesson-experience">
                        <LessonNavigator />
                        <div className="lesson-experience__content">
                            <HighlightableContent className="lesson-experience__readable">
                                <LessonDisplay lesson={lesson} onBack={handleBack} />
                            </HighlightableContent>
                        </div>
                    </div>
                </LessonProgressProvider>
            </div>

            {/* Badge de complétion discret */}
            {scrollProgress >= 95 && (
                <div className="fixed bottom-6 right-6 animate-slideInUp">
                    <div className="bg-success/20 border-2 border-success rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <span className="material-symbols-outlined !text-xl text-success">check_circle</span>
                        <span className="font-semibold text-success text-sm">Terminé</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonView;
