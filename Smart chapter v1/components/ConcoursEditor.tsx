/**
 * ConcoursEditor - Éditeur de concours avec gestion complète du résumé et des quiz
 */

import React, { useState } from 'react';
import { ChapterData, ConcoursData, ConcoursResumeSection, ConcoursQuestion } from '../types';
import {
    TrophyIcon,
    PlusIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    BookOpenIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    SparklesIcon
} from './icons';

interface ConcoursEditorProps {
    chapter: ChapterData;
    setChapter: React.Dispatch<React.SetStateAction<ChapterData>>;
}

export const ConcoursEditor: React.FC<ConcoursEditorProps> = ({ chapter, setChapter }) => {
    const [expandedConcours, setExpandedConcours] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const concoursList = chapter.concours || [];

    const addConcours = () => {
        const newConcours: ConcoursData = {
            id: `concours-${Date.now()}`,
            concours: 'Médecine',
            annee: new Date().getFullYear().toString(),
            theme: 'Nouveau thème',
            resume: {
                title: 'Résumé pédagogique',
                introduction: 'Introduction au thème...',
                sections: []
            },
            quiz: []
        };

        setChapter(c => ({
            ...c,
            concours: [...concoursList, newConcours]
        }));
        setExpandedConcours(newConcours.id);
    };

    const removeConcours = (concoursId: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce concours ?')) {
            setChapter(c => ({
                ...c,
                concours: concoursList.filter(co => co.id !== concoursId)
            }));
            if (expandedConcours === concoursId) {
                setExpandedConcours(null);
            }
        }
    };

    const updateConcours = (concoursId: string, field: keyof ConcoursData, value: any) => {
        setChapter(c => ({
            ...c,
            concours: concoursList.map(co =>
                co.id === concoursId ? { ...co, [field]: value } : co
            )
        }));
    };

    const addResumeSection = (concoursId: string) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        const newSection: ConcoursResumeSection = {
            type: 'definitions',
            title: 'Nouvelle section',
            items: ['Élément 1']
        };

        updateConcours(concoursId, 'resume', {
            ...concours.resume,
            sections: [...concours.resume.sections, newSection]
        });
    };

    const removeResumeSection = (concoursId: string, sectionIndex: number) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        updateConcours(concoursId, 'resume', {
            ...concours.resume,
            sections: concours.resume.sections.filter((_, i) => i !== sectionIndex)
        });
    };

    const updateResumeSection = (
        concoursId: string,
        sectionIndex: number,
        field: keyof ConcoursResumeSection,
        value: any
    ) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        updateConcours(concoursId, 'resume', {
            ...concours.resume,
            sections: concours.resume.sections.map((s, i) =>
                i === sectionIndex ? { ...s, [field]: value } : s
            )
        });
    };

    const addSectionItem = (concoursId: string, sectionIndex: number) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        const section = concours.resume.sections[sectionIndex];
        updateResumeSection(concoursId, sectionIndex, 'items', [
            ...section.items,
            'Nouvel élément'
        ]);
    };

    const removeSectionItem = (concoursId: string, sectionIndex: number, itemIndex: number) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        const section = concours.resume.sections[sectionIndex];
        updateResumeSection(
            concoursId,
            sectionIndex,
            'items',
            section.items.filter((_, i) => i !== itemIndex)
        );
    };

    const updateSectionItem = (
        concoursId: string,
        sectionIndex: number,
        itemIndex: number,
        value: string
    ) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        const section = concours.resume.sections[sectionIndex];
        updateResumeSection(
            concoursId,
            sectionIndex,
            'items',
            section.items.map((item, i) => (i === itemIndex ? value : item))
        );
    };

    const addQuizQuestion = (concoursId: string) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        const newQuestion: ConcoursQuestion = {
            id: `q-${Date.now()}`,
            theme: concours.theme,
            question: 'Nouvelle question',
            type: 'mcq',
            options: [
                { id: 'a', text: 'Option A', isCorrect: true },
                { id: 'b', text: 'Option B', isCorrect: false },
                { id: 'c', text: 'Option C', isCorrect: false },
                { id: 'd', text: 'Option D', isCorrect: false }
            ],
            explanation: 'Explication de la réponse...',
            hints: ['Indice 1', 'Indice 2']
        };

        updateConcours(concoursId, 'quiz', [...concours.quiz, newQuestion]);
    };

    const removeQuizQuestion = (concoursId: string, questionId: string) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        if (window.confirm('Supprimer cette question ?')) {
            updateConcours(
                concoursId,
                'quiz',
                concours.quiz.filter(q => q.id !== questionId)
            );
        }
    };

    const updateQuizQuestion = (
        concoursId: string,
        questionId: string,
        field: keyof ConcoursQuestion,
        value: any
    ) => {
        const concours = concoursList.find(c => c.id === concoursId);
        if (!concours) return;

        updateConcours(
            concoursId,
            'quiz',
            concours.quiz.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
        );
    };

    const getSectionIcon = (type: string) => {
        switch (type) {
            case 'definitions':
                return BookOpenIcon;
            case 'formules':
                return DocumentTextIcon;
            case 'methodes':
                return AcademicCapIcon;
            case 'pieges':
                return ExclamationTriangleIcon;
            case 'reflexion':
                return LightBulbIcon;
            case 'astuces':
                return SparklesIcon;
            default:
                return DocumentTextIcon;
        }
    };

    const getSectionColor = (type: string) => {
        switch (type) {
            case 'definitions':
                return 'blue';
            case 'formules':
                return 'purple';
            case 'methodes':
                return 'green';
            case 'pieges':
                return 'red';
            case 'reflexion':
                return 'yellow';
            case 'astuces':
                return 'indigo';
            default:
                return 'gray';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <TrophyIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    Concours
                </h3>
                <p className="text-sm text-gray-600">
                    Gérez les concours associés à ce chapitre avec résumés pédagogiques et quiz
                </p>
            </div>

            {/* Add Concours Button */}
            <div className="mb-6">
                <button onClick={addConcours} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5" />
                    Ajouter un Concours
                </button>
            </div>

            {/* Concours List */}
            {concoursList.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrophyIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">
                        Aucun concours ajouté. Cliquez sur "Ajouter un Concours" pour commencer.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {concoursList.map((concours, idx) => {
                        const isExpanded = expandedConcours === concours.id;
                        return (
                            <div key={concours.id} className="card">
                                {/* Concours Header */}
                                <div
                                    className="card-header flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() =>
                                        setExpandedConcours(isExpanded ? null : concours.id)
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                        <TrophyIcon className="w-5 h-5 text-yellow-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {concours.concours} - {concours.annee}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {concours.theme}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            removeConcours(concours.id);
                                        }}
                                        className="btn btn-sm btn-danger"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Concours Content (when expanded) */}
                                {isExpanded && (
                                    <div className="card-body space-y-8">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="form-group">
                                                <label className="form-label">Type de Concours</label>
                                                <select
                                                    value={concours.concours}
                                                    onChange={e =>
                                                        updateConcours(
                                                            concours.id,
                                                            'concours',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-select"
                                                >
                                                    <option value="Médecine">Médecine</option>
                                                    <option value="ENSA">ENSA</option>
                                                    <option value="ENSAM">ENSAM</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Année</label>
                                                <input
                                                    type="text"
                                                    value={concours.annee}
                                                    onChange={e =>
                                                        updateConcours(
                                                            concours.id,
                                                            'annee',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder="2024"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Thème</label>
                                                <input
                                                    type="text"
                                                    value={concours.theme}
                                                    onChange={e =>
                                                        updateConcours(
                                                            concours.id,
                                                            'theme',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder="Les nombres complexes"
                                                />
                                            </div>
                                        </div>

                                        {/* Resume Section */}
                                        <div className="border-t border-gray-200 pt-8">
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <BookOpenIcon className="w-5 h-5 text-blue-600" />
                                                Résumé Pédagogique
                                            </h4>

                                            <div className="space-y-4 mb-6">
                                                <div className="form-group">
                                                    <label className="form-label">Titre</label>
                                                    <input
                                                        type="text"
                                                        value={concours.resume.title}
                                                        onChange={e =>
                                                            updateConcours(concours.id, 'resume', {
                                                                ...concours.resume,
                                                                title: e.target.value
                                                            })
                                                        }
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Introduction</label>
                                                    <textarea
                                                        rows={3}
                                                        value={concours.resume.introduction}
                                                        onChange={e =>
                                                            updateConcours(concours.id, 'resume', {
                                                                ...concours.resume,
                                                                introduction: e.target.value
                                                            })
                                                        }
                                                        className="form-textarea"
                                                    />
                                                </div>
                                            </div>

                                            {/* Resume Sections */}
                                            <div className="space-y-4">
                                                {concours.resume.sections.map((section, sIdx) => {
                                                    const SectionIcon = getSectionIcon(section.type);
                                                    const color = getSectionColor(section.type);
                                                    const isSectionExpanded =
                                                        expandedSection === `${concours.id}-${sIdx}`;

                                                    return (
                                                        <div
                                                            key={sIdx}
                                                            className={`border-2 border-${color}-200 bg-${color}-50 rounded-xl overflow-hidden`}
                                                        >
                                                            <div
                                                                className={`p-4 bg-${color}-100 flex items-center justify-between cursor-pointer hover:bg-${color}-200 transition-colors`}
                                                                onClick={() =>
                                                                    setExpandedSection(
                                                                        isSectionExpanded
                                                                            ? null
                                                                            : `${concours.id}-${sIdx}`
                                                                    )
                                                                }
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {isSectionExpanded ? (
                                                                        <ChevronDownIcon className="w-5 h-5" />
                                                                    ) : (
                                                                        <ChevronRightIcon className="w-5 h-5" />
                                                                    )}
                                                                    <SectionIcon
                                                                        className={`w-5 h-5 text-${color}-700`}
                                                                    />
                                                                    <span className="font-semibold">
                                                                        {section.title}
                                                                    </span>
                                                                    <span
                                                                        className={`badge badge-sm bg-${color}-200 text-${color}-800`}
                                                                    >
                                                                        {section.items.length} éléments
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        removeResumeSection(
                                                                            concours.id,
                                                                            sIdx
                                                                        );
                                                                    }}
                                                                    className="btn btn-sm btn-danger"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {isSectionExpanded && (
                                                                <div className="p-4 space-y-4 bg-white">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="form-group">
                                                                            <label className="form-label">
                                                                                Type de section
                                                                            </label>
                                                                            <select
                                                                                value={section.type}
                                                                                onChange={e =>
                                                                                    updateResumeSection(
                                                                                        concours.id,
                                                                                        sIdx,
                                                                                        'type',
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                className="form-select"
                                                                            >
                                                                                <option value="definitions">
                                                                                    Définitions
                                                                                </option>
                                                                                <option value="formules">
                                                                                    Formules
                                                                                </option>
                                                                                <option value="methodes">
                                                                                    Méthodes
                                                                                </option>
                                                                                <option value="pieges">
                                                                                    Pièges
                                                                                </option>
                                                                                <option value="reflexion">
                                                                                    Réflexion
                                                                                </option>
                                                                                <option value="astuces">
                                                                                    Astuces
                                                                                </option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="form-group">
                                                                            <label className="form-label">
                                                                                Titre
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={section.title}
                                                                                onChange={e =>
                                                                                    updateResumeSection(
                                                                                        concours.id,
                                                                                        sIdx,
                                                                                        'title',
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                className="form-input"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Items */}
                                                                    <div>
                                                                        <div className="flex justify-between items-center mb-3">
                                                                            <label className="form-label mb-0">
                                                                                Éléments (support LaTeX avec $...$)
                                                                            </label>
                                                                            <button
                                                                                onClick={() =>
                                                                                    addSectionItem(
                                                                                        concours.id,
                                                                                        sIdx
                                                                                    )
                                                                                }
                                                                                className="btn btn-sm btn-secondary"
                                                                            >
                                                                                <PlusIcon className="w-4 h-4" />
                                                                                Ajouter
                                                                            </button>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {section.items.map(
                                                                                (item, iIdx) => (
                                                                                    <div
                                                                                        key={iIdx}
                                                                                        className="flex gap-2"
                                                                                    >
                                                                                        <input
                                                                                            type="text"
                                                                                            value={item}
                                                                                            onChange={e =>
                                                                                                updateSectionItem(
                                                                                                    concours.id,
                                                                                                    sIdx,
                                                                                                    iIdx,
                                                                                                    e.target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            className="form-input flex-1"
                                                                                        />
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                removeSectionItem(
                                                                                                    concours.id,
                                                                                                    sIdx,
                                                                                                    iIdx
                                                                                                )
                                                                                            }
                                                                                            className="btn btn-sm btn-danger"
                                                                                        >
                                                                                            <TrashIcon className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => addResumeSection(concours.id)}
                                                    className="btn btn-secondary w-full"
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                    Ajouter une Section
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quiz Section */}
                                        <div className="border-t border-gray-200 pt-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600" />
                                                    Questions du Quiz ({concours.quiz.length})
                                                </h4>
                                                <button
                                                    onClick={() => addQuizQuestion(concours.id)}
                                                    className="btn btn-primary"
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                    Ajouter une Question
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {concours.quiz.map((question, qIdx) => (
                                                    <div
                                                        key={question.id}
                                                        className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50"
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center">
                                                                    {qIdx + 1}
                                                                </span>
                                                                <span className="text-sm text-gray-600">
                                                                    Question {qIdx + 1}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    removeQuizQuestion(
                                                                        concours.id,
                                                                        question.id
                                                                    )
                                                                }
                                                                className="btn btn-sm btn-danger"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    Question (LaTeX supporté)
                                                                </label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={question.question}
                                                                    onChange={e =>
                                                                        updateQuizQuestion(
                                                                            concours.id,
                                                                            question.id,
                                                                            'question',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="form-textarea"
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    Options de réponse
                                                                </label>
                                                                <div className="space-y-2">
                                                                    {question.options.map(
                                                                        (option, oIdx) => (
                                                                            <div
                                                                                key={option.id}
                                                                                className="flex gap-2 items-center"
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        option.isCorrect
                                                                                    }
                                                                                    onChange={e => {
                                                                                        const newOptions =
                                                                                            [
                                                                                                ...question.options
                                                                                            ];
                                                                                        newOptions[
                                                                                            oIdx
                                                                                        ].isCorrect =
                                                                                            e.target
                                                                                                .checked;
                                                                                        updateQuizQuestion(
                                                                                            concours.id,
                                                                                            question.id,
                                                                                            'options',
                                                                                            newOptions
                                                                                        );
                                                                                    }}
                                                                                    className="w-5 h-5 text-green-600"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={option.text}
                                                                                    onChange={e => {
                                                                                        const newOptions =
                                                                                            [
                                                                                                ...question.options
                                                                                            ];
                                                                                        newOptions[
                                                                                            oIdx
                                                                                        ].text =
                                                                                            e.target
                                                                                                .value;
                                                                                        updateQuizQuestion(
                                                                                            concours.id,
                                                                                            question.id,
                                                                                            'options',
                                                                                            newOptions
                                                                                        );
                                                                                    }}
                                                                                    className="form-input flex-1"
                                                                                    placeholder={`Option ${option.id.toUpperCase()}`}
                                                                                />
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    Explication
                                                                </label>
                                                                <textarea
                                                                    rows={3}
                                                                    value={question.explanation}
                                                                    onChange={e =>
                                                                        updateQuizQuestion(
                                                                            concours.id,
                                                                            question.id,
                                                                            'explanation',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="form-textarea"
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label className="form-label">
                                                                    Indices (un par ligne)
                                                                </label>
                                                                <textarea
                                                                    rows={3}
                                                                    value={question.hints.join('\n')}
                                                                    onChange={e =>
                                                                        updateQuizQuestion(
                                                                            concours.id,
                                                                            question.id,
                                                                            'hints',
                                                                            e.target.value
                                                                                .split('\n')
                                                                                .filter(
                                                                                    h => h.trim() !== ''
                                                                                )
                                                                        )
                                                                    }
                                                                    className="form-textarea"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
