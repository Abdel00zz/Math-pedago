import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useContext } from 'react';
import { AppState, Action, ChapterData, Chapter } from '../types';
import { DB_KEY } from '../constants';
import { useNotification } from './NotificationContext';

const initialState: AppState = {
    view: 'login',
    profile: null,
    activities: {},
    progress: {},
    currentChapterId: null,
    activitySubView: null,
    isReviewMode: false,
};

// ... (appReducer remains the same)
const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'INIT':
            return { ...state, ...action.payload, view: action.payload.profile ? 'dashboard' : 'login' };
        case 'CHANGE_VIEW': {
            const { view, chapterId, subView, review } = action.payload;
            const newState: AppState = {
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
                        quiz: { ...progress.quiz, isSubmitted: true, score: action.payload.score, currentQuestionIndex: 0 }
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
        case 'SUBMIT_WORK': {
            const { chapterId } = action.payload;
            if (!chapterId || !state.progress[chapterId]) return state;
            const progress = state.progress[chapterId];
             return {
                ...state,
                progress: {
                    ...state.progress,
                    [chapterId]: { ...progress, isWorkSubmitted: true }
                },
            };
        }
        case 'SYNC_ACTIVITIES':
            return {
                ...state,
                activities: action.payload.activities,
                progress: action.payload.progress,
            };
        default:
            return state;
    }
};

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { addNotification } = useNotification();

    useEffect(() => {
        const loadAndSyncData = async () => {
            const allActivities: { [id: string]: Chapter } = {};
            try {
                const manifestRes = await fetch('/manifest.json');
                if (!manifestRes.ok) throw new Error("Manifest file not found");
                const manifest: { [classId: string]: { id: string; file: string; isActive: boolean }[] } = await manifestRes.json();

                const chapterPromises: Promise<Chapter | null>[] = [];

                for (const classId in manifest) {
                    for (const chapterInfo of manifest[classId]) {
                        const promise = fetch(`/chapters/${chapterInfo.file}`)
                            .then(res => {
                                if (!res.ok) throw new Error(`Could not load chapter: ${chapterInfo.file}`);
                                return res.json();
                            })
                            .then((chapterData: ChapterData) => ({
                                ...chapterData,
                                id: chapterInfo.id,
                                file: chapterInfo.file,
                                isActive: chapterInfo.isActive,
                            }))
                            .catch(err => {
                                console.error(err);
                                return null;
                            });
                        chapterPromises.push(promise);
                    }
                }
                
                const loadedChapters = await Promise.all(chapterPromises);
                
                loadedChapters.forEach(chapter => {
                    if (chapter) {
                        allActivities[chapter.id] = chapter;
                    }
                });

            } catch (error) {
                console.error("Failed to load or sync chapter data:", error);
                addNotification("Impossible de charger les dernières activités.", "info");
            } finally {
                let savedData: Partial<AppState> = {};
                try {
                    const rawData = localStorage.getItem(DB_KEY);
                    if (rawData) {
                        const parsedData = JSON.parse(rawData);
                         if (typeof parsedData === 'object' && parsedData !== null) {
                            savedData = parsedData;
                        } else {
                            // This case handles non-object JSON values like "null", "true", etc.
                            throw new Error("Saved data is not a valid object.");
                        }
                    }
                } catch (error) {
                    console.error("Failed to load or parse data from localStorage, resetting.", error);
                    localStorage.removeItem(DB_KEY); // Clear corrupted data
                }
                
                const newProgress = { ...(savedData.progress || {}) };
                
                Object.keys(allActivities).forEach(id => {
                    if (!newProgress[id]) {
                        newProgress[id] = {
                            quiz: { answers: {}, isSubmitted: false, score: 0, allAnswered: false, currentQuestionIndex: 0 },
                            exercisesFeedback: {},
                            isWorkSubmitted: false,
                        };
                    }
                });

                dispatch({ type: 'INIT', payload: { ...savedData, activities: allActivities, progress: newProgress } });
            }
        };

        loadAndSyncData();
    }, [addNotification]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (state.profile) {
                const stateToSave: Partial<AppState> = {
                    profile: state.profile,
                    progress: state.progress,
                };
                localStorage.setItem(DB_KEY, JSON.stringify(stateToSave));
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [state.progress, state.profile]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};