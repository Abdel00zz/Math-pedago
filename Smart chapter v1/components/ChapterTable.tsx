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
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wide">Status</th>
                            <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wide">Chapter</th>
                            <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wide">Version</th>
                            <th scope="col" className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wide">Quiz</th>
                            <th scope="col" className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wide">Exercises</th>
                            <th scope="col" className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {chapters.map(chapter => {
                            const isUpdating = updatingStatus.has(chapter.id);
                            return (
                            <tr key={chapter.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <label className={`flex items-center ${isUpdating ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={chapter.is_active}
                                                onChange={(e) => handleStatusChange(chapter.id, e.target.checked)}
                                                disabled={isUpdating}
                                            />
                                            <div className={`block w-8 h-4 rounded-full transition-colors ${chapter.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                            <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${chapter.is_active ? 'transform translate-x-full' : ''}`}></div>
                                            {isUpdating && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-2.5 w-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        {chapter.is_active
                                            ? <CheckCircleIcon className="ml-1.5 !text-base text-green-600" title="Active"/>
                                            : <XCircleIcon className="ml-1.5 !text-base text-slate-400" title="Inactive"/>
                                        }
                                    </label>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <div className="text-xs font-semibold text-slate-900">{chapter.chapter_name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{chapter.file_name}</div>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <span className="px-1.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                                        {chapter.version}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-600 text-center font-medium">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                                        {chapter.quiz_questions.length}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-600 text-center font-medium">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                                        {chapter.exercises.length}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-center text-xs font-medium">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button onClick={() => onEditChapter(chapter)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-all shadow-sm" title="Edit Chapter">
                                            <EditIcon className="!text-sm" />
                                        </button>
                                        <button className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-all shadow-sm" title="Delete Chapter (Not Implemented)">
                                            <TrashIcon className="!text-sm" />
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