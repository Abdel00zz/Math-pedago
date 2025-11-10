# Math-Pedago: Comprehensive Project Overview

## Executive Summary

**Math-Pedago** is a modern, **React-based educational platform** designed to deliver interactive mathematics lessons to secondary school students (Moroccan curriculum from TCS through 2ème Bac levels). It's a **fully client-side web application** that supports lesson progression, video capsules, interactive quizzes, exercises with hints, and student progress tracking.

---

## 1. Application Type

**Type**: Single-Page Application (SPA) - Web-based Educational Platform

**Architecture**: Client-side React application with:
- No backend server required (data served as JSON from `/public`)
- Progressive Web App (PWA) capable with service worker support
- Responsive design for desktop and tablet/mobile devices
- Offline-ready with localStorage persistence

**Stack**:
- **Frontend Framework**: React 19.1.1 with React DOM
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6 with @vitejs/plugin-react
- **Styling**: Tailwind CSS 4.1 with PostCSS
- **Math Rendering**: KaTeX 0.16.11 (LaTeX equation rendering)
- **State Management**: React Context API + useReducer
- **Data Persistence**: Browser localStorage (no backend required)

**Supported Classes**:
- Tronc Commun Scientifique (TCS)
- 1ère Bac Sciences Expérimentales (1BSE)
- 1ère Bac Sciences Mathématiques (1BSM)
- 2ème Bac Sciences Expérimentales (2BSE)
- 2ème Bac Sciences Mathématiques (2BSM)
- 2ème Bac Économie (2BECO)

---

## 2. Main Features & Functionalities

### Core Features

#### 2.1 Authentication & User Management
- **Login System**: Simple profile selection with name and class selection
- **Session Persistence**: User profile stored in localStorage
- **Multi-class Support**: Students select their educational level

#### 2.2 Dashboard
- **Overview Cards**: Chapter cards showing progress status
- **Chapter Categorization**: 
  - In-progress chapters (en-cours)
  - Upcoming chapters (à-venir)
  - Completed chapters (achevé)
- **Quick Access**: Navigate directly to any chapter
- **Progress Visualization**: Visual indicators for completion percentage

#### 2.3 Chapter Hub (Work Plan)
- **Structured Learning Path**: Chapters organized by educational level and topic
- **Multi-part Activities**: Each chapter can include:
  - Lesson content
  - Video capsules
  - Quiz
  - Exercises
- **Session Dates**: Track when content was/will be presented
- **Progress Tracking**: Real-time progress monitoring across all components

#### 2.4 Lesson Content System
- **Rich Structured Content**: Hierarchical lesson structure with:
  - Sections
  - Subsections
  - Subsubsections
- **Multiple Content Types**:
  - Paragraphs with embedded mathematics
  - Definition boxes
  - Theorem boxes
  - Proposition boxes
  - Property boxes
  - Remark boxes
  - Example boxes
  - Interactive practice boxes
  - Explanation boxes
  - Tables (Markdown format)
- **Images**: Support for inline and positioned images with captions
- **Mathematics**: Full LaTeX support via KaTeX with inline ($...$) and display ($$...$$) modes

#### 2.5 Video Capsules System
- **YouTube Integration**: Embed YouTube videos directly
- **Progress Tracking**: Mark videos as "Well Understood" (Bien assimilé)
- **Duration Tracking**: Monitor time spent watching videos
- **Multiple Videos per Chapter**: Support for video collections

#### 2.6 Interactive Quiz System
- **Multiple Question Types**:
  - Multiple Choice Questions (MCQ)
  - Ordering/Sequencing Questions
- **Smart Navigation**: Jump between questions, view all at once
- **Answer Management**: Save and modify answers before submission
- **Hints System**: Hint support with explanation text
- **Instant Feedback**: Explanation text for correct and incorrect answers
- **Score Calculation**: Automatic scoring with percentage
- **Review Mode**: Review submitted answers with explanations
- **Duration Tracking**: Monitor time spent on quiz
- **Hint Usage Tracking**: Track number of hints used

#### 2.7 Exercises System
- **Sub-questions Support**: Multiple question levels with hierarchical structure
- **Hint System**: Contextual hints for specific questions
- **Feedback Mechanism**: Three-level difficulty feedback
  - Facile (Easy)
  - Moyen (Medium)
  - Difficile (Difficult)
