/**
 * LessonEditorV2 - Éditeur de leçons minimaliste et moderne
 * Version ultra-simplifiée avec auto-save et interface professionnelle
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    TrashIcon,
    PlusIcon,
    SaveIcon,
    EyeIcon,
    UndoIcon,
    RedoIcon,
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
    image?: any;
}

interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

interface LessonEditorV2Props {
    chapterId: string;
    lessonFilePath?: string;
    classType: string;
    dirHandle: FileSystemDirectoryHandle | null;
    onUpdateLessonPath: (path: string) => void;
}

const ELEMENT_CONFIGS: Record<LessonElementType, { label: string; icon: string; color: string }> = {
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

export const LessonEditorV2: React.FC<LessonEditorV2Props> = ({
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
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [history, setHistory] = useState<LessonContent[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [previewMode, setPreviewMode] = useState(false);

    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTargetPath, setImageTargetPath] = useState<{ sIdx: number; ssIdx: number; eIdx: number } | null>(null);

    // Auto-save timer
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Charger la leçon
    useEffect(() => {
        const loadLesson = async () => {
            if (!lessonFilePath || !dirHandle) {
                const emptyLesson: LessonContent = {
                    header: { title: '', subtitle: '', chapter: '', classe: '' },
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
                console.error('[LessonEditorV2] Error loading lesson:', err);
                setError(`Impossible de charger la leçon: ${err instanceof Error ? err.message : String(err)}`);
                const emptyLesson: LessonContent = {
                    header: { title: '', subtitle: '', chapter: '', classe: '' },
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

    // Auto-save effect
    useEffect(() => {
        if (!lesson || !dirHandle || !lessonFilePath) return;

        // Clear previous timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for auto-save after 3 seconds of inactivity
        autoSaveTimerRef.current = setTimeout(() => {
            saveLesson(true);
        }, 3000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [lesson]);

    // Sauvegarder la leçon
    const saveLesson = async (isAutoSave = false) => {
        if (!lesson || !dirHandle) {
            if (!isAutoSave) {
                alert('Aucune leçon à sauvegarder ou répertoire non disponible');
            }
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

            setLastSaved(new Date());
            if (!isAutoSave) {
                alert('Leçon sauvegardée avec succès !');
            }
        } catch (err) {
            console.error('Error saving lesson:', err);
            setError(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : String(err)}`);
            if (!isAutoSave) {
                alert('Erreur lors de la sauvegarde de la leçon');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const saveToHistory = useCallback((newLesson: LessonContent) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newLesson)));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

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

    const updateHeader = useCallback((field: keyof LessonHeader, value: string) => {
        if (!lesson) return;
        const newLesson = { ...lesson, header: { ...lesson.header, [field]: value } };
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

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

    const deleteElement = useCallback((sectionIndex: number, subsectionIndex: number, elementIndex: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections[sectionIndex].subsections[subsectionIndex].elements.splice(elementIndex, 1);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

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

    const openImageModal = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        setImageTargetPath({ sIdx, ssIdx, eIdx });
        setImageModalOpen(true);
    }, []);

    const handleImageUpload = useCallback(async (imageConfig: ImageConfig) => {
        if (!dirHandle || !imageTargetPath || !classType) {
            alert('Configuration incorrecte pour l\'upload');
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

            if (!lesson) return;

            const newLesson = { ...lesson };
            const element = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
            (element as any).image = imageMetadata;

            setLesson(newLesson);
            saveToHistory(newLesson);
            setImageModalOpen(false);

            alert(`Image "${finalFileName}" ajoutée !`);
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Erreur lors du téléchargement de l\'image');
        }
    }, [dirHandle, lesson, saveToHistory, imageTargetPath, classType]);

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        return lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Compact Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-gray-900">Éditeur de Leçon</h1>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Annuler"
                        >
                            <UndoIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Refaire"
                        >
                            <RedoIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-xs text-gray-500">
                            Sauvegardé: {formatLastSaved()}
                        </span>
                    )}
                    {isSaving && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Sauvegarde...
                        </span>
                    )}
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5 transition-colors"
                        disabled={!lesson}
                    >
                        <EyeIcon className="w-4 h-4" />
                        {previewMode ? 'Éditer' : 'Aperçu'}
                    </button>
                    <button
                        onClick={() => saveLesson(false)}
                        className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        disabled={isSaving || !lesson}
                    >
                        <SaveIcon className="w-4 h-4" />
                        Sauvegarder
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-6 py-2 bg-red-50 border-b border-red-200">
                    <p className="text-xs text-red-700">⚠️ {error}</p>
                </div>
            )}

            {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-2 text-gray-600 text-sm">Chargement...</p>
                    </div>
                </div>
            )}

            {!isLoading && !lesson && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="text-lg font-semibold">Aucune leçon</p>
                        <p className="text-sm mt-1">Définissez un chemin dans l'onglet Information</p>
                    </div>
                </div>
            )}

            {!isLoading && lesson && (
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-6">
                        {/* Header compact */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <input
                                type="text"
                                value={lesson.header.title}
                                onChange={(e) => updateHeader('title', e.target.value)}
                                placeholder="Titre de la leçon"
                                className="w-full text-2xl font-bold text-gray-900 border-none outline-none mb-2"
                            />
                            <input
                                type="text"
                                value={lesson.header.subtitle || ''}
                                onChange={(e) => updateHeader('subtitle', e.target.value)}
                                placeholder="Sous-titre (optionnel)"
                                className="w-full text-lg text-gray-600 border-none outline-none"
                            />
                        </div>

                        {/* Sections */}
                        <div className="space-y-6">
                            {lesson.sections.map((section, sIdx) => (
                                <div key={sIdx} className="bg-white rounded-lg shadow-sm p-6">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => {
                                            const newLesson = { ...lesson };
                                            newLesson.sections[sIdx].title = e.target.value;
                                            setLesson(newLesson);
                                            saveToHistory(newLesson);
                                        }}
                                        className="w-full text-xl font-bold text-gray-900 border-none outline-none mb-4"
                                        placeholder="Titre de la section"
                                    />

                                    {section.subsections.map((subsection, ssIdx) => (
                                        <div key={ssIdx} className="mb-6 pl-4 border-l-2 border-blue-500">
                                            <input
                                                type="text"
                                                value={subsection.title}
                                                onChange={(e) => {
                                                    const newLesson = { ...lesson };
                                                    newLesson.sections[sIdx].subsections[ssIdx].title = e.target.value;
                                                    setLesson(newLesson);
                                                    saveToHistory(newLesson);
                                                }}
                                                className="w-full text-lg font-semibold text-gray-900 border-none outline-none mb-3"
                                                placeholder="Titre de la sous-section"
                                            />

                                            <div className="space-y-3">
                                                {subsection.elements.map((element, eIdx) => {
                                                    const config = ELEMENT_CONFIGS[element.type];
                                                    return (
                                                        <div key={eIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                                                    <span>{config.icon}</span>
                                                                    {config.label}
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    {element.type !== 'p' && element.type !== 'table' && (
                                                                        <button
                                                                            onClick={() => openImageModal(sIdx, ssIdx, eIdx)}
                                                                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                                                            title="Ajouter une image"
                                                                        >
                                                                            <ImageIcon className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => deleteElement(sIdx, ssIdx, eIdx)}
                                                                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                                                                        title="Supprimer"
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
                                                                    rows={3}
                                                                    elementType="p"
                                                                />
                                                            ) : element.type === 'table' ? (
                                                                <RichTextEditor
                                                                    value={element.content as string}
                                                                    onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value)}
                                                                    placeholder="Format tableau Markdown..."
                                                                    rows={4}
                                                                    elementType="table"
                                                                />
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <RichTextEditor
                                                                        value={element.preamble || ''}
                                                                        onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'preamble', value)}
                                                                        placeholder="Préambule (optionnel)..."
                                                                        rows={2}
                                                                        elementType={`${element.type}-preamble`}
                                                                    />
                                                                    <select
                                                                        value={element.listType || 'none'}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value === 'none' ? undefined : e.target.value as 'bullet' | 'numbered';
                                                                            updateElement(sIdx, ssIdx, eIdx, 'listType', value);
                                                                        }}
                                                                        className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                                                                    >
                                                                        <option value="none">Texte simple</option>
                                                                        <option value="bullet">Puces</option>
                                                                        <option value="numbered">Numérotée</option>
                                                                    </select>
                                                                    <RichTextEditor
                                                                        value={Array.isArray(element.content) ? element.content.join('\n') : (element.content || '')}
                                                                        onChange={(value) => updateElement(sIdx, ssIdx, eIdx, 'content', value.split('\n'))}
                                                                        placeholder="Contenu..."
                                                                        rows={4}
                                                                        elementType={element.type}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add Element Buttons - Compact */}
                                                <div className="flex gap-1 flex-wrap">
                                                    {Object.entries(ELEMENT_CONFIGS).map(([type, config]) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => addElement(sIdx, ssIdx, type as LessonElementType)}
                                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                                                            title={`Ajouter ${config.label}`}
                                                        >
                                                            {config.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addSubsection(sIdx)}
                                        className="mt-4 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded flex items-center gap-2"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Ajouter une sous-section
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addSection}
                            className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Ajouter une section
                        </button>
                    </div>
                </div>
            )}

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
