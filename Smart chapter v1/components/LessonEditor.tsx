/**
 * LessonEditor - Éditeur de leçons pour smart-chapter-manager
 * Adapté pour charger/sauvegarder depuis le système de fichiers
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    TrashIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    GripVerticalIcon,
    SaveIcon,
    EyeIcon,
    UndoIcon,
    RedoIcon,
    RefreshIcon,
    BookOpenIcon,
    ImageIcon
} from './icons';
import { FileSystemDirectoryHandle } from '../types';
import { ImageUploadModal, ImageConfig } from './ImageUploadModal';
import { RichTextEditor } from './RichTextEditor';

// Types
interface LessonHeader {
    title: string;
    subtitle?: string;
    chapter?: string;
    classe?: string;
    academicYear?: string;
}

interface LessonSection {
    title: string;
    intro?: string; // Nouveau : texte introductif sans cadre
    subsections: LessonSubsection[];
}

interface LessonSubsection {
    title: string;
    subsubsections?: LessonSubsubsection[];
    elements: LessonElement[];
}

interface LessonSubsubsection {
    title: string;
    elements: LessonElement[];
}

type LessonElementType = 
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

interface LessonElement {
    type: LessonElementType;
    content?: string | string[] | BoxColumnContent[]; // Ajout support colonnes
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    statement?: string;
    placeholder?: string;
    columns?: boolean; // Nouveau : pour activer le mode colonnes
}

// Nouveau : Structure pour les colonnes dans les boxes
interface BoxColumnContent {
    title: string;
    items: string[];
}

interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

interface LessonEditorProps {
    chapterId: string;
    lessonFilePath?: string;
    classType: string; // Add class type to know which folder to look in
    dirHandle: FileSystemDirectoryHandle | null;
    onUpdateLessonPath: (path: string) => void;
}

const ELEMENT_CONFIGS = {
    'p': { label: 'Paragraphe', icon: '📝', color: 'gray' },
    'table': { label: 'Tableau', icon: '📊', color: 'blue' },
    'definition-box': { label: 'Définition', icon: '📘', color: 'blue' },
    'theorem-box': { label: 'Théorème', icon: '🔷', color: 'green' },
    'proposition-box': { label: 'Proposition', icon: '🔶', color: 'teal' },
    'property-box': { label: 'Propriété', icon: '⚡', color: 'indigo' },
    'example-box': { label: 'Exemple', icon: '💡', color: 'orange' },
    'remark-box': { label: 'Remarque', icon: '📌', color: 'purple' },
    'practice-box': { label: 'Exercice', icon: '✏️', color: 'red' },
    'explain-box': { label: 'Analyse', icon: '💭', color: 'cyan' },
};

export const LessonEditor: React.FC<LessonEditorProps> = ({ 
    chapterId, 
    lessonFilePath,
    classType,
    dirHandle,
    onUpdateLessonPath 
}) => {
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [history, setHistory] = useState<LessonContent[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    
    // Refs for scrolling to elements
    const elementRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    // Image upload modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTargetPath, setImageTargetPath] = useState<{ sIdx: number; ssIdx: number; eIdx: number } | null>(null);

    // Charger la leçon depuis le fichier
    useEffect(() => {
        const loadLesson = async () => {
            if (!lessonFilePath || !dirHandle) {
                console.log('[LessonEditor] No lesson file path or dir handle', { lessonFilePath, dirHandle: !!dirHandle });
                // Pas de fichier défini - créer une nouvelle leçon vide
                const emptyLesson: LessonContent = {
                    header: {
                        title: '',
                        subtitle: '',
                        chapter: '',
                        classe: '',
                        academicYear: ''
                    },
                    sections: []
                };
                setLesson(emptyLesson);
                setHistory([JSON.parse(JSON.stringify(emptyLesson))]);
                setHistoryIndex(0);
                return;
            }

            console.log('[LessonEditor] Loading lesson:', { lessonFilePath, classType });
            setIsLoading(true);
            setError(null);

            try {
                // Navigate to chapters directory first
                console.log('[LessonEditor] Navigating to chapters directory...');
                const chaptersHandle = await dirHandle.getDirectoryHandle('chapters');
                
                // Navigate to class directory (e.g., '1bsm')
                console.log('[LessonEditor] Navigating to class directory:', classType);
                const classHandle = await chaptersHandle.getDirectoryHandle(classType);
                
                // Navigate through lesson file path (e.g., 'lessons/logique_mathematique.json')
                const pathParts = lessonFilePath.split('/');
                console.log('[LessonEditor] Path parts:', pathParts);
                let currentHandle: any = classHandle;

                // Navigate through subdirectories
                for (let i = 0; i < pathParts.length - 1; i++) {
                    console.log('[LessonEditor] Navigating to subdirectory:', pathParts[i]);
                    currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
                }

                // Get the file
                const fileName = pathParts[pathParts.length - 1];
                console.log('[LessonEditor] Loading file:', fileName);
                const fileHandle = await currentHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                const content = await file.text();
                const loadedLesson = JSON.parse(content);

                console.log('[LessonEditor] Lesson loaded successfully:', loadedLesson);
                setLesson(loadedLesson);
                setHistory([JSON.parse(JSON.stringify(loadedLesson))]);
                setHistoryIndex(0);
            } catch (err) {
                console.error('[LessonEditor] Error loading lesson:', err);
                setError(`Impossible de charger la leçon: ${err instanceof Error ? err.message : String(err)}`);
                // Créer une leçon vide en cas d'erreur
                const emptyLesson: LessonContent = {
                    header: { title: '', subtitle: '', chapter: '', classe: '', academicYear: '' },
                    sections: []
                };
                setLesson(emptyLesson);
                setHistory([JSON.parse(JSON.stringify(emptyLesson))]);
                setHistoryIndex(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadLesson();
    }, [lessonFilePath, dirHandle, classType]);

    // Sauvegarder la leçon
    const saveLesson = async () => {
        if (!lesson || !dirHandle) {
            alert('Aucune leçon à sauvegarder ou répertoire non disponible');
            return;
        }

        // Si pas de chemin défini, demander un nom de fichier
        let savePath = lessonFilePath;
        if (!savePath) {
            const fileName = prompt('Nom du fichier de leçon (ex: lessons/ma_lecon.json):');
            if (!fileName) return;
            savePath = fileName;
            onUpdateLessonPath(savePath);
        }

        setIsSaving(true);
        setError(null);

        try {
            // Navigate to chapters directory
            const chaptersHandle = await dirHandle.getDirectoryHandle('chapters');
            
            // Navigate to class directory
            const classHandle = await chaptersHandle.getDirectoryHandle(classType);
            
            // Navigate/create subdirectories for lesson file
            const pathParts = savePath.split('/');
            let currentHandle: any = classHandle;

            for (let i = 0; i < pathParts.length - 1; i++) {
                currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
            }

            // Create/overwrite the file
            const fileName = pathParts[pathParts.length - 1];
            const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(lesson, null, 2));
            await writable.close();

            alert('Leçon sauvegardée avec succès !');
        } catch (err) {
            console.error('Error saving lesson:', err);
            setError(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : String(err)}`);
            alert('Erreur lors de la sauvegarde de la leçon');
        } finally {
            setIsSaving(false);
        }
    };

    // Sauvegarder dans l'historique
    const saveToHistory = useCallback((newLesson: LessonContent) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newLesson)));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLesson(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    }, [history, historyIndex]);

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLesson(JSON.parse(JSON.stringify(history[historyIndex + 1])));
        }
    }, [history, historyIndex]);

    // Mettre à jour le header
    const updateHeader = useCallback((field: keyof LessonHeader, value: string) => {
        if (!lesson) return;
        const newLesson = { ...lesson, header: { ...lesson.header, [field]: value } };
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Ajouter une section
    const addSection = useCallback(() => {
        if (!lesson) return;
        const newLesson = {
            ...lesson,
            sections: [
                ...lesson.sections,
                { title: `Section ${lesson.sections.length + 1}`, subsections: [] }
            ]
        };
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Ajouter une subsection
    const addSubsection = useCallback((sectionIndex: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections[sectionIndex].subsections.push({
            title: `Sous-section ${newLesson.sections[sectionIndex].subsections.length + 1}`,
            elements: []
        });
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Ajouter un élément
    const addElement = useCallback((sectionIndex: number, subsectionIndex: number, type: LessonElementType) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        const element: LessonElement = { type };
        
        if (type === 'p') {
            element.content = '';
        } else if (type === 'table') {
            element.content = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
        } else {
            element.preamble = '';
            element.content = [];
            element.listType = 'bullet';
        }

        newLesson.sections[sectionIndex].subsections[subsectionIndex].elements.push(element);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Supprimer un élément
    const deleteElement = useCallback((sectionIndex: number, subsectionIndex: number, elementIndex: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections[sectionIndex].subsections[subsectionIndex].elements.splice(elementIndex, 1);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Mettre à jour un élément
    const updateElement = useCallback((
        sectionIndex: number,
        subsectionIndex: number,
        elementIndex: number,
        field: keyof LessonElement,
        value: any
    ) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        const element = newLesson.sections[sectionIndex].subsections[subsectionIndex].elements[elementIndex];
        (element as any)[field] = value;
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move element up
    const moveElementUp = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        if (!lesson || eIdx === 0) return;
        const newLesson = { ...lesson };
        const elements = newLesson.sections[sIdx].subsections[ssIdx].elements;
        [elements[eIdx - 1], elements[eIdx]] = [elements[eIdx], elements[eIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move element down
    const moveElementDown = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        if (!lesson) return;
        const elements = lesson.sections[sIdx].subsections[ssIdx].elements;
        if (eIdx === elements.length - 1) return;
        const newLesson = { ...lesson };
        const elementsArray = newLesson.sections[sIdx].subsections[ssIdx].elements;
        [elementsArray[eIdx], elementsArray[eIdx + 1]] = [elementsArray[eIdx + 1], elementsArray[eIdx]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move section up
    const moveSectionUp = useCallback((sIdx: number) => {
        if (!lesson || sIdx === 0) return;
        const newLesson = { ...lesson };
        [newLesson.sections[sIdx - 1], newLesson.sections[sIdx]] = 
        [newLesson.sections[sIdx], newLesson.sections[sIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move section down
    const moveSectionDown = useCallback((sIdx: number) => {
        if (!lesson || sIdx === lesson.sections.length - 1) return;
        const newLesson = { ...lesson };
        [newLesson.sections[sIdx], newLesson.sections[sIdx + 1]] = 
        [newLesson.sections[sIdx + 1], newLesson.sections[sIdx]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move subsection up
    const moveSubsectionUp = useCallback((sIdx: number, ssIdx: number) => {
        if (!lesson || ssIdx === 0) return;
        const newLesson = { ...lesson };
        const subsections = newLesson.sections[sIdx].subsections;
        [subsections[ssIdx - 1], subsections[ssIdx]] = 
        [subsections[ssIdx], subsections[ssIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Move subsection down
    const moveSubsectionDown = useCallback((sIdx: number, ssIdx: number) => {
        if (!lesson) return;
        const subsections = lesson.sections[sIdx].subsections;
        if (ssIdx === subsections.length - 1) return;
        const newLesson = { ...lesson };
        const subsectionsArray = newLesson.sections[sIdx].subsections;
        [subsectionsArray[ssIdx], subsectionsArray[ssIdx + 1]] = 
        [subsectionsArray[ssIdx + 1], subsectionsArray[ssIdx]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // Toggle expand section
    const toggleSection = useCallback((path: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedSections(newExpanded);
    }, [expandedSections]);

    // Scroll to element when clicked in structure
    const scrollToElement = useCallback((path: string) => {
        setSelectedPath(path);
        const element = elementRefs.current[path];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight briefly
            element.style.backgroundColor = '#dbeafe'; // blue-100
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
        }
    }, []);

    // Upload image to public folder
    const openImageModal = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        setImageTargetPath({ sIdx, ssIdx, eIdx });
        setImageModalOpen(true);
    }, []);

    const handleImageUpload = useCallback(async (imageConfig: ImageConfig) => {
        if (!dirHandle || !imageTargetPath) {
            alert('Aucun répertoire de projet disponible');
            return;
        }

        if (!classType) {
            alert('Type de classe non défini');
            return;
        }

        const { sIdx, ssIdx, eIdx } = imageTargetPath;

        try {
            const file = imageConfig.file;
            const fileName = file.name;

            // Read file content
            const arrayBuffer = await file.arrayBuffer();

            // Navigate to chapters/{classType}/lessons/pictures/
            const chaptersHandle = await dirHandle.getDirectoryHandle('chapters', { create: true });
            const classHandle = await chaptersHandle.getDirectoryHandle(classType, { create: true });
            const lessonsHandle = await classHandle.getDirectoryHandle('lessons', { create: true });
            const picturesHandle = await lessonsHandle.getDirectoryHandle('pictures', { create: true });

            // Create unique filename if needed
            let finalFileName = fileName;
            let counter = 1;
            while (true) {
                try {
                    await picturesHandle.getFileHandle(finalFileName);
                    // File exists, try with counter
                    const nameParts = fileName.split('.');
                    const ext = nameParts.pop();
                    const baseName = nameParts.join('.');
                    finalFileName = `${baseName}_${counter}.${ext}`;
                    counter++;
                } catch {
                    // File doesn't exist, use this name
                    break;
                }
            }

            // Write the file
            const newFileHandle = await picturesHandle.getFileHandle(finalFileName, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(arrayBuffer);
            await writable.close();

            // Create image metadata object (format Pedago)
            const imagePath = `/chapters/${classType}/lessons/pictures/${finalFileName}`;
            
            // Calculate width based on size preset
            let width = '100%';
            if (imageConfig.size === 'small') width = '30%';
            else if (imageConfig.size === 'medium') width = '50%';
            else if (imageConfig.size === 'large') width = '80%';
            else if (imageConfig.size === 'custom' && imageConfig.customWidth) {
                width = `${imageConfig.customWidth}px`;
            }
            
            const imageMetadata = {
                src: imagePath,
                alt: imageConfig.alt || '',
                caption: imageConfig.caption,
                position: imageConfig.position || 'bottom',
                align: imageConfig.alignment || 'center',
                width: width
            };

            // Set image on element (single image, not array)
            if (!lesson) return;
            
            const newLesson = { ...lesson };
            const element = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
            
            // Replace existing image with new one
            (element as any).image = imageMetadata;
            
            setLesson(newLesson);
            saveToHistory(newLesson);
            setImageModalOpen(false);
            
            alert(`Image "${finalFileName}" ajoutée avec succès !`);
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Erreur lors du téléchargement de l\'image');
        }
    }, [dirHandle, lesson, saveToHistory, imageTargetPath, classType]);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Éditeur de Leçon</h1>
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            title="Annuler (Ctrl+Z)"
                        >
                            <UndoIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            title="Refaire (Ctrl+Y)"
                        >
                            <RedoIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:shadow-md flex items-center gap-2 font-medium transition-all"
                        disabled={!lesson}
                    >
                        <EyeIcon className="w-5 h-5" />
                        {previewMode ? 'Éditer' : 'Aperçu'}
                    </button>
                    <button
                        onClick={saveLesson}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-lg flex items-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving || !lesson}
                    >
                        <SaveIcon className="w-5 h-5" />
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                    <p className="text-sm text-red-700">⚠️ {error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-gray-600">Chargement de la leçon...</p>
                    </div>
                </div>
            )}

            {/* No Lesson State */}
            {!isLoading && !lesson && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-700">
                        <BookOpenIcon className="mx-auto !text-6xl mb-4 text-gray-400" />
                        <p className="font-semibold text-lg text-gray-900">Aucune leçon disponible</p>
                        <p className="text-sm mt-2 text-gray-600">Définissez un chemin de fichier dans l'onglet Information</p>
                    </div>
                </div>
            )}

            {/* Main Content - Only render if lesson is loaded */}
            {!isLoading && lesson && (
            <div className="flex-1 overflow-hidden flex">
                {/* Left Panel - Structure */}
                <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <h2 className="font-bold text-gray-900 mb-3 text-base">En-tête de la Leçon</h2>
                        <div className="space-y-2.5">
                            <input
                                type="text"
                                value={lesson.header.title}
                                onChange={(e) => updateHeader('title', e.target.value)}
                                placeholder="Titre de la leçon"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                            />
                            <input
                                type="text"
                                value={lesson.header.subtitle || ''}
                                onChange={(e) => updateHeader('subtitle', e.target.value)}
                                placeholder="Sous-titre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <input
                                type="text"
                                value={lesson.header.chapter || ''}
                                onChange={(e) => updateHeader('chapter', e.target.value)}
                                placeholder="Chapitre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-gray-900 text-base">Structure du Contenu</h2>
                            <button
                                onClick={addSection}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Ajouter une section"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {lesson.sections.map((section, sIdx) => (
                                <div key={sIdx} className="border border-gray-300 rounded-lg group/section bg-white shadow-sm">
                                    <div
                                        className="flex items-center gap-1 p-2.5 cursor-pointer hover:bg-blue-50 transition-colors rounded-t-lg"
                                        onClick={() => toggleSection(`section-${sIdx}`)}
                                    >
                                        {expandedSections.has(`section-${sIdx}`) ? (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-700" />
                                        ) : (
                                            <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                                        )}
                                        <span className="flex-1 font-semibold text-sm text-gray-900">{section.title}</span>
                                        
                                        {/* Section controls */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveSectionUp(sIdx);
                                                }}
                                                disabled={sIdx === 0}
                                                className="p-1 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                                                title="Déplacer la section vers le haut"
                                            >
                                                <span className="text-xs">▲</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveSectionDown(sIdx);
                                                }}
                                                disabled={sIdx === lesson.sections.length - 1}
                                                className="p-1 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                                                title="Déplacer la section vers le bas"
                                            >
                                                <span className="text-xs">▼</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addSubsection(sIdx);
                                                }}
                                                className="p-1 rounded hover:bg-blue-50 text-blue-600"
                                                title="Ajouter une sous-section"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedSections.has(`section-${sIdx}`) && (
                                        <div className="pl-6 pb-2 space-y-1">
                                            {section.subsections.map((subsection, ssIdx) => (
                                                <div key={ssIdx} className="text-sm group">
                                                    <div className="flex items-center gap-1 p-1.5 hover:bg-gray-50 rounded">
                                                        <span 
                                                            className="flex-1 cursor-pointer"
                                                            onClick={() => scrollToElement(`s${sIdx}-ss${ssIdx}`)}
                                                        >
                                                            {subsection.title}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mr-1">
                                                            {subsection.elements.length}
                                                        </span>
                                                        
                                                        {/* Subsection controls */}
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveSubsectionUp(sIdx, ssIdx);
                                                                }}
                                                                disabled={ssIdx === 0}
                                                                className="p-0.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-20 opacity-0 group-hover:opacity-100"
                                                                title="Déplacer vers le haut"
                                                            >
                                                                <span className="text-xs">▲</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveSubsectionDown(sIdx, ssIdx);
                                                                }}
                                                                disabled={ssIdx === section.subsections.length - 1}
                                                                className="p-0.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-20 opacity-0 group-hover:opacity-100"
                                                                title="Déplacer vers le bas"
                                                            >
                                                                <span className="text-xs">▼</span>
                                                            </button>
                                                            <div className="relative">
                                                                <select
                                                                    onChange={(e) => {
                                                                        if (e.target.value) {
                                                                            addElement(sIdx, ssIdx, e.target.value as LessonElementType);
                                                                            e.target.value = ''; // Reset
                                                                        }
                                                                    }}
                                                                    className="p-1 text-xs border border-gray-300 rounded hover:bg-green-50 opacity-0 group-hover:opacity-100 cursor-pointer"
                                                                    title="Ajouter un élément"
                                                                >
                                                                    <option value="">+</option>
                                                                    <option value="p">📝 Paragraphe</option>
                                                                    <option value="table">📊 Tableau</option>
                                                                    <option value="definition-box">📘 Définition</option>
                                                                    <option value="theorem-box">🔷 Théorème</option>
                                                                    <option value="proposition-box">🔶 Proposition</option>
                                                                    <option value="property-box">⚡ Propriété</option>
                                                                    <option value="example-box">💡 Exemple</option>
                                                                    <option value="remark-box">📌 Remarque</option>
                                                                    <option value="practice-box">✏️ Exercice</option>
                                                                    <option value="explain-box">💭 Analyse</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Editor */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.header.title || 'Nouvelle Leçon'}</h1>
                        {lesson.header.subtitle && (
                            <p className="text-lg text-gray-900 mb-4 font-medium">{lesson.header.subtitle}</p>
                        )}

                        <div className="mt-8 space-y-8">
                            {lesson.sections.map((section, sIdx) => (
                                <div key={sIdx} className="border-l-4 border-blue-500 pl-4">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                    
                                    {/* Intro section (texte sans cadre) */}
                                    {section.intro !== undefined && (
                                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                📄 Texte Introductif (sans cadre)
                                            </label>
                                            <RichTextEditor
                                                value={section.intro}
                                                onChange={(value) => {
                                                    const newLesson = { ...lesson };
                                                    newLesson.sections[sIdx].intro = value;
                                                    setLesson(newLesson);
                                                    saveToHistory(newLesson);
                                                }}
                                                placeholder="Ce texte apparaîtra après le titre, sans encadrement..."
                                                rows={3}
                                                elementType="intro"
                                            />
                                        </div>
                                    )}
                                    {!section.intro && (
                                        <button
                                            onClick={() => {
                                                const newLesson = { ...lesson };
                                                newLesson.sections[sIdx].intro = '';
                                                setLesson(newLesson);
                                                saveToHistory(newLesson);
                                            }}
                                            className="mb-4 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <PlusIcon className="w-3 h-3" />
                                            Ajouter un texte introductif
                                        </button>
                                    )}

                                    {section.subsections.map((subsection, ssIdx) => (
                                        <div 
                                            key={ssIdx} 
                                            className="mb-6"
                                            ref={el => elementRefs.current[`s${sIdx}-ss${ssIdx}`] = el}
                                        >
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{subsection.title}</h3>

                                            <div className="space-y-4">
                                                {subsection.elements.map((element, eIdx) => {
                                                    const config = ELEMENT_CONFIGS[element.type];
                                                    const elementPath = `s${sIdx}-ss${ssIdx}-e${eIdx}`;
                                                    return (
                                                        <div 
                                                            key={eIdx} 
                                                            className="border border-gray-200 rounded-lg p-4 transition-colors"
                                                            ref={el => elementRefs.current[elementPath] = el}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="flex items-center gap-2 font-medium text-sm">
                                                                    <span>{config.icon}</span>
                                                                    <span>{config.label}</span>
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    {/* Move Up Button */}
                                                                    <button
                                                                        onClick={() => moveElementUp(sIdx, ssIdx, eIdx)}
                                                                        disabled={eIdx === 0}
                                                                        className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Déplacer vers le haut"
                                                                    >
                                                                        <span className="text-lg">▲</span>
                                                                    </button>
                                                                    {/* Move Down Button */}
                                                                    <button
                                                                        onClick={() => moveElementDown(sIdx, ssIdx, eIdx)}
                                                                        disabled={eIdx === subsection.elements.length - 1}
                                                                        className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                        title="Déplacer vers le bas"
                                                                    >
                                                                        <span className="text-lg">▼</span>
                                                                    </button>
                                                                    {/* Image Button - Shows if image exists */}
                                                                    <button
                                                                        onClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                        className={`p-1 rounded transition-colors ${
                                                                            (element as any).image 
                                                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                                                                : 'hover:bg-blue-50 text-blue-600'
                                                                        }`}
                                                                        title={(element as any).image ? "Remplacer l'image" : "Ajouter une image"}
                                                                    >
                                                                        <ImageIcon className="w-4 h-4" />
                                                                    </button>
                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => deleteElement(sIdx, ssIdx, eIdx)}
                                                                        className="p-1 rounded hover:bg-red-50 text-red-600"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {element.type === 'p' ? (
                                                                <RichTextEditor
                                                                    value={element.content as string}
                                                                    onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value)}
                                                                    placeholder="Contenu du paragraphe..."
                                                                    rows={4}
                                                                    elementType="p"
                                                                    onImageClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                    hasImage={!!(element as any).image}
                                                                />
                                                            ) : element.type === 'table' ? (
                                                                <RichTextEditor
                                                                    value={element.content as string}
                                                                    onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value)}
                                                                    placeholder="Format tableau Markdown..."
                                                                    rows={6}
                                                                    elementType="table"
                                                                    onImageClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                    hasImage={!!(element as any).image}
                                                                />
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                            Préambule
                                                                        </label>
                                                                        <RichTextEditor
                                                                            value={element.preamble || ''}
                                                                            onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'preamble', value)}
                                                                            placeholder="Préambule..."
                                                                            rows={3}
                                                                            elementType={`${element.type}-preamble`}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                            Contenu
                                                                        </label>
                                                                        <RichTextEditor
                                                                            value={Array.isArray(element.content) ? element.content.join('\n') : (element.content || '')}
                                                                            onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value.split('\n'))}
                                                                            placeholder="Contenu du cadre... Chaque ligne = un élément de liste"
                                                                            rows={10}
                                                                            elementType={element.type}
                                                                            onImageClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                            hasImage={!!(element as any).image}
                                                                            listType={element.listType}
                                                                            onListTypeChange={(type) => updateElement(sIdx, ssIdx, eIdx, 'listType', type)}
                                                                            columns={element.columns}
                                                                            onColumnsChange={element.type !== 'p' && element.type !== 'table' ? (columns) => updateElement(sIdx, ssIdx, eIdx, 'columns', columns) : undefined}
                                                                        />
                                                                    </div>

                                                                    {element.listType && (
                                                                        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                                                                            <div className="font-medium mb-1">💡 Mode liste actif :</div>
                                                                            <div>• Chaque ligne = {element.listType === 'bullet' ? 'une puce ⭐' : 'un numéro ①②③'}</div>
                                                                            <div className="text-xs text-purple-600">
                                                                                <span className="font-medium">🎯 NoBullet:</span> Commencez une ligne par <code className="px-1 bg-purple-100 rounded">&gt;&gt;</code> pour la masquer (utile pour titres/notes)
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {element.columns && (
                                                                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                                                            <span className="font-medium">🔲 Mode colonnes activé!</span> Le contenu sera affiché en colonnes côte à côte.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Display image if exists */}
                                                            {(element as any).image && (
                                                                <div className="mt-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                                                            <ImageIcon className="w-4 h-4" />
                                                                            Image attachée
                                                                        </h4>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm('Supprimer cette image ?')) {
                                                                                    const newLesson = { ...lesson! };
                                                                                    const elem = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
                                                                                    delete (elem as any).image;
                                                                                    setLesson(newLesson);
                                                                                    saveToHistory(newLesson);
                                                                                }
                                                                            }}
                                                                            className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                                                                            title="Supprimer l'image"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    <div className="bg-white rounded-lg p-3 mb-3">
                                                                        <div className="aspect-video flex items-center justify-center overflow-hidden rounded">
                                                                            <img 
                                                                                src={(element as any).image.src} 
                                                                                alt={(element as any).image.alt || ''}
                                                                                className="max-w-full max-h-full object-contain"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                                                        <div>
                                                                            <span className="font-medium">Position:</span> {(element as any).image.position || 'bottom'}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Alignement:</span> {(element as any).image.align || 'center'}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Largeur:</span> {(element as any).image.width || '100%'}
                                                                        </div>
                                                                        {(element as any).image.caption && (
                                                                            <div className="col-span-2">
                                                                                <span className="font-medium">Légende:</span> {(element as any).image.caption}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                <div className="flex gap-2">
                                                    {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => addElement(sIdx, ssIdx, type as LessonElementType)}
                                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                                                            title={`Ajouter ${config.label}`}
                                                        >
                                                            <span>{config.icon}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}
            
            {/* Image Upload Modal */}
            <ImageUploadModal 
                isOpen={imageModalOpen}
                onClose={() => {
                    setImageModalOpen(false);
                    setImageTargetPath(null);
                }}
                onUpload={handleImageUpload}
            />
        </div>
    );
};