- **Images in Exercises**: Support for exercise-related imagery
- **Flexible Content**: Free-form text exercises with student reflection

#### 2.8 Progress Tracking System

**Lesson Progress**:
- Section-by-section completion tracking
- Paragraph-level checkbox for completion
- Scroll position awareness (0-100%)
- Estimated reading time tracking
- Last visited section memory

**Quiz Progress**:
- Answer history
- Score tracking
- Submission status
- Current question position
- Time spent
- Hints used count

**Video Progress**:
- Individual video watched status
- Total duration
- "All watched" status

**Exercise Progress**:
- Per-exercise difficulty feedback
- Total time spent
- Work submission status

#### 2.9 Notifications System
- **UI Notification Center**: Modal-based notification center
- **Toast Notifications**: Transient pop-up notifications
- **Event-driven**: Automatic notifications for:
  - Chapter updates/new versions
  - Work submission confirmations
  - Resubmission requirements
- **Smart Deduplication**: Prevents duplicate notifications
- **Auto-cleanup**: Automatic expiration of old notifications

#### 2.10 Data Export
- **JSON Export**: Complete progress data export for teachers
- **Metadata Included**:
  - Student name and class
  - Submission timestamp
  - Chapter-by-chapter results
  - Quiz scores with raw data
  - Exercise feedback
  - Video progress
  - Duration metrics

#### 2.11 Mobile Responsiveness
- **Responsive Design**: Works on tablets and large phones
- **Orientation Detection**: Handles landscape/portrait switching
- **Touch-friendly UI**: Optimized for touch interactions
- **Mobile Prompt**: Suggests portrait orientation for better UX

---

## 3. Current Technologies

### Frontend Technologies
- **React 19.1.1**: UI framework with hooks
- **TypeScript 5.8.2**: Type-safe development
- **Vite 6**: Next-generation build tool
- **Tailwind CSS 4.1**: Utility-first CSS framework
- **KaTeX 0.16.11**: Mathematical equation rendering
- **UUID 13.0.0**: Unique identifier generation
- **@tailwindcss packages**:
  - @tailwindcss/forms: Form styling
  - @tailwindcss/typography: Typography plugin
  - @tailwindcss/aspect-ratio: Aspect ratio utilities
  - tailwindcss-animate: Animation utilities

### Development Tools
- **TypeScript**: Strict type checking
- **PostCSS**: CSS transformations
- **Autoprefixer**: Browser vendor prefixing
- **ESNext modules**: Modern JavaScript modules

### Data & Storage
- **JSON Files**: Chapter data stored in `/public/chapters/`
- **localStorage**: Browser-based persistence
- **No Database**: Fully client-side application

### Styling Architecture
- **CSS Variables**: Themeable design system
- **Custom CSS**: Domain-specific stylesheets
  - main-theme.css: Global styles and theming
  - lesson-boxes.css: Lesson content box styling
  - lesson-navigator.css: TOC and navigation
  - lesson-content.css: Lesson display styles
  - quiz.css: Quiz component styles
  - dashboard.css: Dashboard styles
  - chapter-hub.css: Chapter hub styles
  - coursera-theme.css: Additional theme styling

### Optional Technologies (Configured but not heavily used)
- **Resend 6.2.2**: Email service integration (available for future use)
- **@vercel/node**: Vercel serverless functions support

---

## 4. File & Folder Structure

