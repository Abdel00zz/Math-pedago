import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChapterData, Manifest, CLASSES_DATA, FileSystemDirectoryHandle } from './types';
import { parseChapterFile } from './utils/parser';
import { calculateContentVersion } from './utils/versioning';
import { ChapterTable } from './components/ChapterTable';
import { ChapterEditor } from './components/ChapterEditor';
import {
    BookOpenIcon,
    UploadCloudIcon,
    SaveIcon,
    RefreshIcon,
    InformationCircleIcon,
    HomeIcon,
    XCircleIcon,
    LayoutIcon
} from './components/icons';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="text-center p-12 bg-white shadow-2xl rounded-2xl max-w-2xl animate-fade-in">
                {/* Logo/Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mb-6">
                    <BookOpenIcon className="w-14 h-14 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Smart Chapter Manager
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Éditeur moderne et puissant pour gérer vos chapitres pédagogiques.<br />
                    Sélectionnez le répertoire de votre projet pour commencer.
                </p>

                {/* Button */}
                <div className="mb-6">
                    <button
                        onClick={handleOpenDirectory}
                        disabled={isLoading || !isApiSupported}
                        className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl"
                    >
                        <UploadCloudIcon className="w-6 h-6" />
                        {isLoading ? 'Chargement du projet...' : 'Ouvrir le Répertoire du Projet'}
                    </button>
                </div>

                {/* Browser support warning */}
                {!isApiSupported && (
                    <div className="mt-6 p-4 bg-warning-50 text-warning-800 border-2 border-warning-300 rounded-xl text-sm flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                            <div className="font-semibold mb-1">Navigateur non supporté</div>
                            <div>Votre navigateur ne supporte pas l'édition directe de fichiers. Veuillez utiliser une version récente de Chrome ou Edge.</div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mt-6 p-4 bg-danger-50 text-danger-800 border-2 border-danger-300 rounded-xl text-sm text-left">
                        <div className="font-semibold mb-2 flex items-center gap-2">
                            <XCircleIcon className="w-5 h-5" />
                            Erreur
                        </div>
                        <div className="text-danger-700">{error}</div>
                    </div>
                )}

                {/* Features */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <LayoutIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">Interface Moderne</div>
                            <div className="text-xs text-gray-600 mt-1">Design aéré et intuitif</div>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <BookOpenIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">Arbre d'Édition</div>
                            <div className="text-xs text-gray-600 mt-1">Navigation hiérarchique</div>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <SaveIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">Sauvegarde Directe</div>
                            <div className="text-xs text-gray-600 mt-1">Édition en temps réel</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!manifest) {
        return <InitialScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header moderne et aéré */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Smart Chapter Manager</h1>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {projectPath || 'Projet chargé'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGoHome}
                            className="btn btn-secondary"
                            title="Retour à la sélection de projet"
                        >
                            <HomeIcon className="w-5 h-5" />
                            Accueil
                        </button>
                        <button
                            onClick={handleReload}
                            disabled={isLoading}
                            className="btn btn-secondary"
                            title="Recharger le projet"
                        >
                            <RefreshIcon className="w-5 h-5" />
                            Actualiser
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={isLoading}
                            className="btn btn-primary shadow-lg"
                            title="Sauvegarder toutes les modifications"
                        >
                            {isLoading ? (
                                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <SaveIcon className="w-5 h-5" />
                            )}
                            {isLoading ? 'Sauvegarde...' : 'Tout Sauvegarder'}
                        </button>
                    </div>
                </div>

                {/* Onglets des classes */}
                <div className="border-t border-gray-200 bg-gray-50">
                    <nav className="container mx-auto px-6 flex gap-2 overflow-x-auto">
                        {CLASSES_DATA.map(classData => (
                            <button
                                key={classData.value}
                                onClick={() => setActiveTab(classData.value)}
                                className={`
                                    px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-3 transition-all
                                    ${activeTab === classData.value
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                                    }
                                `}
                            >
                                {classData.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="container mx-auto p-6">
                {editingChapter ? (
                    <ChapterEditor
                        chapter={editingChapter}
                        onClose={() => setEditingChapter(null)}
                        onSave={handleSaveChapter}
                        dirHandle={dirHandleRef.current}
                    />
                ) : (
                    <div className="animate-fade-in">
                        <ChapterTable
                            chapters={getChaptersByClass(activeTab)}
                            onEditChapter={setEditingChapter}
                            onUpdateActive={updateChapterActive}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
