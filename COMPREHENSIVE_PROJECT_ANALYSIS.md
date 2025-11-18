# Math-pedago - Comprehensive Project Analysis & Documentation

## Project Overview

**Math-pedago** (Center Scientific of Mathematics) is a comprehensive Progressive Web Application (PWA) designed for Moroccan high school mathematics education. The platform provides an interactive learning experience with lessons, video capsules, quizzes, exercises, and competitive exam preparation.

---

## 1. MAIN SECTIONS & PAGES

### 1.1 Login View (`LoginView.tsx`)
**Purpose:** User authentication and profile selection

**Features:**
- **Two modes:** Regular school mode and Concours (competitive exam) mode
- **Profile persistence:** Name and class selection stored in localStorage
- **Class options:**
  - Tronc Commun Scientifique (TCS)
  - 1ère Bac Sciences Expérimentales (1BSE)
  - 1ère Bac Sciences Mathématiques (1BSM)
  - 2ème Bac Sciences Expérimentales (2BSE)
  - 2ème Bac Sciences Mathématiques (2BSM)
  - Préparation Concours (Médecine, ENSAM, ENSA)

**Design Elements:**
- Centered card layout with psychology icon
- Material Symbols icons
- Space Grotesk font for headings
- Locked name field after first login (prevents accidental changes)

---

### 1.2 Dashboard View (`DashboardView.tsx`)
**Purpose:** Main hub showing student's learning progress and available chapters

**Key Features:**
- **Personalized greeting** with animated typing effect for student name
- **Progress summary cards** showing:
  - Chapters in progress
  - Mastered chapters
  - Quiz validations
  - Available chapters
- **Session-based prioritization:**
  - LIVE sessions appear first (active now)
  - Upcoming sessions appear second
  - Other chapters organized by status
- **Chapter organization:**
  - "Your current learning" section (en-cours)
  - "Available chapters" section (à-venir)
  - "Mastered chapters" section (achevé)

**Design System:**
- Gradient background with SVG pattern overlay
- Animated student name with glowing effect
- Progress metrics with icons
- Responsive card grid layout

**User Journey:**
1. User sees personalized greeting
2. Views progress summary
3. Selects a chapter to work on
4. Redirected to Chapter Hub

---

### 1.3 Chapter Hub View (`ChapterHubView.tsx`)
**Purpose:** Overview of all learning resources for a specific chapter

**Learning Steps (in order):**

#### Step 1: Lesson (Leçon)
- **Icon:** auto_stories
- **Status indicators:** locked | todo | in-progress | completed
- **Progress tracking:** Paragraph completion percentage
- **Button:** "Commencer la leçon" / "Continuer la leçon" / "Revoir la leçon"

#### Step 2: Videos (Capsules Vidéo)
- **Icon:** play_circle
- **Unlock condition:** Lesson must be started
- **Progress tracking:** Videos marked as "assimilated"
- **Button:** "Regarder les vidéos"

#### Step 3: Quiz
- **Icon:** quiz
- **Unlock condition:** Videos must be watched
- **Progress tracking:** Score percentage, time spent
- **Button:** "Commencer le quiz" / "Reprendre le quiz" / "Revoir le quiz"

#### Step 4: Exercises
- **Icon:** edit_note
- **Unlock condition:** Quiz must be completed
- **Progress tracking:** Exercises marked with difficulty feedback
- **Button:** "Faire les exercices"

#### Step 5: Submit Work
- **Icon:** send
- **Unlock condition:** Exercises must be completed
- **Special feature:** "Triple-click on verified badge" easter egg allows resubmission
- **Button:** "Soumettre le travail"

**Design Features:**
- **Stage breadcrumb navigation** at top
- **Progress bars** for each step
- **Locked/unlocked visual states**
- **Confetti animation** on work submission

---

### 1.4 Activity View (`ActivityView.tsx`)
**Purpose:** Container for the actual learning activities (lesson, videos, quiz, exercises)

**Sub-views:**
1. **Lesson View** - Interactive lesson with mathematical content
2. **Videos View** - YouTube video capsules
3. **Quiz View** - Interactive quiz interface
4. **Exercises View** - Practice problems with hints

**Navigation:**
- **Stage breadcrumb** shows current position
- **Back button** returns to Chapter Hub
- **Back button highlights** when all exercises completed

