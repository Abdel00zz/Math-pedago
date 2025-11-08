# Smart Chapter V1 Platform - Complete Architecture & Structure Analysis

## Project Overview

**Smart Chapter Manager V1** is a sophisticated React-based web application designed to manage educational content for mathematics courses. It provides a comprehensive editing interface for chapters containing lessons, videos, quizzes, and exercises, organized by academic class level and organized through a manifest-based system.

**Location:** `/home/user/Math-pedago/Smart chapter v1/`

---

## 1. DIRECTORY STRUCTURE & KEY FILES

```
Smart chapter v1/
├── App.tsx                          # Main application component
├── index.tsx                        # React DOM entry point
├── index.html                       # HTML template
├── types.ts                         # TypeScript type definitions
├── package.json                     # Project dependencies
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
├── GUIDE_UTILISATION.md             # User guide (French)
├── components/
│   ├── ChapterTable.tsx             # Chapter listing & status management
│   ├── ChapterEditor.tsx            # Main chapter editor with tabs
│   ├── LessonEditor.tsx             # Lesson content editor
│   ├── VideoEditor.tsx              # Video management interface
│   ├── QuizEditor.tsx               # Quiz/MCQ question editor
│   ├── ExerciseEditor.tsx           # Exercise problem editor
│   ├── ImageManager.tsx             # Image upload & management
│   ├── ImageUploadModal.tsx         # Image upload dialog
│   └── icons.tsx                    # Material Symbols icon components
└── utils/
    ├── parser.ts                    # JSON chapter file parser
    ├── versioning.ts                # MD5-based content versioning
    └── fileUtils.ts                 # File I/O utilities
```

---

## 2. MANIFEST MANAGEMENT

### Manifest Structure & Location

**File:** `public/manifest.json`

```json
{
  "tcs": [
    {
      "id": "tcs-les-ensembles-de-nombres-n-z-q-d-et-r",
      "file": "tcs/tcs_les_ensembles_de_nombres.json",
      "isActive": false,
      "version": "v1.1.0-3c1087"
    }
  ],
  "1bse": [...],
  "1bsm": [...],
  "2bse": [...],
  "2bsm": [...]
}
```

### Manifest Management Features

**File:** `/home/user/Math-pedago/Smart chapter v1/App.tsx` (lines 37-231)

1. **Loading Manifest:**
   - Uses File System Access API (`showDirectoryPicker()`)
   - Supports both legacy (flat) and new (subfolder) chapter file structures
   - Automatically handles path resolution for files like `tcs/tcs_ensembles.json`

2. **Class Types Supported:**
   - `tcs` - Tronc Commun Scientifique
   - `1bse` - 1ère Bac Sciences Expérimentales
   - `1bsm` - 1ère Bac Sciences Mathématiques
   - `2bse` - 2ème Bac Sciences Expérimentales
   - `2bsm` - 2ème Bac Sciences Mathématiques

3. **Manifest Updates:**
   - Real-time toggle of chapter active status
   - Version hashing with MD5
   - Atomic saves to `manifest.json`
   - Direct file system writes via File System Access API

**Key Methods:**
```typescript
- loadProjectFromHandle()      # Load project & manifest
- handleSaveAll()              # Batch save all chapters
- updateChapterActive()        # Toggle chapter status
- getChaptersByClass()         # Filter chapters by class
```

---

## 3. LESSON MANAGEMENT

### Lesson File Structure

**Location:** `chapters/{classType}/lessons/` (e.g., `chapters/1bsm/lessons/logique_mathematique.json`)

```json
{
  "header": {
    "title": "Introduction à la dérivation",
    "subtitle": "Concepts fondamentaux",
    "chapter": "Chapitre 3",
    "classe": "1BSM",
    "academicYear": "2024-2025"
  },
  "sections": [
    {
      "title": "I. Définition",
      "intro": "Texte introductif optionnel...",
      "subsections": [
        {
          "title": "1. Nombre dérivé",
          "elements": [
            {
              "type": "definition-box",
              "preamble": "Introduction...",
              "listType": "bullet",
              "columns": false,
              "content": [">> **Points clés**", "Point 1"],
              "image": { "src": "/path/to/img.png", ... }
            }
          ]
        }
      ]
    }
  ]
}
```

