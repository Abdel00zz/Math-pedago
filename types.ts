export interface Profile {
    name: string;
    classId: string;
}

export interface Option {
    id?: string; // Optionnel, pour les concours
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
    images?: ExerciseImage[]; // Images pour les sous-questions
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

// ============================================================================
// TYPES POUR LES LEÇONS (LESSON SYSTEM)
// ============================================================================

export interface LessonImageConfig {
    src: string; // Chemin relatif depuis /public/
    alt?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    align?: 'center' | 'left' | 'right';
    width?: string; // ex: "70%", "500px"
    caption?: string;
}

export interface LessonHeaderData {
    title: string;
    subtitle?: string;
    classe?: string;
    chapter?: string;
}

interface BaseLessonElement {
    type: string;
}

export interface LessonTextElement extends BaseLessonElement {
    type: 'p';
    content: string;
    image?: LessonImageConfig;
}

export interface LessonTableElement {
    type: 'table';
    content: string; // Markdown table
    image?: LessonImageConfig;
}

export interface LessonInfoBoxElement extends BaseLessonElement {
    type: 'definition-box' | 'theorem-box' | 'proposition-box' | 'property-box' | 'remark-box' | 'example-box';
    content?: string | string[];
    preamble?: string;
    listType?: 'bullet' | 'number' | 'numbered';
    image?: LessonImageConfig;
}

export interface LessonInteractiveBoxElement {
    type: 'practice-box' | 'explain-box';
    content?: string | string[];
    statement?: string;
    placeholder?: string;
    solution?: string | string[];  // Solution détaillée pour la modale
    image?: LessonImageConfig;
}

export type LessonElement = LessonTextElement | LessonInfoBoxElement | LessonInteractiveBoxElement | LessonTableElement;

export interface LessonSubsubsection {
    title: string;
    elements: LessonElement[];
}

export interface LessonSubsection {
    title: string;
    subsubsections?: LessonSubsubsection[];
    elements?: LessonElement[];
}

export interface LessonSection {
    title: string;
    intro?: string;
    subsections: LessonSubsection[];
}

export interface LessonContent {
    header: LessonHeaderData;
    sections: LessonSection[];
}

export type LessonElementPath = (string | number)[];

// ============================================================================
// FIN TYPES LEÇONS
// ============================================================================

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
    lessonFile?: string; // Nouveau : fichier JSON de la leçon séparée
    isActive: boolean;
    class: string;
    chapter: string;
    sessionDates: string[]; // Changed from sessionDate: string
    videos?: Video[]; // Nouveau champ pour les capsules vidéo
    quiz: Question[];
    exercises: Exercise[];
    lesson?: LessonContent; // Nouveau : contenu de la leçon
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

// Nouveau type pour le progrès des leçons
export interface LessonProgress {
    isRead: boolean; // La leçon a été lue
    duration: number; // Temps passé sur la leçon en secondes
    scrollProgress: number; // Progression du scroll (0-100)
    lastReadSection?: string; // Dernière section lue
    completedParagraphs: number; // Nombre de paragraphes cochés
    totalParagraphs: number; // Nombre total de paragraphes
    completedSections: number; // Nombre de sections complètes
    totalSections: number; // Nombre total de sections
    checklistPercentage: number; // Pourcentage de la checklist (0-100)
}

export type ChapterStatus = 'en-cours' | 'a-venir' | 'acheve';

export interface ChapterProgress {
    videos?: VideosProgress; // Nouveau champ pour le tracking des vidéos
    lesson?: LessonProgress; // Nouveau champ pour le tracking des leçons
    quiz: QuizProgress;
    exercisesFeedback: { [exId: string]: Feedback };
    isWorkSubmitted: boolean;
    submittedVersion?: string; // Track version on submission
    exercisesDuration: number; // in seconds
    hasUpdate?: boolean;
    status: ChapterStatus; // Statut du chapitre : en cours, à venir ou achevé
}

export interface AppState {
    view: 'login' | 'dashboard' | 'work-plan' | 'activity' | 'concours' | 'concours-list' | 'concours-year' | 'concours-resume' | 'concours-quiz';
    profile: Profile | null;
    allowLoginWithProfile?: boolean;
    activities: { [chapterId: string]: Chapter };
    activityVersions: { [chapterId: string]: string }; // To track versions for update notifications
    progress: { [chapterId: string]: ChapterProgress };
    currentChapterId: string | null;
    currentActiveChapterId: string | null; // Le chapitre actuellement "en cours" (1 seul à la fois)
    activitySubView: 'videos' | 'quiz' | 'exercises' | 'lesson' | null; // Ajout de 'lesson'
    isReviewMode: boolean;
    chapterOrder: string[];
    // Concours
    concoursProgress: ConcoursProgress;
    currentConcoursType: string | null; // "medecine", "ensa", "ensam"
    currentConcoursId: string | null; // ex: "medecine-2024-nombres-complexes"
    concoursNavigationMode: 'theme' | 'year' | null; // Mode de navigation: par thème ou par année
    currentConcoursYear: string | null; // Année sélectionnée en mode "par année"
    currentConcoursTheme: string | null; // Thème sélectionné (utilisé dans les deux modes)
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
    lesson?: {
        completed: number;
        total: number;
        percentage: number;
    };
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

// ============================================================================
// TYPES POUR LES CONCOURS
// ============================================================================

export interface ConcoursResumeSection {
    type: 'definitions' | 'formules' | 'methodes' | 'pieges' | 'reflexion' | 'astuces';
    title: string;
    items: string[];
}

export interface ConcoursResume {
    title: string;
    introduction: string;
    sections: ConcoursResumeSection[];
}

export interface ConcoursQuestion extends Question {
    theme: string; // Référence au thème du concours
}

export interface ConcoursData {
    id: string;
    concours: string; // "Médecine", "ENSA", "ENSAM"
    annee: string;
    theme: string;
    resume: ConcoursResume;
    quiz: ConcoursQuestion[];
}

export interface ConcoursExamen {
    annee: string;
    fichiers: {
        id: string;
        theme: string;
        file: string;
    }[];
}

export interface ConcoursInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    examens: ConcoursExamen[];
}

export interface ConcoursIndex {
    concours: ConcoursInfo[];
}

export interface ConcoursQuizProgress {
    answers: { [qId: string]: string | string[] };
    currentQuestionIndex: number;
    duration: number;
    hintsUsed: number;
    score?: number;
    completed: boolean;
}

export interface ConcoursProgress {
    [concoursId: string]: { // ex: "medecine-2024-nombres-complexes"
        resumeRead: boolean; // L'utilisateur a lu et confirmé le résumé
        quiz: ConcoursQuizProgress;
    };
}

// ============================================================================
// FIN TYPES CONCOURS
// ============================================================================


export type Action =
    | { type: 'INIT'; payload: Partial<AppState> }
    | { type: 'CHANGE_VIEW'; payload: {
        view: AppState['view'];
        chapterId?: string;
        subView?: AppState['activitySubView'];
        review?: boolean;
        concoursType?: string | null;
        concoursId?: string | null;
        concoursYear?: string | null;
        concoursTheme?: string | null;
        concoursMode?: 'theme' | 'year' | null;
        fromHistory?: boolean;
        forceLogin?: boolean;
    } }
    | { type: 'LOGIN'; payload: Profile }
    | { type: 'NAVIGATE_QUIZ'; payload: number }
    | { type: 'UPDATE_QUIZ_ANSWER'; payload: { qId: string; answer: string | string[] } }
    | { type: 'SUBMIT_QUIZ'; payload: { score: number; duration: number; hintsUsed: number } }
    | { type: 'TOGGLE_REVIEW_MODE'; payload: boolean }
    | { type: 'SET_QUIZ_DURATION'; payload: { chapterId: string; duration: number } }
    | { type: 'MARK_VIDEO_WATCHED'; payload: { videoId: string } } // Nouvelle action
    | { type: 'SET_VIDEOS_DURATION'; payload: { duration: number } } // Nouvelle action
    | { type: 'UPDATE_LESSON_PROGRESS'; payload: { chapterId?: string; scrollProgress?: number; isRead?: boolean; duration?: number; completedParagraphs?: number; totalParagraphs?: number; completedSections?: number; totalSections?: number; checklistPercentage?: number } } // Nouvelle action
    | { type: 'UPDATE_EXERCISE_FEEDBACK'; payload: { exId: string; feedback: Feedback } }
    | { type: 'UPDATE_EXERCISES_DURATION'; payload: { duration: number } }
    | { type: 'SUBMIT_WORK'; payload: { chapterId: string } }
    | { type: 'MARK_UPDATE_SEEN'; payload: { chapterId: string } }
    | { type: 'SYNC_ACTIVITIES'; payload: { activities: { [id: string]: Chapter }; progress: { [id: string]: ChapterProgress }; chapterOrder: string[] } }
    | { type: 'SET_CHAPTER_STATUS'; payload: { chapterId: string; status: ChapterStatus } } // Nouvelle action pour gérer les statuts
    | { type: 'START_CHAPTER'; payload: { chapterId: string } }; // Nouvelle action pour démarrer un chapitre