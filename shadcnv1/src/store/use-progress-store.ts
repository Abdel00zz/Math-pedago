import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProgress,
  QuizAttempt,
  ExerciseProgress,
  VideoProgress,
  Achievement,
} from '@/types'
import { STORAGE_KEYS } from '@/lib/constants/config'

interface ProgressState {
  progress: UserProgress
  addLessonCompleted: (lessonId: string) => void
  addQuizAttempt: (attempt: QuizAttempt) => void
  addExerciseProgress: (progress: ExerciseProgress) => void
  updateVideoProgress: (progress: VideoProgress) => void
  unlockAchievement: (achievement: Achievement) => void
  getTotalProgress: () => number
  reset: () => void
}

const initialProgress: UserProgress = {
  lessonsCompleted: [],
  quizzesAttempted: [],
  exercisesCompleted: [],
  videosWatched: [],
  totalPoints: 0,
  level: 'TCS',
  achievements: [],
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,

      addLessonCompleted: (lessonId: string) =>
        set((state) => {
          if (state.progress.lessonsCompleted.includes(lessonId)) {
            return state
          }
          return {
            progress: {
              ...state.progress,
              lessonsCompleted: [...state.progress.lessonsCompleted, lessonId],
            },
          }
        }),

      addQuizAttempt: (attempt: QuizAttempt) =>
        set((state) => ({
          progress: {
            ...state.progress,
            quizzesAttempted: [...state.progress.quizzesAttempted, attempt],
            totalPoints: state.progress.totalPoints + attempt.score,
          },
        })),

      addExerciseProgress: (progress: ExerciseProgress) =>
        set((state) => {
          const existing = state.progress.exercisesCompleted.find(
            (e) => e.exerciseId === progress.exerciseId
          )
          if (existing) {
            return {
              progress: {
                ...state.progress,
                exercisesCompleted: state.progress.exercisesCompleted.map((e) =>
                  e.exerciseId === progress.exerciseId ? progress : e
                ),
                totalPoints:
                  state.progress.totalPoints - existing.score + progress.score,
              },
            }
          }
          return {
            progress: {
              ...state.progress,
              exercisesCompleted: [...state.progress.exercisesCompleted, progress],
              totalPoints: state.progress.totalPoints + progress.score,
            },
          }
        }),

      updateVideoProgress: (progress: VideoProgress) =>
        set((state) => {
          const existing = state.progress.videosWatched.find(
            (v) => v.videoId === progress.videoId
          )
          if (existing) {
            return {
              progress: {
                ...state.progress,
                videosWatched: state.progress.videosWatched.map((v) =>
                  v.videoId === progress.videoId ? progress : v
                ),
              },
            }
          }
          return {
            progress: {
              ...state.progress,
              videosWatched: [...state.progress.videosWatched, progress],
            },
          }
        }),

      unlockAchievement: (achievement: Achievement) =>
        set((state) => {
          if (state.progress.achievements.find((a) => a.id === achievement.id)) {
            return state
          }
          return {
            progress: {
              ...state.progress,
              achievements: [...state.progress.achievements, achievement],
            },
          }
        }),

      getTotalProgress: () => {
        const { progress } = get()
        const total =
          progress.lessonsCompleted.length +
          progress.quizzesAttempted.length +
          progress.exercisesCompleted.length +
          progress.videosWatched.length
        return total
      },

      reset: () => set({ progress: initialProgress }),
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
    }
  )
)