```
Math-pedago/
├── App.tsx                           # Main app component (view routing)
├── index.tsx                         # App entry point with providers
├── index.html                        # HTML template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── sw.js                             # Service worker for PWA
├── constants.ts                      # Global constants
├── types.ts                          # TypeScript type definitions (1100+ lines)
│
├── components/                       # React components
│   ├── views/                        # Main page views
│   │   ├── LoginView.tsx             # Authentication
│   │   ├── DashboardView.tsx         # Chapter overview
│   │   ├── ChapterHubView.tsx        # Lesson progress hub
│   │   ├── ActivityView.tsx          # Multi-tab activity container
│   │   └── LessonView.tsx            # Lesson display
│   │
│   ├── lesson/                       # Lesson-specific components
│   │   ├── LessonDisplay.tsx         # Lesson content renderer
│   │   ├── LessonNavigator.tsx       # Table of contents (sticky)
│   │   ├── LessonElement.tsx         # Individual content elements
│   │   ├── HighlightableContent.tsx  # Selectable text content
│   │   └── SolutionModal.tsx         # Solution display modal
│   │
│   ├── quiz/                         # Quiz components
│   │   ├── Quiz.tsx                  # Quiz container
│   │   ├── MCQQuestion.tsx           # Multiple choice question
│   │   ├── OrderingQuestion.tsx      # Ordering question
│   │   └── QuizResult.tsx            # Quiz results display
│   │
│   ├── ui/                           # Basic UI components
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   │
│   ├── ChapterCard.tsx               # Chapter card display
│   ├── ChapterSection.tsx            # Chapter section grouping
│   ├── Exercises.tsx                 # Exercises container
│   ├── ExerciseEditor.tsx            # Exercise editing
│   ├── Exercises.tsx                 # Exercise display
│   ├── HintModal.tsx                 # Hint display modal
│   ├── SolutionModal.tsx             # Solution modal
│   ├── HelpModal.tsx                 # Help information modal
│   ├── VideoCapsules.tsx             # Video player container
│   ├── VideoEditor.tsx               # Video editing
│   ├── LessonEditor.tsx              # Lesson content editing
│   ├── QuizEditor.tsx                # Quiz editing
│   ├── MathContent.tsx               # Math rendering wrapper
│   ├── FormattedText.tsx             # Text formatting
│   ├── Modal.tsx                     # Generic modal
│   ├── Notifications.tsx             # Toast notifications portal
│   ├── NotificationCenter.tsx        # Notification center modal
│   ├── GlobalActionButtons.tsx       # Global action buttons
│   ├── GlobalWorkSubmit.tsx          # Work submission component
│   ├── StandardHeader.tsx            # Header component
│   ├── SessionStatus.tsx             # Session status display
│   ├── MobileOrientationPrompt.tsx   # Mobile orientation helper
│   ├── ConfirmationModal.tsx         # Confirmation dialogs
│   ├── ErrorBoundary.tsx             # Error boundary component
│   ├── ImageManager.tsx              # Image management
│   ├── ImageUploadModal.tsx          # Image upload modal
│   ├── RichTextEditor.tsx            # Rich text editing
│   ├── ChapterActionButton.tsx       # Chapter actions
│   ├── ChapterEditor.tsx             # Chapter editing
│   ├── ChapterTable.tsx              # Chapter data table
│   ├── BackButton.tsx                # Navigation back button
│   ├── Tooltip.tsx                   # Tooltip component
│   └── icons.tsx                     # Icon definitions
│
├── context/                          # React Context providers
│   ├── AppContext.tsx                # Main app state (2000+ lines)
│   ├── NotificationContext.tsx       # Notification state
│   ├── LessonProgressContext.tsx     # Lesson progress tracking
│   ├── LessonProgressContextNew.tsx  # Alternative progress logic
│   ├── NumberingContext.tsx          # Counter numbering
│   └── BoxNumberingContext.tsx       # Box numbering context
│
├── hooks/                            # Custom React hooks
│   ├── useMathJax.ts                 # KaTeX rendering
│   ├── useSectionObserver.ts         # Intersection observer for sections
│   └── useNotificationGenerator.ts   # Notification generation logic
│
├── services/                         # Business logic services
│   └── lessonProgressService.ts      # Lesson progress CRUD
│
├── utils/                            # Utility functions
│   ├── lessonContentParser.tsx       # JSON to React component parser
│   ├── lessonParser.tsx              # Alternative parser
│   ├── lessonProgressHelpers.ts      # Progress calculation helpers
│   ├── chapterStatusHelpers.ts       # Chapter status logic
│   ├── parser.ts                     # Generic parsers
│   ├── mathJaxDiagnostic.ts          # Math rendering diagnostics
│   ├── versioning.ts                 # Version management
│   ├── fileUtils.ts                  # File utilities
│   ├── intelligentProgressCalculator.ts # Progress calculations
│   └── mathText.ts                   # Math text utilities
│
├── src/
│   └── styles/                       # CSS stylesheets
│       ├── main-theme.css            # Global styles (1000+ lines)
│       ├── lesson-boxes.css          # Lesson box styles
│       ├── lesson-navigator.css      # Navigator styles
│       ├── lesson-content.css        # Lesson display styles
│       ├── dashboard.css             # Dashboard styles
│       ├── quiz.css                  # Quiz styles
│       ├── chapter-hub.css           # Chapter hub styles
│       ├── coursera-theme.css        # Alternative theme
│       ├── global.css                # Global utilities
│       └── typography.css            # Typography rules
│
├── data/                             # Static data files
│   └── chaptersData.ts               # Chapter metadata
│
├── public/
│   ├── chapters/                     # Course content (JSON files)
│   │   ├── 1bse/                     # 1ère Bac SE
│   │   ├── 1bsm/                     # 1ère Bac SM
│   │   ├── 2bse/                     # 2ème Bac SE
│   │   ├── 2bsm/                     # 2ème Bac SM
│   │   ├── tcs/                      # Tronc Commun
│   │   │   └── lessons/              # Separate lesson JSON files
│   │   └── (each class has lessons/ subdirectory)
│   │
│   ├── pictures/                     # Educational images
│   │   ├── 1bsm/
│   │   ├── 2bsm/
│   │   ├── 1bse/
│   │   └── 2bse/
│   │
│   ├── manifest.json                 # PWA manifest
│   ├── manifest.webmanifest         # Web manifest
│   └── icone.png                     # App icon
│
├── api/                              # API endpoints (future/optional)
│   └── submit-work.ts                # Work submission endpoint stub
│
├── Documentation/
│   ├── architecture.md               # Detailed architecture (450+ lines)
│   ├── GUIDE_COMPLET_CREATION_LECONS.md
│   ├── guide_lesson_structure.md
│   ├── guide_json.md
│   ├── guide_attention.md
│   └── CHANGELOG_CHAPTER_MODES.md
│
├── Python Utilities/
│   ├── admin_app.py                  # Admin panel (186KB)
│   ├── validate_system.py            # System validation
│   ├── optimize_structure.py         # Structure optimization
│   ├── reorganize_chapters_by_class.py
│   ├── fix_latex_formatting.py
│   └── clear_cache.bat, commit_update.bat (Windows scripts)
│
└── Configuration Files/
    ├── .env.example
    ├── .gitignore
    ├── components.json                # shadcn/ui config
    ├── metadata.json
    └── README.md
```

