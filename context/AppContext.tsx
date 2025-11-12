import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useContext, useRef, useCallback } from 'react';
import { AppState, Action, Chapter, Profile, QuizProgress, ChapterProgress, Feedback, UINotification } from '../types';
import { DB_KEY } from '../constants';
import { useNotification } from './NotificationContext';
import { isChapterCompleted, determineInitialStatus } from '../utils/chapterStatusHelpers';
import { pushNavigationState, replaceNavigationState, getCurrentNavigationState, parseURL } from '../utils/browserNavigation';
import { storageService, STORAGE_KEYS } from '../services/StorageService';

const initialState: AppState = {
    view: 'login',
    profile: null,
    activities: {},
    activityVersions: {},
    progress: {},
    currentChapterId: null,
    currentActiveChapterId: null,
    activitySubView: null,
    isReviewMode: false,
    chapterOrder: [],
    concoursProgress: {},
    currentConcoursType: null,
    currentConcoursId: null,
    concoursNavigationMode: null,
    currentConcoursYear: null,
    currentConcoursTheme: null,
};

const appReducer = (state: AppState, action: Action): AppState => {
    const findFirstUnansweredIndex = (chapter: Chapter, answers: { [qId: string]: any }): number => {
        if (!chapter?.quiz) return 0;
        for (let i = 0; i < chapter.quiz.length; i++) {
            const qId = chapter.quiz[i].id;
            if (!answers.hasOwnProperty(qId)) {
                return i;
            }
        }
        return 0;
    };

    switch (action.type) {
        case 'INIT': {
            const {
                profile,
                progress = {},
                view,
                currentChapterId,
                currentActiveChapterId,
                activitySubView,
                chapterOrder,
                activityVersions,
                concoursProgress,
                currentConcoursType,
                currentConcoursId,
                concoursNavigationMode,
                currentConcoursYear,
                currentConcoursTheme
            } = action.payload;
            const restoredView = profile && profile.classId ? (view || 'dashboard') : 'login';

            return {
                ...state,
                profile: profile || null,
                progress,
                chapterOrder: chapterOrder || [],
                activityVersions: activityVersions || {},
                view: restoredView,
                currentChapterId: currentChapterId || null,
                currentActiveChapterId: currentActiveChapterId || null,
                activitySubView: activitySubView || null,
                concoursProgress: concoursProgress || {},
                currentConcoursType: currentConcoursType || null,
                currentConcoursId: currentConcoursId || null,
                concoursNavigationMode: concoursNavigationMode || null,
                currentConcoursYear: currentConcoursYear || null,
                currentConcoursTheme: currentConcoursTheme || null,
            };
        }
        
        case 'CHANGE_VIEW': {
            const {
                view,
                chapterId,
                subView,
                review,
                fromHistory,
                concoursType,
                concoursId,
                concoursYear,
                concoursTheme,
                concoursMode
            } = action.payload;

            // Mettre à jour les champs concours depuis payload ou garder les valeurs actuelles
            let finalConcoursType = concoursType !== undefined ? concoursType : state.currentConcoursType;
            let finalConcoursId = concoursId !== undefined ? concoursId : state.currentConcoursId;
            let finalConcoursYear = concoursYear !== undefined ? concoursYear : state.currentConcoursYear;
            let finalConcoursTheme = concoursTheme !== undefined ? concoursTheme : state.currentConcoursTheme;
            let finalConcoursMode = concoursMode !== undefined ? concoursMode : state.concoursNavigationMode;

            // Si on navigue vers une vue concours, lire depuis sessionStorage si non fournis
            if (typeof window !== 'undefined') {
                if (view === 'concours-list' && !finalConcoursType) {
                    finalConcoursType = sessionStorage.getItem('currentConcoursType');
                }
                if ((view === 'concours-resume' || view === 'concours-quiz') && !finalConcoursId) {
                    finalConcoursId = sessionStorage.getItem('currentConcoursFile');
                }
                if (view === 'concours-year' && !finalConcoursYear) {
                    finalConcoursYear = sessionStorage.getItem('currentConcoursYear');
                }
            }

            let newState: AppState = {
                ...state,
                view,
                currentChapterId: chapterId !== undefined ? chapterId : state.currentChapterId,
                activitySubView: subView !== undefined ? subView : state.activitySubView,
                isReviewMode: review ?? false,
                currentConcoursType: finalConcoursType,
                currentConcoursId: finalConcoursId,
                currentConcoursYear: finalConcoursYear,
                currentConcoursTheme: finalConcoursTheme,
                concoursNavigationMode: finalConcoursMode,
            };

            const targetChapterId = chapterId !== undefined ? chapterId : state.currentChapterId;

            if (view === 'activity' && subView === 'quiz' && review && targetChapterId && newState.progress[targetChapterId]) {
                const progress = newState.progress[targetChapterId];
                newState.progress = {
                    ...newState.progress,
                    [targetChapterId]: {
                        ...progress,
                        quiz: { ...progress.quiz, currentQuestionIndex: 0 }
                    }
                };
            }

            // Synchroniser avec l'historique du navigateur (sauf si le changement vient déjà de l'historique)
            if (!fromHistory && typeof window !== 'undefined') {
                const navState = {
                    view,
                    chapterId: newState.currentChapterId,
                    subView: newState.activitySubView,
                    review: newState.isReviewMode,
                    concoursType: newState.currentConcoursType,
                    concoursId: newState.currentConcoursId,
                    concoursYear: newState.currentConcoursYear,
                    concoursTheme: newState.currentConcoursTheme,
                    concoursMode: newState.concoursNavigationMode
                };
                pushNavigationState(navState);
            }

            return newState;
        }
        
        case 'LOGIN': {
            // Ne pas changer la vue ici, LoginView le fera selon la classe sélectionnée
            return { ...state, profile: action.payload };
        }
        
        case 'NAVIGATE_QUIZ': {
            if (!state.currentChapterId) return state;
            const progress = state.progress[state.currentChapterId];
            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        quiz: { ...progress.quiz, currentQuestionIndex: action.payload },
                    },
                },
            };
        }
        
        case 'UPDATE_QUIZ_ANSWER': {
            if (!state.currentChapterId) return state;
            const progress = state.progress[state.currentChapterId];
            const newAnswers = { ...progress.quiz.answers, [action.payload.qId]: action.payload.answer };
            const allAnswered = Object.keys(newAnswers).length === state.activities[state.currentChapterId].quiz.length;
            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        quiz: { ...progress.quiz, answers: newAnswers, allAnswered }
                    },
                },
            };
        }
        
        case 'SET_QUIZ_DURATION': {
            const { chapterId, duration } = action.payload;
            const chapterProgress = state.progress[chapterId];
            if (!chapterProgress) return state;

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [chapterId]: {
                        ...chapterProgress,
                        quiz: {
                            ...chapterProgress.quiz,
                            duration,
                        },
                    },
                },
            };
        }

        case 'MARK_VIDEO_WATCHED': {
            if (!state.currentChapterId) return state;
            const { videoId } = action.payload;
            const chapter = state.activities[state.currentChapterId];
            const progress = state.progress[state.currentChapterId];

            if (!chapter?.videos) return state;

            // Initialiser videosProgress si nécessaire
            const videosProgress = progress.videos || {
                watched: {},
                allWatched: false,
                duration: 0,
            };

            // Marquer la vidéo comme regardée
            const newWatched = { ...videosProgress.watched, [videoId]: true };

            // Vérifier si toutes les vidéos sont regardées
            const totalVideos = chapter.videos.length;
            const watchedCount = Object.values(newWatched).filter(Boolean).length;
            const allWatched = watchedCount === totalVideos;

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        videos: {
                            ...videosProgress,
                            watched: newWatched,
                            allWatched,
                        },
                    },
                },
            };
        }

        case 'SET_VIDEOS_DURATION': {
            if (!state.currentChapterId) return state;
            const { duration } = action.payload;
            const progress = state.progress[state.currentChapterId];

            // Initialiser videosProgress si nécessaire
            const videosProgress = progress.videos || {
                watched: {},
                allWatched: false,
                duration: 0,
            };

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        videos: {
                            ...videosProgress,
                            duration,
                        },
                    },
                },
            };
        }

        case 'UPDATE_LESSON_PROGRESS': {
            if (!state.currentChapterId) return state;
            const {
                chapterId,
                scrollProgress,
                isRead,
                duration,
                completedParagraphs,
                totalParagraphs,
                completedSections,
                totalSections,
                checklistPercentage,
            } = action.payload;
            
            const targetChapterId = chapterId || state.currentChapterId;
            const progress = state.progress[targetChapterId];
            
            console.log('🎯 AppReducer UPDATE_LESSON_PROGRESS:', {
                currentChapterId: state.currentChapterId,
                targetChapterId,
                payload: action.payload,
                hasProgress: !!progress
            });

            // Initialiser lessonProgress si nécessaire
            const lessonProgress = progress?.lesson || {
                isRead: false,
                duration: 0,
                scrollProgress: 0,
                completedParagraphs: 0,
                totalParagraphs: 0,
                completedSections: 0,
                totalSections: 0,
                checklistPercentage: 0,
            };

            const nextLessonProgress = {
                ...lessonProgress,
                scrollProgress: scrollProgress !== undefined ? scrollProgress : lessonProgress.scrollProgress,
                isRead: isRead !== undefined ? isRead : lessonProgress.isRead,
                duration: duration !== undefined ? duration : lessonProgress.duration,
                completedParagraphs: completedParagraphs !== undefined ? completedParagraphs : lessonProgress.completedParagraphs,
                totalParagraphs: totalParagraphs !== undefined ? totalParagraphs : lessonProgress.totalParagraphs,
                completedSections: completedSections !== undefined ? completedSections : lessonProgress.completedSections,
                totalSections: totalSections !== undefined ? totalSections : lessonProgress.totalSections,
                checklistPercentage: checklistPercentage !== undefined ? checklistPercentage : lessonProgress.checklistPercentage,
            };

            const result = {
                ...state,
                progress: {
                    ...state.progress,
                    [targetChapterId]: {
                        ...progress,
                        lesson: nextLessonProgress,
                    },
                },
            };
            
            console.log('✅ AppReducer - Résultat UPDATE_LESSON_PROGRESS:', {
                targetChapterId,
                nextLessonProgress,
                updatedProgress: result.progress[targetChapterId]
            });
            
            return result;
        }

        case 'SUBMIT_QUIZ': {
            if (!state.currentChapterId) return state;
            const progress = state.progress[state.currentChapterId];
            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        quiz: { 
                            ...progress.quiz, 
                            isSubmitted: true, 
                            score: action.payload.score, 
                            duration: action.payload.duration,
                            hintsUsed: action.payload.hintsUsed,
                            currentQuestionIndex: 0 
                        }
                    },
                },
            };
        }
        
        case 'TOGGLE_REVIEW_MODE': {
            if (!state.currentChapterId) return state;
            const progress = state.progress[state.currentChapterId];
            return {
                ...state,
                isReviewMode: action.payload,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        quiz: { ...progress.quiz, currentQuestionIndex: 0 },
                    },
                },
            };
        }
        
        case 'UPDATE_EXERCISE_FEEDBACK': {
            if (!state.currentChapterId) return state;
            const { exId, feedback } = action.payload;
            const progress = state.progress[state.currentChapterId];
            const newFeedback = { ...progress.exercisesFeedback, [exId]: feedback };
            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: { ...progress, exercisesFeedback: newFeedback }
                },
            };
        }
        
        case 'UPDATE_EXERCISES_DURATION': {
            if (!state.currentChapterId) return state;
            const progress = state.progress[state.currentChapterId];
            const newDuration = (progress.exercisesDuration || 0) + action.payload.duration;
            return {
                ...state,
                progress: {
                    ...state.progress,
                    [state.currentChapterId]: {
                        ...progress,
                        exercisesDuration: newDuration
                    }
                },
            };
        }
        
        case 'SUBMIT_WORK': {
            const { chapterId } = action.payload;
            if (!chapterId || !state.progress[chapterId] || !state.activities[chapterId]) return state;
            const progress = state.progress[chapterId];
            const chapter = state.activities[chapterId];

            // Vérifier si le chapitre est complété à 100%
            const isCompleted = isChapterCompleted(chapter, progress);

            // Déterminer le nouveau statut
            const newStatus = isCompleted ? 'acheve' : (progress.status || 'en-cours');

            // Si le chapitre est achevé et qu'il était le chapitre actif, retirer le statut actif
            const newCurrentActiveChapterId = isCompleted && state.currentActiveChapterId === chapterId
                ? null
                : state.currentActiveChapterId;

            return {
                ...state,
                currentActiveChapterId: newCurrentActiveChapterId,
                progress: {
                    ...state.progress,
                    [chapterId]: {
                        ...progress,
                        isWorkSubmitted: true,
                        submittedVersion: chapter.version,
                        hasUpdate: false,
                        status: newStatus,
                    }
                },
            };
        }

        case 'MARK_UPDATE_SEEN': {
            const { chapterId } = action.payload;
            if (!chapterId || !state.progress[chapterId]) return state;

            // Clear the update flag in progress
            const chapterProgress = state.progress[chapterId];
            const newProgress = {
                ...state.progress,
                [chapterId]: { ...chapterProgress, hasUpdate: false }
            };

            // Also remove stored UI notifications related to this chapter (updates/resubmit/quiz-reset)
            try {
                const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';
                const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as any[];
                    const filtered = parsed.filter(n => {
                        const id: string = n.id || '';
                        // keep notifications that are NOT related to this chapter update
                        if (id.startsWith(`update-${chapterId}`) || id.startsWith(`resubmit-${chapterId}`) || id.startsWith(`quiz-reset-${chapterId}`)) {
                            return false;
                        }
                        return true;
                    });
                    localStorage.setItem(UI_NOTIFICATIONS_KEY, JSON.stringify(filtered));
                    // notify listeners
                    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('notificationsUpdated'));
                }
            } catch (e) {
                console.error('Failed to remove update notifications from storage', e);
            }

            return { ...state, progress: newProgress };
        }
        
        case 'SYNC_ACTIVITIES': {
            const newActivityVersions = Object.values(action.payload.activities).reduce((acc, chapter) => {
                if (chapter.version) {
                    acc[chapter.id] = chapter.version;
                }
                return acc;
            }, {} as { [id: string]: string });

            const generatedNotifications: UINotification[] = [];
            const newProgress = { ...state.progress };

            Object.values(action.payload.activities).forEach(newChapter => {
                // Assurer l'existence d'un objet progress pour chaque chapitre
                if (!newProgress[newChapter.id]) {
                    // Nouveau chapitre - initialiser avec statut "à venir"
                    newProgress[newChapter.id] = {
                        // Initialiser videosProgress si le chapitre contient des vidéos
                        ...(newChapter.videos && newChapter.videos.length > 0 && {
                            videos: {
                                watched: {},
                                allWatched: false,
                                duration: 0,
                            }
                        }),
                        quiz: {
                            answers: {},
                            isSubmitted: false,
                            score: 0,
                            allAnswered: false,
                            currentQuestionIndex: 0,
                            duration: 0,
                            hintsUsed: 0
                        },
                        exercisesFeedback: {},
                        isWorkSubmitted: false,
                        exercisesDuration: 0,
                        status: 'a-venir',
                    };
                } else {
                    // Chapitre existant - ajouter videosProgress si nécessaire
                    if (newChapter.videos && newChapter.videos.length > 0 && !newProgress[newChapter.id].videos) {
                        newProgress[newChapter.id].videos = {
                            watched: {},
                            allWatched: false,
                            duration: 0,
                        };
                    }

                    // Ajouter le statut s'il n'existe pas encore
                    if (!newProgress[newChapter.id].status) {
                        const isCurrentActive = state.currentActiveChapterId === newChapter.id;
                        newProgress[newChapter.id].status = determineInitialStatus(
                            newChapter,
                            newProgress[newChapter.id],
                            isCurrentActive
                        );
                    }
                }

                const currentProgress = newProgress[newChapter.id];
                const oldVersion = state.activityVersions[newChapter.id];

                // CAS 1: NOUVEAU CHAPITRE (jamais vu ET jamais commencé)
                if (newChapter.isActive && !oldVersion) {
                    // CORRECTION CRITIQUE: Vérifier que l'utilisateur n'a PAS commencé
                    const hasAnsweredQuiz = Object.keys(currentProgress.quiz.answers).length > 0;
                    const hasEvaluatedExercises = Object.keys(currentProgress.exercisesFeedback).length > 0;
                    const hasSubmittedWork = currentProgress.isWorkSubmitted;
                    
                    const hasNeverStarted = !hasAnsweredQuiz && !hasEvaluatedExercises && !hasSubmittedWork;
                    
                    if (hasNeverStarted) {
                        generatedNotifications.push({
                            id: `new-${newChapter.id}`,
                            title: 'Nouveau Chapitre Disponible',
                            message: `Le chapitre "<b>${newChapter.chapter}</b>" est maintenant accessible.`,
                            timestamp: Date.now()
                        });
                    }
                }

                // CAS 2: CHAPITRE MIS À JOUR (version changée)
                else if (newChapter.isActive && oldVersion && newChapter.version && oldVersion !== newChapter.version) {
                    
                    // Notification de mise à jour du contenu
                    generatedNotifications.push({
                        id: `update-${newChapter.id}-${newChapter.version}`,
                        title: 'Contenu mis à jour',
                        message: `Le chapitre "<b>${newChapter.chapter}</b>" a été amélioré avec du nouveau contenu.`,
                        timestamp: Date.now()
                    });
                    
                    currentProgress.hasUpdate = true;

                    // 2a. Valider et nettoyer les réponses obsolètes
                    const newQuizIds = new Set(newChapter.quiz.map(q => q.id));
                    const newExerciseIds = new Set(newChapter.exercises.map(ex => ex.id));

                    // Garder seulement les réponses valides
                    const validatedAnswers = Object.entries(currentProgress.quiz.answers)
                        .filter(([qId]) => newQuizIds.has(qId))
                        .reduce((acc, [qId, answer]) => ({ 
                            ...acc, 
                            [qId]: answer as string | string[] 
                        }), {});
                    
                    currentProgress.quiz.answers = validatedAnswers;

                    // Garder seulement les feedbacks valides
                    const validatedFeedback = Object.entries(currentProgress.exercisesFeedback)
                        .filter(([exId]) => newExerciseIds.has(exId))
                        .reduce((acc, [exId, feedback]) => ({ 
                            ...acc, 
                            [exId]: feedback as Feedback
                        }), {});
                    
                    currentProgress.exercisesFeedback = validatedFeedback;
                    
                    // 2b. Recalculer le statut du quiz
                    const totalNewQuestions = newChapter.quiz.length;
                    const answeredCount = Object.keys(validatedAnswers).length;
                    const isNowFullyAnswered = totalNewQuestions > 0 
                        ? answeredCount === totalNewQuestions 
                        : true;
                    
                    currentProgress.quiz.allAnswered = isNowFullyAnswered;

                    // 2c. Réinitialiser le quiz SI soumis mais incomplet
                    if (currentProgress.quiz.isSubmitted && !isNowFullyAnswered) {
                        const addedQuestionsCount = totalNewQuestions - answeredCount;
                        
                        currentProgress.quiz.isSubmitted = false;
                        currentProgress.quiz.currentQuestionIndex = findFirstUnansweredIndex(newChapter, validatedAnswers);
                        
                        generatedNotifications.push({
                            id: `quiz-reset-${newChapter.id}-${newChapter.version}`,
                            title: 'Quiz à compléter',
                            message: `<b>${addedQuestionsCount} nouvelle${addedQuestionsCount > 1 ? 's' : ''} question${addedQuestionsCount > 1 ? 's' : ''}</b> ${addedQuestionsCount > 1 ? 'ont été ajoutées' : 'a été ajoutée'} au quiz "<b>${newChapter.chapter}</b>".`,
                            timestamp: Date.now() + 500
                        });
                    }

                    // 2d. Réinitialiser la soumission SI travail déjà finalisé
                    if (currentProgress.isWorkSubmitted) {
                        currentProgress.isWorkSubmitted = false;
                        
                        generatedNotifications.push({
                            id: `resubmit-${newChapter.id}-${newChapter.version}`,
                            title: 'Nouvelle soumission requise',
                            message: `Le contenu du chapitre "<b>${newChapter.chapter}</b>" a changé. Veuillez finaliser à nouveau votre travail après révision.`,
                            timestamp: Date.now() + 1000 
                        });
                    }
                }
            });

            // PERSISTANCE DES NOTIFICATIONS
            const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';
            
            if (generatedNotifications.length > 0) {
                try {
                    const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
                    const existing = stored ? JSON.parse(stored) : [];
                    
                    // Créer un Set des IDs existants pour dédupliquer
                    const existingIds = new Set(existing.map((n: UINotification) => n.id));
                    
                    // Ajouter seulement les nouvelles notifications
                    const uniqueNew = generatedNotifications.filter(n => !existingIds.has(n.id));
                    
                    if (uniqueNew.length > 0) {
                        const updated = [...existing, ...uniqueNew];
                        localStorage.setItem(UI_NOTIFICATIONS_KEY, JSON.stringify(updated));
                        
                        // Invalider le cache pour forcer rechargement
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
                        }
                    }
                } catch (e) {
                    console.error("Failed to update UI notifications", e);
                }
            }

            // Vérifier si le chapitre actuel existe encore dans les nouvelles activités
            let updatedState = { ...state };
            if (state.currentChapterId && !action.payload.activities[state.currentChapterId]) {
                console.log(`Chapitre actuel '${state.currentChapterId}' n'existe pas dans les activités. Redirection vers dashboard.`);
                updatedState = {
                    ...state,
                    currentChapterId: null,
                    view: 'dashboard'
                };
            }

            return {
                ...updatedState,
                activities: action.payload.activities,
                progress: newProgress,
                chapterOrder: action.payload.chapterOrder,
                activityVersions: newActivityVersions,
            };
        }
        
        case 'SET_CHAPTER_STATUS': {
            const { chapterId, status } = action.payload;
            if (!chapterId || !state.progress[chapterId]) return state;

            return {
                ...state,
                progress: {
                    ...state.progress,
                    [chapterId]: {
                        ...state.progress[chapterId],
                        status,
                    }
                },
            };
        }

        case 'START_CHAPTER': {
            const { chapterId } = action.payload;
            if (!chapterId || !state.progress[chapterId]) return state;

            // Mettre l'ancien chapitre actif en "à venir" s'il existe
            const updatedProgress = { ...state.progress };
            if (state.currentActiveChapterId && state.currentActiveChapterId !== chapterId) {
                const oldActiveProgress = updatedProgress[state.currentActiveChapterId];
                if (oldActiveProgress && oldActiveProgress.status === 'en-cours') {
                    updatedProgress[state.currentActiveChapterId] = {
                        ...oldActiveProgress,
                        status: 'a-venir',
                    };
                }
            }

            // Mettre le nouveau chapitre en "en-cours"
            updatedProgress[chapterId] = {
                ...updatedProgress[chapterId],
                status: 'en-cours',
            };

            return {
                ...state,
                currentActiveChapterId: chapterId,
                progress: updatedProgress,
            };
        }

        default:
            return state;
    }
};

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);
const AppSyncContext = createContext<(() => Promise<void>) | undefined>(undefined);

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    return context;
};

