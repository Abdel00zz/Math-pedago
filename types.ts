export interface Profile {
    name: string;
    classId: string;
}

export interface Option {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    question: string;
    options: Option[];
    explanation: string;
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
    sessionDate: string;
    quiz: Question[];
    exercises: Exercise[];
}

export type Feedback = 'Réussi facilement' | 'J\'ai réfléchi' | 'C\'était un défi' | 'Non traité';

export interface QuizProgress {
    answers: { [qId: string]: string };
    isSubmitted: boolean;
    score: number;
    allAnswered: boolean;
    currentQuestionIndex: number;
}

export interface ChapterProgress {
    quiz: QuizProgress;
    exercisesFeedback: { [exId: string]: Feedback };
    isWorkSubmitted: boolean;
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
    | { type: 'SUBMIT_QUIZ'; payload: { score: number } }
    | { type: 'TOGGLE_REVIEW_MODE'; payload: boolean }
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [id: string]: Chapter }; progress: { [id: string]: ChapterProgress }; chapterOrder: string[] } };