---

## 5. Key Components & Pages

### 5.1 Main Views (Pages)

| Component | Purpose | Features |
|-----------|---------|----------|
| **LoginView** | Authentication/Profile Selection | Name input, class selection, profile persistence |
| **DashboardView** | Chapter Overview & Quick Start | Chapter cards, progress categories (in-progress/upcoming/done), greeting message, class display |
| **ChapterHubView** | Detailed Chapter Navigation | Multi-step activity layout, progress indicators, session date display, work submission |
| **ActivityView** | Tab-based Learning Interface | Tabs for Lesson/Videos/Quiz/Exercises, dynamic sub-view routing |
| **LessonView** | Lesson Content Display | Full-featured lesson rendering with TOC, section navigation |

### 5.2 Content Components

| Component | Purpose |
|-----------|---------|
| **LessonDisplay** | Renders hierarchical lesson structure |
| **LessonNavigator** | Sticky table of contents with auto-scroll |
| **LessonElement** | Individual lesson elements (boxes, paragraphs, tables) |
| **MathContent** | KaTeX equation rendering |
| **HighlightableContent** | Selectable lesson text for comprehension |

### 5.3 Activity Components

| Component | Purpose |
|-----------|---------|
| **Quiz** | Quiz container with question navigation |
| **Exercises** | Exercise display with hints |
| **VideoCapsules** | YouTube video player with progress tracking |
| **GlobalActionButtons** | Download/submit actions |

### 5.4 Modal Components

| Component | Purpose |
|-----------|---------|
| **HintModal** | Display hints for questions/exercises |
| **SolutionModal** | Show solution explanations |
| **HelpModal** | General help information |
| **ConfirmationModal** | User confirmations |
| **ImageUploadModal** | Image management interface |
| **OrientationModal** | Mobile orientation guidance |

### 5.5 Data & UI Components

| Component | Purpose |
|-----------|---------|
| **ChapterCard** | Dashboard chapter card |
| **ChapterSection** | Chapter organization |
| **NotificationCenter** | Notification management modal |
| **Notifications** | Toast notification portal |
| **SessionStatus** | Session progress display |

---

## 6. State Management Architecture