---

### 1.5 Lesson View (`LessonView.tsx`)
**Purpose:** Display structured lesson content with mathematical formulas

**Features:**
- **Hierarchical structure:**
  - Sections (numbered with Roman numerals)
  - Subsections (numbered)
  - Sub-subsections (lettered a, b, c...)
- **Interactive elements:**
  - Checkboxes to mark paragraphs as read
  - Practice boxes with solutions
  - Definition, theorem, property, example boxes
  - Image support with various positions
- **Progress tracking:**
  - Paragraph completion saved to localStorage
  - Scroll position tracking
  - Time spent tracking
- **Math rendering:**
  - MathJax integration for LaTeX formulas
  - Responsive formula sizing
  - Proper vertical alignment

**Special Content Types:**
- `definition-box` - Definitions with blue accent
- `theorem-box` - Theorems with formal styling
- `proposition-box` - Mathematical propositions
- `property-box` - Mathematical properties
- `remark-box` - Remarks and notes
- `example-box` - Worked examples
- `practice-box` - Interactive practice with solution modal
- `explain-box` - Explanations with detailed solutions

---

### 1.6 Videos View (`VideoCapsules.tsx`)
**Purpose:** YouTube video player with progress tracking

**Features:**
- **Grid layout** of video cards
- **YouTube embed** player
- **"Bien assimilé" button** to mark video as watched
- **Progress bar** showing completion percentage
- **Thumbnail previews** from YouTube
- **Duration display** for each video

**Video Card Elements:**
- Play button overlay
- Video title
- Duration badge
- Checkmark when watched

---

### 1.7 Quiz View (`Quiz.tsx`)
**Purpose:** Interactive assessment with multiple question types

**Question Types:**
1. **Multiple Choice Questions (MCQ)**
   - Single correct answer
   - Multiple choice with radio buttons
   - Explanation after submission

2. **Ordering Questions**
   - Drag and drop interface
   - Steps to arrange in correct order
   - Visual feedback on correctness

**Features:**
- **Navigation window:** Shows 7 questions at a time, scrollable
- **Timer:** Tracks time spent
- **Hint system:** Progressive hints (costs points)
- **Answer review mode:** After submission, review all answers
- **Progress tracking:**
  - Answered vs total questions
  - Current score
  - Time spent
  - Hints used

**UI Elements:**
- **Question navigation dots:** Click to jump to any question
- **Color coding:**
  - Blue: Current question
  - Green: Answered correctly (review mode)
  - Red: Answered incorrectly (review mode)
  - Gray: Not answered
- **Hint modal:** Shows progressive hints
- **Result screen:** Final score, time, and review option

---

### 1.8 Exercises View (`Exercises.tsx`)
**Purpose:** Practice problems with hierarchical structure and hints

**Features:**
- **Nested structure:**
  - Main exercise statement
  - Sub-questions (numbered)
  - Sub-sub-questions (lettered)
- **Image support:**
  - Multiple positions (top, bottom, left, right, inline)
  - Caption support
  - Responsive sizing
- **Hint system:**
  - Multiple hints per exercise
  - Progressive reveal
  - Question-specific hints
- **Difficulty feedback:**
  - "Facile" (Easy)
  - "Moyen" (Medium)
  - "Difficile" (Difficult)
  - "Non traité" (Not attempted)
- **Progress tracking:**
  - Feedback saved per exercise
  - Completion percentage
  - "All exercises completed" detection

**Design:**
- Card-based layout
- Collapsible sections
- Math formula support
- Hint modal with formatted content

---

### 1.9 Concours Views
Set of views for competitive exam preparation (Médecine, ENSAM, ENSA)

#### 1.9.1 Concours View (`ConcoursView.tsx`)
- **Landing page** for competitive exams
- **Three concours types:**
  - Médecine (Medicine)
  - ENSAM (Engineering)
  - ENSA (Applied Sciences)
- **Gradient background** with geometric SVG patterns
- **Stats display:** Years available, themes count

#### 1.9.2 Concours List View (`ConcoursListView.tsx`)
- **Browse by year** or by theme
- **Exam selection:** Choose specific year's exam
- **Theme browsing:** All themes across years

