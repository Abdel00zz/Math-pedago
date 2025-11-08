import React, { useState, useEffect } from 'react';
import { ChapterData, FileSystemDirectoryHandle } from '../types';
import { VideoEditor } from './VideoEditor';
import { QuizEditor } from './QuizEditor';
import { ExerciseEditor } from './ExerciseEditor';
import { LessonEditor } from './LessonEditor';
import { DocumentTextIcon, VideoCameraIcon, QuestionMarkCircleIcon, PencilSquareIcon, InformationCircleIcon, BookOpenIcon } from './icons';

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

    const InfoTab: React.FC = () => (
        <div className="space-y-4 p-4">
            <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                    Nom du Chapitre
                </label>
                <input
                    type="text"
                    value={editedChapter.chapter_name}
                    onChange={(e) => setEditedChapter(c => ({...c, chapter_name: e.target.value}))}
                    className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Logique mathématique"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                    Fichier de Leçon (optionnel)
                </label>
                <input
                    type="text"
                    value={editedChapter.lessonFile || ''}
                    onChange={(e) => setEditedChapter(c => ({...c, lessonFile: e.target.value || undefined}))}
                    className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                    placeholder="lessons/logique_mathematique.json"
                />
                <p className="mt-1 text-[10px] text-gray-600">
                    Chemin relatif vers le fichier JSON de la leçon pour ce chapitre
                </p>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                    Dates des Séances (format ISO 8601)
                </label>
                <textarea
                    rows={4}
                    value={editedChapter.session_dates.join('\n')}
                    onChange={(e) => setEditedChapter(c => ({...c, session_dates: e.target.value.split('\n').filter(d => d.trim() !== '')}))}
                    className="block w-full px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                    placeholder="2025-09-01T14:00:00Z&#10;2025-09-08T14:00:00Z"
                />
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-2" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border border-slate-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div>
                        <h2 className="text-base font-bold text-white">Édition du Chapitre</h2>
                        <p className="text-xs text-blue-100 mt-0.5">{chapter.chapter_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                        title="Fermer (Échap)"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <aside className="w-44 bg-slate-50 border-r border-gray-200 p-2">
                        <nav className="flex flex-col space-y-0.5">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content Area */}
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
                </div>

                {/* Footer */}
                <footer className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-md shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all"
                    >
                        Sauvegarder
                    </button>
                </footer>
            </div>
        </div>
    );
};
