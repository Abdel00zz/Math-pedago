/**
 * LessonPreview - Aperçu en temps réel de la leçon avec rendu KaTeX
 */

import React, { useEffect, useRef } from 'react';
import { LessonContent } from './types';

interface LessonPreviewProps {
    lesson: LessonContent;
    highlightedPath?: string | null;
}

declare global {
    interface Window {
        MathJax?: any;
    }
}

export const LessonPreview: React.FC<LessonPreviewProps> = ({ lesson, highlightedPath }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Charger MathJax dynamiquement
    useEffect(() => {
        if (!window.MathJax) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // Rendre les formules mathématiques
    useEffect(() => {
        if (window.MathJax && containerRef.current) {
            window.MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
                console.error('MathJax rendering error:', err);
            });
        }
    }, [lesson]);

    const renderContent = (content: string | string[]): string => {
        if (Array.isArray(content)) {
            return content.map((line, idx) => {
                const isNoBullet = line.startsWith('>>');
                const cleanLine = isNoBullet ? line.substring(2).trim() : line;
                if (isNoBullet) {
                    return `<div class="preview-no-bullet">${cleanLine}</div>`;
                }
                return `<li>${cleanLine}</li>`;
            }).join('');
        }
        return content;
    };

    const getElementClass = (type: string): string => {
        const baseClasses: Record<string, string> = {
            'definition-box': 'preview-box preview-box--definition',
            'theorem-box': 'preview-box preview-box--theorem',
            'proposition-box': 'preview-box preview-box--proposition',
            'property-box': 'preview-box preview-box--property',
            'example-box': 'preview-inline preview-inline--example',
            'remark-box': 'preview-inline preview-inline--remark',
            'practice-box': 'preview-box preview-box--practice',
            'explain-box': 'preview-box preview-box--explain',
        };
        return baseClasses[type] || 'preview-paragraph';
    };

    const getElementBadge = (type: string): string => {
        const badges: Record<string, string> = {
            'definition-box': 'Définition',
            'theorem-box': 'Théorème',
            'proposition-box': 'Proposition',
            'property-box': 'Propriété',
            'example-box': 'Exemple',
            'remark-box': 'Remarque',
            'practice-box': 'Exercice',
            'explain-box': 'Analyse',
        };
        return badges[type] || '';
    };

    return (
        <div className="lesson-preview" ref={containerRef}>
            <style>{`
                .lesson-preview {
                    padding: 2rem;
                    background: #f8fafc;
                    border-radius: 12px;
                    height: 100%;
                    overflow-y: auto;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .preview-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid #e2e8f0;
                }

                .preview-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }

                .preview-subtitle {
                    font-size: 1.25rem;
                    color: #64748b;
                    margin-bottom: 1rem;
                }

                .preview-meta {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    font-size: 0.875rem;
                    color: #64748b;
                }

                .preview-meta-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0.75rem;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }

                .preview-section {
                    margin-bottom: 2rem;
                }

                .preview-section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 1rem;
                }

                .preview-intro {
                    font-size: 1rem;
                    line-height: 1.7;
                    color: #475569;
                    margin-bottom: 1.5rem;
                    font-style: italic;
                }

                .preview-subsection {
                    margin-bottom: 1.5rem;
                    padding-left: 1rem;
                    border-left: 3px solid #e2e8f0;
                }

                .preview-subsection-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 0.75rem;
                }

                .preview-box, .preview-inline {
                    margin: 1.5rem 0;
                    padding: 1.25rem;
                    border-radius: 8px;
                    border: 2px solid;
                    background: white;
                }

                .preview-box--definition { border-color: #6366f1; }
                .preview-box--theorem { border-color: #3b82f6; }
                .preview-box--proposition { border-color: #10b981; }
                .preview-box--property { border-color: #f59e0b; }
                .preview-inline--example { border-color: #8b5cf6; }
                .preview-inline--remark { border-color: #10b981; }
                .preview-box--practice { border-color: #ef4444; }
                .preview-box--explain { border-color: #06b6d4; }

                .preview-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.35rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-radius: 4px;
                    margin-bottom: 0.75rem;
                }

                .preview-box--definition .preview-badge { background: #6366f1; color: white; }
                .preview-box--theorem .preview-badge { background: #3b82f6; color: white; }
                .preview-box--proposition .preview-badge { background: #10b981; color: white; }
                .preview-box--property .preview-badge { background: #f59e0b; color: white; }
                .preview-inline--example .preview-badge { background: #8b5cf6; color: white; }
                .preview-inline--remark .preview-badge { background: #10b981; color: white; }

                .preview-preamble {
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 0.5rem;
                }

                .preview-paragraph {
                    margin: 1rem 0;
                    line-height: 1.7;
                    color: #334155;
                }

                .preview-paragraph ul {
                    list-style: none;
                    padding-left: 0;
                }

                .preview-paragraph li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .preview-paragraph li:before {
                    content: "⭐";
                    position: absolute;
                    left: 0;
                    color: #f59e0b;
                }

                .preview-no-bullet {
                    margin: 0.5rem 0;
                }

                .preview-table {
                    width: 100%;
                    margin: 1.5rem 0;
                    border-collapse: collapse;
                    overflow: hidden;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .preview-table thead {
                    background: #f1f5f9;
                }

                .preview-table th {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: #334155;
                    border-bottom: 2px solid #e2e8f0;
                }

                .preview-table td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #475569;
                }

                .preview-table tr:hover {
                    background: #f8fafc;
                }

                .mjx-chtml {
                    font-size: 1.1em !important;
                }
            `}</style>

            {/* Header */}
            <div className="preview-header">
                {lesson.header.title && (
                    <h1 className="preview-title">{lesson.header.title}</h1>
                )}
                {lesson.header.subtitle && (
                    <h2 className="preview-subtitle">{lesson.header.subtitle}</h2>
                )}
                <div className="preview-meta">
                    {lesson.header.classe && (
                        <span className="preview-meta-item">
                            <span>🎓</span>
                            <span>{lesson.header.classe}</span>
                        </span>
                    )}
                    {lesson.header.chapter && (
                        <span className="preview-meta-item">
                            <span>📖</span>
                            <span>{lesson.header.chapter}</span>
                        </span>
                    )}
                    {lesson.header.academicYear && (
                        <span className="preview-meta-item">
                            <span>📅</span>
                            <span>{lesson.header.academicYear}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Sections */}
            {lesson.sections.map((section, sIdx) => (
                <div key={sIdx} className="preview-section">
                    <h2 className="preview-section-title">
                        {sIdx + 1}. {section.title}
                    </h2>

                    {section.intro && (
                        <div className="preview-intro">{section.intro}</div>
                    )}

                    {section.subsections.map((subsection, ssIdx) => (
                        <div key={ssIdx} className="preview-subsection">
                            <h3 className="preview-subsection-title">
                                {sIdx + 1}.{ssIdx + 1}. {subsection.title}
                            </h3>

                            {subsection.elements.map((element, eIdx) => {
                                const elementClass = getElementClass(element.type);
                                const badge = getElementBadge(element.type);

                                if (element.type === 'table') {
                                    return (
                                        <div key={eIdx} className="preview-table-wrapper">
                                            <div dangerouslySetInnerHTML={{ __html: `<table class="preview-table">${element.content}</table>` }} />
                                        </div>
                                    );
                                }

                                if (element.type === 'p') {
                                    return (
                                        <div key={eIdx} className="preview-paragraph">
                                            {Array.isArray(element.content) ? (
                                                <ul dangerouslySetInnerHTML={{ __html: renderContent(element.content) }} />
                                            ) : (
                                                <div dangerouslySetInnerHTML={{ __html: element.content || '' }} />
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={eIdx} className={elementClass}>
                                        {badge && <div className="preview-badge">{badge}</div>}
                                        {element.preamble && (
                                            <div className="preview-preamble" dangerouslySetInnerHTML={{ __html: element.preamble }} />
                                        )}
                                        {element.content && (
                                            <div dangerouslySetInnerHTML={{ __html: renderContent(element.content) }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