### Lesson Editor Component

**File:** `/home/user/Math-pedago/Smart chapter v1/components/LessonEditor.tsx`

**Key Features:**
1. **File Loading/Saving:**
   - Auto-loads lesson from path stored in chapter
   - Creates empty lesson if no path defined
   - Saves to `chapters/{classType}/lessons/{path}`

2. **History Management:**
   - Undo/Redo functionality with state tracking
   - History array with index pointer
   - Deep cloning for safety

3. **Content Elements:**
   - Paragraph (`p`)
   - Table (`table`)
   - Definition Box (`definition-box`)
   - Theorem Box (`theorem-box`)
   - Proposition Box (`proposition-box`)
   - Property Box (`property-box`)
   - Example Box (`example-box`)
   - Remark Box (`remark-box`)
   - Practice Box (`practice-box`)
   - Explain Box (`explain-box`)

4. **Advanced Features:**
   - **NoBullet System:** `>>` prefix hides bullets on list items
   - **Column Mode:** Display content side-by-side
   - **Intro Text:** Section introduction without frame
   - **MathJax Support:** LaTeX rendering with `$...$` and `$$...$$`
   - **Fill-in-the-Blank:** `___answer___` creates interactive blanks
   - **Image Support:** Per-element image configuration with position/alignment

---

## 4. QUIZ/EXERCISE HANDLING

### Quiz Structure

**Location:** Chapter JSON files (e.g., `1bse_limites.json`)

```json
{
  "class": "1bse",
  "chapter": "Limites d'une fonction",
  "sessionDates": ["2025-09-01T14:00:00Z"],
  "quiz": [
    {
      "id": "q1",
      "question": "Que vaut $\\lim_{x\\to 0} \\frac{\\sin x}{x}$ ?",
      "type": "mcq",
      "options": [
        {
          "text": "0",
          "is_correct": false,
          "explanation": null
        },
        {
          "text": "1",
          "is_correct": true,
          "explanation": "C'est une limite de référence..."
        }
      ],
      "steps": []
    }
  ]
}
```

### Quiz Editor

**File:** `/home/user/Math-pedago/Smart chapter v1/components/QuizEditor.tsx`

**Features:**
- Two question types: `mcq` (Multiple Choice) and `ordering` (Sequence)
- Dynamic option management (add/remove/reorder)
- Explanation per correct option
- Step-by-step solutions
- List sidebar for quick navigation
- Duplicate/Move/Delete operations

**Type Definition:** (types.ts)
```typescript
interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'ordering';
  options: QuizOption[];
  steps: string[];
}

interface QuizOption {
  text: string;
  is_correct: boolean;
  explanation?: string | null;
}
```

---

### Exercise Structure

```json
{
  "exercises": [
    {
      "id": "ex1",
      "title": "Asymptote",
      "statement": "Déterminer la limite en $+\\infty$ de $f(x) = \\sqrt{x^2+1}-x$.",
      "sub_questions": [
        {
          "text": "Question 1",
          "sub_sub_questions": [
            { "text": "Part a)" },
            { "text": "Part b)" }
          ],
          "hint": "Utiliser la conjuguée...",
          "questionNumber": "1",
          "images": []
        }
      ],
      "images": [],
      "hint": [
        {
          "text": "Multiplier par la conjuguée",
          "questionNumber": "1"
        }
      ]
    }
  ]
}
```

### Exercise Editor

**File:** `/home/user/Math-pedago/Smart chapter v1/components/ExerciseEditor.tsx`

**Features:**
- Hierarchical question structure (main → sub → sub-sub)
- Multi-level hint system (per question)
- Image attachment per sub-question
- Duplicate, Move, Delete operations
- Main exercise images (for statement illustration)

