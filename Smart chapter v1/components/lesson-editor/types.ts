/**
 * Types partagés pour l'éditeur de leçons
 */

export interface LessonHeader {
    title: string;
    subtitle?: string;
    chapter?: string;
    classe?: string;
    academicYear?: string;
}

export interface LessonSection {
    title: string;
    intro?: string;
    subsections: LessonSubsection[];
}

export interface LessonSubsection {
    title: string;
    subsubsections?: LessonSubsubsection[];
    elements: LessonElement[];
}

export interface LessonSubsubsection {
    title: string;
    elements: LessonElement[];
}

export type LessonElementType =
    | 'p'
    | 'table'
    | 'definition-box'
    | 'theorem-box'
    | 'proposition-box'
    | 'property-box'
    | 'example-box'
    | 'remark-box'
    | 'practice-box'
    | 'explain-box';

export interface LessonElement {
    type: LessonElementType;
    content?: string | string[] | BoxColumnContent[];
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    statement?: string;
    placeholder?: string;
    columns?: boolean;
    image?: ImageConfig;
}

export interface BoxColumnContent {
    title: string;
    items: string[];
}

export interface ImageConfig {
    src: string;
    alt?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    caption?: string;
}

export interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

export const ELEMENT_CONFIGS = {
    'p': { label: 'Paragraphe', icon: '📝', color: 'gray', description: 'Texte simple ou liste' },
    'table': { label: 'Tableau', icon: '📊', color: 'blue', description: 'Tableau Markdown' },
    'definition-box': { label: 'Définition', icon: '📘', color: 'blue', description: 'Définition formelle' },
    'theorem-box': { label: 'Théorème', icon: '🔷', color: 'green', description: 'Théorème mathématique' },
    'proposition-box': { label: 'Proposition', icon: '🔶', color: 'teal', description: 'Proposition ou assertion' },
    'property-box': { label: 'Propriété', icon: '⚡', color: 'indigo', description: 'Propriété importante' },
    'example-box': { label: 'Exemple', icon: '💡', color: 'orange', description: 'Exemple d\'application' },
    'remark-box': { label: 'Remarque', icon: '📌', color: 'purple', description: 'Remarque ou note' },
    'practice-box': { label: 'Exercice', icon: '✏️', color: 'red', description: 'Exercice pratique' },
    'explain-box': { label: 'Analyse', icon: '💭', color: 'cyan', description: 'Analyse détaillée' },
} as const;
