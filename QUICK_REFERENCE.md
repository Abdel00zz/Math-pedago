# Math-Pedago Quick Reference Guide

## Getting Started

### Installation & Running
```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### File Locations

| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| Main App | `App.tsx` | 39 | Route dispatcher |
| Entry Point | `index.tsx` | 35 | React initialization |
| State Management | `context/AppContext.tsx` | 2000+ | Global state & reducer |
| Type Definitions | `types.ts` | 1100+ | All TypeScript interfaces |
| Constants | `constants.ts` | 20 | DB_KEY, CLASS_OPTIONS |

---

## View Routing

### Available Views & Navigation

```typescript
// From App.tsx
const renderView = () => {
    switch (state.view) {
        case 'login':      return <LoginView />
        case 'dashboard':  return <DashboardView />
        case 'work-plan':  return <ChapterHubView />
        case 'activity':   return <ActivityView />
        default:           return <LoginView />
    }
};

// Navigate between views via dispatch
dispatch({ 
    type: 'CHANGE_VIEW', 
    payload: { 
        view: 'activity',
        chapterId: 'chapter1',
        subView: 'quiz'  // lesson | quiz | exercises | videos
    } 
});
```

### View Flow
```
LoginView
    ↓ (user logs in)
DashboardView
    ↓ (user selects chapter)
ChapterHubView
    ↓ (user clicks on activity)
ActivityView (multi-tab)
    ├─ LessonView
    ├─ Quiz
    ├─ VideoCapsules
    └─ Exercises
```

---

## State Management Quick Guide

### useAppState() Hook
```typescript
import { useAppState, useAppDispatch } from '@/context/AppContext';

const MyComponent = () => {
    const state = useAppState();  // Get current state
    const dispatch = useAppDispatch();  // Dispatch actions
    
    // Access state
    const { profile, activities, progress, view } = state;
    
    // Dispatch action
    dispatch({ 
        type: 'UPDATE_QUIZ_ANSWER',
        payload: { qId: 'q1', answer: 'opt1' }
    });
};
```

### Common Actions

```typescript
// Navigation
dispatch({ type: 'CHANGE_VIEW', payload: { view: 'dashboard' } });

// Quiz
dispatch({ type: 'NAVIGATE_QUIZ', payload: 1 });  // Go to question 1
dispatch({ type: 'UPDATE_QUIZ_ANSWER', payload: { qId: 'q1', answer: 'opt1' } });
dispatch({ type: 'SUBMIT_QUIZ', payload: { score: 85, duration: 300, hintsUsed: 2 } });
dispatch({ type: 'TOGGLE_REVIEW_MODE', payload: true });

// Video
dispatch({ type: 'MARK_VIDEO_WATCHED', payload: { videoId: 'vid1' } });
dispatch({ type: 'SET_VIDEOS_DURATION', payload: { duration: 600 } });

// Lesson
dispatch({ type: 'UPDATE_LESSON_PROGRESS', payload: { 
    scrollProgress: 50, 
    completedParagraphs: 3,
    totalParagraphs: 10
} });

// Exercise
dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { 
    exId: 'ex1', 
    feedback: 'Difficile'  // Facile | Moyen | Difficile
} });

// Work submission
dispatch({ type: 'SUBMIT_WORK', payload: { chapterId: 'ch1' } });
```

---

## Component Patterns

### Creating a New Component

```typescript
// components/MyFeature.tsx
import React from 'react';
import { useAppState } from '@/context/AppContext';
import '@/src/styles/my-feature.css';  // Optional: custom styles

interface MyFeatureProps {
    title: string;
    onAction?: () => void;
}

export const MyFeature: React.FC<MyFeatureProps> = ({ title, onAction }) => {
    const state = useAppState();
    
    return (
        <div className="my-feature">
            <h2>{title}</h2>
            {/* Component content */}
        </div>
    );
};

export default MyFeature;
```

### Using Notifications

```typescript
import { useNotification } from '@/context/NotificationContext';

