# Math-Pedago V2 - Architecture Ultra-Moderne

## 🚀 Stack Technique Avancée

### Core Framework
- **Next.js 15** - App Router, Server Components, Server Actions, Turbopack
- **TypeScript 5.7** - Mode strict, types avancés
- **React 19** - Concurrent features, Server Components

### UI Layer
- **shadcn/ui** - Composants accessibles et personnalisables
- **Radix UI** - Primitives UI headless
- **Tailwind CSS 4** - Utility-first CSS avec CSS-in-JS
- **Framer Motion** - Animations fluides et performantes
- **next-themes** - Dark mode avec support système
- **class-variance-authority** - Système de variants type-safe
- **tailwind-merge** - Merge intelligent de classes Tailwind

### State Management & Data Fetching
- **Zustand** - State management léger et performant
- **TanStack Query v5** - Server state, caching, synchronisation
- **Zod** - Validation de schémas runtime
- **react-hook-form** - Gestion de formulaires performante

### Math & Content
- **KaTeX** - Rendu mathématique ultra-rapide
- **MDX** - Markdown avec composants React
- **rehype/remark** - Traitement avancé du contenu

### Performance & PWA
- **next-pwa** - Progressive Web App optimisée
- **sharp** - Optimisation d'images
- **@vercel/analytics** - Analytics performant

### Dev Tools
- **ESLint** - Linting avec règles strictes
- **Prettier** - Formatage de code
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **Vitest** - Tests unitaires ultra-rapides
- **Playwright** - Tests E2E

---

## 🏗️ Architecture Modulaire Hyper-Dynamique

### 1. Structure de Dossiers par Features

```
Math-pedago-v2/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group - Authentication
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (platform)/               # Route group - Main Platform
│   │   │   ├── dashboard/
│   │   │   ├── lessons/
│   │   │   │   └── [slug]/
│   │   │   ├── quiz/
│   │   │   │   └── [id]/
│   │   │   ├── exercises/
│   │   │   │   └── [id]/
│   │   │   ├── videos/
│   │   │   │   └── [id]/
│   │   │   └── progress/
│   │   ├── api/                      # API Routes
│   │   │   ├── lessons/
│   │   │   ├── quiz/
│   │   │   ├── exercises/
│   │   │   └── progress/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css
│   │   └── providers.tsx
│   │
│   ├── features/                     # Feature Modules (Domain-Driven)
│   │   ├── lessons/
│   │   │   ├── components/
│   │   │   │   ├── lesson-viewer.tsx
│   │   │   │   ├── lesson-sidebar.tsx
│   │   │   │   ├── lesson-toc.tsx
│   │   │   │   └── box-types/        # Dynamic box renderers
│   │   │   ├── hooks/
│   │   │   │   ├── use-lesson.ts
│   │   │   │   └── use-lesson-progress.ts
│   │   │   ├── store/
│   │   │   │   └── lesson-store.ts
│   │   │   ├── types/
│   │   │   │   └── lesson.types.ts
│   │   │   ├── utils/
│   │   │   │   └── lesson-parser.ts
│   │   │   └── schemas/
│   │   │       └── lesson.schema.ts
│   │   │
│   │   ├── quiz/
│   │   │   ├── components/
│   │   │   │   ├── quiz-player.tsx
│   │   │   │   ├── question-renderer.tsx
│   │   │   │   └── question-types/   # Strategy pattern
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   │   ├── quiz-engine.ts
│   │   │   │   └── scoring.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── exercises/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── videos/
│   │   │   ├── components/
│   │   │   │   ├── video-player.tsx
│   │   │   │   └── video-controls.tsx
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── types/
│   │   │
│   │   ├── progress/
│   │   │   ├── components/
│   │   │   │   ├── progress-dashboard.tsx
│   │   │   │   ├── analytics-charts.tsx
│   │   │   │   └── achievement-system.tsx
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │       ├── analytics.ts
│   │   │       └── achievements.ts
│   │   │
│   │   └── notifications/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── store/
│   │       └── types/
│   │
│   ├── components/                   # Shared Components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── app-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── shared/
│   │   │   ├── math-renderer.tsx
│   │   │   ├── loading-states.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── providers/
│   │       ├── theme-provider.tsx
│   │       └── query-provider.tsx
│   │
│   ├── lib/                          # Core Utilities
│   │   ├── hooks/
│   │   │   ├── use-media-query.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── use-intersection-observer.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                 # classNames utility
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── math-utils.ts
│   │   ├── schemas/
│   │   │   └── common.schemas.ts
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── levels.ts
│   │   │   └── config.ts
│   │   └── api/
│   │       ├── client.ts
│   │       └── endpoints.ts
│   │
│   ├── store/                        # Global State (Zustand)
│   │   ├── app-store.ts
│   │   ├── user-store.ts
│   │   └── settings-store.ts
│   │
│   └── types/                        # Global TypeScript Types
│       ├── index.ts
│       ├── common.types.ts
│       └── api.types.ts
│
├── public/
│   ├── chapters/                     # Content JSON files
│   ├── images/
│   ├── icons/
│   └── manifest.json
│
├── config/
│   ├── site.config.ts
│   └── theme.config.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── components.json                   # shadcn/ui config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🎨 Design Patterns Utilisés

### 1. **Feature-Sliced Design**
Chaque feature est complètement autonome avec ses propres composants, hooks, store, types et utils.

### 2. **Strategy Pattern** - Questions de Quiz
```typescript
interface QuestionStrategy {
  render: (question: Question) => ReactNode
  validate: (answer: Answer) => ValidationResult
  calculateScore: (answer: Answer) => number
}

