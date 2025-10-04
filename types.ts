export interface Profile {
    name: string;
    classId: string;
}

export interface Option {
    text: string;
    isCorrect: boolean;
    explanation?: string;
}

export interface Question {
    id: string;
    question: string;
    type?: 'mcq' | 'ordering';
    options?: Option[];
    steps?: string[];
    explanation?: string;
    hints?: string[];
}

export interface Hint {
    text: string;
    // Fix: Added optional 'sub_questions' to allow hints to contain sub-questions.
    sub_questions?: SubQuestion[];
}

export interface SubQuestion {
    text: string;
}

export interface Exercise {
    id: string;
    title: string;
    statement: string;
    sub_questions?: SubQuestion[];
    hint?: Hint[];
}

export interface Chapter {
    id: string;
    file: string;
    isActive: boolean;
    class: string;
    chapter: string;
    sessionDates: string[]; // Changed from sessionDate: string
    quiz: Question[];
    exercises: Exercise[];
    version: string;
}

export type Feedback = 'Facile' | 'Moyen' | 'Difficile' | 'Non traité';

export interface QuizProgress {
    answers: { [qId: string]: string | string[] };
    isSubmitted: boolean;
    score: number;
    allAnswered: boolean;
    currentQuestionIndex: number;
    duration: number; // in seconds
    hintsUsed: number;
}

export interface ChapterProgress {
    quiz: QuizProgress;
    exercisesFeedback: { [exId: string]: Feedback };
    isWorkSubmitted: boolean;
    submittedVersion?: string; // Track version on submission
    exercisesDuration: number; // in seconds
    hasUpdate?: boolean;
}

export interface AppState {
    view: 'login' | 'dashboard' | 'work-plan' | 'activity';
    profile: Profile | null;
    activities: { [chapterId: string]: Chapter };
    activityVersions: { [chapterId: string]: string }; // To track versions for update notifications
    progress: { [chapterId: string]: ChapterProgress };
    currentChapterId: string | null;
    activitySubView: 'quiz' | 'exercises' | null;
    isReviewMode: boolean;
    chapterOrder: string[];
}

// Types for the specific JSON export structure
export interface ExportedQuizResult {
    score: number; // Percentage
    scoreRaw: string;
    durationSeconds: number;
    hintsUsed: number;
    answers: { [qId: string]: number | number[] }; // Standardized to numbers/indices
}

export interface ExportedChapterResult {
    chapter: string;
    version: string;
    quiz: ExportedQuizResult;
    exercisesFeedback: { [exId: string]: Feedback };
    exercisesDurationSeconds: number;
    totalDurationSeconds: number;
}

export interface ExportedProgressFile {
    studentName: string;
    studentLevel: string;
    submissionDate: string;
    timestamp: number;
    results: ExportedChapterResult[];
}

// Notification for the Notification Center UI (Modal)
export interface UINotification {
    id: string;
    title: string;
    message: string;
    timestamp: number; // For sorting and expiration
}

// Notification for the Toast UI (transient pop-ups)
export type ToastNotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
    id: string;
    type: ToastNotificationType;
    title?: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}


export type Action =
    | { type: 'INIT'; payload: Partial<AppState> }
    | { type: 'CHANGE_VIEW'; payload: { view: AppState['view']; chapterId?: string; subView?: AppState['activitySubView']; review?: boolean } }
    | { type: 'LOGIN'; payload: Profile }
    | { type: 'NAVIGATE_QUIZ'; payload: number }
    | { type: 'UPDATE_QUIZ_ANSWER'; payload: { qId: string; answer: string | string[] } }
    | { type: 'SUBMIT_QUIZ'; payload: { score: number; duration: number; hintsUsed: number } }
    | { type: 'TOGGLE_REVIEW_MODE'; payload: boolean }
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'UPDATE_EXERCISES_DURATION'; payload: { duration: number } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [id: string]: Chapter }; progress: { [id: string]: ChapterProgress }; chapterOrder: string[] } };