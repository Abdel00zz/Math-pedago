/**
 * ChapterTable - Tableau moderne des chapitres avec styles améliorés
 */

import React from 'react';
import { ChapterData } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from './icons';

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
        <div className="card shadow-xl">
            {/* En-tête du tableau */}
            <div className="card-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Liste des Chapitres</h2>
                        <p className="text-sm text-gray-600 mt-1">{chapters.length} chapitre(s) disponible(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge badge-primary">{chapters.filter(c => c.is_active).length} actifs</span>
                        <span className="badge badge-danger">{chapters.filter(c => !c.is_active).length} inactifs</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Chapitre
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Version
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Vidéos
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Quiz
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Exercices
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {chapters.map(chapter => {
                            const isUpdating = updatingStatus.has(chapter.id);
                            return (
                                <tr
                                    key={chapter.id}
                                    className="hover:bg-blue-50 transition-colors group"
                                >
                                    {/* Statut */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <label className={`flex items-center gap-3 ${isUpdating ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={chapter.is_active}
                                                    onChange={(e) => handleStatusChange(chapter.id, e.target.checked)}
                                                    disabled={isUpdating}
                                                />
                                                <div className={`block w-12 h-6 rounded-full transition-colors shadow-inner ${chapter.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${chapter.is_active ? 'transform translate-x-6' : ''}`}></div>
                                                {isUpdating && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            {chapter.is_active ? (
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" title="Actif" />
                                            ) : (
                                                <XCircleIcon className="w-5 h-5 text-gray-400" title="Inactif" />
                                            )}
                                        </label>
                                    </td>

                                    {/* Chapitre */}
                                    <td className="px-6 py-5">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{chapter.chapter_name}</div>
                                            <div className="text-xs text-gray-500 mt-1 font-mono">{chapter.file_name}</div>
                                        </div>
                                    </td>

                                    {/* Version */}
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="badge badge-primary">
                                            v{chapter.version}
                                        </span>
                                    </td>

                                    {/* Vidéos */}
                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${chapter.videos?.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {chapter.videos?.length || 0}
                                        </span>
                                    </td>

                                    {/* Quiz */}
                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${chapter.quiz_questions.length > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {chapter.quiz_questions.length}
                                        </span>
                                    </td>

                                    {/* Exercices */}
                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${chapter.exercises.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {chapter.exercises.length}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEditChapter(chapter)}
                                                className="p-2.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                                                title="Éditer le chapitre"
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-400 rounded-lg transition-all shadow-sm hover:shadow-md opacity-50 cursor-not-allowed"
                                                title="Prévisualiser (à venir)"
                                                disabled
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {chapters.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <XCircleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun chapitre</h3>
                    <p className="text-gray-600">Il n'y a aucun chapitre dans cette classe pour le moment.</p>
                </div>
            )}
        </div>
    );
};