class MCQStrategy implements QuestionStrategy { ... }
class OrderingStrategy implements QuestionStrategy { ... }
class FillInBlankStrategy implements QuestionStrategy { ... }
```

### 3. **Factory Pattern** - Box Types dans Lessons
```typescript
interface BoxRenderer {
  type: string
  render: (content: BoxContent) => ReactNode
}

class BoxFactory {
  private renderers = new Map<string, BoxRenderer>()

  register(renderer: BoxRenderer) { ... }
  render(box: Box) { ... }
}
```

### 4. **Observer Pattern** - Progress Tracking
```typescript
interface ProgressObserver {
  onProgressUpdate: (progress: Progress) => void
}

class ProgressTracker {
  private observers: ProgressObserver[] = []

  subscribe(observer: ProgressObserver) { ... }
  notify(progress: Progress) { ... }
}
```

### 5. **Composite Pattern** - Exercices Hiérarchiques
```typescript
interface Exercise {
  id: string
  render: () => ReactNode
  getProgress: () => number
}

class SimpleExercise implements Exercise { ... }
class CompositeExercise implements Exercise {
  private children: Exercise[] = []
}
```

### 6. **Builder Pattern** - Configuration de Quiz
```typescript
class QuizBuilder {
  private config: QuizConfig = {}

  withQuestions(questions: Question[]) { return this }
  withTimeLimit(minutes: number) { return this }
  withShuffling(enabled: boolean) { return this }
  build() { return new Quiz(this.config) }
}
```

---

## 🔧 Système de Configuration Dynamique

### Schema-Driven UI
```typescript
// Configuration de features via schémas Zod
const LessonConfigSchema = z.object({
  enableTOC: z.boolean().default(true),
  enableProgress: z.boolean().default(true),
  boxTypes: z.array(z.string()),
  theme: z.enum(['light', 'dark', 'auto']),
  mathRenderer: z.enum(['katex', 'mathjax']),
})

// Auto-génération de l'UI basée sur le schéma
const DynamicForm = createFormFromSchema(LessonConfigSchema)
```

### Plugin System
```typescript
interface Plugin {
  name: string
  version: string
  initialize: (app: App) => void
  hooks: PluginHooks
}

// Les plugins peuvent étendre la plateforme
const AnalyticsPlugin: Plugin = {
  name: 'analytics',
  hooks: {
    onLessonComplete: (lesson) => trackEvent('lesson_complete', lesson),
    onQuizSubmit: (quiz) => trackEvent('quiz_submit', quiz),
  }
}
```

---

## 📊 State Management Architecture

### Zustand Stores (Modulaire)

```typescript
// store/lesson-store.ts
interface LessonStore {
  currentLesson: Lesson | null
  progress: Map<string, LessonProgress>

  // Actions
  setLesson: (lesson: Lesson) => void
  updateProgress: (id: string, progress: number) => void

