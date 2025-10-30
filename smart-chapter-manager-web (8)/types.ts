export interface QuizOption {
  text: string;
  is_correct: boolean;
  explanation?: string | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'ordering';
  options: QuizOption[];
  steps: string[];
}

export interface SubSubQuestion {
  text: string;
}

export interface Hint {
  text: string;
  questionNumber: string;
}

export interface SubQuestion {
  text: string;
  sub_sub_questions: SubSubQuestion[];
  hint?: string | null;
  questionNumber?: string;
  images?: ExerciseImage[];
}

export interface ExerciseImage {
  id: string;
  path: string;
  caption: string;
  size: 'small' | 'medium' | 'large' | 'full' | 'custom';
  custom_width?: number | null;
  custom_height?: number | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'inline' | 'float-left' | 'float-right';
  alignment: 'left' | 'center' | 'right' | 'justify';
  alt: string;
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  duration: string;
  description: string;
  thumbnail: string;
}

export interface Exercise {
  id: string;
  title: string;
  statement: string;
  sub_questions: SubQuestion[];
  hint?: Hint[];
  images?: ExerciseImage[];
}

export interface ChapterData {
  // From manifest
  id: string;
  file_name: string;
  is_active: boolean;
  version: string;
  class_type: string;
  // From chapter file
  chapter_name: string;
  session_dates: string[];
  videos: Video[];
  quiz_questions: QuizQuestion[];
  exercises: Exercise[];
  // For internal state
  file_content?: string; // Raw content from file
}

export interface Manifest {
  [classType: string]: {
    id: string;
    file: string;
    isActive: boolean;
    version: string;
  }[];
}

export const CLASSES_DATA = [
    { value: 'tcs', label: 'Tronc Commun Scientifique' },
    { value: '1bse', label: '1ère Bac Sciences Expérimentales' },
    { value: '1bsm', label: '1ère Bac Sciences Mathématiques' },
    { value: '2bse', label: '2ème Bac Sciences Expérimentales' },
    { value: '2bsm', label: '2ème Bac Sciences Mathématiques' },
];

// Type definition for File System Access API handle
// This is a simplified version for our use case.
export interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}