#### 1.9.3 Concours Year View (`ConcoursYearView.tsx`)
- **Theme cards** for specific year
- **PDF download** option
- **Resume and quiz** access

#### 1.9.4 Concours Resume View (`ConcoursResumeView.tsx`)
- **Structured summary** of exam topic
- **Checkbox progress:** Mark sections as reviewed
- **Section navigation:** Previous/Next buttons
- **Progress bar:** Completion tracking

#### 1.9.5 Concours Quiz View (`ConcoursQuizView.tsx`)
- **Similar to regular quiz** but for concours
- **Exam-specific questions**
- **Result tracking**

---

## 2. COMPONENTS ARCHITECTURE

### 2.1 Core Components

#### ChapterCard.tsx
- **Displays chapter information** on dashboard
- **Session indicators:** LIVE badge, upcoming badge
- **Update alerts:** Glowing animation for new content
- **Progress indicators:** Lesson, videos, quiz, exercises status
- **Work submission badge:** Shows verification checkmark

#### ChapterSection.tsx
- **Groups chapters** by status (in progress, completed, available)
- **Section title** with icon
- **Grid layout** for chapter cards

#### StageBreadcrumb.tsx
- **Visual navigation** showing current learning stage
- **Clickable stages** to jump between activities
- **Completion indicators** (checkmarks)
- **Current stage highlight**

#### LessonStageNavigation.tsx
- **Horizontal tab navigation** for lesson stages
- **Icons for each stage:** lesson, videos, quiz, exercises
- **Active state styling**
- **Click to navigate**

#### StandardHeader.tsx
- **Reusable header** component
- **Back button** with icon
- **Title and subtitle**
- **Badge support** (e.g., "LIVE")
- **Responsive layout**

---

### 2.2 Lesson Components

#### LessonDisplay.tsx
- **Main lesson renderer**
- **Hierarchical structure display**
- **Section numbering** (Roman, Arabic, alphabetic)
- **Element rendering** delegation
- **MathJax integration**

#### LessonElement.tsx
- **Renders individual lesson elements**
- **Box components:** Definition, theorem, example, etc.
- **Interactive boxes:** Practice, explain
- **Image handling**
- **Table rendering** (Markdown to HTML)

#### MathTitle.tsx
- **Special component** for titles with math
- **LaTeX formula support** in headings
- **Proper spacing**

#### SolutionModal.tsx
- **Modal for practice solutions**
- **Formatted math content**
- **Close button**

#### LessonNavigator.tsx
- **Table of contents** sidebar
- **Jump to section** links
- **Progress indicators**
- **Scroll spy** (highlights current section)

---

### 2.3 Quiz Components

#### Quiz.tsx
- **Main quiz controller**
- **Question navigation**
- **Timer management**
- **State persistence**

#### MCQQuestion.tsx
- **Multiple choice interface**
- **Radio button options**
- **Answer highlighting** (correct/incorrect)
- **Explanation display**

#### OrderingQuestion.tsx
- **Drag and drop interface**
- **Step reordering**
- **Visual feedback**

#### ActiveQuiz.tsx
- **Quiz in progress** component
- **Navigation dots**
- **Submit functionality**

#### QuizResult.tsx
- **Final score display**
- **Time breakdown**
- **Review button**
- **Performance metrics**

---

### 2.4 UI Components

#### Modal.tsx
- **Generic modal container**
- **Backdrop with blur**
- **Close button**
- **Configurable header**
- **Scrollable content**

#### HintModal.tsx
- **Progressive hint display**
- **Math formula support**
- **Close functionality**
- **Hint counter**

#### HelpModal.tsx
- **Tabbed help interface**
- **Usage instructions**
- **Contact information** (Facebook, WhatsApp)
- **Feature explanations**

#### ConfirmationModal.tsx
- **Action confirmation dialogs**
- **Yes/No buttons**
- **Warning messages**

#### Notifications.tsx
- **Toast notification system**
- **Success, info, warning, error types**
- **Auto-dismiss**
- **Queue management**

#### NotificationCenter.tsx
- **Notification history**
- **Category filtering**
- **Time display**
- **Read/unread states**

---

### 2.5 Utility Components

#### FormattedText.tsx
- **Renders formatted text** with math
- **MathJax processing**
- **Safe HTML rendering**

