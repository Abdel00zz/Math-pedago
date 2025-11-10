/**
 * LessonEditor - Éditeur de leçons refactorisé et modulaire
 * Version améliorée avec composants séparés
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EditorToolbar } from './lesson-editor-parts/EditorToolbar';
import { StructureNavigator } from './lesson-editor-parts/StructureNavigator';
import { EditorPanel } from './lesson-editor-parts/EditorPanel';
import { LessonPreview } from './lesson-editor/LessonPreview';
import { ImageUploadModal, ImageConfig } from './ImageUploadModal';
import { FileSystemDirectoryHandle } from '../types';
import '../lesson-editor/editor-styles.css';

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
    content?: string | string[] | any[];
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    columns?: boolean;
    image?: any;
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

export const LessonEditor: React.FC<LessonEditorProps> = ({
    chapterId,
    lessonFilePath,
    classType,
    dirHandle,
    onUpdateLessonPath
}) => {
    // State
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<LessonContent[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTargetPath, setImageTargetPath] = useState<{ sIdx: number; ssIdx: number; eIdx: number } | null>(null);

    const elementRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // ========================================
    // FILE OPERATIONS
    // ========================================

    // Load lesson from filesystem
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

    // Save lesson to filesystem
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

    // ========================================
    // HISTORY MANAGEMENT
    // ========================================

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

    // ========================================
    // HEADER OPERATIONS
    // ========================================

    const updateHeader = useCallback((field: keyof LessonHeader, value: string) => {
        if (!lesson) return;
        const newLesson = { ...lesson, header: { ...lesson.header, [field]: value } };
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // ========================================
    // SECTION OPERATIONS
    // ========================================

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

    const updateSection = useCallback((sIdx: number, field: string, value: any) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        (newLesson.sections[sIdx] as any)[field] = value;
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const deleteSection = useCallback((sIdx: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections.splice(sIdx, 1);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const moveSectionUp = useCallback((sIdx: number) => {
        if (!lesson || sIdx === 0) return;
        const newLesson = { ...lesson };
        [newLesson.sections[sIdx - 1], newLesson.sections[sIdx]] =
            [newLesson.sections[sIdx], newLesson.sections[sIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const moveSectionDown = useCallback((sIdx: number) => {
        if (!lesson || sIdx === lesson.sections.length - 1) return;
        const newLesson = { ...lesson };
        [newLesson.sections[sIdx], newLesson.sections[sIdx + 1]] =
            [newLesson.sections[sIdx + 1], newLesson.sections[sIdx]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    // ========================================
    // SUBSECTION OPERATIONS
    // ========================================

    const addSubsection = useCallback((sIdx: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections[sIdx].subsections.push({
            title: `Sous-section ${newLesson.sections[sIdx].subsections.length + 1}`,
            elements: []
        });
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const updateSubsection = useCallback((sIdx: number, ssIdx: number, field: string, value: any) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        (newLesson.sections[sIdx].subsections[ssIdx] as any)[field] = value;
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const moveSubsectionUp = useCallback((sIdx: number, ssIdx: number) => {
        if (!lesson || ssIdx === 0) return;
        const newLesson = { ...lesson };
        const subsections = newLesson.sections[sIdx].subsections;
        [subsections[ssIdx - 1], subsections[ssIdx]] =
            [subsections[ssIdx], subsections[ssIdx - 1]];
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

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

    // ========================================
    // ELEMENT OPERATIONS
    // ========================================

    const addElement = useCallback((sIdx: number, ssIdx: number, type: LessonElementType) => {
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

        newLesson.sections[sIdx].subsections[ssIdx].elements.push(element);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const deleteElement = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        newLesson.sections[sIdx].subsections[ssIdx].elements.splice(eIdx, 1);
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

    const updateElement = useCallback((
        sIdx: number,
        ssIdx: number,
        eIdx: number,
        field: string,
        value: any
    ) => {
        if (!lesson) return;
        const newLesson = { ...lesson };
        const element = newLesson.sections[sIdx].subsections[ssIdx].elements[eIdx];
        (element as any)[field] = value;
        setLesson(newLesson);
        saveToHistory(newLesson);
    }, [lesson, saveToHistory]);

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

    // ========================================
    // IMAGE OPERATIONS
    // ========================================

    const openImageModal = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        setImageTargetPath({ sIdx, ssIdx, eIdx });
        setImageModalOpen(true);
    }, []);

    const handleImageUpload = useCallback(async (imageConfig: ImageConfig) => {
        if (!dirHandle || !imageTargetPath) {
            alert('Aucun répertoire de projet disponible');
            return;
        }

        const { sIdx, ssIdx, eIdx } = imageTargetPath;

        try {
            const file = imageConfig.file;
            const fileName = file.name;
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
                    const nameParts = fileName.split('.');
                    const ext = nameParts.pop();
                    const baseName = nameParts.join('.');
                    finalFileName = `${baseName}_${counter}.${ext}`;
                    counter++;
                } catch {
                    break;
                }
            }

            // Write the file
            const newFileHandle = await picturesHandle.getFileHandle(finalFileName, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(arrayBuffer);
            await writable.close();

            // Create image metadata
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

            alert(`Image "${finalFileName}" ajoutée avec succès !`);
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Erreur lors du téléchargement de l\'image');
        }
    }, [dirHandle, lesson, saveToHistory, imageTargetPath, classType]);

    // ========================================
    // UI HELPERS
    // ========================================

    const toggleSection = useCallback((path: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedSections(newExpanded);
    }, [expandedSections]);

    const scrollToElement = useCallback((sIdx: number, ssIdx: number, eIdx: number) => {
        const path = `s${sIdx}-ss${ssIdx}-e${eIdx}`;
        setSelectedPath(path);
        const element = elementRefs.current[path];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.backgroundColor = '#dbeafe';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
        }
    }, []);

    // ========================================
    // RENDER
    // ========================================

    if (isLoading) {
        return (
            <div className="lesson-editor-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div>Chargement de la leçon...</div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-editor-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
                    <div>Aucune leçon chargée</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="lesson-editor-container">
                {/* Left panel - Structure Navigator */}
                <StructureNavigator
                    lesson={lesson}
                    expandedSections={expandedSections}
                    onToggleSection={toggleSection}
                    onUpdateHeader={updateHeader}
                    onAddSection={addSection}
                    onScrollToElement={scrollToElement}
                />

                {/* Right panel - Editor or Preview */}
                <div className="lesson-editor-panel">
                    <EditorToolbar
                        historyIndex={historyIndex}
                        historyLength={history.length}
                        onUndo={undo}
                        onRedo={redo}
                        previewMode={previewMode}
                        onTogglePreview={() => setPreviewMode(!previewMode)}
                        onSave={saveLesson}
                        isSaving={isSaving}
                        canSave={!!lesson}
                    />

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {previewMode ? (
                        <div className="lesson-editor-panel__content">
                            <LessonPreview lesson={lesson} highlightedPath={selectedPath} />
                        </div>
                    ) : (
                        <EditorPanel
                            lesson={lesson}
                            elementRefs={elementRefs}
                            onUpdateElement={updateElement}
                            onDeleteElement={deleteElement}
                            onMoveElementUp={moveElementUp}
                            onMoveElementDown={moveElementDown}
                            onOpenImageModal={openImageModal}
                            onUpdateSection={updateSection}
                            onUpdateSubsection={updateSubsection}
                            onAddSubsection={addSubsection}
                            onAddElement={addElement}
                            onMoveSectionUp={moveSectionUp}
                            onMoveSectionDown={moveSectionDown}
                            onMoveSubsectionUp={moveSubsectionUp}
                            onMoveSubsectionDown={moveSubsectionDown}
                            onDeleteSection={deleteSection}
                        />
                    )}
                </div>
            </div>

            {/* Image Upload Modal */}
            {imageModalOpen && (
                <ImageUploadModal
                    onClose={() => setImageModalOpen(false)}
                    onUpload={handleImageUpload}
                />
            )}
        </>
    );
};
