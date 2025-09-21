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
    options: Option[];
    explanation?: string;
}

export interface Hint {
    text: string;
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
}

export type Feedback = 'Facile' | 'Moyen' | 'Difficile' | 'Non traité';

export interface QuizProgress {
    answers: { [qId: string]: string };
    isSubmitted: boolean;
    score: number;
    allAnswered: boolean;
    currentQuestionIndex: number;
    duration: number; // in seconds
}

export interface ChapterProgress {
    quiz: QuizProgress;
    exercisesFeedback: { [exId: string]: Feedback };
    isWorkSubmitted: boolean;
    exercisesDuration: number; // in seconds
}

export interface AppState {
    view: 'login' | 'dashboard' | 'work-plan' | 'activity';
    profile: Profile | null;
    activities: { [chapterId: string]: Chapter };
    progress: { [chapterId: string]: ChapterProgress };
    currentChapterId: string | null;
    activitySubView: 'quiz' | 'exercises' | null;
    isReviewMode: boolean;
    chapterOrder: string[];
}

export type Action =
    | { type: 'INIT'; payload: Partial<AppState> }
    | { type: 'LOGIN'; payload: Profile }
    | { type: 'CHANGE_VIEW'; payload: { view: AppState['view']; chapterId?: string; subView?: AppState['activitySubView']; review?: boolean } }
    | { type: 'NAVIGATE_QUIZ'; payload: number }
    | { type: 'UPDATE_QUIZ_ANSWER'; payload: { qId: string; answer: string } }
    | { type: 'SUBMIT_QUIZ'; payload: { score: number; duration: number } }
    | { type: 'TOGGLE_REVIEW_MODE'; payload: boolean }
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'UPDATE_EXERCISES_DURATION'; payload: { duration: number } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [id: string]: Chapter }; progress: { [id: string]: ChapterProgress }; chapterOrder: string[] } };

// ---- Structures for Progress File Import ----

/**
 * Describes the structure of a quiz result within an imported progress file.
 * This corresponds to the `quiz` object in the JSON schema.
 */
export interface ImportedQuizResult {
    isSubmitted: boolean;
    score: number; // Percentage, e.g., 33.33
    answers: { [qId: string]: number }; // Maps question ID to the index of the selected option
}

/**
 * Describes the structure of a single chapter's results in an imported progress file.
 * This corresponds to an object in the `results` array in the JSON schema.
 */
export interface ImportedChapterResult {
    chapter: string; // Chapter name, must match exactly
    quiz: ImportedQuizResult;
    exercisesFeedback: { [exId: string]: Feedback };
    durationSeconds?: number; // Total time spent on the chapter in seconds
}

/**
 * Describes the top-level structure of an imported progress JSON file.
 */
export interface ImportedProgressFile {
    studentName: string;
    studentLevel: string; // The full class name, e.g., "1ère Bac Sciences Mathématiques"
    timestamp: number;
    results: ImportedChapterResult[];
}