#### MathContent.tsx
- **Math formula renderer**
- **LaTeX support**
- **Responsive sizing**
- **Color inheritance**

#### BackButton.tsx
- **Reusable back navigation**
- **Icon with text**
- **Hover effects**

#### GlobalActionButtons.tsx
- **Floating action buttons** (bottom-right)
- **Help button**
- **Notification button**
- **Badge for unread count**

#### Tooltip.tsx
- **Hover tooltips**
- **Positioned overlays**

#### ImageManager.tsx
- **Image upload** functionality
- **Preview**
- **Cropping**

#### SessionStatus.tsx
- **Shows session info** (LIVE, upcoming)
- **Countdown timer**

---

## 3. NAVIGATION STRUCTURE & ROUTING

### 3.1 View States (in AppContext)
```
- 'login' → LoginView
- 'dashboard' → DashboardView
- 'work-plan' → ChapterHubView
- 'activity' → ActivityView
  - subView: 'lesson' | 'videos' | 'quiz' | 'exercises'
- 'concours' → ConcoursView
- 'concours-list' → ConcoursListView
- 'concours-year' → ConcoursYearView
- 'concours-resume' → ConcoursResumeView
- 'concours-quiz' → ConcoursQuizView
```

### 3.2 Navigation Flow

**Primary Flow:**
```
Login → Dashboard → Chapter Hub → Activity View (Lesson/Videos/Quiz/Exercises)
                                      ↓
                                Submit Work → Dashboard
```

**Concours Flow:**
```
Login (Concours) → Concours → Concours List → Concours Year → Resume → Quiz
```

### 3.3 URL State Management
- **No traditional routing** (single-page app)
- **State-based navigation** via AppContext
- **SessionStorage:** Current concours type
- **LocalStorage:** All progress, profile data

---

## 4. DESIGN SYSTEM

### 4.1 Color Palette

#### Primary Colors
```css
--primary-color: #4255ff (Coursera blue)
--primary-color-strong: #2f3ab2 (darker blue)
--primary-soft: rgba(66, 85, 255, 0.12) (light blue tint)
--secondary-color: #5f7dff (lighter blue)
--secondary-soft: rgba(95, 125, 255, 0.14)
```

#### Text Colors
```css
--coursera-black: #101828 (main headings)
--coursera-text: #1d2939 (body text)
--coursera-text-light: #475467 (secondary text)
--text-muted: #667085 (disabled/muted)
```

#### Status Colors
```css
--success-color: #22c55e (green)
--error-color: #ef476f (red)
--warning-color: #fbbf24 (amber)
--info-color: #3B82F6 (blue)
```

#### Surface Colors
```css
--surface-app: #f7f8ff (page background)
--surface-card: #ffffff (card background)
--surface-muted: #eef1ff (muted backgrounds)
--border-subtle: rgba(15, 23, 42, 0.08)
--border-strong: rgba(15, 23, 42, 0.16)
```

#### Lesson Box Colors
```css
--lesson-accent: #0056d2 (definitions, theorems)
--lesson-inline-accent: #e96d2f (examples, remarks)
```

### 4.2 Typography

#### Font Families
```css
/* Headings */
font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;

/* Body text */
font-family: 'Outfit', 'Inter', system-ui, sans-serif;

/* Display */
font-family: 'Sora', 'Outfit', sans-serif;

/* Monospace (code) */
font-family: 'DM Mono', 'Consolas', monospace;
```

#### Font Sizes (Responsive)
```css
h1: clamp(1.75rem, 3.5vw, 2.5rem)
h2: clamp(1.6rem, 3.2vw, 2.2rem)
h3: clamp(1.5rem, 3vw, 2rem)
h4: clamp(1.25rem, 2.5vw, 1.5rem)
body: 16px (base)
```

### 4.3 Spacing System
```css
--spacing-xs: 0.5rem (8px)
--spacing-sm: 0.75rem (12px)
--spacing-md: 1.25rem (20px)
--spacing-lg: 1.75rem (28px)
--spacing-xl: 2.5rem (40px)
```

### 4.4 Border Radius
```css
--radius-sm: 0.5rem (8px)
--radius-md: 0.75rem (12px)
--radius-lg: 1rem (16px)
--radius-xl: 1.5rem (24px)
```

