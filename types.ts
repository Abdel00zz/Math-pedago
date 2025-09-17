// types.ts
export type View = 'login' | 'dashboard' | 'chapter-hub' | 'activity';
export type ActivitySubView = 'quiz' | 'exercises' | null;
export type Feedback = 'Facile' | 'Moyen' | 'Difficile' | 'Pas travaillé';

export interface Profile {
    name: string;
    classId: string;
}

export interface QuizOption {
    text: string;
    isCorrect?: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
    explanation: string;
}

export interface SubQuestion {
    text: string;
    sub_questions?: SubQuestion[];
}

export interface Exercise {
    id: string;
    title?: string;
    statement: string;
    hint?: SubQuestion[];
    sub_questions: SubQuestion[];
}

export interface ChapterData {
    class: string;
    chapter: string;
    sessionDate: string;
    quiz: QuizQuestion[];
    exercises: Exercise[];
}

// The main Chapter object now includes all necessary properties
export interface Chapter extends ChapterData {
    id: string;
    file: string; // The original filename, useful for the admin panel
    isActive: boolean;
}

export interface QuizProgress {
    answers: { [questionId: string]: string };
    isSubmitted: boolean;
    score: number;
    allAnswered: boolean;
    currentQuestionIndex: number;
}

export interface ChapterProgress {
    quiz: QuizProgress;
    exercisesFeedback: { [exerciseId: string]: Feedback };
    isWorkSubmitted: boolean;
}

export interface AppState {
    view: View;
    profile: Profile | null;
    activities: { [chapterId: string]: Chapter };
    progress: { [chapterId: string]: ChapterProgress };
    currentChapterId: string | null;
    activitySubView: ActivitySubView;
    isReviewMode: boolean;
}

export type Action =
    | { type: 'INIT'; payload: Partial<AppState> }
    | { type: 'CHANGE_VIEW'; payload: { view: View; chapterId?: string | null; subView?: ActivitySubView; review?: boolean } }
    | { type: 'LOGIN'; payload: Profile }
    | { type: 'NAVIGATE_QUIZ'; payload: number }
    | { type: 'UPDATE_QUIZ_ANSWER'; payload: { qId: string; answer: string } }
    | { type: 'SUBMIT_QUIZ'; payload: { score: number } }
    | { type: 'TOGGLE_REVIEW_MODE'; payload: boolean }
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [chapterId: string]: Chapter }; progress: { [chapterId: string]: ChapterProgress } } };