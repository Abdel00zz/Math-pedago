/**
 * ChapterEditor - Éditeur principal avec arbre hiérarchique et interface moderne
 * Layout à 3 panneaux : Arbre de navigation | Contenu principal | Propriétés
 */

import React, { useState, useEffect } from 'react';
import { ChapterData, FileSystemDirectoryHandle } from '../types';
import { VideoEditor } from './VideoEditor';
import { QuizEditor } from './QuizEditor';
import { ExerciseEditor } from './ExerciseEditor';
import { LessonEditor } from './LessonEditor';
import { TreeView } from './TreeView';
import {
    DocumentTextIcon,
    VideoCameraIcon,
    QuestionMarkCircleIcon,
    PencilSquareIcon,
    InformationCircleIcon,
    BookOpenIcon,
    SaveIcon,
    XCircleIcon,
    LayoutIcon,
    EyeIcon
} from './icons';

interface ChapterEditorProps {
    chapter: ChapterData;
    onClose: () => void;
    onSave: (updatedChapter: ChapterData) => void;
    dirHandle: FileSystemDirectoryHandle | null;
}

type Tab = 'info' | 'videos' | 'quiz' | 'exercises' | 'lesson';

export const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, onClose, onSave, dirHandle }) => {
    const [editedChapter, setEditedChapter] = useState<ChapterData>(() => JSON.parse(JSON.stringify(chapter)));
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [activeElement, setActiveElement] = useState<{ type: string; id?: string } | null>({ type: 'info' });
    const [showTreeView, setShowTreeView] = useState(true);
    const [showProperties, setShowProperties] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = () => {
        onSave(editedChapter);
    };

    // Gestionnaire pour la navigation depuis le TreeView
    const handleSelectElement = (type: string, id?: string) => {
        setActiveElement({ type, id });

        // Mapper le type à l'onglet approprié
        if (type === 'info') {
            setActiveTab('info');
        } else if (type === 'lesson' || type === 'lesson-content') {
            setActiveTab('lesson');
        } else if (type.includes('video')) {
            setActiveTab('videos');
        } else if (type.includes('quiz')) {
            setActiveTab('quiz');
        } else if (type.includes('exercise')) {
            setActiveTab('exercises');
        }
    };

    const InfoTab: React.FC = () => (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="space-y-8">
                {/* En-tête de section */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        Informations Générales
                    </h3>
                    <p className="text-sm text-gray-600">
                        Configurez les informations de base du chapitre
                    </p>
                </div>

                {/* Nom du chapitre */}
                <div className="form-group">
                    <label className="form-label">
                        Nom du Chapitre
                    </label>
                    <input
                        type="text"
                        value={editedChapter.chapter_name}
                        onChange={(e) => setEditedChapter(c => ({...c, chapter_name: e.target.value}))}
                        className="form-input"
                        placeholder="Ex: Logique mathématique"
                    />
                </div>

                {/* Fichier de leçon */}
                <div className="form-group">
                    <label className="form-label">
                        Fichier de Leçon
                        <span className="ml-2 text-xs font-normal text-gray-500">(optionnel)</span>
                    </label>
                    <input
                        type="text"
                        value={editedChapter.lessonFile || ''}
                        onChange={(e) => setEditedChapter(c => ({...c, lessonFile: e.target.value || undefined}))}
                        className="form-input"
                        placeholder="lessons/logique_mathematique.json"
                    />
                    <p className="form-help">
                        Chemin relatif vers le fichier JSON de la leçon pour ce chapitre
                    </p>
                </div>

                {/* Dates des séances */}
                <div className="form-group">
                    <label className="form-label">
                        Dates des Séances
                        <span className="ml-2 text-xs font-normal text-gray-500">(format ISO 8601)</span>
                    </label>
                    <textarea
                        rows={6}
                        value={editedChapter.session_dates.join('\n')}
                        onChange={(e) => setEditedChapter(c => ({...c, session_dates: e.target.value.split('\n').filter(d => d.trim() !== '')}))}
                        className="form-textarea font-mono"
                        placeholder="2025-09-01T14:00:00Z&#10;2025-09-08T14:00:00Z"
                    />
                    <p className="form-help">
                        Une date par ligne. Total : {editedChapter.session_dates.length} séance(s)
                    </p>
                </div>

                {/* Statistiques */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="text-sm font-semibold text-gray-900">Statistiques du Chapitre</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{editedChapter.session_dates.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Séances</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">{editedChapter.videos?.length || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Vidéos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">{editedChapter.quiz_questions?.length || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Quiz</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">{editedChapter.exercises?.length || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Exercices</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs: { id: Tab, name: string, icon: React.FC<any> }[] = [
        { id: 'info', name: 'Information', icon: InformationCircleIcon },
        { id: 'lesson', name: 'Leçon', icon: BookOpenIcon },
        { id: 'videos', name: 'Vidéos', icon: VideoCameraIcon },
        { id: 'quiz', name: 'Quiz', icon: QuestionMarkCircleIcon },
        { id: 'exercises', name: 'Exercices', icon: PencilSquareIcon },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col overflow-hidden animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex-shrink-0 flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Éditeur de Chapitre</h2>
                            <p className="text-sm text-gray-600 mt-0.5">{chapter.chapter_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Toggle TreeView */}
                        <button
                            onClick={() => setShowTreeView(!showTreeView)}
                            className={`btn btn-sm ${showTreeView ? 'btn-primary' : 'btn-secondary'}`}
                            title="Afficher/Masquer l'arbre"
                        >
                            <LayoutIcon className="w-4 h-4" />
                            Arbre
                        </button>

                        {/* Toggle Properties */}
                        <button
                            onClick={() => setShowProperties(!showProperties)}
                            className={`btn btn-sm ${showProperties ? 'btn-primary' : 'btn-secondary'}`}
                            title="Afficher/Masquer les propriétés"
                        >
                            <EyeIcon className="w-4 h-4" />
                            Propriétés
                        </button>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Fermer (Échap)"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Content avec 3 panneaux */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Panel 1: TreeView (Navigation) */}
                    {showTreeView && (
                        <aside className="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0 animate-slide-in-right">
                            <TreeView
                                chapter={editedChapter}
                                onSelectElement={handleSelectElement}
                                activeElement={activeElement}
                            />
                        </aside>
                    )}

                    {/* Panel 2: Main Content */}
                    <main className="flex-1 bg-white overflow-y-auto">
                        {activeTab === 'info' && <InfoTab />}
                        {activeTab === 'lesson' && (
                            <LessonEditor
                                chapterId={editedChapter.id}
                                lessonFilePath={editedChapter.lessonFile}
                                classType={editedChapter.class_type}
                                dirHandle={dirHandle}
                                onUpdateLessonPath={(path) => setEditedChapter(c => ({...c, lessonFile: path}))}
                            />
                        )}
                        {activeTab === 'videos' && <VideoEditor chapter={editedChapter} setChapter={setEditedChapter} />}
                        {activeTab === 'quiz' && <QuizEditor chapter={editedChapter} setChapter={setEditedChapter} />}
                        {activeTab === 'exercises' && <ExerciseEditor chapter={editedChapter} setChapter={setEditedChapter} dirHandle={dirHandle} />}
                    </main>

                    {/* Panel 3: Properties (optionnel, pour le futur) */}
                    {showProperties && (
                        <aside className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 animate-slide-in-right overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Propriétés</h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">ID</div>
                                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">{editedChapter.id}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Classe</div>
                                        <div className="font-semibold mt-1">{editedChapter.class_type.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Version</div>
                                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">{editedChapter.version}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Fichier</div>
                                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">{editedChapter.file_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Statut</div>
                                        <div className="mt-1">
                                            <span className={`badge ${editedChapter.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {editedChapter.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 flex justify-between items-center px-8 py-5 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        <XCircleIcon className="w-5 h-5" />
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary btn-lg"
                    >
                        <SaveIcon className="w-5 h-5" />
                        Sauvegarder les Modifications
                    </button>
                </footer>
            </div>
        </div>
    );
};