**Type Definition:**
```typescript
interface Exercise {
  id: string;
  title: string;
  statement: string;
  sub_questions: SubQuestion[];
  hint?: Hint[];
  images?: ExerciseImage[];
}

interface SubQuestion {
  text: string;
  sub_sub_questions: SubSubQuestion[];
  hint?: string | null;
  questionNumber?: string;
  images?: ExerciseImage[];
}
```

---

## 5. UI/INTERFACE COMPONENTS

### Main Application Flow

**File:** `/home/user/Math-pedago/Smart chapter v1/App.tsx`

#### Component Hierarchy:
```
App
├── InitialScreen          # Directory picker
└── Main Interface
    ├── Header
    │   ├── Title & Project Path
    │   ├── Navigation Tabs (5 classes)
    │   └── Control Buttons (Home, Reload, Save All)
    └── Main Content
        ├── ChapterTable           # When no chapter selected
        └── ChapterEditor          # When editing chapter
```

### ChapterTable Component

**File:** `/home/user/Math-pedago/Smart chapter v1/components/ChapterTable.tsx`

Displays chapter list with:
- Toggle switches for active/inactive status
- Chapter name and file path
- Version badge
- Quiz count (read-only)
- Exercise count (read-only)
- Edit and Delete action buttons
- Real-time manifest synchronization

### ChapterEditor Component

**File:** `/home/user/Math-pedago/Smart chapter v1/components/ChapterEditor.tsx`

**Tab Structure:**
```
ChapterEditor
├── Info Tab              # Chapter metadata
├── Lesson Tab            # LessonEditor component
├── Videos Tab            # VideoEditor component
├── Quiz Tab              # QuizEditor component
└── Exercises Tab         # ExerciseEditor component
```

**Sidebar Navigation:**
- Tabbed interface with icons
- Active tab highlighting
- Modal overlay with backdrop

### Icon System

**File:** `/home/user/Math-pedago/Smart chapter v1/components/icons.tsx`

Uses **Material Symbols Outlined** from Google Fonts:
```typescript
// Base component
const Icon: React.FC<{ iconName: string }> = ({ iconName }) =>
  <span className="material-symbols-outlined">{iconName}</span>;

// Exported icons (30+ total)
- BookOpenIcon        // menu_book
- SaveIcon           // save
- EditIcon           // edit
- TrashIcon          // delete
- CheckCircleIcon    // check_circle
- PlusIcon           // add
- ImageIcon          // image
- EyeIcon            // visibility
- And more...
```

---

## 6. EDITOR IMPLEMENTATIONS

### Video Editor

**File:** `/home/user/Math-pedago/Smart chapter v1/components/VideoEditor.tsx`

**Fields per Video:**
- Title
- YouTube ID
- Duration (e.g., "5:42")
- Description
- Thumbnail URL

**Operations:**
- Add video capsule
- Edit all fields
- Delete video
- Move up/down
- Duplicate video
- Visual card layout with edit forms

### Quiz Editor Details

**Features:**
- MCQ with multiple options
- Ordering question type
- Option-level explanations
- Question reordering
- Bulk operations

### Exercise Editor Details

**Features:**
- Main exercise statement with images
- Hierarchical sub-question structure
- Image manager for visual content
- Hint system (per question number)
- Question numbering
- Drag-and-drop reordering

### Image Management

**Files:**
- `ImageManager.tsx` - Full image CRUD for exercises
- `ImageUploadModal.tsx` - Modal dialog for image upload with preview

**Image Storage:**
```
pictures/
├── {classType}/
│   └── {chapterId}/
│       ├── img_20250108T143022Z_diagram1.png
│       └── img_20250108T143025Z_table.png
```

**Image Configuration:**
```typescript
interface ExerciseImage {
  id: string;
  path: string;                    // Relative path
  caption: string;
  size: 'small'|'medium'|'large'|'full'|'custom';
  custom_width?: number;
  custom_height?: number;
  position: 'top'|'bottom'|'left'|'right'|'center'|'inline'|...
  alignment: 'left'|'center'|'right'|'justify';
  alt: string;
}
```