export const useAppDispatch = () => {
    const context = useContext(AppDispatchContext);
    if (context === undefined) {
        throw new Error('useAppDispatch must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { addNotification } = useNotification();
    const fetchedClassRef = useRef<string | null>(null);

    // Effect 1: Load initial state from localStorage. Runs only once.
    useEffect(() => {
        // 🔧 NOUVEAU: Exécuter migration et nettoyage au démarrage
        console.log('[AppContext] Initialisation du StorageService...');
        storageService.migrate();
        const cleaned = storageService.cleanup();
        console.log(`[AppContext] ${cleaned} entrées nettoyées`);

        let savedData: Partial<AppState> = {};
        try {
            // Essayer d'abord la nouvelle clé
            const newData = storageService.get(STORAGE_KEYS.APP_STATE);
            if (newData) {
                savedData = newData;
                console.log('[AppContext] Données chargées depuis nouvelle clé');
            } else {
                // Fallback vers l'ancienne clé si la nouvelle n'existe pas
                const rawData = localStorage.getItem(DB_KEY);
                if (rawData) {
                    const parsedData = JSON.parse(rawData);
                    if (typeof parsedData === 'object' && parsedData !== null) {
                        savedData = parsedData;
                        console.log('[AppContext] Données chargées depuis ancienne clé');
                    }
                }
            }
        } catch (error) {
            console.error("[AppContext] Échec chargement localStorage, réinitialisation.", error);
            localStorage.removeItem(DB_KEY);
            storageService.remove(STORAGE_KEYS.APP_STATE);
        }
        dispatch({ type: 'INIT', payload: savedData });
    }, []);

    // Fonction de synchronisation des chapitres (utilisable manuellement ou automatiquement)
    const syncChaptersForClass = useCallback(async (classId: string, forceReload: boolean = false) => {
        console.log('AppContext - Syncing chapters for class:', classId);
            
            if (!forceReload && classId === fetchedClassRef.current) {
                console.log('AppContext - Class already fetched, skipping');
                return;
            }
            
            fetchedClassRef.current = classId;

            try {
                console.log('AppContext - Fetching manifest...');
                // Ajouter un timestamp pour forcer le rechargement et éviter le cache
                const cacheBuster = `?t=${Date.now()}`;
                const manifestRes = await fetch(`/manifest.json${cacheBuster}`);
                if (!manifestRes.ok) throw new Error("Manifest file not found");
                const manifest: { [id: string]: any[] } = await manifestRes.json();
                
                console.log('AppContext - Manifest loaded:', manifest);
                
                const chapterInfos = manifest[classId] || [];
                console.log('AppContext - Chapter infos for class:', chapterInfos);
                
                const allActivities: { [id: string]: Chapter } = {};
                const chapterOrderForClass = chapterInfos.map(info => info.id);

                if (chapterInfos.length > 0) {
                    console.log('AppContext - Loading chapter files...');
                    const chapterPromises = chapterInfos.map(info => 
                        // Ajouter un timestamp unique pour chaque fichier pour éviter le cache
                        fetch(`/chapters/${info.file}${cacheBuster}`)
                            .then(res => {
                                if (!res.ok) {
                                    console.error(`Failed to load ${info.file}:`, res.status, res.statusText);
                                    return Promise.reject(`Could not load ${info.file}: ${res.status}`);
                                }
                                return res.json();
                            })
                            .then(data => {
                                console.log(`Loaded chapter ${info.id}:`, data);
                                const normalizedData = { ...data };
                                if (!Array.isArray(normalizedData.sessionDates)) {
                                    normalizedData.sessionDates = typeof normalizedData.sessionDate === 'string' && normalizedData.sessionDate ? [normalizedData.sessionDate] : [];
                                }
                                if ('sessionDate' in normalizedData) {
                                    delete normalizedData.sessionDate;
                                }

                                // Transform snake_case to camelCase for quiz options
                                if (normalizedData.quiz && Array.isArray(normalizedData.quiz)) {
                                    normalizedData.quiz = normalizedData.quiz.map((q: any) => {
                                        if (q.options && Array.isArray(q.options)) {
                                            q.options = q.options.map((opt: any) => ({
                                                ...opt,
                                                isCorrect: opt.is_correct !== undefined ? opt.is_correct : opt.isCorrect,
                                            }));
                                        }
                                        return q;
                                    });
                                }

                                return { ...normalizedData, id: info.id, file: info.file, isActive: info.isActive, version: info.version };
                            })
                            .catch(err => { 
                                console.error(`Error loading chapter ${info.id}:`, err); 
                                return null; 
                            })
                    );
                    const loadedChapters = (await Promise.all(chapterPromises)).filter(Boolean) as Chapter[];
                    console.log('AppContext - Loaded chapters:', loadedChapters);
                    loadedChapters.forEach(ch => allActivities[ch.id] = ch);
                }
                
                console.log('AppContext - Dispatching SYNC_ACTIVITIES with:', {
                    activitiesCount: Object.keys(allActivities).length,
                    chapterOrder: chapterOrderForClass
                });
                
                dispatch({ 
                    type: 'SYNC_ACTIVITIES', 
                    payload: { 
                        activities: allActivities, 
                        progress: state.progress,
                        chapterOrder: chapterOrderForClass 
                    } 
                });

            } catch (error) {
                console.error("AppContext - Failed to load or sync chapter data:", error);
                addNotification("Chargement échoué", "error", { 
                    message: "Impossible de charger les chapitres. Veuillez vérifier votre connexion.",
                    action: {
                        label: 'Réessayer',
                        onClick: () => window.location.reload()
                    },
                    duration: 10000 
                });
            }
    }, [state.progress, addNotification]);

    // Effect 2: Fetch and sync chapter data when profile class changes.
    useEffect(() => {
        console.log('AppContext - Profile effect triggered. Profile:', state.profile);
        
        if (state.profile?.classId) {
            console.log('AppContext - Profile has classId, syncing chapters...');
            syncChaptersForClass(state.profile.classId, false);
        } else {
            console.log('AppContext - No profile or classId, clearing activities');
            if(Object.keys(state.activities).length > 0) {
                dispatch({ type: 'SYNC_ACTIVITIES', payload: { activities: {}, progress: state.progress, chapterOrder: [] } });
            }
            fetchedClassRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.profile, syncChaptersForClass]);

    // Effect 3: Persist state to localStorage immediately on any state change.
    useEffect(() => {
        if (state.profile) {
            const { activities, ...stateToSave } = state; 
            try {
                localStorage.setItem(DB_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save state to localStorage:", error);
                addNotification("Sauvegarde échouée", "error", {
                    message: "Impossible de sauvegarder votre progression.",
                    action: {
                        label: 'Réessayer',
                        onClick: () => window.location.reload()
                    },
                    duration: 10000 
                });
            }
        }
    }, [state, addNotification]);

    // Fonction de synchronisation manuelle exposée
    const syncManually = useCallback(async () => {
        if (state.profile?.classId) {
            console.log('Manual sync triggered for class:', state.profile.classId);
            await syncChaptersForClass(state.profile.classId, true); // forceReload = true
            addNotification("Synchronisation réussie", "success", {
                message: "Les données ont été rechargées depuis le serveur.",
                duration: 3000
            });
        }
    }, [state.profile, syncChaptersForClass, addNotification]);

    // Effect 4: Check for pending submissions on app load and notify user
    useEffect(() => {
        const checkPendingSubmissions = () => {
            try {
                const pendingKeys: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('pending_submission_')) {
                        pendingKeys.push(key);
                    }
                }

                if (pendingKeys.length > 0) {
                    console.log(`Found ${pendingKeys.length} pending submission(s):`, pendingKeys);

                    const message = pendingKeys.length === 1
                        ? "Vous avez 1 rapport non envoyé. Cliquez pour réessayer."
                        : `Vous avez ${pendingKeys.length} rapports non envoyés. Cliquez pour réessayer.`;

                    addNotification("Rapports en attente", "warning", {
                        message,
                        duration: 10000,
                        action: {
                            label: 'Voir détails',
                            onClick: () => {
                                const details = pendingKeys.map(key => {
                                    try {
                                        const data = JSON.parse(localStorage.getItem(key) || '{}');
                                        return `- ${data.studentName || 'Inconnu'}: ${data.results?.[0]?.chapter || 'Chapitre inconnu'}`;
                                    } catch {
                                        return `- Rapport corrompu (${key})`;
                                    }
                                }).join('\n');

                                alert(`Rapports en attente d'envoi:\n\n${details}\n\nVeuillez soumettre à nouveau vos chapitres depuis le tableau de bord.`);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error checking pending submissions:', error);
            }
        };

        // Run only once when app initializes
        checkPendingSubmissions();
    }, [addNotification]);

    // Effect 5: Gérer les boutons retour/avancer du navigateur
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            console.log('PopState event triggered:', event.state);

            // Récupérer l'état de navigation depuis l'événement ou l'URL
            const navState = event.state || getCurrentNavigationState();

            if (navState && navState.view) {
                console.log('Navigating from history to:', navState);

                // Restaurer les données sessionStorage pour les concours si nécessaire
                if (navState.concoursType) {
                    sessionStorage.setItem('currentConcoursType', navState.concoursType);
                }
                if (navState.concoursId) {
                    sessionStorage.setItem('currentConcoursFile', navState.concoursId);
                }
                if (navState.concoursYear) {
                    sessionStorage.setItem('currentConcoursYear', navState.concoursYear);
                }
                if (navState.concoursTheme) {
                    sessionStorage.setItem('currentConcoursTheme', navState.concoursTheme);
                }

                // Dispatcher le changement de vue avec le flag fromHistory
                dispatch({
                    type: 'CHANGE_VIEW',
                    payload: {
                        view: navState.view,
                        chapterId: navState.chapterId || null,
                        subView: navState.subView || null,
                        review: navState.review || false,
                        concoursType: navState.concoursType || null,
                        concoursId: navState.concoursId || null,
                        concoursYear: navState.concoursYear || null,
                        concoursTheme: navState.concoursTheme || null,
                        concoursMode: navState.concoursMode || null,
                        fromHistory: true // Important: évite la boucle infinie
                    }
                });
            }
        };

        // Écouter les événements popstate (retour/avancer du navigateur)
        window.addEventListener('popstate', handlePopState);

        // Initialiser l'état de l'historique au chargement
        if (state.view && !window.history.state) {
            replaceNavigationState({
                view: state.view,
                chapterId: state.currentChapterId,
                subView: state.activitySubView,
                review: state.isReviewMode,
                concoursType: state.currentConcoursType,
                concoursId: state.currentConcoursId,
                concoursYear: state.currentConcoursYear,
                concoursTheme: state.currentConcoursTheme,
                concoursMode: state.concoursNavigationMode
            });
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [dispatch, state.view, state.currentChapterId, state.activitySubView, state.isReviewMode, state.currentConcoursType, state.currentConcoursId, state.currentConcoursYear, state.currentConcoursTheme, state.concoursNavigationMode]);

    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                <AppSyncContext.Provider value={syncManually}>
                    {children}
                </AppSyncContext.Provider>
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
};