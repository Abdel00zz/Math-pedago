/**
 * LessonPreview - Composant pour l'aperçu en temps réel d'une leçon
 * Affiche un rendu visuel de la leçon avec tous les styles pédagogiques
 */

import React from 'react';

// Types (mêmes que LessonEditor)
interface LessonHeader {
    title: string;
    subtitle?: string;
    chapter?: string;
    classe?: string;
    academicYear?: string;
}

interface LessonSection {
    title: string;
    intro?: string;
    subsections: LessonSubsection[];
}

interface LessonSubsection {
    title: string;
    elements: LessonElement[];
}

type LessonElementType =
    | 'p'
    | 'table'
    | 'definition-box'
    | 'theorem-box'
    | 'proposition-box'
    | 'property-box'
    | 'example-box'
    | 'remark-box'
    | 'practice-box'
    | 'explain-box';

interface LessonElement {
    type: LessonElementType;
    content?: string | string[];
    preamble?: string;
    listType?: 'bullet' | 'numbered';
    statement?: string;
    columns?: boolean;
    image?: {
        src: string;
        alt?: string;
        caption?: string;
        position?: string;
        align?: string;
        width?: string;
    };
}

interface LessonContent {
    header: LessonHeader;
    sections: LessonSection[];
}

interface LessonPreviewProps {
    lesson: LessonContent;
}

// Configurations des éléments avec couleurs et styles
const BOX_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    'definition-box': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', icon: '📘' },
    'theorem-box': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', icon: '🔷' },
    'proposition-box': { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-900', icon: '🔶' },
    'property-box': { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-900', icon: '⚡' },
    'example-box': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', icon: '💡' },
    'remark-box': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', icon: '📌' },
    'practice-box': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', icon: '✏️' },
    'explain-box': { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-900', icon: '💭' },
};

export const LessonPreview: React.FC<LessonPreviewProps> = ({ lesson }) => {
    // Rendu d'un élément pédagogique
    const renderElement = (element: LessonElement, index: number) => {
        // Paragraphe simple
        if (element.type === 'p') {
            return (
                <div key={index} className="my-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {element.content}
                    </p>
                </div>
            );
        }

        // Tableau
        if (element.type === 'table') {
            return (
                <div key={index} className="my-6 overflow-x-auto">
                    <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-300">
                        {element.content}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">Note : Le tableau sera rendu en HTML dans l'application finale</p>
                </div>
            );
        }

        // Boxes pédagogiques
        const boxStyle = BOX_STYLES[element.type] || BOX_STYLES['definition-box'];
        const contentArray = Array.isArray(element.content) ? element.content : [];

        return (
            <div key={index} className={`my-6 p-5 rounded-xl border-2 ${boxStyle.border} ${boxStyle.bg} shadow-sm`}>
                {/* Icône et préambule */}
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl flex-shrink-0">{boxStyle.icon}</span>
                    {element.preamble && (
                        <div className={`flex-1 font-medium ${boxStyle.text} text-base leading-relaxed`}>
                            {element.preamble}
                        </div>
                    )}
                </div>

                {/* Contenu */}
                {contentArray.length > 0 && (
                    <div className="ml-11">
                        {element.listType === 'bullet' ? (
                            <ul className="space-y-2">
                                {contentArray.map((item, idx) => {
                                    if (item.startsWith('>>')) {
                                        return (
                                            <li key={idx} className="list-none text-gray-700 font-medium">
                                                {item.substring(2).trim()}
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-yellow-500 text-lg flex-shrink-0 mt-0.5">⭐</span>
                                            <span className="text-gray-800 leading-relaxed">{item}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : element.listType === 'numbered' ? (
                            <ol className="space-y-2">
                                {contentArray.map((item, idx) => {
                                    if (item.startsWith('>>')) {
                                        return (
                                            <li key={idx} className="list-none text-gray-700 font-medium mb-1">
                                                {item.substring(2).trim()}
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-800 leading-relaxed flex-1">{item}</span>
                                        </li>
                                    );
                                })}
                            </ol>
                        ) : (
                            <div className="space-y-2">
                                {contentArray.map((item, idx) => (
                                    <p key={idx} className="text-gray-800 leading-relaxed">
                                        {item}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Image si présente */}
                {element.image && (
                    <div className={`mt-4 ${element.image.position === 'top' ? '-order-1' : ''}`}>
                        <div className={`flex justify-${element.image.align || 'center'}`}>
                            <div style={{ width: element.image.width || '100%' }}>
                                <img
                                    src={element.image.src}
                                    alt={element.image.alt || ''}
                                    className="w-full rounded-lg shadow-md"
                                />
                                {element.image.caption && (
                                    <p className="text-center text-sm text-gray-600 mt-2 italic">
                                        {element.image.caption}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <div className="mb-12 text-center border-b-4 border-blue-500 pb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        {lesson.header.title || 'Nouvelle Leçon'}
                    </h1>
                    {lesson.header.subtitle && (
                        <p className="text-xl text-gray-700 mb-2 font-medium">
                            {lesson.header.subtitle}
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mt-4">
                        {lesson.header.chapter && (
                            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                                📚 {lesson.header.chapter}
                            </span>
                        )}
                        {lesson.header.classe && (
                            <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">
                                🎓 {lesson.header.classe}
                            </span>
                        )}
                        {lesson.header.academicYear && (
                            <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                                📅 {lesson.header.academicYear}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {lesson.sections.map((section, sIdx) => (
                        <section key={sIdx} className="scroll-mt-8">
                            {/* Titre de section */}
                            <div className="mb-6 border-l-4 border-blue-500 pl-4">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {section.title}
                                </h2>
                            </div>

                            {/* Texte introductif */}
                            {section.intro && (
                                <div className="mb-6 text-gray-700 leading-relaxed text-lg italic bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                                    {section.intro}
                                </div>
                            )}

                            {/* Sous-sections */}
                            <div className="space-y-8">
                                {section.subsections.map((subsection, ssIdx) => (
                                    <div key={ssIdx}>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="text-blue-500">▸</span>
                                            {subsection.title}
                                        </h3>

                                        {/* Éléments */}
                                        <div className="space-y-4">
                                            {subsection.elements.map((element, eIdx) => renderElement(element, eIdx))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Message si pas de contenu */}
                {lesson.sections.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-lg font-medium">Aucun contenu pour le moment</p>
                        <p className="text-sm mt-2">Ajoutez des sections pour commencer</p>
                    </div>
                )}
            </div>
        </div>
    );
};
