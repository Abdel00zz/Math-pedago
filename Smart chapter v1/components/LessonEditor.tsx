/**
 * LessonEditor - Éditeur professionnel de leçons avec split-view
 * Édition à gauche, aperçu en temps réel à droite
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    TrashIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    SaveIcon,
    EyeIcon,
    UndoIcon,
    RedoIcon,
    BookOpenIcon,
    ImageIcon,
    LayoutIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from './icons';
import { FileSystemDirectoryHandle } from '../types';
import { ImageUploadModal, ImageConfig } from './ImageUploadModal';
import { LessonPreview } from './LessonPreview';
import { RichTextToolbar } from './RichTextToolbar';

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
    intro?: string;
    subsections: LessonSubsection[];
}

interface LessonSubsection {
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
    content?: string | string[];
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    columns?: boolean;
    image?: {
        src: string;
        alt?: string;
        caption?: string;
        position?: string;
        align?: string;
        width?: string;
    };
}

interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

interface LessonEditorProps {
    chapterId: string;
    lessonFilePath?: string;
    classType: string;
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
    const [showPreview, setShowPreview] = useState(true);

    const [history, setHistory] = useState<LessonContent[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Image upload modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTargetPath, setImageTargetPath] = useState<{ sIdx: number; ssIdx: number; eIdx: number } | null>(null);

    // Charger la leçon depuis le fichier
    useEffect(() => {
        const loadLesson = async () => {
            if (!lessonFilePath || !dirHandle) {
                const emptyLesson: LessonContent = {
                    header: { title: '', subtitle: '', chapter: '', classe: '', academicYear: '' },
                    sections: []
                };
                setLesson(emptyLesson);
                setHistory([JSON.parse(JSON.stringify(emptyLesson))]);
                setHistoryIndex(0);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const chaptersHandle = await dirHandle.getDirectoryHandle('chapters');
                const classHandle = await chaptersHandle.getDirectoryHandle(classType);

                const pathParts = lessonFilePath.split('/');
                let currentHandle: any = classHandle;

                for (let i = 0; i < pathParts.length - 1; i++) {
                    currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
                }

                const fileName = pathParts[pathParts.length - 1];
                const fileHandle = await currentHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                const content = await file.text();
                const loadedLesson = JSON.parse(content);

                setLesson(loadedLesson);
                setHistory([JSON.parse(JSON.stringify(loadedLesson))]);
                setHistoryIndex(0);
            } catch (err) {
                console.error('[LessonEditor] Error loading lesson:', err);
                setError(`Impossible de charger la leçon: ${err instanceof Error ? err.message : String(err)}`);
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
            const chaptersHandle = await dirHandle.getDirectoryHandle('chapters');
            const classHandle = await chaptersHandle.getDirectoryHandle(classType);

            const pathParts = savePath.split('/');
            let currentHandle: any = classHandle;

            for (let i = 0; i < pathParts.length - 1; i++) {
                currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
            }

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

    // Undo/Redo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLesson(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    }, [history, historyIndex]);

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
        setExpandedSections(prev => new Set([...prev, `section-${lesson.sections.length}`]));
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

    // Move elements
    const moveElementUp = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        if (!lesson || eIdx === 0) return;
        const newLesson = { ...lesson };
        const elements = newLesson.sections[sIdx].subsections[ssIdx].elements;
        [elements[eIdx - 1], elements[eIdx]] = [elements[eIdx], elements[eIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

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

    // Image upload
    const openImageModal = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        setImageTargetPath({ sIdx, ssIdx, eIdx });
        setImageModalOpen(true);
    }, []);

    const handleImageUpload = useCallback(async (imageConfig: ImageConfig) => {
        if (!dirHandle || !imageTargetPath || !lesson) {
            alert('Aucun répertoire de projet disponible');
            return;
        }

        const { sIdx, ssIdx, eIdx } = imageTargetPath;

        try {
            const file = imageConfig.file;
            const fileName = file.name;
            const arrayBuffer = await file.arrayBuffer();

            const chaptersHandle = await dirHandle.getDirectoryHandle('chapters', { create: true });
            const classHandle = await chaptersHandle.getDirectoryHandle(classType, { create: true });
            const lessonsHandle = await classHandle.getDirectoryHandle('lessons', { create: true });
            const picturesHandle = await lessonsHandle.getDirectoryHandle('pictures', { create: true });

            let finalFileName = fileName;
            let counter = 1;
            while (true) {
                try {
                    await picturesHandle.getFileHandle(finalFileName);
                    const nameParts = fileName.split('.');
                    const ext = nameParts.pop();
                    const baseName = nameParts.join('.');
                    finalFileName = `${baseName}_${counter}.${ext}`;
                    counter++;
                } catch {
                    break;
                }
            }

            const newFileHandle = await picturesHandle.getFileHandle(finalFileName, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(arrayBuffer);
            await writable.close();

            const imagePath = `/chapters/${classType}/lessons/pictures/${finalFileName}`;

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

            const newLesson = { ...lesson };
            const element = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement de la leçon...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-700">
                    <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold text-lg text-gray-900">Aucune leçon disponible</p>
                    <p className="text-sm mt-2 text-gray-600">Définissez un chemin de fichier dans l'onglet Information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Toolbar Moderne */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {/* Gauche : Titre et actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                <BookOpenIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Éditeur de Leçon</h1>
                                <p className="text-xs text-gray-600">{lesson.header.title || 'Nouvelle leçon'}</p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-300"></div>

                        {/* Undo/Redo */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                className="btn btn-secondary btn-sm"
                                title="Annuler (Ctrl+Z)"
                            >
                                <UndoIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                className="btn btn-secondary btn-sm"
                                title="Refaire (Ctrl+Y)"
                            >
                                <RedoIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-300"></div>

                        {/* Add Section */}
                        <button
                            onClick={addSection}
                            className="btn btn-secondary btn-sm"
                            title="Ajouter une section"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Section
                        </button>
                    </div>

                    {/* Droite : Actions principales */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <LayoutIcon className="w-4 h-4" />
                            {showPreview ? 'Masquer Aperçu' : 'Afficher Aperçu'}
                        </button>
                        <button
                            onClick={saveLesson}
                            className="btn btn-primary shadow-lg"
                            disabled={isSaving}
                        >
                            <SaveIcon className="w-5 h-5" />
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Editor */}
                <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 transition-all duration-300`}>
                    {/* Header Form */}
                    <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">En-tête de la Leçon</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={lesson.header.title}
                                onChange={(e) => updateHeader('title', e.target.value)}
                                placeholder="Titre de la leçon"
                                className="form-input col-span-2"
                            />
                            <input
                                type="text"
                                value={lesson.header.subtitle || ''}
                                onChange={(e) => updateHeader('subtitle', e.target.value)}
                                placeholder="Sous-titre"
                                className="form-input"
                            />
                            <input
                                type="text"
                                value={lesson.header.chapter || ''}
                                onChange={(e) => updateHeader('chapter', e.target.value)}
                                placeholder="Chapitre"
                                className="form-input"
                            />
                            <input
                                type="text"
                                value={lesson.header.classe || ''}
                                onChange={(e) => updateHeader('classe', e.target.value)}
                                placeholder="Classe"
                                className="form-input"
                            />
                            <input
                                type="text"
                                value={lesson.header.academicYear || ''}
                                onChange={(e) => updateHeader('academicYear', e.target.value)}
                                placeholder="Année académique"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Sections Editor - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {lesson.sections.map((section, sIdx) => (
                            <div key={sIdx} className="card">
                                {/* Section Header */}
                                <div className="card-header">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <button
                                                onClick={() => toggleSection(`section-${sIdx}`)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                {expandedSections.has(`section-${sIdx}`) ? (
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-700" />
                                                ) : (
                                                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                                )}
                                            </button>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newLesson = { ...lesson };
                                                    newLesson.sections[sIdx].title = e.target.value;
                                                    setLesson(newLesson);
                                                    saveToHistory(newLesson);
                                                }}
                                                className="flex-1 font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                                                placeholder="Titre de la section"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => addSubsection(sIdx)}
                                                className="btn btn-sm btn-secondary"
                                                title="Ajouter une sous-section"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Supprimer cette section ?')) {
                                                        const newLesson = { ...lesson };
                                                        newLesson.sections.splice(sIdx, 1);
                                                        setLesson(newLesson);
                                                        saveToHistory(newLesson);
                                                    }
                                                }}
                                                className="btn btn-sm text-red-600 hover:bg-red-50"
                                                title="Supprimer la section"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Content */}
                                {expandedSections.has(`section-${sIdx}`) && (
                                    <div className="card-body space-y-4">
                                        {/* Intro optionnelle */}
                                        <div>
                                            <label className="form-label text-xs">Texte introductif (optionnel)</label>
                                            <textarea
                                                value={section.intro || ''}
                                                onChange={(e) => {
                                                    const newLesson = { ...lesson };
                                                    newLesson.sections[sIdx].intro = e.target.value;
                                                    setLesson(newLesson);
                                                    saveToHistory(newLesson);
                                                }}
                                                className="form-textarea"
                                                rows={2}
                                                placeholder="Texte d'introduction pour cette section..."
                                            />
                                        </div>

                                        {/* Subsections */}
                                        {section.subsections.map((subsection, ssIdx) => (
                                            <div key={ssIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <input
                                                        type="text"
                                                        value={subsection.title}
                                                        onChange={(e) => {
                                                            const newLesson = { ...lesson };
                                                            newLesson.sections[sIdx].subsections[ssIdx].title = e.target.value;
                                                            setLesson(newLesson);
                                                            saveToHistory(newLesson);
                                                        }}
                                                        className="flex-1 font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Titre de la sous-section"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Supprimer cette sous-section ?')) {
                                                                const newLesson = { ...lesson };
                                                                newLesson.sections[sIdx].subsections.splice(ssIdx, 1);
                                                                setLesson(newLesson);
                                                                saveToHistory(newLesson);
                                                            }
                                                        }}
                                                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Elements */}
                                                <div className="space-y-3">
                                                    {subsection.elements.map((element, eIdx) => {
                                                        const config = ELEMENT_CONFIGS[element.type];
                                                        return (
                                                            <div key={eIdx} className="border border-gray-300 rounded-lg p-3 bg-white">
                                                                {/* Element Header */}
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                                        <span>{config.icon}</span>
                                                                        <span>{config.label}</span>
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => moveElementUp(sIdx, ssIdx, eIdx)}
                                                                            disabled={eIdx === 0}
                                                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                                                                            title="Déplacer vers le haut"
                                                                        >
                                                                            <ArrowUpIcon className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveElementDown(sIdx, ssIdx, eIdx)}
                                                                            disabled={eIdx === subsection.elements.length - 1}
                                                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                                                                            title="Déplacer vers le bas"
                                                                        >
                                                                            <ArrowDownIcon className="w-4 h-4" />
                                                                        </button>
                                                                        {element.type !== 'table' && (
                                                                            <button
                                                                                onClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                                className={`p-1 rounded ${(element as any).image ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-blue-600'}`}
                                                                                title="Ajouter/Modifier image"
                                                                            >
                                                                                <ImageIcon className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => deleteElement(sIdx, ssIdx, eIdx)}
                                                                            className="p-1 rounded hover:bg-red-50 text-red-600"
                                                                            title="Supprimer"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Element Content */}
                                                                {element.type === 'p' ? (
                                                                    <RichTextToolbar
                                                                        value={element.content as string || ''}
                                                                        onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value)}
                                                                        elementType="p"
                                                                        onImageClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                    />
                                                                ) : element.type === 'table' ? (
                                                                    <textarea
                                                                        value={element.content as string}
                                                                        onChange={(e) => updateElement(sIdx, ssIdx, eIdx, 'content', e.target.value)}
                                                                        className="form-textarea font-mono text-sm"
                                                                        rows={6}
                                                                        placeholder="Format tableau Markdown..."
                                                                    />
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {/* Préambule avec toolbar */}
                                                                        <div>
                                                                            <label className="form-label text-xs text-gray-600 mb-1">Préambule</label>
                                                                            <RichTextToolbar
                                                                                value={element.preamble || ''}
                                                                                onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'preamble', typeof value === 'string' ? value : value.join('\n'))}
                                                                                elementType="box"
                                                                            />
                                                                        </div>

                                                                        {/* Contenu avec toolbar et liste */}
                                                                        <div>
                                                                            <label className="form-label text-xs text-gray-600 mb-1">Contenu</label>
                                                                            <RichTextToolbar
                                                                                value={Array.isArray(element.content) ? element.content : [element.content || '']}
                                                                                onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', Array.isArray(value) ? value : value.split('\n'))}
                                                                                elementType="box"
                                                                                listType={element.listType}
                                                                                onListTypeChange={(type) => updateElement(sIdx, ssIdx, eIdx, 'listType', type)}
                                                                                columns={element.columns}
                                                                                onColumnsChange={(cols) => updateElement(sIdx, ssIdx, eIdx, 'columns', cols)}
                                                                                onImageClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Image Preview */}
                                                                {(element as any).image && (
                                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-semibold text-blue-800">Image attachée</span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (confirm('Supprimer cette image ?')) {
                                                                                        const newLesson = { ...lesson };
                                                                                        const elem = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
                                                                                        delete (elem as any).image;
                                                                                        setLesson(newLesson);
                                                                                        saveToHistory(newLesson);
                                                                                    }
                                                                                }}
                                                                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                                                                            >
                                                                                <TrashIcon className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                        <p className="text-xs text-blue-700 truncate">{(element as any).image.src}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Add Element Buttons */}
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => addElement(sIdx, ssIdx, type as LessonElementType)}
                                                                className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                                                                title={`Ajouter ${config.label}`}
                                                            >
                                                                <span>{config.icon}</span>
                                                                <span className="text-xs">{config.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Empty State */}
                        {lesson.sections.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="font-medium">Aucune section</p>
                                <p className="text-sm mt-1">Cliquez sur "Section" pour commencer</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Preview */}
                {showPreview && (
                    <div className="w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 animate-slide-in-right">
                        <div className="h-full flex flex-col">
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <EyeIcon className="w-5 h-5 text-blue-600" />
                                        Aperçu en temps réel
                                    </h2>
                                    <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                                        Mise à jour automatique
                                    </span>
                                </div>
                            </div>
                            <LessonPreview lesson={lesson} />
                        </div>
                    </div>
                )}
            </div>

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
