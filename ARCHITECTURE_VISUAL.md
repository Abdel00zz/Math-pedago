# Math-Pedago Architecture Visual Guide

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser / Client Side                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Application                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌────────────────────┐    ┌──────────────────────┐    │  │
│  │  │   index.tsx Entry  │    │   Error Boundary     │    │  │
│  │  │   Mount on #root   │───→│   Error Handling     │    │  │
│  │  └────────────────────┘    └──────────────────────┘    │  │
│  │           │                                             │  │
│  │           ▼                                             │  │
│  │  ┌────────────────────┐    ┌──────────────────────┐    │  │
│  │  │ App.tsx (Router)   │    │ Notification Prov.   │    │  │
│  │  │ Routes to Views    │───→│ Toast Notifications  │    │  │
│  │  └────────────────────┘    └──────────────────────┘    │  │
│  │           │                                             │  │
│  │           ▼                                             │  │
│  │  ┌─────────────────────────────────────────┐           │  │
│  │  │    AppContext (Global State)            │           │  │
│  │  │  ├─ Profile (name, classId)             │           │  │
│  │  │  ├─ Activities (50+ chapters)           │           │  │
│  │  │  ├─ Progress (per-chapter tracking)     │           │  │
│  │  │  ├─ currentView (login/dashboard/...)   │           │  │
│  │  │  └─ activitySubView (lesson/quiz/...)   │           │  │
│  │  └─────────────────────────────────────────┘           │  │
│  │           │                                             │  │
│  │           ├──────────────┬──────────────┬─────────────┤  │
│  │           ▼              ▼              ▼              ▼  │
│  │    ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │    │ Login    │   │Dashboard │  │Chapter   │  │Activity│ │
│  │    │ View     │   │ View     │  │Hub View  │  │View    │ │
│  │    └──────────┘   └──────────┘  └──────────┘  └────────┘ │
│  │         │              │              │            │      │
│  │         │              │              │     ┌──────┼──────┬──────┬─────┐
│  │         │              │              │     ▼      ▼      ▼      ▼     │
│  │         │              │              │  ┌─────┬─────┬──────┬────────┐ │
│  │         │              │              │  │Les-│Quiz │Video│Exer-   │ │
│  │         │              │              │  │son │     │     │cises   │ │
│  │         │              │              │  └─────┴─────┴──────┴────────┘ │
│  │         │              │              │                                │
│  │         │              └──────────────────────────────────────────────┤  │
│  │         │                                                              │  │
│  │         └──────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │              Data Layer                                     │          │
│  ├─────────────────────────────────────────────────────────────┤          │
│  │                                                             │          │
│  │  ┌───────────────────┐        ┌──────────────────────┐    │          │
│  │  │  localStorage     │        │  /public/chapters/   │    │          │
│  │  │  ┌─────────────┐  │        │  ├─ 1bsm/            │    │          │
│  │  │  │Profile      │  │        │  ├─ 1bse/            │    │          │
│  │  │  │Progress     │  │        │  ├─ 2bsm/            │    │          │
│  │  │  │Lesson Marks │  │◄──────►│  ├─ 2bse/            │    │          │
│  │  │  │Quiz Results │  │        │  ├─ tcs/             │    │          │
│  │  │  │Notifications│  │        │  └─ lessons/         │    │          │
│  │  │  └─────────────┘  │        │  50+ JSON Files      │    │          │
│  │  └───────────────────┘        └──────────────────────┘    │          │
│  │                                                             │          │
│  │  ┌──────────────────────────────────────────────────┐    │          │
│  │  │  /public/pictures/                               │    │          │
│  │  │  ├─ 1bsm/                                        │    │          │
│  │  │  ├─ 1bse/                                        │    │          │
│  │  │  ├─ 2bsm/                                        │    │          │
│  │  │  └─ 2bse/                                        │    │          │
│  │  │  Educational Images                             │    │          │
│  │  └──────────────────────────────────────────────────┘    │          │
│  │                                                             │          │
│  └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

         External Services (Optional)
              
         ┌──────────────────────────────────┐
         │   YouTube (Video Capsules)       │
         │   - Embedded via IFrame          │
         │   - Player progress tracked      │
         └──────────────────────────────────┘
         
         ┌──────────────────────────────────┐
         │   KaTeX / MathJax (Math Render)  │
         │   - LaTeX equation parsing       │
         │   - Client-side rendering       │
         └──────────────────────────────────┘
