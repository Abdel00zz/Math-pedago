/**
 * TreeView - Composant arbre hiérarchique pour naviguer dans la structure du chapitre
 * Affiche tous les éléments (vidéos, quiz, exercices, sections de leçon) dans un arbre interactif
 */

import React, { useState } from 'react';
import { ChapterData, Video, QuizQuestion, Exercise } from '../types';
import {
    ChevronRightIcon,
    ChevronDownIcon,
    VideoCameraIcon,
    QuestionMarkCircleIcon,
    PencilSquareIcon,
    BookOpenIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    ImageIcon,
    LightBulbIcon,
    TrophyIcon
} from './icons';

interface TreeViewProps {
    chapter: ChapterData;
    onSelectElement: (type: string, id?: string, sectionIndex?: number, subsectionIndex?: number) => void;
    activeElement: { type: string; id?: string } | null;
}

interface TreeNode {
    id: string;
    label: string;
    icon: React.FC<any>;
    type: string;
    itemId?: string;
    color: string;
    count?: number;
    children?: TreeNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({ chapter, onSelectElement, activeElement }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'info', 'videos', 'quiz', 'exercises', 'lesson', 'concours']));

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);
    const isActive = (type: string, id?: string) => {
        return activeElement?.type === type && (!id || activeElement?.id === id);
    };

    // Construction de l'arbre de données
    const buildTree = (): TreeNode[] => {
        const tree: TreeNode[] = [
            {
                id: 'info',
                label: 'Informations générales',
                icon: InformationCircleIcon,
                type: 'info',
                color: 'blue',
            },
            {
                id: 'lesson',
                label: 'Leçon',
                icon: BookOpenIcon,
                type: 'lesson',
                color: 'green',
                children: chapter.lessonFile ? [
                    {
                        id: 'lesson-content',
                        label: 'Contenu de la leçon',
                        icon: DocumentTextIcon,
                        type: 'lesson',
                        color: 'green',
                    }
                ] : []
            },
        ];

        // Vidéos
        if (chapter.videos && chapter.videos.length > 0) {
            tree.push({
                id: 'videos',
                label: 'Vidéos',
                icon: VideoCameraIcon,
                type: 'videos-section',
                color: 'red',
                count: chapter.videos.length,
                children: chapter.videos.map((video, index) => ({
                    id: `video-${video.id}`,
                    label: video.title || `Vidéo ${index + 1}`,
                    icon: VideoCameraIcon,
                    type: 'video',
                    itemId: video.id,
                    color: 'red',
                }))
            });
        }

        // Quiz
        if (chapter.quiz_questions && chapter.quiz_questions.length > 0) {
            tree.push({
                id: 'quiz',
                label: 'Quiz',
                icon: QuestionMarkCircleIcon,
                type: 'quiz-section',
                color: 'purple',
                count: chapter.quiz_questions.length,
                children: chapter.quiz_questions.map((question, index) => ({
                    id: `quiz-${question.id}`,
                    label: `Question ${index + 1}: ${question.type === 'mcq' ? 'QCM' : 'Ordonnancement'}`,
                    icon: question.type === 'mcq' ? QuestionMarkCircleIcon : LightBulbIcon,
                    type: 'quiz-question',
                    itemId: question.id,
                    color: 'purple',
                }))
            });
        }

        // Exercices
        if (chapter.exercises && chapter.exercises.length > 0) {
            tree.push({
                id: 'exercises',
                label: 'Exercices',
                icon: PencilSquareIcon,
                type: 'exercises-section',
                color: 'orange',
                count: chapter.exercises.length,
                children: chapter.exercises.map((exercise, index) => {
                    const children: TreeNode[] = [];

                    // Sous-questions
                    if (exercise.sub_questions && exercise.sub_questions.length > 0) {
                        exercise.sub_questions.forEach((subq, sqIndex) => {
                            children.push({
                                id: `exercise-${exercise.id}-subq-${sqIndex}`,
                                label: `Question ${sqIndex + 1}`,
                                icon: DocumentTextIcon,
                                type: 'sub-question',
                                itemId: `${exercise.id}-${sqIndex}`,
                                color: 'teal',
                            });
                        });
                    }

                    // Images
                    if (exercise.images && exercise.images.length > 0) {
                        exercise.images.forEach((img, imgIndex) => {
                            children.push({
                                id: `exercise-${exercise.id}-img-${imgIndex}`,
                                label: img.caption || `Image ${imgIndex + 1}`,
                                icon: ImageIcon,
                                type: 'exercise-image',
                                itemId: `${exercise.id}-img-${imgIndex}`,
                                color: 'indigo',
                            });
                        });
                    }

                    return {
                        id: `exercise-${exercise.id}`,
                        label: exercise.title || `Exercice ${index + 1}`,
                        icon: PencilSquareIcon,
                        type: 'exercise',
                        itemId: exercise.id,
                        color: 'orange',
                        children: children.length > 0 ? children : undefined,
                    };
                })
            });
        }

        // Concours
        if (chapter.concours && chapter.concours.length > 0) {
            tree.push({
                id: 'concours',
                label: 'Concours',
                icon: TrophyIcon,
                type: 'concours-section',
                color: 'yellow',
                count: chapter.concours.length,
                children: chapter.concours.map((concours, index) => {
                    const children: TreeNode[] = [];

                    // Résumé pédagogique
                    if (concours.resume && concours.resume.sections && concours.resume.sections.length > 0) {
                        children.push({
                            id: `concours-${concours.id}-resume`,
                            label: `Résumé (${concours.resume.sections.length} sections)`,
                            icon: BookOpenIcon,
                            type: 'concours-resume',
                            itemId: concours.id,
                            color: 'blue',
                        });
                    }

                    // Questions du quiz
                    if (concours.quiz && concours.quiz.length > 0) {
                        children.push({
                            id: `concours-${concours.id}-quiz`,
                            label: `Quiz (${concours.quiz.length} questions)`,
                            icon: QuestionMarkCircleIcon,
                            type: 'concours-quiz',
                            itemId: concours.id,
                            color: 'purple',
                        });
                    }

                    return {
                        id: `concours-${concours.id}`,
                        label: `${concours.concours} ${concours.annee} - ${concours.theme}`,
                        icon: TrophyIcon,
                        type: 'concours',
                        itemId: concours.id,
                        color: 'yellow',
                        children: children.length > 0 ? children : undefined,
                    };
                })
            });
        }

        return tree;
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const expanded = isExpanded(node.id);
        const active = isActive(node.type, node.itemId);
        const Icon = node.icon;

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                        hover:bg-slate-100 group
                        ${active ? `bg-${node.color}-50 border-l-4 border-${node.color}-500 shadow-sm` : 'border-l-4 border-transparent'}
                        ${level > 0 ? 'ml-' + (level * 4) : ''}
                    `}
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                    onClick={() => {
                        if (hasChildren) {
                            toggleNode(node.id);
                        }
                        onSelectElement(node.type, node.itemId);
                    }}
                >
                    {/* Chevron pour nœuds avec enfants */}
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-colors"
                        >
                            {expanded ? (
                                <ChevronDownIcon className="w-4 h-4 text-slate-600" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}

                    {/* Icône */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-${node.color}-100 text-${node.color}-600 group-hover:bg-${node.color}-200 transition-colors`}>
                        <Icon className={`w-4 h-4 text-${node.color}-600`} />
                    </div>

                    {/* Label */}
                    <span className={`flex-1 text-sm font-medium truncate ${active ? `text-${node.color}-700` : 'text-slate-700'}`}>
                        {node.label}
                    </span>

                    {/* Badge de comptage */}
                    {node.count !== undefined && (
                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-${node.color}-100 text-${node.color}-700`}>
                            {node.count}
                        </span>
                    )}
                </div>

                {/* Enfants */}
                {hasChildren && expanded && (
                    <div className="mt-1">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const treeData = buildTree();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* En-tête */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-blue-600" />
                    Structure du Chapitre
                </h3>
                <p className="text-xs text-slate-500 mt-1">{chapter.chapter_name}</p>
            </div>

            {/* Arbre */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {treeData.map(node => renderNode(node, 0))}
            </div>

            {/* Statistiques en bas */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                        <div className="text-lg font-bold text-red-600">{chapter.videos?.length || 0}</div>
                        <div className="text-xs text-slate-600">Vidéos</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-600">{chapter.quiz_questions?.length || 0}</div>
                        <div className="text-xs text-slate-600">Quiz</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-orange-600">{chapter.exercises?.length || 0}</div>
                        <div className="text-xs text-slate-600">Exercices</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-yellow-600">{chapter.concours?.length || 0}</div>
                        <div className="text-xs text-slate-600">Concours</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
