// Common types
export type Level = 'TCS' | '1BSE' | '1BSM' | '2BSE' | '2BSM' | '2BECO'

export interface BaseEntity {
  id: string
  createdAt?: Date
  updatedAt?: Date
}

// Lesson types
export interface Lesson extends BaseEntity {
  slug: string
  title: string
  level: Level
  order: number
  content: LessonContent[]
  estimatedDuration?: number
}

export interface LessonContent {
  type: 'text' | 'math' | 'box' | 'image' | 'video'
  content: string
  boxType?: BoxType
  props?: Record<string, any>
}

export type BoxType =
  | 'definition'
  | 'theorem'
  | 'property'
  | 'example'
  | 'exercise'
  | 'method'
  | 'remark'
  | 'attention'
  | 'history'
  | 'application'

// Quiz types
export interface Quiz extends BaseEntity {
  title: string
  description: string
  level: Level
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
}

export interface QuizQuestion {
  id: string
  type: 'mcq' | 'ordering' | 'fill-blank'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  hints?: string[]
  points: number
}

export interface QuizAttempt extends BaseEntity {
  quizId: string
  answers: Record<string, any>
  score: number
  timeSpent: number
  completed: boolean
}

// Exercise types
export interface Exercise extends BaseEntity {
  title: string
  description: string
  level: Level
  difficulty: 'easy' | 'medium' | 'hard'
  subQuestions: SubQuestion[]
}

export interface SubQuestion {
  id: string
  question: string
  hints: string[]
  answer: string
  feedback: {
    correct: string
    incorrect: string
    partial?: string
  }
  points: number
}

export interface ExerciseProgress extends BaseEntity {
  exerciseId: string
  answers: Record<string, any>
  score: number
  completed: boolean
}

// Video types
export interface VideoCapsu extends BaseEntity {
  title: string
  description: string
  level: Level
  youtubeId: string
  duration: number
  thumbnail?: string
  topics: string[]
}

export interface VideoProgress extends BaseEntity {
  videoId: string
  watchedDuration: number
  completed: boolean
  favorite: boolean
}

// Progress types
export interface UserProgress {
  lessonsCompleted: string[]
  quizzesAttempted: QuizAttempt[]
  exercisesCompleted: ExerciseProgress[]
  videosWatched: VideoProgress[]
  totalPoints: number
  level: Level
  achievements: Achievement[]
}

export interface Achievement extends BaseEntity {
  title: string
  description: string
  icon: string
  unlockedAt?: Date
}

// Notification types
export interface Notification extends BaseEntity {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
  action?: {
    label: string
    href: string
  }
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'ar' | 'en'
  notifications: boolean
  soundEffects: boolean
  autoSave: boolean
}