```

## Component Hierarchy

```
App (root)
├── LoginView
│   └── Profile Selection Form
│       ├── Name Input
│       └── Class Selection
│
├── DashboardView
│   ├── StandardHeader
│   ├── ChapterSection[] (categorized)
│   │   └── ChapterCard[]
│   │       ├── Progress Indicators
│   │       ├── Chapter Title
│   │       └── Action Buttons
│   ├── GlobalActionButtons
│   └── Notifications
│
├── ChapterHubView
│   ├── StandardHeader
│   ├── SessionStatus
│   ├── ChapterTable (multi-step)
│   │   ├── Lesson Progress
│   │   ├── Videos Progress
│   │   ├── Quiz Progress
│   │   ├── Exercises Progress
│   │   └── Submission Status
│   ├── GlobalActionButtons
│   └── Notifications
│
├── ActivityView (Multi-tab)
│   ├── Tab Navigation
│   ├── LessonView (when active)
│   │   ├── StandardHeader
│   │   ├── LessonNavigator (sticky TOC)
│   │   │   ├── Section Links
│   │   │   ├── Subsection Links
│   │   │   └── Auto-scroll sync
│   │   └── LessonDisplay
│   │       ├── LessonElement[] (recursive)
│   │       │   ├── Paragraph Elements
│   │       │   ├── Definition Boxes
│   │       │   ├── Theorem Boxes
│   │       │   ├── Practice Boxes
│   │       │   ├── Table Elements
│   │       │   ├── MathContent (KaTeX)
│   │       │   └── Images
│   │       └── Section Checkboxes (completion)
│   │
│   ├── VideoCapsules (when active)
│   │   ├── Video Card[] (YouTube)
│   │   │   ├── Thumbnail
│   │   │   ├── YouTube Player
│   │   │   ├── Duration
│   │   │   └── "Mark as Understood" Button
│   │   └── Progress Summary
│   │
│   ├── Quiz (when active)
│   │   ├── Question Navigation
│   │   ├── MCQQuestion[] or OrderingQuestion[]
│   │   │   ├── Question Text (with $math$)
│   │   │   ├── Options/Ordering Interface
│   │   │   ├── HintModal (optional)
│   │   │   └── Answer Selection
│   │   ├── Submit Button
│   │   ├── QuizResult (after submission)
│   │   │   ├── Score Display
│   │   │   ├── Time Spent
│   │   │   ├── Hints Used
│   │   │   └── Review Mode
│   │   └── Notifications
│   │
│   └── Exercises (when active)
│       ├── Exercise Card[] 
│       │   ├── Exercise Title
│       │   ├── Exercise Statement (with $math$)
│       │   ├── SubQuestion[]
│       │   │   ├── Question Text
│       │   │   ├── SubSubQuestion[] (optional)
│       │   │   └── Images[]
│       │   ├── HintModal
│       │   └── Feedback (Facile/Moyen/Difficile)
│       └── Work Submission Button
│
└── Global Components (all views)
    ├── ErrorBoundary (top level)
    ├── Notifications Portal
    │   └── Toast Notifications[]
    ├── NotificationCenter Modal
    └── MobileOrientationPrompt
```

## Data Flow for Quiz

```
User interacts with Quiz
        │
        ▼
┌──────────────────────────┐
│  MCQQuestion Component   │
│  - Renders options       │
│  - Handles selection     │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  useAppDispatch()                        │
│  - Dispatch UPDATE_QUIZ_ANSWER           │
│  - Payload: { qId, answer }              │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  AppContext Reducer                      │
│  - Update progress[chapterId].quiz       │
│  - Update answers object                 │
│  - Check if all answered                 │
│  - Persist to localStorage               │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  Quiz Component Re-renders               │
│  - Shows updated UI                      │
│  - Auto-save feedback visible            │
└──────────────────────────────────────────┘
        │
        ▼
User submits quiz
        │
        ▼
┌──────────────────────────────────────────┐
│  SUBMIT_QUIZ Action                      │
│  - Calculate score                       │
│  - Record duration                       │
│  - Record hints used                     │
│  - Set isSubmitted = true                │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  Notification Triggered                  │
│  - Toast: "Quiz submitted!"              │
│  - Show score                            │
│  - Option to review                      │
└──────────────────────────────────────────┘
        │
        ▼
Data persisted to localStorage
```

## Data Flow for Lesson Progress

```
User reads lesson
        │
        ▼
