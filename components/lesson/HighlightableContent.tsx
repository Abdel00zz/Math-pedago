/**
 * Composant pour rendre le contenu highlightable au double-clic
 */

import React, { useRef, useEffect } from 'react';

interface HighlightableContentProps {
    children: React.ReactNode;
    className?: string;
}

export const HighlightableContent: React.FC<HighlightableContentProps> = ({ children, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A') {
                return;
            }

            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            if (highlightElement) {
                const highlightId = highlightElement.getAttribute('data-highlight-id');
                const parentNode = highlightElement.parentNode;
                if (parentNode) {
                    parentNode.replaceChild(document.createTextNode(highlightElement.textContent || ''), highlightElement);
                    parentNode.normalize();
                }

                return;
            }

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                return;
            }

            const selectedTextRaw = selection.toString();
            if (selectedTextRaw.trim() === '') {
                selection.removeAllRanges();
                return;
            }

            const range = selection.getRangeAt(0);
            if (!container.contains(range.commonAncestorContainer)) {
                selection.removeAllRanges();
                return;
            }

            const highlightId = `highlight-word-${Date.now()}`;
            const span = document.createElement('span');
            span.className = 'lesson-highlight';
            span.setAttribute('data-highlight-id', highlightId);
            span.textContent = selectedTextRaw;

            try {
                range.deleteContents();
                range.insertNode(span);

                requestAnimationFrame(() => {
                    span.classList.add('lesson-highlight--applied');
                    setTimeout(() => {
                        span.classList.remove('lesson-highlight--applied');
                    }, 200);
                });
            } catch (error) {
                console.error('Erreur lors du highlight:', error);
            }

            selection.removeAllRanges();
        };

        container.addEventListener('dblclick', handleDoubleClick);

        return () => {
            container.removeEventListener('dblclick', handleDoubleClick);
        };
    }, []);

    return (
        <div ref={containerRef} className={`highlightable-content ${className}`}>
            {children}
            <style>{`
                .lesson-highlight {
                    display: inline-block;
                    position: relative;
                    padding: 0.15rem 0.5rem;
                    margin: 0 0.12rem;
                    border-radius: 999px;
                    background: rgba(0, 86, 210, 0.08);
                    border: 1px solid rgba(0, 86, 210, 0.12);
                    box-shadow: inset 0 -2px 0 rgba(0, 86, 210, 0.18);
                    color: inherit;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
                }

                .lesson-highlight::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.35));
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                }

                .lesson-highlight--applied {
                    transform: translateY(-1px);
                    box-shadow: inset 0 -2px 0 rgba(0, 86, 210, 0.28), 0 6px 12px rgba(0, 86, 210, 0.12);
                }

                .lesson-highlight:hover {
                    background: rgba(0, 86, 210, 0.12);
                    border-color: rgba(0, 86, 210, 0.28);
                    box-shadow: inset 0 -3px 0 rgba(0, 86, 210, 0.25), 0 4px 12px rgba(15, 23, 42, 0.08);
                }

                .lesson-highlight:hover::before {
                    opacity: 1;
                }

                .highlightable-content p,
                .highlightable-content li,
                .highlightable-content td,
                .highlightable-content th {
                    cursor: text;
                    transition: transform 0.15s ease-out;
                }

                .highlightable-content p:hover,
                .highlightable-content li:hover,
                .highlightable-content td:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
            `}</style>
        </div>
    );
};
