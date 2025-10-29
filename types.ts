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

// Nouveau type pour les vidéos YouTube
export interface Video {
    id: string;
    title: string;
    youtubeId: string; // ID de la vidéo YouTube (ex: "dQw4w9WgXcQ")
    duration?: string; // Durée affichée (ex: "3:24")
    description?: string; // Description courte
    thumbnail?: string; // URL de la miniature (optionnel, peut être généré depuis YouTube)
}

export interface Hint {
    text: string;
    // Nouveau champ optionnel pour lier explicitement un indice à une question spécifique
    questionNumber?: string; // Ex: "2b", "1a", "3", etc.
    // Fix: Added optional 'sub_questions' to allow hints to contain sub-questions.
    sub_questions?: SubQuestion[];
}

export interface SubSubQuestion {
    text: string;
}

export interface SubQuestion {
    text: string;
    sub_sub_questions?: SubSubQuestion[];
}

// Nouveau type pour les images dans les exercices
export type ImagePosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'inline' | 'float-left' | 'float-right';
export type ImageSize = 'small' | 'medium' | 'large' | 'full' | 'custom';
export type ImageAlignment = 'left' | 'center' | 'right' | 'justify'; // Alignement horizontal

export interface ExerciseImage {
    id: string;
    path: string; // Chemin relatif depuis public/ (ex: "pictures/1bse/calcul_trigonometrique/image1.png")
    caption?: string; // Légende de l'image
    size?: ImageSize; // Taille prédéfinie
    customWidth?: number; // Largeur personnalisée en pixels (si size='custom')
    customHeight?: number; // Hauteur personnalisée en pixels (si size='custom')
    position?: ImagePosition; // Position de l'image dans le contenu
    alignment?: ImageAlignment; // Alignement horizontal de l'image
    alt?: string; // Texte alternatif pour l'accessibilité
}

export interface Exercise {
    id: string;
    title: string;
    statement: string;
    sub_questions?: SubQuestion[];
    hint?: Hint[];
    images?: ExerciseImage[]; // Nouveau champ pour les images
}

export interface Chapter {
    id: string;
    file: string;
    isActive: boolean;
    class: string;
    chapter: string;
    sessionDates: string[]; // Changed from sessionDate: string
    videos?: Video[]; // Nouveau champ pour les capsules vidéo
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

// Nouveau type pour le progrès des vidéos
export interface VideosProgress {
    watched: { [videoId: string]: boolean }; // true si "Bien assimilé" cliqué
    allWatched: boolean; // true si toutes les vidéos sont marquées comme assimilées
    duration: number; // temps passé total en secondes
}

export interface ChapterProgress {
    videos?: VideosProgress; // Nouveau champ pour le tracking des vidéos
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
    activitySubView: 'videos' | 'quiz' | 'exercises' | null; // Ajout de 'videos'
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

export interface ExportedVideosResult {
    watchedCount: number; // Nombre de vidéos regardées
    totalCount: number; // Nombre total de vidéos
    allWatched: boolean; // Toutes les vidéos sont-elles assimilées ?
    durationSeconds: number; // Temps passé
}

export interface ExportedChapterResult {
    chapter: string;
    version: string;
    videos?: ExportedVideosResult; // Nouveau champ pour l'export
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
    | { type: 'SET_QUIZ_DURATION'; payload: { chapterId: string; duration: number } }
    | { type: 'MARK_VIDEO_WATCHED'; payload: { videoId: string } } // Nouvelle action
    | { type: 'SET_VIDEOS_DURATION'; payload: { duration: number } } // Nouvelle action
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'UPDATE_EXERCISES_DURATION'; payload: { duration: number } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'MARK_UPDATE_SEEN'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [id: string]: Chapter }; progress: { [id: string]: ChapterProgress }; chapterOrder: string[] } };