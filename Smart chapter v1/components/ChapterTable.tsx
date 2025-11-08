import React from 'react';
import { ChapterData } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ChapterTableProps {
    chapters: ChapterData[];
    onEditChapter: (chapter: ChapterData) => void;
    onUpdateActive: (chapterId: string, isActive: boolean) => Promise<void>;
}

export const ChapterTable: React.FC<ChapterTableProps> = ({ chapters, onEditChapter, onUpdateActive }) => {
    const [updatingStatus, setUpdatingStatus] = React.useState<Set<string>>(new Set());

    const handleStatusChange = async (chapterId: string, isActive: boolean) => {
        setUpdatingStatus(prev => new Set([...prev, chapterId]));
        try {
            await onUpdateActive(chapterId, isActive);
        } catch (error) {
            console.error('Error updating chapter status:', error);
        } finally {
            setUpdatingStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(chapterId);
                return newSet;
            });
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Chapter</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Quiz</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Exercises</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {chapters.map(chapter => {
                            const isUpdating = updatingStatus.has(chapter.id);
                            return (
                            <tr key={chapter.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <label className={`flex items-center ${isUpdating ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={chapter.is_active} 
                                                onChange={(e) => handleStatusChange(chapter.id, e.target.checked)} 
                                                disabled={isUpdating}
                                            />
                                            <div className={`block w-10 h-6 rounded-full ${chapter.is_active ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${chapter.is_active ? 'transform translate-x-full' : ''}`}></div>
                                            {isUpdating && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        {chapter.is_active 
                                            ? <CheckCircleIcon className="ml-2 !text-xl text-green-500" title="Active"/>
                                            : <XCircleIcon className="ml-2 !text-xl text-slate-400" title="Inactive"/>
                                        }
                                    </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{chapter.chapter_name}</div>
                                    <div className="text-xs text-slate-500">{chapter.file_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {chapter.version}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{chapter.quiz_questions.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{chapter.exercises.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onEditChapter(chapter)} className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors" title="Edit Chapter">
                                            <EditIcon className="!text-xl" />
                                        </button>
                                        <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors" title="Delete Chapter (Not Implemented)">
                                            <TrashIcon className="!text-xl" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};