const MyComponent = () => {
    const { addNotification } = useNotification();
    
    const handleAction = () => {
        addNotification({
            title: 'Success',
            message: 'Action completed!',
            type: 'success',
            duration: 3000  // auto-dismiss after 3s
        });
    };
    
    return <button onClick={handleAction}>Do Action</button>;
};
```

### Using MathJax (KaTeX)

```typescript
import { MathContent } from '@/components/MathContent';

const MyMathComponent = () => {
    const mathText = 'The solution is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$';
    
    return <MathContent content={mathText} />;
};

// Or use directly in JSX
const inlineFormula = 'For all $n \\in \\mathbb{N}$, we have...';
```

---

## Data Access Patterns

### Accessing Activities (Chapters)

```typescript
const state = useAppState();

// Get all chapters
const chapters = state.activities;

// Get specific chapter
const chapter = state.activities['chapter-id'];

// Check chapter content
if (chapter) {
    chapter.quiz      // Array of questions
    chapter.exercises // Array of exercises
    chapter.videos    // Array of videos
    chapter.lesson    // Lesson content (if separated)
}
```

### Accessing Progress

```typescript
const state = useAppState();

// Get progress for current chapter
const progress = state.progress[state.currentChapterId];

if (progress) {
    progress.quiz.score            // 0-100
    progress.quiz.answers          // { qId: answer }
    progress.quiz.isSubmitted      // boolean
    progress.quiz.hintsUsed        // number
    
    progress.lesson.isRead         // boolean
    progress.lesson.scrollProgress // 0-100
    progress.lesson.duration       // seconds
    
    progress.videos.watched        // { videoId: bool }
    progress.videos.allWatched     // boolean
    
    progress.exercisesFeedback     // { exId: feedback }
    progress.isWorkSubmitted       // boolean
}
```

---

## Styling Guide

### Using Tailwind CSS Classes

```tsx
// Basic spacing
<div className="mt-4 mb-8 px-6 py-3">Content</div>

// Colors (via CSS variables)
<div className="text-primary bg-card border border-border rounded-lg">
    Card content
</div>

// Responsive
<div className="text-base sm:text-lg md:text-xl">
    Responsive text
</div>

// Dark mode
<div className="text-slate-900 dark:text-slate-50">
    Adaptive text
</div>
```

### Adding Custom CSS

```css
/* src/styles/my-feature.css */
.my-feature {
    --my-color: hsl(var(--primary));
    padding: var(--spacing-4);
    border-radius: var(--radius);
}

