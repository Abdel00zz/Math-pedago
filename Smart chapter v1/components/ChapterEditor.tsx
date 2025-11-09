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
        <div className="space-y-8 p-8 max-w-4xl">
            <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                    Nom du Chapitre
                </label>
                <input
                    type="text"
                    value={editedChapter.chapter_name}
                    onChange={(e) => setEditedChapter(c => ({...c, chapter_name: e.target.value}))}
                    className="block w-full px-5 py-3.5 text-lg text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ex: Logique mathématique"
                />
            </div>
            <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                    Fichier de Leçon (optionnel)
                </label>
                <input
                    type="text"
                    value={editedChapter.lessonFile || ''}
                    onChange={(e) => setEditedChapter(c => ({...c, lessonFile: e.target.value || undefined}))}
                    className="block w-full px-5 py-3.5 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="lessons/logique_mathematique.json"
                />
                <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    💡 Chemin relatif vers le fichier JSON de la leçon pour ce chapitre
                </p>
            </div>
            <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                    Dates des Séances (format ISO 8601)
                </label>
                <textarea
                    rows={6}
                    value={editedChapter.session_dates.join('\n')}
                    onChange={(e) => setEditedChapter(c => ({...c, session_dates: e.target.value.split('\n').filter(d => d.trim() !== '')}))}
                    className="block w-full px-5 py-3.5 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-3" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[98vw] h-[96vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Édition du Chapitre</h2>
                        <p className="text-sm text-gray-600 mt-1">{chapter.chapter_name}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        title="Fermer (Échap)"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                        <nav className="flex flex-col space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-lg text-base font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                                            : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-102'
                                    }`}
                                >
                                    <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
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
                <footer className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all"
                    >
                        Sauvegarder les Modifications
                    </button>
                </footer>
            </div>
        </div>
    );
};
