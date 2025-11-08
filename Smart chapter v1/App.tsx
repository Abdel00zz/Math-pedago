import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChapterData, Manifest, CLASSES_DATA, FileSystemDirectoryHandle } from './types';
import { parseChapterFile } from './utils/parser';
import { calculateContentVersion } from './utils/versioning';
import { ChapterTable } from './components/ChapterTable';
import { ChapterEditor } from './components/ChapterEditor';
import { BookOpenIcon, UploadCloudIcon, SaveIcon, RefreshIcon, InformationCircleIcon, HomeIcon } from './components/icons';

// Type definitions for the File System Access API
// This avoids needing to install a separate @types package
interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | Blob | BufferSource): Promise<void>;
    close(): Promise<void>;
}

// --- Main App Component ---

const App: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [chapters, setChapters] = useState<Record<string, ChapterData>>({});
    const [projectPath, setProjectPath] = useState<string>('');
    const [activeTab, setActiveTab] = useState(CLASSES_DATA[0].value);
    const [editingChapter, setEditingChapter] = useState<ChapterData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
    const isApiSupported = 'showDirectoryPicker' in window;

    const loadProjectFromHandle = async (handle: FileSystemDirectoryHandle) => {
        setIsLoading(true);
        setError(null);
        setProjectPath(handle.name);
        dirHandleRef.current = handle;

        try {
            const manifestHandle = await handle.getFileHandle('manifest.json');
            const manifestFile = await manifestHandle.getFile();
            const manifestContent = await manifestFile.text();
            const newManifest: Manifest = JSON.parse(manifestContent);
            
            const chaptersDirHandle = await handle.getDirectoryHandle('chapters');
            const newChapters: Record<string, ChapterData> = {};

            for (const classType in newManifest) {
                for (const manifestEntry of newManifest[classType]) {
                    try {
                        // Support pour les chemins avec sous-dossiers (ex: "tcs/tcs_ensembles.json")
                        let chapterHandle: FileSystemFileHandle;
                        const filePath = manifestEntry.file;
                        
                        if (filePath.includes('/')) {
                            // Fichier dans un sous-dossier (nouvelle structure)
                            const [subFolder, fileName] = filePath.split('/');
                            const subDirHandle = await chaptersDirHandle.getDirectoryHandle(subFolder);
                            chapterHandle = await subDirHandle.getFileHandle(fileName);
                        } else {
                            // Fichier à la racine (ancienne structure)
                            chapterHandle = await chaptersDirHandle.getFileHandle(filePath);
                        }
                        
                        const chapterFile = await chapterHandle.getFile();
                        const fileContent = await chapterFile.text();
                        const parsedChapter = parseChapterFile(fileContent, manifestEntry, classType);
                        
                        // Utiliser un ID unique combinant class_type et id pour éviter les collisions
                        const uniqueId = `${classType}:${parsedChapter.id}`;
                        newChapters[uniqueId] = { ...parsedChapter, file_content: fileContent };
                    } catch (e) {
                         console.warn(`Could not load chapter file: ${manifestEntry.file}`, e);
                    }
                }
            }

            setManifest(newManifest);
            setChapters(newChapters);
        } catch (err) {
            console.error("Error loading project:", err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to load project. Ensure 'manifest.json' and a 'chapters' directory exist. Error: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenDirectory = async () => {
        if (!isApiSupported) {
            setError("The File System Access API is not supported in your browser. Please use a recent version of Chrome, Edge, or another compatible browser.");
            return;
        }
        try {
            // The 'as any' is a workaround for TypeScript not having the latest DOM types
            const handle = await (window as any).showDirectoryPicker();
            await loadProjectFromHandle(handle);
        } catch (err) {
            const error = err as Error;
            if (error.name !== 'AbortError') {
                console.error("Error picking directory:", error);
                let userMessage = `An error occurred while opening the directory: ${error.message}`;
                if (error.name === 'SecurityError' || error.message.includes('Cross origin')) {
                    userMessage = "Could not open directory picker due to security restrictions. This can happen in some embedded or sandboxed environments. Please ensure the app has the required permissions.";
                }
                setError(userMessage);
            }
        }
    };
    
    const handleReload = () => {
        if (dirHandleRef.current) {
            loadProjectFromHandle(dirHandleRef.current);
        } else {
            setError("No project directory is selected to reload.");
        }
    };

    const handleGoHome = () => {
        if (window.confirm("Return to project selection? Any unsaved changes will be lost.")) {
            setManifest(null);
            setChapters({});
            setProjectPath('');
            dirHandleRef.current = null;
            setError(null);
        }
    };

    const handleSaveChapter = (updatedChapter: ChapterData) => {
        const clonedChapters = { ...chapters };
        clonedChapters[updatedChapter.id] = { ...clonedChapters[updatedChapter.id], ...updatedChapter };
        setChapters(clonedChapters);
        setEditingChapter(null);
    };

    const handleSaveAll = async () => {
        if (!manifest || !dirHandleRef.current) {
            alert("No project loaded or directory handle is missing.");
            return;
        }

        setIsLoading(true);
        let changedFiles = 0;
        const updatedManifest = JSON.parse(JSON.stringify(manifest));
        const chaptersDirHandle = await dirHandleRef.current.getDirectoryHandle('chapters', { create: true });

        const savePromises = Object.values(chapters).map(async (chapter: ChapterData) => {
            const newVersion = calculateContentVersion(chapter);
            const manifestEntry = updatedManifest[chapter.class_type]?.find(c => c.id === chapter.id);
            
            let contentHasChanged = chapter.version !== newVersion;
            // Check if active status changed
            if (manifestEntry && manifestEntry.isActive !== chapter.is_active) {
                manifestEntry.isActive = chapter.is_active;
                // Force save even if content hash is the same
                contentHasChanged = true; 
            }

            if (contentHasChanged && manifestEntry) {
                changedFiles++;
                chapter.version = newVersion;
                manifestEntry.version = newVersion;
                
                const dataToSave = {
                    class: chapter.class_type,
                    chapter: chapter.chapter_name,
                    sessionDates: chapter.session_dates,
                    lessonFile: chapter.lessonFile || undefined, // Save lesson file path if defined
                    videos: chapter.videos.map(v => ({ id: v.id, title: v.title, youtubeId: v.youtubeId, duration: v.duration, description: v.description, thumbnail: v.thumbnail })),
                    quiz: chapter.quiz_questions,
                    exercises: chapter.exercises.map(ex => {
                        const sub_questions_to_save = ex.sub_questions.map(sq => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { hint, ...rest } = sq; // remove temporary hint property
                            return rest;
                        });
                        const hints_to_save = ex.sub_questions
                            .map((sq, index) => ({
                                text: sq.hint,
                                questionNumber: sq.questionNumber || (index + 1).toString()
                            }))
                            .filter((h): h is { text: string; questionNumber: string } => !!h.text && h.text.trim() !== '');
                        
                        return {
                             id: ex.id,
                             title: ex.title,
                             statement: ex.statement,
                             images: ex.images && ex.images.length > 0 ? ex.images : undefined,
                             sub_questions: sub_questions_to_save,
                             hint: hints_to_save.length > 0 ? hints_to_save : undefined,
                        }
                    }),
                    version: newVersion,
                };
                
                // Support pour les chemins avec sous-dossiers
                let chapterFileHandle: FileSystemFileHandle;
                const filePath = chapter.file_name;
                
                if (filePath.includes('/')) {
                    // Fichier dans un sous-dossier (nouvelle structure)
                    const [subFolder, fileName] = filePath.split('/');
                    const subDirHandle = await chaptersDirHandle.getDirectoryHandle(subFolder, { create: true });
                    chapterFileHandle = await subDirHandle.getFileHandle(fileName, { create: true });
                } else {
                    // Fichier à la racine (ancienne structure)
                    chapterFileHandle = await chaptersDirHandle.getFileHandle(filePath, { create: true });
                }
                
                const writable = await chapterFileHandle.createWritable();
                await writable.write(JSON.stringify(dataToSave, null, 2));
                await writable.close();
            }
        });

        // Save manifest if anything changed
        if (changedFiles > 0) {
            const manifestFileHandle = await dirHandleRef.current.getFileHandle('manifest.json', { create: true });
            const writable = await manifestFileHandle.createWritable();
            await writable.write(JSON.stringify(updatedManifest, null, 2));
            await writable.close();
        }

        await Promise.all(savePromises);
        setIsLoading(false);
        setManifest(updatedManifest);
        alert(`${changedFiles} chapter(s) and manifest.json have been saved directly to your folder.`);
    };

    const updateChapterActive = async (chapterId: string, isActive: boolean) => {
        console.log('updateChapterActive called:', { chapterId, isActive });
        console.log('Available chapter IDs:', Object.keys(chapters));
        console.log('Manifest structure:', JSON.stringify(manifest, null, 2));
        
        // Mettre à jour l'état local - trouver la bonne clé
        setChapters(prev => {
            console.log('Updating chapters state for:', chapterId);
            
            // Trouver la clé correspondante (peut être l'ID simple ou l'ID unique)
            let targetKey = chapterId;
            if (!prev[chapterId]) {
                // Chercher par ID unique
                targetKey = Object.keys(prev).find(key => {
                    const chapter = prev[key];
                    return chapter && chapter.id === chapterId;
                }) || chapterId;
            }
            
            console.log('Using key:', targetKey);
            console.log('Chapter exists in state:', !!prev[targetKey]);
            
            return {
                ...prev,
                [targetKey]: { ...prev[targetKey], is_active: isActive }
            };
        });

        // Mettre à jour le manifest
        const updatedManifest = { ...manifest };
        let found = false;
        
        // Trouver et mettre à jour l'entrée correspondante
        // Le chapterId peut être soit l'ID simple soit l'ID unique (classType:id)
        for (const classType in updatedManifest) {
            const classEntries = updatedManifest[classType];
            const entryIndex = classEntries.findIndex(entry => {
                // Chercher par ID simple OU par ID unique
                const uniqueId = `${classType}:${entry.id}`;
                return entry.id === chapterId || uniqueId === chapterId;
            });
            
            if (entryIndex !== -1) {
                console.log('Found entry to update:', { classType, entryIndex, entryId: classEntries[entryIndex].id, oldValue: classEntries[entryIndex].isActive, newValue: isActive });
                updatedManifest[classType] = [...classEntries];
                updatedManifest[classType][entryIndex] = {
                    ...classEntries[entryIndex],
                    isActive: isActive
                };
                found = true;
                break;
            }
        }

        if (!found) {
            console.error('Chapter not found in manifest:', chapterId);
            alert('Error: Chapter not found in manifest');
            return;
        }

        // Sauvegarder le manifest immédiatement
        try {
            if (dirHandleRef.current) {
                console.log('Saving manifest...');
                const manifestFileHandle = await dirHandleRef.current.getFileHandle('manifest.json', { create: true });
                const writable = await manifestFileHandle.createWritable();
                await writable.write(JSON.stringify(updatedManifest, null, 2));
                await writable.close();
                console.log('Manifest saved successfully');
            } else {
                console.error('No directory handle available');
                alert('Error: No directory handle available');
                return;
            }
        } catch (error) {
            console.error('Error saving manifest:', error);
            alert('Error saving status change: ' + error.message);
            return;
        }

        // Mettre à jour l'état du manifest
        setManifest(updatedManifest);
        console.log('Status update completed successfully');
    };

    const getChaptersByClass = (classType: string): ChapterData[] => {
        if (!manifest || !manifest[classType]) return [];
        // Filtrer les chapitres par class_type pour éviter les mélanges
        return manifest[classType]
            .map(entry => {
                const uniqueId = `${classType}:${entry.id}`;
                return chapters[uniqueId];
            })
            .filter(Boolean);
    };

    const InitialScreen = () => (
         <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
            <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-lg">
                <BookOpenIcon className="mx-auto !text-6xl text-blue-500" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">Smart Chapter Manager</h1>
                <p className="text-slate-600 mt-2">
                    Please select your project's root directory to load and edit files directly.
                </p>
                <div className="mt-6">
                    <button onClick={handleOpenDirectory} disabled={isLoading || !isApiSupported} className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        <UploadCloudIcon className="!text-2xl" />
                        {isLoading ? 'Loading Project...' : 'Open Project Directory'}
                    </button>
                </div>
                 {!isApiSupported && (
                    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md text-sm flex items-center gap-2">
                        <InformationCircleIcon className="!text-xl"/>
                        Your browser doesn't support direct file editing. Please use a recent version of Chrome or Edge.
                    </div>
                )}
                 {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md text-sm text-left">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    if (!manifest) {
        return <InitialScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <BookOpenIcon className="!text-3xl text-blue-600"/>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Smart Chapter Manager</h1>
                            <p className="text-sm text-slate-500">{projectPath || 'Project loaded'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={handleGoHome} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors text-sm">
                            <HomeIcon className="!text-xl"/> Home
                        </button>
                         <button onClick={handleReload} disabled={isLoading} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors text-sm disabled:opacity-50">
                            <RefreshIcon className="!text-xl"/> Reload
                        </button>
                        <button onClick={handleSaveAll} disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
                           {isLoading ? <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <SaveIcon className="!text-xl"/>}
                           {isLoading ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>
                 <div className="border-b border-slate-200">
                    <nav className="container mx-auto px-4 flex space-x-4">
                        {CLASSES_DATA.map(classData => (
                            <button
                                key={classData.value}
                                onClick={() => setActiveTab(classData.value)}
                                className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === classData.value
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {classData.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>
            <main className="container mx-auto p-4">
                {editingChapter ? (
                    <ChapterEditor
                        chapter={editingChapter}
                        onClose={() => setEditingChapter(null)}
                        onSave={handleSaveChapter}
                        dirHandle={dirHandleRef.current}
                    />
                ) : (
                    <ChapterTable
                        chapters={getChaptersByClass(activeTab)}
                        onEditChapter={setEditingChapter}
                        onUpdateActive={updateChapterActive}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
