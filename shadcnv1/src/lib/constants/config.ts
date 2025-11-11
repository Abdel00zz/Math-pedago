export const APP_CONFIG = {
  name: 'Math-Pedago',
  description: 'Plateforme éducative interactive pour l\'apprentissage des mathématiques',
  version: '2.0.0',
  author: 'Math-Pedago Team',
  repository: 'https://github.com/yourusername/math-pedago',
  supportEmail: 'support@math-pedago.com',
} as const

export const STORAGE_KEYS = {
  THEME: 'math-pedago-theme',
  PROGRESS: 'math-pedago-progress',
  SETTINGS: 'math-pedago-settings',
  QUIZ_ATTEMPTS: 'math-pedago-quiz-attempts',
  VIDEO_PROGRESS: 'math-pedago-video-progress',
} as const

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const
