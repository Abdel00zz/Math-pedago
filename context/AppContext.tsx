
import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useContext, useRef } from 'react';
// Fix: Removed unused 'ChapterData' type from import to resolve error. The other types are now correctly imported from the fixed types.ts file.
import { AppState, Action, Chapter, Profile, QuizProgress, ChapterProgress, Feedback, UINotification } from '../types';
import { DB_KEY } from '../constants';
import { useNotification } from './NotificationContext';

const initialState: AppState = {
    view: 'login',
    profile: null,
    activities: {},
    activityVersions: {},
    progress: {},
    currentChapterId: null,
    activitySubView: null,
    isReviewMode: false,
    chapterOrder: [],
};

// ... (appReducer remains the same)
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
            const { profile, progress = {}, view, currentChapterId, activitySubView, chapterOrder, activityVersions } = action.payload;
            const restoredView = profile && profile.classId ? (view || 'dashboard') : 'login';

            return {
                ...state,
                profile: profile || null,
                progress,
                chapterOrder: chapterOrder || [],
                activityVersions: activityVersions || {},
                view: restoredView,
                currentChapterId: currentChapterId || null,
                activitySubView: activitySubView || null,
            };
        }
        case 'CHANGE_VIEW': {
            const { view, chapterId, subView, review } = action.payload;
            let newState: AppState = {
                ...state,
                view,
                currentChapterId: chapterId !== undefined ? chapterId : state.currentChapterId,
                activitySubView: subView !== undefined ? subView : state.activitySubView,
                isReviewMode: review ?? false,
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
        
            return newState;
        }
        case 'LOGIN':
            return { ...state, profile: action.payload, view: 'dashboard' };
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
             return {
                ...state,
                progress: {
                    ...state.progress,
                    [chapterId]: { 
                        ...progress, 
                        isWorkSubmitted: true,
                        submittedVersion: chapter.version,
                        hasUpdate: false,
                    }
                },
            };
        }
        case 'SYNC_ACTIVITIES':
            const newActivityVersions = Object.values(action.payload.activities).reduce((acc, chapter) => {
                if (chapter.version) {
                    acc[chapter.id] = chapter.version;
                }
                return acc;
            }, {} as { [id: string]: string });

            const generatedNotifications: UINotification[] = [];
            const newProgress = { ...state.progress };

            Object.values(action.payload.activities).forEach(newChapter => {
                // Ensure a progress object exists for every chapter
                if (!newProgress[newChapter.id]) {
                    newProgress[newChapter.id] = {
                        quiz: { answers: {}, isSubmitted: false, score: 0, allAnswered: false, currentQuestionIndex: 0, duration: 0, hintsUsed: 0 },
                        exercisesFeedback: {},
                        isWorkSubmitted: false,
                        exercisesDuration: 0,
                    };
                }

                const currentProgress = newProgress[newChapter.id];
                const oldVersion = state.activityVersions[newChapter.id];

                // Check for updates by comparing versions, but ONLY for active chapters.
                if (newChapter.isActive && oldVersion && newChapter.version && oldVersion !== newChapter.version) {
                    generatedNotifications.push({
                        id: `update-${newChapter.id}-${newChapter.version}`,
                        title: 'Chapitre mis à jour !',
                        message: `Le contenu du chapitre "<b>${newChapter.chapter}</b>" a été amélioré.`,
                        timestamp: Date.now()
                    });
                    currentProgress.hasUpdate = true;

                    // 1. Re-validate progress: remove answers/feedback for deleted content
                    const newQuizIds = new Set(newChapter.quiz.map(q => q.id));
                    const newExerciseIds = new Set(newChapter.exercises.map(ex => ex.id));

                    const validatedAnswers = Object.entries(currentProgress.quiz.answers)
                        .filter(([qId]) => newQuizIds.has(qId))
                        .reduce((acc, [qId, answer]) => ({ ...acc, [qId]: answer as string | string[] }), {});
                    currentProgress.quiz.answers = validatedAnswers;

                    const validatedFeedback = Object.entries(currentProgress.exercisesFeedback)
                        .filter(([exId]) => newExerciseIds.has(exId))
                        .reduce((acc, [exId, feedback]) => ({ ...acc, [exId]: feedback as Feedback }), {});
                    currentProgress.exercisesFeedback = validatedFeedback;
                    
                    // 2. Intelligently update quiz status
                    const totalNewQuestions = newChapter.quiz.length;
                    const answeredCount = Object.keys(validatedAnswers).length;
                    const isNowFullyAnswered = totalNewQuestions > 0 ? answeredCount === totalNewQuestions : true;
                    currentProgress.quiz.allAnswered = isNowFullyAnswered;

                    // CRITICAL: If the quiz was submitted but is no longer complete (due to new questions),
                    // reset its submission status to force the user to complete it again.
                    if (currentProgress.quiz.isSubmitted && !isNowFullyAnswered) {
                        currentProgress.quiz.isSubmitted = false;
                        // UX Enhancement: Navigate user to the first unanswered question
                        currentProgress.quiz.currentQuestionIndex = findFirstUnansweredIndex(newChapter, validatedAnswers);
                         generatedNotifications.push({
                            id: `quiz-reset-${newChapter.id}`,
                            title: 'Quiz mis à jour',
                            message: `De nouvelles questions ont été ajoutées au quiz du chapitre "<b>${newChapter.chapter}</b>". Veuillez le compléter à nouveau.`,
                            timestamp: Date.now() + 500 // Stagger notification
                        });
                    }

                    // 3. Force re-submission of the entire chapter work if it was previously finalized.
                    if (currentProgress.isWorkSubmitted) {
                        currentProgress.isWorkSubmitted = false;
                        generatedNotifications.push({
                            id: `resubmit-${newChapter.id}-${newChapter.version}`,
                            title: 'Action requise',
                            message: `Le chapitre "<b>${newChapter.chapter}</b>" a changé. Veuillez finaliser votre travail à nouveau.`,
                            timestamp: Date.now() + 1000 
                        });
                    }
                } else if (newChapter.isActive && !oldVersion) {
                     generatedNotifications.push({
                        id: `new-${newChapter.id}`,
                        title: 'Nouveau Chapitre Disponible',
                        message: `Un nouveau défi vous attend. Le chapitre "<b>${newChapter.chapter}</b>" est prêt.`,
                        timestamp: Date.now()
                    });
                }
            });

            // Persist notifications
            const UI_NOTIFICATIONS_KEY = 'pedagoUiNotifications_V1';
            if (generatedNotifications.length > 0) {
                 try {
                    const stored = localStorage.getItem(UI_NOTIFICATIONS_KEY);
                    const existing = stored ? JSON.parse(stored) : [];
                    const existingIds = new Set(existing.map((n: UINotification) => n.id));
                    const uniqueNew = generatedNotifications.filter(n => !existingIds.has(n.id));
                    if (uniqueNew.length > 0) {
                        localStorage.setItem(UI_NOTIFICATIONS_KEY, JSON.stringify([...existing, ...uniqueNew]));
                    }
                } catch (e) {
                    console.error("Failed to update UI notifications", e);
                }
            }


            return {
                ...state,
                activities: action.payload.activities,
                progress: newProgress,
                chapterOrder: action.payload.chapterOrder,
                activityVersions: newActivityVersions,
            };
        default:
            return state;
    }
};

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

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
        let savedData: Partial<AppState> = {};
        try {
            const rawData = localStorage.getItem(DB_KEY);
            if (rawData) {
                const parsedData = JSON.parse(rawData);
                if (typeof parsedData === 'object' && parsedData !== null) {
                    savedData = parsedData;
                }
            }
        } catch (error) {
            console.error("Failed to load or parse data from localStorage, resetting.", error);
            localStorage.removeItem(DB_KEY);
        }
        dispatch({ type: 'INIT', payload: savedData });
    }, []);

    // Effect 2: Fetch and sync chapter data when profile class changes.
    useEffect(() => {
        const syncChaptersForClass = async (classId: string) => {
            if (classId === fetchedClassRef.current) return;
            fetchedClassRef.current = classId;

            try {
                const manifestRes = await fetch('/manifest.json');
                if (!manifestRes.ok) throw new Error("Manifest file not found");
                const manifest: { [id: string]: any[] } = await manifestRes.json();
                
                const chapterInfos = manifest[classId] || [];
                const allActivities: { [id: string]: Chapter } = {};
                const chapterOrderForClass = chapterInfos.map(info => info.id);

                if (chapterInfos.length > 0) {
                    const chapterPromises = chapterInfos.map(info => 
                        fetch(`/chapters/${info.file}`)
                            .then(res => res.ok ? res.json() : Promise.reject(`Could not load ${info.file}`))
                            .then(data => {
                                const normalizedData = { ...data };
                                if (!Array.isArray(normalizedData.sessionDates)) {
                                    normalizedData.sessionDates = typeof normalizedData.sessionDate === 'string' && normalizedData.sessionDate ? [normalizedData.sessionDate] : [];
                                }
                                if ('sessionDate' in normalizedData) {
                                    delete normalizedData.sessionDate;
                                }
                                return { ...normalizedData, id: info.id, file: info.file, isActive: info.isActive, version: info.version };
                            })
                            .catch(err => { console.error(err); return null; })
                    );
                    const loadedChapters = (await Promise.all(chapterPromises)).filter(Boolean) as Chapter[];
                    loadedChapters.forEach(ch => allActivities[ch.id] = ch);
                }
                
                // The SYNC_ACTIVITIES dispatch will handle progress creation, validation and notifications.
                dispatch({ 
                    type: 'SYNC_ACTIVITIES', 
                    payload: { 
                        activities: allActivities, 
                        progress: state.progress, // Pass current progress to be updated
                        chapterOrder: chapterOrderForClass 
                    } 
                });

            } catch (error) {
                console.error("Failed to load or sync chapter data:", error);
                addNotification("Chargement échoué", "error", { 
                    message: "Impossible de charger les chapitres. Veuillez vérifier votre connexion.",
                    action: {
                        label: 'Réessayer',
                        onClick: () => window.location.reload()
                    },
                    duration: 10000 
                });
            }
        };

        if (state.profile?.classId) {
            syncChaptersForClass(state.profile.classId);
        } else {
             if(Object.keys(state.activities).length > 0) {
                 dispatch({ type: 'SYNC_ACTIVITIES', payload: { activities: {}, progress: state.progress, chapterOrder: [] } });
            }
            fetchedClassRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.profile]);

    // Effect 3: Persist state to localStorage immediately on any state change.
    useEffect(() => {
        if (state.profile) {
            // We never save the full activities data to avoid bloating localStorage.
            // We only save metadata like versions, progress, profile, etc.
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

    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
};