### 4.5 Shadows
```css
--shadow-sm: 0 6px 18px rgba(15, 23, 42, 0.05)
--shadow-md: 0 12px 28px rgba(15, 23, 42, 0.08)
--shadow-lg: 0 22px 44px rgba(15, 23, 42, 0.12)
--shadow-claude: 0 4px 12px rgba(0, 0, 0, 0.2)
--glow-primary: 0 0 20px rgba(255, 107, 53, 0.3)
```

### 4.6 Animations

#### Keyframes
```css
fadeIn: opacity 0 → 1
slideInUp: translateY(10px) → 0
blink: opacity pulse
textGlow: text-shadow glow effect
gentleGlow: border-color pulse
alertBeacon: attention grabber
```

#### Usage
- **Page transitions:** fadeIn (0.3s)
- **Cards:** slideInUp (0.4s)
- **Session badges:** textGlow (2.5s infinite)
- **Update alerts:** gentleGlow, alertBeacon

### 4.7 Background Patterns

#### App Background
```css
/* Gradient overlay */
radial-gradient(circle at 0% 0%, rgba(95, 125, 255, 0.14), transparent)
radial-gradient(circle at 100% 0%, rgba(66, 85, 255, 0.12), transparent)

/* SVG pattern */
Geometric grid with circles (160px × 160px repeat)
```

#### Concours Background
```css
/* Gradient */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Geometric shapes (SVG) */
Hexagon pattern
Blurred rectangles and circles
```

---

## 5. FEATURES & USER FLOWS

### 5.1 Session Management

#### Session Types
1. **Active Sessions (LIVE)**
   - Current date/time within session range
   - Glowing badge animation
   - Priority placement on dashboard
   - Auto-accessible regardless of chapter status

2. **Upcoming Sessions**
   - Session scheduled for future
   - "Prochainement" badge
   - Visible countdown
   - Pre-accessible for preparation

3. **No Session**
   - Regular chapter display
   - Access based on isActive flag

#### Session Date Format
```json
"sessionDates": [
  "2025-11-18 08:00 - 2025-11-18 18:00",
  "2025-11-19 08:00 - 2025-11-19 18:00"
]
```

### 5.2 Progress Tracking

#### Progress Types

**1. Lesson Progress**
```typescript
{
  isRead: boolean
  duration: number (seconds)
  scrollProgress: number (0-100)
  lastReadSection: string
  completedParagraphs: number
  totalParagraphs: number
}
```

**2. Videos Progress**
```typescript
{
  watched: { [videoId: string]: boolean }
  allWatched: boolean
  duration: number (seconds)
}
```

**3. Quiz Progress**
```typescript
{
  answers: { [qId: string]: string | string[] }
  isSubmitted: boolean
  score: number
  allAnswered: boolean
  currentQuestionIndex: number
  duration: number (seconds)
  hintsUsed: number
}
```

**4. Exercises Progress**
```typescript
{
  feedback: { [exId: string]: Feedback }
  duration: number (seconds)
  allCompleted: boolean
}
```

**5. Chapter Progress**
```typescript
{
  status: 'a-venir' | 'en-cours' | 'acheve'
  isWorkSubmitted: boolean
  submittedAt: number (timestamp)
  hasUpdate: boolean
  lesson: LessonProgress
  videos: VideosProgress
  quiz: QuizProgress
  exercises: ExercisesProgress
}
```

### 5.3 Work Submission Flow

1. **Check prerequisites:**
   - Lesson must be started (completedParagraphs > 0)
   - Videos must be watched (allWatched = true)
   - Quiz must be submitted (isSubmitted = true)
   - Exercises must be completed (allCompleted = true)

2. **Submit work:**
   - Shows confirmation modal
   - Sets isWorkSubmitted = true
   - Sets submittedAt timestamp
   - Changes chapter status to 'acheve'
   - Shows confetti animation

3. **Work submitted state:**
   - Green verified badge appears
   - Chapter moves to "Mastered" section
   - Can still review all content
   - Triple-click badge to resubmit (easter egg)

### 5.4 Accessibility Features

#### Chapter Access Rules
A chapter is accessible if ANY of:
- `isActive: true` (manually activated)
- Has active session (LIVE)
- Has upcoming session
- Work already submitted (review mode)

### 5.5 Review Mode