---

## 7. TREEVIEW COMPONENT

**Status:** No dedicated TreeView component found in codebase.

**Current Navigation Pattern:**
- Flat list views with selection (ChapterTable, QuizEditor, ExerciseEditor)
- Sidebar tabs for chapter sections
- Hierarchical rendering in LessonEditor (Sections → Subsections → Elements)

**Potential Candidates for Tree Enhancement:**
- LessonEditor's section navigation
- Exercise sub-question hierarchy
- Image manager file browser

---

## 8. CSS/STYLING FILES

### Styling Approach

**Primary:** Tailwind CSS via CDN
- Utility-first CSS framework
- No custom CSS file for component styling
- Built-in via `<script src="https://cdn.tailwindcss.com"></script>`

**Icon Styling:**
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}
```

### CSS Files in Project (in `src/styles/`)

Located in `/home/user/Math-pedago/src/styles/`:
- `global.css` - Global styles
- `main-theme.css` - Theme definitions
- `dashboard.css` - Dashboard layout
- `lesson-content.css` - Lesson rendering
- `lesson-boxes.css` - Lesson box styles
- `lesson-navigator.css` - Navigator styling
- `quiz.css` - Quiz presentation
- `coursera-theme.css` - Coursera-inspired theme
- `chapter-hub.css` - Chapter hub layout
- `typography.css` - Typography rules

**Note:** Smart Chapter V1 uses Tailwind classes directly; these CSS files are for the main application (`src/`).

---

## 9. TYPE DEFINITIONS

**File:** `/home/user/Math-pedago/Smart chapter v1/types.ts`

### Core Types:

```typescript
// Chapter Data (from both manifest and file)
interface ChapterData {
  id: string;
  file_name: string;
  is_active: boolean;
  version: string;
  class_type: string;
  chapter_name: string;
  session_dates: string[];
  videos: Video[];
  quiz_questions: QuizQuestion[];
  exercises: Exercise[];
  lessonFile?: string;
  file_content?: string;
}

// Manifest Structure
interface Manifest {
  [classType: string]: {
    id: string;
    file: string;
    isActive: boolean;
    version: string;
  }[];
}

// File System API Handles
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<...>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<...>;
}
```

---

## 10. PARSER & VERSIONING

### Chapter File Parser

**File:** `/home/user/Math-pedago/Smart chapter v1/utils/parser.ts`

**Function:** `parseChapterFile(content: string, manifestEntry: any, classType: string): ChapterData`

**Processing:**
1. Parses JSON chapter content
2. Normalizes class type (to lowercase)
3. Extracts chapter name from filename
4. Maps quiz options (handles both `is_correct` and `isCorrect`)
5. Constructs exercise hierarchy with hints
6. Handles image metadata normalization

**Features:**
- Flexible naming convention extraction
- Automatic class type detection
- Hint mapping by question number
- Image path normalization

### Content Versioning

**File:** `/home/user/Math-pedago/Smart chapter v1/utils/versioning.ts`

**Function:** `calculateContentVersion(chapter: ChapterData): string`

**Algorithm:**
1. Creates JSON string of chapter content (excluding file metadata)
2. Sorts object keys for consistency
3. Computes MD5 hash
4. Returns first 6 characters + version prefix

**Example Output:** `v1.1.0-3c1087`

**Implementation:** 
- Self-contained MD5 algorithm (no external dependencies)
- Deterministic hashing for change detection
- Used to track content modifications in manifest

---

## 11. BUILD & CONFIGURATION

### Vite Configuration

**File:** `/home/user/Math-pedago/Smart chapter v1/vite.config.ts`

```typescript
export default defineConfig(({ mode }) => ({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
}));
```

**Development Server:**
- Port: 3000
- Host: 0.0.0.0 (all interfaces)
- React Fast Refresh enabled

### Dependencies

**File:** `/home/user/Math-pedago/Smart chapter v1/package.json`

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

**Minimal dependencies:** React core only, styled with Tailwind CSS.

---

## 12. DATA FLOW & OPERATIONS

### Loading Workflow
```
1. User selects directory via showDirectoryPicker()
2. App loads manifest.json
3. For each manifest entry:
   - Loads chapter file (supports nested paths)
   - Parses content with parseChapterFile()
   - Creates ChapterData object
   - Displays in ChapterTable