┌──────────────────────────────────────────┐
│  Lesson Section comes into view          │
│  - IntersectionObserver triggers         │
│  - useSectionObserver detects            │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  LessonProgressContext                   │
│  - Update currentSection                 │
│  - Record scroll position                │
│  - Update duration tracking              │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│  lessonProgressService                   │
│  - Persist to localStorage               │
│  - Update pedago.lessonProgress.v1       │
│  - Update pedago.lessonProgressMeta.v1   │
└──────────────────────────────────────────┘
        │
        ▼
User clicks checkbox on paragraph
        │
        ▼
┌──────────────────────────────────────────┐
│  markNode() action                       │
│  - Toggle node completion                │
│  - Update checklist percentage           │
└──────────────────────────────────────────┘
        │
        ▼
Updated UI reflects completion
```

## State Update Flow

```
┌─────────────────────────────────────────┐
│  Action Dispatched                      │
│  Example: CHANGE_VIEW                   │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  appReducer() processes action          │
│  - Immutable state updates              │
│  - Return new state object              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  useAppState() subscribers notified     │
│  - Components re-render                 │
│  - Only affected components update      │
└─────────────────────────────────────────┘
        │
        ├─────────────────────────────────┤
        ▼                                 ▼
┌──────────────────────┐  ┌──────────────────────┐
│  localStorage sync   │  │  UI Updates          │
│  - saveState()       │  │  - Components render │
│  - persist to DB_KEY │  │  - Visual changes    │
└──────────────────────┘  └──────────────────────┘
        │                         │
        ▼                         ▼
   State persisted         User sees changes
```

## Key Service Interactions

```
┌─────────────────────────────────────────────────┐
│         lessonProgressService                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ├─ readLessonProgress(chapterId)               │
│  │  └─ Returns: { nodePath: completion status }│
│  │                                              │
│  ├─ writeLessonProgress(chapterId, progress)   │
│  │  └─ Persists to localStorage                 │
│  │                                              │
│  ├─ markNode(chapterId, nodePath)               │
│  │  └─ Toggle single node status                │
│  │                                              │
│  ├─ toggleNode(chapterId, nodePath)             │
│  │  └─ Mark/unmark completion                   │
│  │                                              │
│  ├─ markAllNodesUpTo(chapterId, nodePath)       │
│  │  └─ Mark all nodes up to point               │
│  │                                              │
│  ├─ setLastVisited(chapterId, section)          │
│  │  └─ Remember last read section               │
│  │                                              │
│  └─ ensureLessonNodes(chapterId, structure)     │
│     └─ Initialize lesson node tracking          │
│                                                 │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      localStorage API                   │
│  Key: pedago.lessonProgress.v1          │
│  Key: pedago.lessonProgressMeta.v1      │
└─────────────────────────────────────────┘
```

## File Organization by Domain

```
LESSON DOMAIN:
├── components/lesson/
│   ├── LessonDisplay.tsx
│   ├── LessonNavigator.tsx
│   ├── LessonElement.tsx
│   └── SolutionModal.tsx
├── context/
│   ├── LessonProgressContext.tsx
│   └── NumberingContext.tsx
├── services/
│   └── lessonProgressService.ts
├── utils/
│   ├── lessonContentParser.tsx
│   ├── lessonParser.tsx
│   └── lessonProgressHelpers.ts
└── styles/
    ├── lesson-content.css
    ├── lesson-navigator.css
    └── lesson-boxes.css

QUIZ DOMAIN:
├── components/quiz/
│   ├── Quiz.tsx
│   ├── MCQQuestion.tsx
│   ├── OrderingQuestion.tsx
│   └── QuizResult.tsx
├── components/
│   ├── HintModal.tsx
│   └── (quiz state in AppContext)
└── styles/
    └── quiz.css

EXERCISE DOMAIN:
├── components/
│   ├── Exercises.tsx
│   ├── ExerciseEditor.tsx
│   └── HintModal.tsx
├── components/
│   ├── ImageUploadModal.tsx
│   └── ImageManager.tsx
└── types/Exercise interface

VIDEO DOMAIN:
├── components/
│   ├── VideoCapsules.tsx
│   ├── VideoEditor.tsx
├── types/Video interface
└── (video state in AppContext)

CORE DOMAIN:
├── App.tsx
├── AppContext.tsx
├── index.tsx
├── types.ts
├── constants.ts
└── styles/main-theme.css
```