**Quiz Review:**
- After submission, can review all questions
- Correct answers highlighted in green
- Incorrect answers highlighted in red
- Explanations shown for all questions
- No score changes

**Lesson Review:**
- All content accessible
- Can re-check paragraphs
- Progress already tracked

**Exercises Review:**
- Can view all exercises
- Previous feedback shown
- Can change feedback ratings

---

## 6. DATA STRUCTURE

### 6.1 Chapter Data (`Chapter` type)

```typescript
{
  id: string                    // Unique identifier
  file: string                  // Path to JSON file
  lessonFile?: string           // Path to lesson JSON
  isActive: boolean             // Manual activation
  class: string                 // tcs, 1bse, 1bsm, 2bse, 2bsm
  chapter: string               // Chapter name
  sessionDates: string[]        // Array of date ranges
  version: string               // Content version
  
  videos?: Video[]              // Video capsules
  quiz: Question[]              // Quiz questions
  exercises: Exercise[]         // Practice exercises
  lesson?: LessonContent        // Structured lesson
}
```

### 6.2 Lesson Data Structure

```typescript
LessonContent {
  header: {
    title: string
    subtitle?: string
    classe?: string
    chapter?: string
  }
  sections: LessonSection[]
}

LessonSection {
  title: string
  intro?: string
  subsections: LessonSubsection[]
}

LessonSubsection {
  title: string
  elements?: LessonElement[]
  subsubsections?: LessonSubsubsection[]
}

LessonElement {
  type: 'p' | 'definition-box' | 'theorem-box' | 
        'proposition-box' | 'property-box' | 
        'remark-box' | 'example-box' |
        'practice-box' | 'explain-box' | 'table'
  content: string | string[]
  preamble?: string
  solution?: string | string[]
  image?: LessonImageConfig
}
```

### 6.3 Quiz Data Structure

```typescript
Question {
  id: string
  question: string
  type: 'mcq' | 'ordering'
  
  // MCQ fields
  options?: Option[]
  
  // Ordering fields
  steps?: string[]
  
  explanation?: string
  hints?: string[]
}

Option {
  id?: string
  text: string
  isCorrect: boolean
  explanation?: string
}
```

### 6.4 Exercise Data Structure

```typescript
Exercise {
  id: string
  title: string
  statement: string
  sub_questions?: SubQuestion[]
  hint?: Hint[]
  images?: ExerciseImage[]
}

SubQuestion {
  text: string
  sub_sub_questions?: SubSubQuestion[]
  images?: ExerciseImage[]
}

ExerciseImage {
  id: string
  path: string
  caption?: string
  size?: 'small' | 'medium' | 'large' | 'full' | 'custom'
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  alignment?: 'left' | 'center' | 'right'
}
```

### 6.5 Concours Data Structure

```typescript
ConcoursIndex {
  concours: ConcoursInfo[]
}

ConcoursInfo {
  id: string                    // 'medecine', 'ensam', 'ensa'
  name: string
  description: string
  examens: ConcoursExam[]
}

ConcoursExam {
  annee: string                 // '2024', '2023', etc.
  fichiers: ConcoursFile[]
}

ConcoursFile {
  theme: string
  fichier: string               // Path to JSON
  pdf?: string                  // Path to PDF
}
```

### 6.6 LocalStorage Structure

**Key:** `pedagoEleveData_V4.7_React`

```typescript
{
  profile: Profile
  activities: { [id: string]: Chapter }
  progress: { [id: string]: ChapterProgress }
  chapterOrder: string[]
  customActivities: any[]
  exportedChaptersData: ExportedProgressFile[]
  lastSync: number
}
```

---

## 7. KEY FEATURES

### 7.1 Mathematical Content

#### MathJax Integration
- **LaTeX rendering:** Inline `$...$` and display `$$...$$`
- **Formula alignment:** Baseline-aligned with text
- **Responsive sizing:** Adapts to screen size
- **Color inheritance:** Math formulas match text color
- **Performance:** Cached rendering, deferred loading

#### Math Features
- **Fractions:** `\frac{a}{b}`
- **Superscripts/subscripts:** `x^2`, `a_n`
- **Greek letters:** `\alpha`, `\beta`, etc.
- **Vectors:** `\vec{AB}`
- **Integrals, sums, limits**
- **Matrices and tables**

