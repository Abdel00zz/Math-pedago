import React, { useState } from 'react';
import { ChapterData } from '../types';
import {
    EditIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
    PencilSquareIcon
} from './icons';

interface ChapterTreeViewProps {
    chapters: ChapterData[];
    onEditChapter: (chapter: ChapterData) => void;
    onUpdateActive: (chapterId: string, isActive: boolean) => Promise<void>;
}

export const ChapterTreeView: React.FC<ChapterTreeViewProps> = ({
    chapters,
    onEditChapter,
    onUpdateActive
}) => {
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());

    const toggleChapter = (chapterId: string) => {
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId);
        } else {
            newExpanded.add(chapterId);
        }
        setExpandedChapters(newExpanded);
    };

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
            <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <BookOpenIcon className="!text-sm text-blue-600" />
                    Chapitres ({chapters.length})
                </h3>
            </div>

            <div className="divide-y divide-slate-100">
                {chapters.map(chapter => {
                    const isExpanded = expandedChapters.has(chapter.id);
                    const isUpdating = updatingStatus.has(chapter.id);

                    return (
                        <div key={chapter.id} className="hover:bg-blue-50/30 transition-colors">
                            {/* Chapter Header */}
                            <div className="p-3 flex items-center gap-2">
                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={() => toggleChapter(chapter.id)}
                                    className="p-0.5 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                                >
                                    {isExpanded ? (
                                        <ChevronDownIcon className="w-4 h-4 text-slate-600" />
                                    ) : (
                                        <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                                    )}
                                </button>

                                {/* Status Toggle */}
                                <label className={`flex items-center flex-shrink-0 ${isUpdating ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={chapter.is_active}
                                            onChange={(e) => handleStatusChange(chapter.id, e.target.checked)}
                                            disabled={isUpdating}
                                        />
                                        <div className={`block w-7 h-3.5 rounded-full transition-colors ${chapter.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-transform ${chapter.is_active ? 'transform translate-x-3.5' : ''}`}></div>
                                        {isUpdating && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-2 w-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {/* Chapter Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                            {chapter.chapter_name}
                                        </h4>
                                        {chapter.is_active ? (
                                            <CheckCircleIcon className="!text-sm text-green-600 flex-shrink-0" title="Active" />
                                        ) : (
                                            <XCircleIcon className="!text-sm text-slate-400 flex-shrink-0" title="Inactive" />
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono truncate">{chapter.file_name}</p>
                                </div>

                                {/* Version Badge */}
                                <span className="px-1.5 py-0.5 text-[9px] leading-3 font-bold rounded bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
                                    v{chapter.version.substring(0, 6)}
                                </span>

                                {/* Edit Button */}
                                <button
                                    onClick={() => onEditChapter(chapter)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-all shadow-sm flex-shrink-0"
                                    title="Edit Chapter"
                                >
                                    <EditIcon className="!text-sm" />
                                </button>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-3 pb-3 ml-6 space-y-2">
                                    {/* Quiz Section */}
                                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md border border-purple-200">
                                        <QuestionMarkCircleIcon className="!text-sm text-purple-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-semibold text-purple-900">Quiz</p>
                                            <p className="text-[9px] text-purple-700">{chapter.quiz_questions.length} question{chapter.quiz_questions.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-[9px] font-bold">
                                            {chapter.quiz_questions.length}
                                        </span>
                                    </div>

                                    {/* Exercises Section */}
                                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md border border-orange-200">
                                        <PencilSquareIcon className="!text-sm text-orange-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-semibold text-orange-900">Exercices</p>
                                            <p className="text-[9px] text-orange-700">{chapter.exercises.length} exercice{chapter.exercises.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-[9px] font-bold">
                                            {chapter.exercises.length}
                                        </span>
                                    </div>

                                    {/* Lesson File */}
                                    {chapter.lessonFile && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                            <BookOpenIcon className="!text-sm text-blue-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-semibold text-blue-900">Leçon</p>
                                                <p className="text-[9px] text-blue-700 font-mono truncate">{chapter.lessonFile}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Session Dates */}
                                    {chapter.session_dates && chapter.session_dates.length > 0 && (
                                        <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                                            <p className="text-[10px] font-semibold text-slate-900 mb-1">Séances</p>
                                            <div className="space-y-0.5">
                                                {chapter.session_dates.slice(0, 3).map((date, idx) => (
                                                    <p key={idx} className="text-[9px] text-slate-600 font-mono">
                                                        {new Date(date).toLocaleDateString('fr-FR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                ))}
                                                {chapter.session_dates.length > 3 && (
                                                    <p className="text-[9px] text-slate-500 italic">
                                                        +{chapter.session_dates.length - 3} autre{chapter.session_dates.length - 3 > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