### 6.1 App Context (AppContext.tsx)

**Main State Object (AppState)**:
```typescript
{
  view: 'login' | 'dashboard' | 'work-plan' | 'activity'
  profile: { name, classId }
  activities: { [chapterId]: Chapter }
  activityVersions: { [chapterId]: version }
  progress: { [chapterId]: ChapterProgress }
  currentChapterId: string | null
  currentActiveChapterId: string | null
  activitySubView: 'videos' | 'quiz' | 'exercises' | 'lesson' | null
  isReviewMode: boolean
  chapterOrder: string[]
}
```

**Key Reducer Actions**:
- `INIT`: Restore from localStorage
- `LOGIN`: User authentication
- `CHANGE_VIEW`: Navigation between views
- `NAVIGATE_QUIZ`: Move between quiz questions
- `UPDATE_QUIZ_ANSWER`: Save quiz answers
- `SUBMIT_QUIZ`: Submit quiz with scoring
- `UPDATE_LESSON_PROGRESS`: Track lesson reading
- `MARK_VIDEO_WATCHED`: Video completion
- `UPDATE_EXERCISE_FEEDBACK`: Exercise difficulty feedback
- `SUBMIT_WORK`: Chapter work submission
- `SYNC_ACTIVITIES`: Catalog synchronization
- `SET_CHAPTER_STATUS`: Chapter status management

### 6.2 Notification Context (NotificationContext.tsx)

**Features**:
- Queue-based notification system
- Max 3 visible, 10 pending notifications
- Auto-deduplication
- 60-second cleanup interval
- Configurable auto-dismiss duration

### 6.3 Lesson Progress Context (LessonProgressContext.tsx)

**Features**:
- Hierarchical outline tracking
- Per-paragraph completion checkboxes
- Scroll position awareness (0-100%)
- Section/subsection metadata
- localStorage persistence
- Section observer via IntersectionObserver

---

## 7. Data Structure

### 7.1 Chapter JSON Format

**Location**: `/public/chapters/{class}/{chapter}.json`

**Structure**:
```json
{
  "class": "1bsm",
  "chapter": "Chapter Title",
  "sessionDates": ["2024-01-15", "2024-01-16"],
  "lessonFile": "lessons/chapter_lesson.json",
  "videos": [
    {
      "id": "vid1",
      "title": "Video Title",
      "youtubeId": "dQw4w9WgXcQ",
      "duration": "5:30",
      "description": "Video description"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Question with $LaTeX$ math",
      "type": "mcq",
      "options": [
        {
          "text": "Option text with $math$",
          "isCorrect": true,
          "explanation": "Why this is correct"
        }
      ],
      "hints": ["Hint 1", "Hint 2"]
    }
  ],
  "exercises": [
    {
      "id": "ex1",
      "title": "Exercise Title",
      "statement": "Exercise statement with $math$",
      "sub_questions": [
        {
          "text": "Sub-question",
          "sub_sub_questions": [
            {
              "text": "Detailed question"
            }
          ],
          "images": [
            {
              "id": "img1",
              "path": "pictures/chapter/image.png",
              "caption": "Image caption",
              "size": "medium"
            }
          ]
        }
      ],
      "hint": [
        {
          "text": "Hint text",
          "questionNumber": "1a"
        }
      ]
    }
  ]
}
```

### 7.2 Lesson JSON Format

**Location**: `/public/chapters/{class}/lessons/{lesson}.json`