### 7.2 Progressive Web App (PWA)

#### Features
- **Service Worker:** Offline caching
- **Manifest:** Installable app
- **Icons:** Various sizes for different devices
- **Splash screen**
- **Standalone mode:** Runs like native app

#### Caching Strategy
- **Static assets:** Cached on install
- **Dynamic content:** Cache-first strategy
- **API calls:** Network-first with fallback

### 7.3 Responsive Design

#### Breakpoints
```css
mobile: < 640px
tablet: 640px - 768px
desktop: > 768px
large: > 960px
```

#### Mobile Optimizations
- **Touch-friendly:** Min 44px tap targets
- **Reduced animations:** On mobile devices
- **Compact layout:** Adjusted spacing
- **Optimized fonts:** clamp() for responsive sizing

### 7.4 Accessibility

#### Features
- **ARIA labels:** Screen reader support
- **Keyboard navigation:** Tab order
- **Focus indicators:** Visible outlines
- **Semantic HTML:** Proper heading hierarchy
- **Alt text:** For all images
- **High contrast:** Readable color combinations

### 7.5 Performance Optimizations

#### React Optimizations
- **useMemo:** For expensive calculations
- **useCallback:** For stable function references
- **React.memo:** For pure components
- **Lazy loading:** Code splitting (potential)

#### CSS Optimizations
- **No transitions on critical elements**
- **Hardware acceleration:** transform, opacity
- **Will-change hints**
- **Efficient selectors**

#### Data Optimizations
- **LocalStorage batching**
- **Debounced saves**
- **Indexed progress lookups**
- **Memoized derived state**

---

## 8. USER JOURNEYS

### 8.1 First-Time Student

1. **Login**
   - Enters name
   - Selects class (e.g., 1BSM)
   - Submits

2. **Dashboard**
   - Sees personalized greeting
   - Views "Available chapters" section
   - All chapters show "À venir" unless active/session

3. **Select Active Chapter**
   - Clicks on a chapter with LIVE session or isActive
   - Redirected to Chapter Hub

4. **Chapter Hub**
   - Sees 5 steps (all locked except Lesson)
   - Clicks "Commencer la leçon"

5. **Lesson**
   - Reads structured content
   - Checks paragraphs as completed
   - Progress bar fills up

6. **Videos**
   - Unlocked after starting lesson
   - Watches YouTube videos
   - Marks as "Bien assimilé"

7. **Quiz**
   - Unlocked after videos
   - Answers MCQ and ordering questions
   - Uses hints if needed
   - Submits quiz
   - Sees score

8. **Exercises**
   - Unlocked after quiz
   - Reads exercises
   - Marks difficulty feedback
   - Uses hints as needed

9. **Submit Work**
   - Unlocked after exercises
   - Clicks "Soumettre le travail"
   - Confirms in modal
   - Sees confetti animation
   - Returns to dashboard

10. **Dashboard**
    - Chapter moved to "Mastered" section
    - Green verified badge
    - Can review anytime

### 8.2 Returning Student

1. **Login**
   - Name pre-filled and locked
   - Class pre-selected
   - Clicks "Continuer"

2. **Dashboard**
   - Sees "Your current learning" section with in-progress chapters
   - Continues where left off

3. **Resume Chapter**
   - All previous progress preserved
   - Can navigate to any unlocked step
   - Review mode available for completed items

### 8.3 Concours Student

1. **Login**
   - Selects "Préparation Concours"
   - Enters name
   - Submits

2. **Concours Landing**
   - Sees Médecine, ENSAM, ENSA cards
   - Selects one (e.g., Médecine)

3. **Concours List**
   - Browses by year or theme
   - Selects year (e.g., 2024)

4. **Concours Year**
   - Sees available themes
   - Clicks on a theme

5. **Concours Resume**
   - Reads structured summary
   - Checks sections as reviewed
   - Navigates with Prev/Next buttons

6. **Concours Quiz**
   - Takes quiz on the theme
   - Reviews results
   - Returns to select another theme

---

## 9. TECHNICAL STACK

### 9.1 Core Technologies
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Utility CSS (via CDN)
- **IndexedDB/LocalStorage** - Data persistence

### 9.2 Libraries & Dependencies
- **MathJax 3** - Math rendering
- **Material Symbols** - Icon font
- **React DnD** (potential) - Drag and drop

