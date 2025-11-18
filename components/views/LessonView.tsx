import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { LessonDisplay } from '../lesson/LessonDisplay';
import { HighlightableContent } from '../lesson/HighlightableContent';
import { LessonNavigator } from '../lesson/LessonNavigator';
import { LessonProgressProvider } from '../../context/LessonProgressContext';
import { LESSON_PROGRESS_REFRESH_EVENT } from '../../utils/lessonProgressHelpers';
import { storageService } from '../../services/StorageService';
import { validateLesson, formatValidationResults, ValidationResult } from '../../utils/jsonValidator';
import ValidationErrorDisplay from '../ValidationErrorDisplay';
import type { LessonContent } from '../../types';
import StageBreadcrumb, { StageBreadcrumbStage } from '../StageBreadcrumb';
import { LessonProvider } from '../../utils/lessonContentParser';
import { blankRevealService } from '../../services/blankRevealService';

const LessonView: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;

    const [startTime] = useState(Date.now());
    const [scrollProgress, setScrollProgress] = useState(0);
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [revealedBlanks, setRevealedBlanks] = useState<Set<string>>(() => new Set());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

    const chapter = currentChapterId ? activities[currentChapterId] : null;
    const chapterProgress = currentChapterId ? progress[currentChapterId] : null;
    const lessonStorageId = chapter ? `${chapter.class}-${chapter.chapter}` : undefined;

    const blankPersistence = useMemo(() => {
        if (!lessonStorageId) {
            return undefined;
        }

        return {
            isBlankRevealed: (blankId: string) => revealedBlanks.has(blankId),
            setBlankReveal: (blankId: string, revealed: boolean) => {
                setRevealedBlanks((prev) => {
                    if (revealed && prev.has(blankId)) {
                        return prev;
                    }
                    if (!revealed && !prev.has(blankId)) {
                        return prev;
                    }
                    const next = new Set(prev);
                    if (revealed) {
                        next.add(blankId);
                    } else {
                        next.delete(blankId);
                    }
                    return next;
                });

                blankRevealService.setBlankReveal(lessonStorageId, blankId, revealed);
            },
        };
    }, [lessonStorageId, revealedBlanks]);

    // 🔥 SOLUTION RADICALE: Quand on quitte la vue Lesson, dispatcher un événement global
    useEffect(() => {
        return () => {
            console.log('🔥 LessonView unmounting - broadcasting global refresh');
            window.dispatchEvent(new CustomEvent(LESSON_PROGRESS_REFRESH_EVENT, { 
                detail: { lessonId: 'GLOBAL_REFRESH_ON_LESSON_EXIT' } 
            }));
        };
    }, []);

    const handleBack = useCallback(() => {
        // Utiliser la navigation native du navigateur au lieu de dispatch(CHANGE_VIEW)
        // pour éviter de pousser deux états dans l'historique
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    }, []);

    const handleNavigateHome = useCallback(() => {
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });
    }, [dispatch]);

    const handleNavigateSteps = useCallback(() => {
        if (!chapter) return;
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'work-plan', chapterId: chapter.id } });
    }, [dispatch, chapter]);

    const handleStageSelect = useCallback((stage: StageBreadcrumbStage) => {
        if (!chapter) return;
        dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: stage } });
    }, [dispatch, chapter]);

    useEffect(() => {
        if (!lessonStorageId) {
            setRevealedBlanks(new Set());
            return;
        }

        const stored = blankRevealService.getRevealedBlankIds(lessonStorageId);
        setRevealedBlanks(new Set(stored));
    }, [lessonStorageId]);

    // Charger la leçon (inline ou depuis fichier) avec cache intelligent
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
                    // Valider la structure de la leçon
                    const result = validateLesson(chapter.lesson, `inline lesson for ${chapter.id}`);

                    if (!result.valid) {
                        const errorMessage = `Erreur dans la structure de la leçon:\n\n${formatValidationResults(result)}`;
                        console.error(errorMessage);
                        setError(errorMessage);
                        setValidationResult(result);
                        setIsLoading(false);
                        return;
                    }

                    // Afficher les avertissements s'il y en a
                    if (result.warnings.length > 0) {
                        console.warn('Avertissements de validation:', result.warnings);
                    }

                    setLesson(chapter.lesson);
                    setIsLoading(false);
                    return;
                }

                // Sinon, charger depuis le fichier lessonFile avec cache
                if (chapter.lessonFile) {
                    const chapterId = chapter.id;
                    const chapterVersion = chapter.version || '1.0.0';
                    let servedFromCache = false;

                    // 🚀 OPTIMISATION: Vérifier le cache d'abord
                    const cachedLesson = storageService.getCachedLesson(chapterId, chapterVersion);
                    if (cachedLesson) {
                        console.log(`✅ Leçon "${chapter.chapter}" chargée depuis le cache (v${chapterVersion})`);
                        const lesson = cachedLesson.lesson || cachedLesson;
                        setLesson(lesson);
                        setIsLoading(false);
                        servedFromCache = true;
                    }

                    // Fetch depuis le serveur (toujours exécuté pour revalider les données)
                    const logPrefix = servedFromCache ? '♻️ Rafraîchissement' : '🌐 Chargement';
                    console.log(`${logPrefix} leçon "${chapter.chapter}" depuis le serveur (v${chapterVersion})`);

                    try {
                        // ⚡ IMPORTANT: Ajouter cacheBuster pour forcer rechargement
                        const cacheBuster = `?t=${Date.now()}`;
                        const lessonPath = `/chapters/${chapter.class}/${chapter.lessonFile}${cacheBuster}`;
                        const response = await fetch(lessonPath);

                        if (!response.ok) {
                            throw new Error(`Impossible de charger la leçon depuis ${lessonPath}`);
                        }

                        const jsonText = await response.text();
                        const lessonData = JSON.parse(jsonText);

                        // ✅ Valider la structure de la leçon AVANT de l'utiliser
                        const result = validateLesson(lessonData, lessonPath, jsonText);

                        if (!result.valid) {
                            const errorMessage = `Erreur dans la structure du fichier ${lessonPath}:\n\n${formatValidationResults(result)}`;
                            console.error(errorMessage);
                            setError(errorMessage);
                            setValidationResult(result);
                            setIsLoading(false);
                            return;
                        }

                        // Afficher les avertissements s'il y en a
                        if (result.warnings.length > 0) {
                            console.warn(`⚠️ Avertissements pour ${lessonPath}:`, result.warnings);
                        }

                        // 💾 Mettre en cache pour les prochaines fois (seulement si valide)
                        storageService.cacheLessonContent(chapterId, lessonData, chapterVersion);
                        console.log(`💾 Leçon "${chapter.chapter}" mise à jour dans le cache (v${chapterVersion})`);

                        // Extraire la propriété 'lesson' du JSON si elle existe
                        const lesson = lessonData.lesson || lessonData;
                        setLesson(lesson);
                        setIsLoading(false);
                        return;
                    } catch (networkError) {
                        if (servedFromCache) {
                            console.warn('♻️ Impossible de rafraîchir la leçon, utilisation du cache existant.', networkError);
                            return;
                        }

                        throw networkError;
                    }
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
                    <span className="material-symbols-outlined !text-6xl text-primary mb-4">refresh</span>
                    <p className="text-text-secondary text-lg">Chargement de la leçon...</p>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        // Si on a un résultat de validation détaillé, utiliser l'affichage structuré
        if (validationResult && !validationResult.valid) {
            return (
                <ValidationErrorDisplay
                    errors={validationResult.errors}
                    warnings={validationResult.warnings}
                    filePath={chapter?.lessonFile || chapter?.id}
                />
            );
        }

        // Sinon, affichage d'erreur simple
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined !text-6xl text-error mb-4">error</span>
                    <p className="text-text-primary text-xl font-bold mb-2">Erreur de chargement</p>
                    <p className="text-text-secondary mb-6 whitespace-pre-wrap">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="font-button px-6 py-2 font-semibold text-text bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        ← Retour
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
                    {/* Bouton 'Retour au chapitre' supprimé */}
                </div>
            </div>
        );
    }

    const lessonBreadcrumbDisabledStagesSet = new Set<StageBreadcrumbStage>();
    const lessonHasVideos = (chapter.videos?.length ?? 0) > 0;
    const lessonProgressMeta = chapterProgress?.lesson;
    const isLessonComplete = !!(lessonProgressMeta?.isRead || (lessonProgressMeta?.scrollProgress ?? 0) >= 95);
    const isQuizCompleted = !!chapterProgress?.quiz?.isSubmitted;

    if (!lessonHasVideos) {
        lessonBreadcrumbDisabledStagesSet.add('videos');
    }

    if (!isLessonComplete) {
        lessonBreadcrumbDisabledStagesSet.add('quiz');
        lessonBreadcrumbDisabledStagesSet.add('exercises');
    } else if (!isQuizCompleted) {
        lessonBreadcrumbDisabledStagesSet.add('exercises');
    }

    const lessonBreadcrumbDisabledStages = Array.from(lessonBreadcrumbDisabledStagesSet);

    return (
        <div ref={scrollContainerRef} className="lesson-shell">
            <div className="lesson-shell__body pl-16 sm:pl-20">
                <LessonProgressProvider
                    lessonId={`${chapter.class}-${chapter.chapter}`}
                    lesson={lesson}
                    scrollContainerRef={scrollContainerRef}
                >
                    <LessonProvider
                        showAnswers={false}
                        lessonId={lessonStorageId}
                        blankPersistence={blankPersistence}
                    >
                        <div className="lesson-experience">
                            <LessonNavigator />
                            <div className="lesson-experience__content">
                                <StageBreadcrumb
                                    className="lesson-stage-breadcrumb lesson-stage-breadcrumb--content"
                                    currentStage="lesson"
                                    onNavigateHome={handleNavigateHome}
                                    onNavigateSteps={handleNavigateSteps}
                                    onSelectStage={handleStageSelect}
                                    disabledStages={lessonBreadcrumbDisabledStages}
                                />
                                <HighlightableContent
                                    className="lesson-experience__readable"
                                    storageKey={lessonStorageId}
                                >
                                    <LessonDisplay lesson={lesson} onBack={handleBack} />
                                </HighlightableContent>
                            </div>
                        </div>
                    </LessonProvider>
                </LessonProgressProvider>
            </div>

            {/* Badge de complétion discret */}
            {scrollProgress >= 95 && (
                <div className="fixed bottom-6 right-6">
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