```

### Editing Workflow
```
1. User clicks Edit on chapter
2. ChapterEditor opens with 5 tabs
3. User modifies content via specific editors
4. Changes stored in React state
5. User clicks "Save All Changes"
6. App calculates MD5 version
7. Saves chapter files
8. Updates manifest.json
9. Confirmation alert
```

### Lesson Editing Workflow
```
1. LessonEditor mounts
2. Loads lesson file from path in ChapterData
3. Displays section hierarchy
4. User edits sections/elements
5. History tracks all changes
6. User can Undo/Redo
7. Save writes to filesystem via FileSystemDirectoryHandle
```

---

## 13. SECURITY & BROWSER API

### File System Access API

**Browser Support:** Chrome, Edge, Brave (not Firefox/Safari)

**Permissions:**
- `showDirectoryPicker()` - User grants permission to directory
- Persistent `FileSystemDirectoryHandle` for read/write
- Error handling for `SecurityError` on sandboxed contexts

**Safety Features:**
- File writes are atomic (createWritable → write → close)
- Deep cloning of state for immutability
- No direct file system access outside picked directory

---

## 14. EXAMPLE CHAPTER FILE STRUCTURE

**File:** `public/chapters/1bse/1bse_limites_dune_fonction.json`

```json
{
  "class": "1bse",
  "chapter": "Limites d'une fonction",
  "sessionDates": [],
  "videos": [],
  "quiz": [
    {
      "id": "q1",
      "question": "Que vaut $\\lim_{x\\to 0} \\frac{\\sin x}{x}$ ?",
      "type": "mcq",
      "options": [
        { "text": "0", "is_correct": false, "explanation": null },
        { "text": "1", "is_correct": true, "explanation": "C'est une limite de référence..." }
      ],
      "steps": []
    }
  ],
  "exercises": [
    {
      "id": "ex1",
      "title": "Asymptote",
      "statement": "Déterminer la limite...",
      "sub_questions": []
    }
  ],
  "version": "v1.1.0-16f67e"
}
```

---

## 15. KEY FEATURES SUMMARY

### Strengths
- **Manifest-based:** Centralized chapter registry
- **Modular Editors:** Separate UI for each content type
- **Version Tracking:** MD5-based change detection
- **File System Access:** Direct local file editing without backend
- **Hierarchical Content:** Lessons with sections, exercises with sub-questions
- **Rich Media:** Videos, images, formatted text, LaTeX math
- **Responsive UI:** Tailwind CSS, Material icons
- **State Management:** React hooks with undo/redo
- **TypeScript:** Full type safety

### Limitations
- **No TreeView:** Would benefit from hierarchical navigation
- **Browser-Dependent:** Requires File System Access API support
- **Limited Multi-User:** File-based, not server-backed
- **No Real-Time Sync:** Manual save operations

---

## 16. DEVELOPMENT COMMANDS

```bash
# Development
npm run dev          # Start dev server on port 3000

# Build
npm run build        # Create production bundle

# Preview
npm run preview      # Preview built app
```

---

## CONCLUSION

The Smart Chapter V1 platform is a sophisticated, client-side React application for educational content management. It uses a manifest-file hybrid architecture, with File System Access API for local editing. The modular component structure allows easy extension, and TypeScript ensures type safety. The system supports rich pedagogical content including lessons, quizzes, exercises, and media, making it suitable for structured mathematics education.

**Next Steps for Enhancement:**
1. Implement TreeView for lesson hierarchy visualization
2. Add CSS styling system for custom theming
3. Implement backend sync for multi-user support
4. Add lesson preview rendering
5. Implement batch operations on chapters