### 9.3 Fonts
- **Space Grotesk** - Display headings
- **Plus Jakarta Sans** - UI text
- **Outfit** - Body text
- **Sora** - Special headings
- **DM Mono** - Code/math
- **Bree Serif** - Exercise numbers

---

## 10. FILE STRUCTURE

```
Math-pedago/
├── public/
│   ├── chapters/              # Chapter JSON files
│   │   ├── 1bse/
│   │   ├── 1bsm/
│   │   ├── 2bse/
│   │   ├── 2bsm/
│   │   └── tcs/
│   ├── concours/              # Concours JSON files
│   │   ├── medecine/
│   │   ├── ensam/
│   │   └── ensa/
│   ├── pictures/              # Images
│   ├── icone.png              # App icon
│   └── manifest.webmanifest   # PWA manifest
│
├── components/
│   ├── views/                 # Page-level views
│   │   ├── LoginView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ChapterHubView.tsx
│   │   ├── ActivityView.tsx
│   │   ├── LessonView.tsx
│   │   ├── ConcoursView.tsx
│   │   └── ...
│   ├── lesson/                # Lesson components
│   ├── quiz/                  # Quiz components
│   ├── ui/                    # Reusable UI
│   └── ...                    # Other components
│
├── context/
│   ├── AppContext.tsx         # Global state
│   ├── NotificationContext.tsx
│   └── LessonProgressContext.tsx
│
├── hooks/
│   ├── useMathJax.ts
│   └── ...
│
├── services/
│   └── ...
│
├── src/styles/                # CSS modules
│   ├── main-theme.css         # Main theme
│   ├── dashboard.css          # Dashboard styles
│   ├── chapter-hub.css        # Chapter hub styles
│   ├── quiz.css               # Quiz styles
│   ├── lesson-content.css     # Lesson content styles
│   └── ...
│
├── utils/
│   ├── lessonProgressHelpers.ts
│   ├── chapterStatusHelpers.ts
│   └── ...
│
├── types.ts                   # TypeScript types
├── constants.ts               # App constants
├── App.tsx                    # Main app component
├── index.tsx                  # Entry point
├── index.html                 # HTML template
└── sw.js                      # Service worker
```

---

## 11. DESIGN PATTERNS & BEST PRACTICES

### 11.1 State Management
- **AppContext:** Global state with reducer
- **LocalStorage sync:** Automatic persistence
- **Optimistic updates:** UI updates before save
- **Event-driven updates:** Custom events for cross-component sync

### 11.2 Component Patterns
- **Container/Presentational:** Separate logic from UI
- **Compound components:** Complex UI with multiple parts
- **Render props:** Flexible component composition
- **Hooks:** Reusable logic extraction

### 11.3 Performance Patterns
- **Memoization:** Expensive calculations cached
- **Lazy evaluation:** Compute only when needed
- **Debouncing:** Reduce update frequency
- **Virtualization:** (Potential) For long lists

### 11.4 Code Organization
- **Feature-based:** Components grouped by feature
- **Type safety:** TypeScript throughout
- **Consistent naming:** Clear, descriptive names
- **Documentation:** Comments for complex logic

---

## 12. FUTURE ENHANCEMENTS

### Potential Features
- **Teacher Dashboard:** View student progress
- **Collaborative Learning:** Student groups
- **Gamification:** Badges, leaderboards
- **AI Tutoring:** Personalized help
- **Video Recording:** Teacher-created videos
- **Real-time Sync:** Multi-device support
- **Analytics:** Detailed learning insights
- **Export/Import:** Progress backup

---

## SUMMARY

Math-pedago is a comprehensive, well-architected educational platform that combines:
- **Structured learning** (lessons, videos, quizzes, exercises)
- **Progress tracking** (detailed state management)
- **Competitive exam prep** (concours system)
- **Modern design** (responsive, accessible)
- **Mathematical content** (MathJax integration)
- **Offline capability** (PWA)
- **Session management** (LIVE and upcoming)

The platform follows modern web development best practices with React, TypeScript, and a component-based architecture, while maintaining excellent performance and user experience.

---

**Last Updated:** November 18, 2025  
**Version:** 4.7  
**Project Location:** `/home/user/Math-pedago/`