  // Selectors
  getLessonProgress: (id: string) => LessonProgress
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  // Implementation
}))
```

### TanStack Query pour Data Fetching
```typescript
// hooks/use-lesson-data.ts
export function useLessonData(slug: string) {
  return useQuery({
    queryKey: ['lesson', slug],
    queryFn: () => fetchLesson(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

---

## 🎭 Component Patterns Avancés

### 1. Compound Components
```typescript
export const Lesson = {
  Root: LessonRoot,
  Header: LessonHeader,
  Content: LessonContent,
  Sidebar: LessonSidebar,
  Footer: LessonFooter,
}

// Usage
<Lesson.Root>
  <Lesson.Header />
  <Lesson.Content />
  <Lesson.Sidebar />
</Lesson.Root>
```

### 2. Render Props + Hooks
```typescript
function QuizPlayer({ quiz, children }) {
  const state = useQuizState(quiz)
  return children(state)
}

// Usage
<QuizPlayer quiz={quiz}>
  {({ currentQuestion, answer, submit }) => (
    <QuestionRenderer question={currentQuestion} onAnswer={answer} />
  )}
</QuizPlayer>
```

### 3. Polymorphic Components
```typescript
type PolymorphicProps<E extends React.ElementType> = {
  as?: E
} & React.ComponentPropsWithoutRef<E>

function Box<E extends React.ElementType = 'div'>({
  as,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'div'
  return <Component {...props} />
}
```

---

## 🚀 Performance Optimizations

### 1. Code Splitting
- Route-based splitting automatique (Next.js)
- Dynamic imports pour les features lourdes
- Component lazy loading

### 2. Server Components
- Rendu côté serveur pour le contenu statique
- Streaming SSR pour l'UI progressive
- Server Actions pour les mutations

### 3. Image Optimization
- next/image pour optimisation automatique
- Lazy loading avec intersection observer
- Responsive images avec srcset

### 4. Memoization Strategy
```typescript
// Memoization sélective
const MemoizedQuestionRenderer = memo(
  QuestionRenderer,
  (prev, next) => prev.question.id === next.question.id
)
```

---

## 🌙 Theming System

### Multi-theme Support
```typescript
// config/themes.ts
export const themes = {
  light: {
    colors: { /* ... */ },
    shadows: { /* ... */ },
  },
  dark: {
    colors: { /* ... */ },
    shadows: { /* ... */ },
  },
  'high-contrast': {
    colors: { /* ... */ },
    shadows: { /* ... */ },
  }
}
```

### CSS Variables + Tailwind
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

---

## ♿ Accessibilité (WCAG 2.1 AA)

- Radix UI primitives (accessibilité native)
- Navigation au clavier complète
- Screen reader support
- Focus management
- ARIA attributes
- Semantic HTML
- Color contrast ratios

---

## 📱 Progressive Web App

- Service Worker avec Workbox
- Offline support
- App manifest
- Install prompt
- Push notifications (optionnel)
- Background sync

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Composants UI
- Hooks
- Utils
- Store logic

### Integration Tests (React Testing Library)
- User flows
- Feature interactions

### E2E Tests (Playwright)
- Critical user journeys
- Cross-browser testing

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
# Next.js optimized production build
# - Static generation où possible
# - ISR (Incremental Static Regeneration)
# - Edge runtime pour certaines routes
```

### CI/CD Pipeline
- GitHub Actions
- Automated tests
- Type checking
- Linting
- Build verification
- Automated deployment

---

## 🔐 Security Best Practices

- Content Security Policy (CSP)
- XSS protection
- CSRF tokens
- Input validation (Zod)
- Sanitization des contenus
- Rate limiting
- Secure headers

---

## 📈 Monitoring & Analytics

- Vercel Analytics
- Error tracking (Sentry optionnel)
- Performance monitoring
- User behavior tracking
- Custom events

---

Cette architecture garantit:
✅ **Scalabilité** - Facile d'ajouter de nouvelles features
✅ **Maintenabilité** - Code organisé et testable
✅ **Performance** - Optimisations avancées
✅ **DX** - Excellente expérience développeur
✅ **UX** - Interface moderne et fluide
✅ **Accessibilité** - WCAG compliance
✅ **Type Safety** - TypeScript strict
✅ **Future-proof** - Technologies modernes et pérennes
