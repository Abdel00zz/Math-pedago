import React, { useState, useEffect } from 'react';
import { ChapterData, FileSystemDirectoryHandle } from '../types';
import { VideoEditor } from './VideoEditor';
import { QuizEditor } from './QuizEditor';
import { ExerciseEditor } from './ExerciseEditor';
import { DocumentTextIcon, VideoCameraIcon, QuestionMarkCircleIcon, PencilSquareIcon, InformationCircleIcon } from './icons';

interface ChapterEditorProps {
    chapter: ChapterData;
    onClose: () => void;
    onSave: (updatedChapter: ChapterData) => void;
    dirHandle: FileSystemDirectoryHandle | null;
}

type Tab = 'info' | 'videos' | 'quiz' | 'exercises';

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
                <label className="block text-sm font-medium text-slate-700">Chapter Name</label>
                <input
                    type="text"
                    value={editedChapter.chapter_name}
                    onChange={(e) => setEditedChapter(c => ({...c, chapter_name: e.target.value}))}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-slate-900"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Session Dates (ISO 8601 format)</label>
                <textarea
                    rows={4}
                    value={editedChapter.session_dates.join('\n')}
                    onChange={(e) => setEditedChapter(c => ({...c, session_dates: e.target.value.split('\n').filter(d => d.trim() !== '')}))}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-slate-900"
                    placeholder="2025-09-01T14:00:00Z&#10;2025-09-08T14:00:00Z"
                />
            </div>
        </div>
    );

    const tabs: { id: Tab, name: string, icon: React.FC<any> }[] = [
        { id: 'info', name: 'Information', icon: InformationCircleIcon },
        { id: 'videos', name: 'Videos', icon: VideoCameraIcon },
        { id: 'quiz', name: 'Quiz', icon: QuestionMarkCircleIcon },
        { id: 'exercises', name: 'Exercises', icon: PencilSquareIcon },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Editing: {chapter.chapter_name}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
                </header>
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-48 bg-white border-r border-slate-200 p-2">
                        <nav className="flex flex-col space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <tab.icon className="!text-xl" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                    <main className="flex-1 bg-white overflow-y-auto">
                        {activeTab === 'info' && <InfoTab />}
                        {activeTab === 'videos' && <VideoEditor chapter={editedChapter} setChapter={setEditedChapter} />}
                        {activeTab === 'quiz' && <QuizEditor chapter={editedChapter} setChapter={setEditedChapter} />}
                        {activeTab === 'exercises' && <ExerciseEditor chapter={editedChapter} setChapter={setEditedChapter} dirHandle={dirHandle} />}
                    </main>
                </div>
                <footer className="flex justify-end items-center p-4 border-t border-slate-200 bg-slate-50/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                        Save Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};