**Structure**:
```json
{
  "header": {
    "title": "Lesson Title",
    "subtitle": "Optional subtitle",
    "classe": "1bsm",
    "chapter": "Chapter Name"
  },
  "sections": [
    {
      "title": "Section 1",
      "intro": "Optional introduction",
      "subsections": [
        {
          "title": "Subsection 1.1",
          "subsubsections": [
            {
              "title": "Subsubsection 1.1.1",
              "elements": [
                {
                  "type": "p",
                  "content": "Paragraph with $math$ support"
                },
                {
                  "type": "definition-box",
                  "content": ["Definition line 1", "Definition line 2"],
                  "preamble": "Definition"
                },
                {
                  "type": "table",
                  "content": "| Header | Header |\n|--------|--------|"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.3 Progress JSON Format

**Location**: `localStorage` under `pedagoEleveData_V4.7_React`

**Stored Data**:
- User profile
- Per-chapter progress:
  - Quiz: answers, score, duration, hints used
  - Lesson: sections read, paragraphs completed
  - Videos: watched status
  - Exercises: feedback per exercise
- Chapter statuses (en-cours, à-venir, achevé)
- Activity versions for update detection

---

## 8. Key Technologies Deep Dive

### 8.1 KaTeX Integration (Math Rendering)

- **Full LaTeX Support**: Inline (`$...$`) and display (`$$...$$`) modes
- **Automatic Rendering**: via `useMathJax` hook
- **Performance**: Client-side rendering with error handling
- **Diagnostic Tool**: `window.diagnoseMathJax()` for debugging

### 8.2 Tailwind CSS Theme System

**Color Variables** (CSS HSL format):
- Primary, Secondary, Destructive, Muted, Accent
- Background, Foreground, Border, Input, Ring
- Card, Popover colors
- Dark mode support via `darkMode: "class"`

**Responsive Breakpoints**:
- 768px: tablet
- 1024px: desktop
- Custom landscape: `@media (orientation: landscape)`

### 8.3 Service Worker & PWA

- **Location**: `/sw.js`
- **Features**: Offline caching, offline operation capability
- **Manifest**: PWA manifest for installation

---

## 9. Development Features

### 9.1 Development Server
```bash
npm run dev      # Start Vite dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
```

### 9.2 Admin Panel
- **Location**: `admin_app.py`
- **Purpose**: Chapter management, content editing, data validation
- **Size**: 186KB (comprehensive admin interface)

### 9.3 Utility Scripts
- **validate_system.py**: System validation
- **optimize_structure.py**: Content optimization
- **reorganize_chapters_by_class.py**: Chapter reorganization

---

## 10. Current Implementation Status

### Completed Features
- Full lesson content system with hierarchical structure
- Interactive quiz with MCQ and ordering questions
- Exercise system with hints and feedback
- Video capsule integration
- Progress tracking (all components)
- localStorage persistence
- Responsive design for mobile/tablet/desktop
- PWA-ready with service worker
- Notifications system
- Work submission capability
- Data export for teachers
- 50+ mathematics chapters across 6 educational levels

### Partial/Experimental
- Admin interface (Python-based)
- Alternative lesson progress context
- Advanced optimization features

### Future-Ready
- Backend API integration stubs
- Email service integration (Resend configured)
- Serverless deployment (Vercel functions)

---

## 11. Notable Implementation Patterns

### 11.1 State Management
- **Compound Components Pattern**: Flexible component composition
- **Provider Pattern**: Centralized context management
- **Custom Hooks**: `useMathJax`, `useSectionObserver`, `useNotificationGenerator`
- **Service Layer**: `lessonProgressService` for persistence

### 11.2 Performance Optimizations
- `useMemo` for expensive calculations
- `useCallback` for stable handlers
- Lazy loading of chapter JSON files
- Virtual scrolling potential in long lists
- MathJax rendering only when visible

### 11.3 Code Organization
- **Separation of Concerns**: Clear component/service/util boundaries
- **Type Safety**: Strict TypeScript throughout
- **Modular Styles**: Domain-specific CSS files
- **Reusable Utilities**: Parser and helper functions

---

## 12. Statistics

- **Total Components**: 30+ React components
- **Lines of Code**: ~8,300+ lines in components alone
- **Custom Hooks**: 3 hooks
- **Services**: 1 main service
- **Style Files**: 10 CSS files (190KB+)
- **Chapters**: 50+ JSON chapter files
- **TypeScript Definitions**: 300+ type definitions
- **Documentation Files**: 7 markdown guides

---

## Summary for Rebuild

When rebuilding this platform from scratch, you should:

1. **Preserve the comprehensive type system** - The types.ts is well-designed
2. **Maintain the Context-based state management** - It works well for this scope
3. **Keep the three-tier content structure** - Lessons, Quiz, Exercises, Videos
4. **Preserve the persistence strategy** - localStorage is appropriate for this use case
5. **Keep the responsive design approach** - Mobile-first with tablet/desktop support
6. **Maintain KaTeX integration** - Essential for mathematics content
7. **Preserve the modular CSS architecture** - Easy to theme and maintain

The platform is well-architected, feature-complete for its scope, and ready for modernization with the latest React patterns and optimizations.