.my-feature__title {
    color: var(--my-color);
    font-weight: var(--font-semibold);
}
```

### CSS Variables Available

```css
--primary, --primary-foreground
--secondary, --secondary-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--background, --foreground
--card, --card-foreground
--border, --input, --ring
--muted, --muted-foreground
--radius
```

---

## Adding Chapter Content

### JSON Chapter Structure

```json
{
  "class": "1bsm",
  "chapter": "Chapter Title",
  "sessionDates": ["2024-01-15"],
  "lessonFile": "lessons/chapter_name.json",
  "videos": [
    {
      "id": "vid1",
      "title": "Video Title",
      "youtubeId": "YOUTUBE_ID",
      "duration": "5:30",
      "description": "Description"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Question text with $math$ support",
      "type": "mcq",
      "options": [
        {
          "text": "Option 1 with $math$",
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
      "statement": "Problem statement",
      "sub_questions": [
        {
          "text": "Sub-question"
        }
      ],
      "hint": [
        {
          "text": "Helpful hint"
        }
      ]
    }
  ]
}
```

### Adding a Lesson File

**Location**: `/public/chapters/{class}/lessons/{chapter_name}.json`

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
      "title": "Section 1: Introduction",
      "intro": "Opening text",
      "subsections": [
        {
          "title": "Subsection 1.1",
          "subsubsections": [
            {
              "title": "Subsubsection 1.1.1",
              "elements": [
                {
                  "type": "p",
                  "content": "Paragraph text with $LaTeX$ math"
                },
                {
                  "type": "definition-box",
                  "preamble": "Definition",
                  "content": ["Definition content"]
                },
                {
                  "type": "theorem-box",
                  "preamble": "Theorem Name",
                  "content": ["Theorem statement"]
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

---

## Testing & Debugging

### Debugging Math Rendering

```javascript
// In browser console
window.diagnoseMathJax();
```

### Accessing localStorage

```javascript
// View all stored data
JSON.parse(localStorage.getItem('pedagoEleveData_V4.7_React'));

// Clear all data
localStorage.clear();

// Set test data
localStorage.setItem('pedagoEleveData_V4.7_React', JSON.stringify({
    profile: { name: 'Test User', classId: '1bsm' },
    progress: {}
}));
```

### React DevTools

```javascript
// Recommended browser extensions:
// - React Developer Tools
// - Redux DevTools (or Context inspector)

// View state in components
const state = useAppState();
console.log('Current state:', state);
```

---

## Performance Tips

### Optimization Patterns

```typescript
// 1. Memoization
const cachedValue = useMemo(() => {
    return expensiveCalculation(data);
}, [data]);

// 2. Callback stability
const handleClick = useCallback(() => {
    dispatch({ type: 'ACTION' });
}, [dispatch]);

// 3. Component splitting
// Move large components to separate files
const BigForm = React.lazy(() => import('./BigForm'));

// 4. Conditional rendering
{condition && <ExpensiveComponent />}  // Better than ternary
```

### CSS Performance

```css
/* Use CSS variables for theme colors */
.component {
    color: hsl(var(--foreground));  /* Faster than individual RGB */
}

/* Reduce repaints with contain */
.section {
    contain: layout style;
}
```

---

## Common Tasks

### Logging a User Out
```typescript
dispatch({ type: 'CHANGE_VIEW', payload: { view: 'login' } });
localStorage.removeItem('pedagoEleveData_V4.7_React');
```

### Exporting Student Progress
```typescript
// Uses JSON.stringify(progressData)
// Includes: score, duration, exercises feedback, etc.
```

### Resetting a Chapter Progress
```typescript
dispatch({ 
    type: 'UPDATE_QUIZ_ANSWER', 
    payload: { qId: 'q1', answer: '' }
});
```

### Adding a New Class
1. Add to `CLASS_OPTIONS` in `constants.ts`
2. Create chapter JSON files in `/public/chapters/{newClass}/`
3. Create lesson JSON files in `/public/chapters/{newClass}/lessons/`

---

## File Size & Performance Metrics

| Metric | Value |
|--------|-------|
| Main bundle (Vite) | ~150KB (gzipped) |
| CSS files | 190KB total |
| Types file | 1100+ lines |
| Largest component | LessonEditor (66KB) |
| Total components | 30+ |

---

## Useful Resources

### Documentation in Repo
- `/architecture.md` - Detailed architecture (450+ lines)
- `/GUIDE_COMPLET_CREATION_LECONS.md` - Lesson creation guide
- `/guide_json.md` - JSON structure documentation
- `/guide_lesson_structure.md` - Lesson hierarchy guide

### External Libraries
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [KaTeX](https://katex.org)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

---

## Common Errors & Solutions

### Math Not Rendering
```javascript
// Check if KaTeX is loaded
console.log(window.katex);

// Run diagnostic
window.diagnoseMathJax();
```

### localStorage Quota Exceeded
```javascript
// Clear old notifications
localStorage.removeItem('pedagoUiNotifications_V1');

// Check size
console.log(new Blob([localStorage.getItem('pedagoEleveData_V4.7_React')]).size / 1024 + 'KB');
```

### Progress Not Saving
```javascript
// Check if action was dispatched
console.log('Dispatching action...');

// Verify localStorage
console.log(localStorage.getItem('pedagoEleveData_V4.7_React'));
```

### Components Not Updating
```typescript
// Ensure using hooks correctly
const state = useAppState();  // Must be at top level
const [local, setLocal] = useState();  // Before effects

// Check dependencies in useEffect
useEffect(() => {
    // ... code
}, [dependencies]);  // Include all used variables
```

