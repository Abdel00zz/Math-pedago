/**
 * Composant pour rendre le contenu highlightable au double-clic avec persistance et fusion intelligente
 */

import React, { useEffect, useRef } from 'react';

interface HighlightableContentProps {
    children: React.ReactNode;
    className?: string;
    storageKey?: string;
}

type HighlightRecord = {
    id: string;
    startOffset: number;
    endOffset: number;
    createdAt: number;
};

const FORBIDDEN_TAGS = new Set(['BUTTON', 'INPUT', 'A', 'TEXTAREA']);
const LEGACY_ID_PATTERN = /highlight-word-\d+(?:-\d+)?/g;
const LEGACY_ID_TEST = /highlight-word-\d+(?:-\d+)?/;
const INVISIBLE_CHARACTERS = /[\u200b\u200c\u200d\uFEFF]/g;
const VISIBLE_GLYPH_PATTERN = /[^\s\u00a0]/;

export const HighlightableContent: React.FC<HighlightableContentProps> = ({ children, className = '', storageKey }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightsRef = useRef<Map<string, HighlightRecord>>(new Map());
    const incrementalIdRef = useRef(0);
    // 🔧 FIX: Ajouter des refs pour la synchronisation avec MathJax
    const mathjaxUpdatePendingRef = useRef(false);
    const highlightsBackupRef = useRef<HighlightRecord[]>([]);
    const rehydrationTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isBrowser = typeof window !== 'undefined';

        // 🔧 FIX: Améliorer la génération d'IDs pour éviter les collisions
        // Utiliser un compteur global plus un timestamp au début pour unicité
        const sessionStartTime = Date.now();
        const nextHighlightId = () => `highlight-word-${sessionStartTime}-${incrementalIdRef.current++}`;

        const normalizeTextContent = (value?: string | null) => (value ?? '').replace(INVISIBLE_CHARACTERS, '');

        const hasVisibleGlyph = (text?: string | null) => VISIBLE_GLYPH_PATTERN.test(normalizeTextContent(text));

        const unwrapHighlightElement = (element: HTMLElement) => {
            const parent = element.parentNode;
            if (!parent) {
                return;
            }

            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }

            parent.removeChild(element);
            parent.normalize();
        };

        const removeEmptyHighlights = () => {
            if (!container) {
                return;
            }

            const highlights = container.querySelectorAll('.lesson-highlight');
            highlights.forEach((node) => {
                if (hasVisibleGlyph((node as HTMLElement).textContent)) {
                    return;
                }

                const element = node as HTMLElement;
                const highlightId = element.getAttribute('data-highlight-id');
                unwrapHighlightElement(element);
                if (highlightId) {
                    highlightsRef.current.delete(highlightId);
                }
            });
        };

        const clearAllHighlightNodes = () => {
            if (!container) {
                return;
            }

            const existing = container.querySelectorAll('[data-highlight-id]');
            existing.forEach((node) => unwrapHighlightElement(node as HTMLElement));
            container.normalize();
            highlightsRef.current.clear();
        };

        const persistHighlights = (dataOverride?: HighlightRecord[]) => {
            if (!isBrowser || !storageKey) return;
            removeEmptyHighlights();
            const data = (dataOverride ?? Array.from(highlightsRef.current.values())).sort(
                (a, b) => a.startOffset - b.startOffset
            );
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (error) {
                console.error('Impossible de sauvegarder les surlignages', error);
            }
        };

        const cleanupLegacyArtifacts = () => {
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            const corruptNodes: Text[] = [];
            let current = walker.nextNode() as Text | null;

            while (current) {
                const content = current.textContent ?? '';
                if (LEGACY_ID_TEST.test(content)) {
                    corruptNodes.push(current);
                }
                current = walker.nextNode() as Text | null;
            }

            corruptNodes.forEach((node) => {
                const cleaned = (node.textContent ?? '').replace(LEGACY_ID_PATTERN, '').replace(/\s{2,}/g, ' ');
                if (cleaned.trim().length === 0) {
                    node.parentNode?.removeChild(node);
                } else {
                    node.textContent = cleaned;
                }
            });

            removeEmptyHighlights();
        };

        const unwrapHighlightWrappersInFragment = (fragment: DocumentFragment) => {
            const temp = document.createElement('div');
            temp.appendChild(fragment);
            const nested = temp.querySelectorAll('[data-highlight-id]');
            nested.forEach((node) => unwrapHighlightElement(node as HTMLElement));

            const cleanedFragment = document.createDocumentFragment();
            while (temp.firstChild) {
                cleanedFragment.appendChild(temp.firstChild);
            }

            return cleanedFragment;
        };

        const getTextNodeAtOffset = (targetOffset: number) => {
            let remainingOffset = targetOffset;
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            let currentNode = walker.nextNode() as Text | null;
            let lastNode: Text | null = null;

            while (currentNode) {
                const length = currentNode.textContent?.length ?? 0;
                if (remainingOffset <= length) {
                    return { node: currentNode, offset: remainingOffset };
                }

                remainingOffset -= length;
                lastNode = currentNode;
                currentNode = walker.nextNode() as Text | null;
            }

            if (lastNode) {
                return { node: lastNode, offset: lastNode.textContent?.length ?? 0 };
            }

            return null;
        };

        // 🔧 FIX: Améliorer getOffsetsFromRange pour ignorer les éléments MathJax
        // MathJax crée des éléments mjx-container qui n'ont pas de textContent visible
        // mais qui prennent de la place dans le DOM. Nous devons les ignorer.
        const getOffsetsFromRange = (range: Range) => {
            try {
                const preRange = range.cloneRange();
                preRange.selectNodeContents(container);
                preRange.setEnd(range.startContainer, range.startOffset);

                // Calculer la longueur en ignorant les éléments MathJax
                let start = 0;
                const walker = document.createTreeWalker(
                    preRange.cloneContents(),
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: (node) => {
                            // Ignorer les nœuds texte à l'intérieur de mjx-container
                            let parent = node.parentNode;
                            while (parent) {
                                if (parent instanceof HTMLElement &&
                                    (parent.tagName === 'MJX-CONTAINER' ||
                                     parent.classList.contains('MathJax') ||
                                     parent.hasAttribute('data-mathml'))) {
                                    return NodeFilter.FILTER_REJECT;
                                }
                                parent = parent.parentNode;
                            }
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                );

                let node;
                while ((node = walker.nextNode())) {
                    start += (node.textContent || '').length;
                }

                const textLength = range.toString().length;
                preRange.detach();
                return { start, end: start + textLength };
            } catch (error) {
                console.error('Impossible de calculer les offsets du surlignage', error);
                return null;
            }
        };

        const createSpanFromRange = (range: Range, record: HighlightRecord) => {
            // 🔧 FIX: Vérifier si la sélection contient des éléments MathJax
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(range.cloneContents());
            const hasMathJax = tempDiv.querySelector('mjx-container, .MathJax, [data-mathml]') !== null;

            if (hasMathJax) {
                console.warn('[Highlight] Sélection contient des éléments MathJax, highlight ignoré');
                return null;
            }

            const fragment = range.extractContents();
            const fallbackText = fragment.textContent ?? '';
            const cleanedFragment = unwrapHighlightWrappersInFragment(fragment);
            const cleanedText = normalizeTextContent(cleanedFragment.textContent ?? fallbackText);

            if (!hasVisibleGlyph(cleanedText)) {
                range.insertNode(cleanedFragment);
                return null;
            }

            const span = document.createElement('span');
            span.className = 'lesson-highlight';
            span.setAttribute('data-highlight-id', record.id);

            if (cleanedFragment.childNodes.length > 0) {
                span.appendChild(cleanedFragment);
            } else {
                span.textContent = cleanedText;
            }

            range.insertNode(span);

            requestAnimationFrame(() => {
                span.classList.add('lesson-highlight--applied');
                setTimeout(() => span.classList.remove('lesson-highlight--applied'), 200);
            });

            return span;
        };

        const findNeighborHighlight = (span: HTMLElement, direction: 'previous' | 'next') => {
            let sibling: ChildNode | null = direction === 'previous' ? span.previousSibling : span.nextSibling;

            while (sibling) {
                if (sibling.nodeType === Node.TEXT_NODE) {
                    if ((sibling.textContent ?? '').trim() === '') {
                        sibling = direction === 'previous' ? sibling.previousSibling : sibling.nextSibling;
                        continue;
                    }
                    return null;
                }

                if (sibling.nodeType === Node.ELEMENT_NODE) {
                    const el = sibling as HTMLElement;
                    if (el.hasAttribute('data-highlight-id')) {
                        return el;
                    }
                    return null;
                }

                sibling = direction === 'previous' ? sibling.previousSibling : sibling.nextSibling;
            }

            return null;
        };

        const mergeAdjacentHighlights = (span: HTMLElement, baseRecord: HighlightRecord) => {
            let workingSpan = span;
            let workingRecord = baseRecord;
            let merged = false;

            const executeMerge = (neighborElement: HTMLElement, direction: 'previous' | 'next') => {
                const neighborId = neighborElement.getAttribute('data-highlight-id');
                if (!neighborId) {
                    return false;
                }

                const neighborRecord = highlightsRef.current.get(neighborId);
                if (!neighborRecord) {
                    return false;
                }

                const range = document.createRange();
                if (direction === 'previous') {
                    range.setStartBefore(neighborElement);
                    range.setEndAfter(workingSpan);
                } else {
                    range.setStartBefore(workingSpan);
                    range.setEndAfter(neighborElement);
                }

                const fragment = range.extractContents();
                const cleanedFragment = unwrapHighlightWrappersInFragment(fragment);
                const mergedText = normalizeTextContent(cleanedFragment.textContent ?? '');

                if (!hasVisibleGlyph(mergedText)) {
                    range.insertNode(cleanedFragment);
                    return false;
                }

                const mergedSpan = document.createElement('span');
                mergedSpan.className = 'lesson-highlight lesson-highlight--grouped';
                const mergedId = nextHighlightId();
                mergedSpan.setAttribute('data-highlight-id', mergedId);

                if (cleanedFragment.childNodes.length > 0) {
                    mergedSpan.appendChild(cleanedFragment);
                } else {
                    mergedSpan.textContent = mergedText;
                }

                range.insertNode(mergedSpan);

                const mergedRange = document.createRange();
                mergedRange.selectNodeContents(mergedSpan);
                const offsets = getOffsetsFromRange(mergedRange);
                mergedRange.detach();
                if (!offsets) {
                    return false;
                }

                highlightsRef.current.delete(workingRecord.id);
                highlightsRef.current.delete(neighborId);

                workingRecord = {
                    id: mergedId,
                    startOffset: offsets.start,
                    endOffset: offsets.end,
                    createdAt: Math.min(workingRecord.createdAt, neighborRecord.createdAt),
                };

                mergedSpan.classList.add('lesson-highlight--grouped');
                workingSpan = mergedSpan;
                highlightsRef.current.set(workingRecord.id, workingRecord);
                merged = true;
                return true;
            };

            let keepMerging = true;
            while (keepMerging) {
                keepMerging = false;

                const previousHighlight = findNeighborHighlight(workingSpan, 'previous');
                if (previousHighlight && executeMerge(previousHighlight, 'previous')) {
                    keepMerging = true;
                    continue;
                }

                const nextHighlight = findNeighborHighlight(workingSpan, 'next');
                if (nextHighlight && executeMerge(nextHighlight, 'next')) {
                    keepMerging = true;
                }
            }

            return { span: workingSpan, record: workingRecord, merged };
        };

        const wrapRange = (
            range: Range,
            record: HighlightRecord,
            options?: { skipPersistence?: boolean; skipMerge?: boolean }
        ): HighlightRecord | null => {
            const span = createSpanFromRange(range, record);
            if (!span) {
                return null;
            }
            highlightsRef.current.set(record.id, record);

            let finalRecord = record;
            if (!options?.skipMerge) {
                const mergeResult = mergeAdjacentHighlights(span, record);
                finalRecord = mergeResult.record;
            }

            if (!options?.skipPersistence) {
                persistHighlights();
            }

            return finalRecord;
        };

        const applyRecord = (record: HighlightRecord) => {
            const range = document.createRange();
            const start = getTextNodeAtOffset(record.startOffset);
            const end = getTextNodeAtOffset(record.endOffset);
            if (!start || !end) {
                return false;
            }

            try {
                range.setStart(start.node, start.offset);
                range.setEnd(end.node, end.offset);
            } catch (error) {
                console.error('Impossible de réappliquer un surlignage', error);
                return false;
            }

            if (!wrapRange(range, record, { skipPersistence: true, skipMerge: true })) {
                range.detach();
                return false;
            }
            range.detach();
            return true;
        };

        const hydrateHighlights = () => {
            if (!isBrowser || !storageKey) {
                highlightsRef.current = new Map();
                return;
            }

            let stored: HighlightRecord[] = [];
            try {
                const raw = localStorage.getItem(storageKey);
                if (raw) {
                    stored = JSON.parse(raw);
                }
            } catch (error) {
                console.error('Impossible de charger les surlignages', error);
            }

            if (!Array.isArray(stored) || stored.length === 0) {
                highlightsRef.current = new Map();
                return;
            }

            const applied: HighlightRecord[] = [];
            stored
                .filter((record) =>
                    record && typeof record.startOffset === 'number' && typeof record.endOffset === 'number' && record.endOffset > record.startOffset
                )
                .sort((a, b) => a.startOffset - b.startOffset)
                .forEach((record) => {
                    if (applyRecord(record)) {
                        applied.push(record);
                    }
                });

            highlightsRef.current = new Map(applied.map((record) => [record.id, record]));

            if (applied.length !== stored.length) {
                persistHighlights(applied);
            }
        };

        clearAllHighlightNodes();
        cleanupLegacyArtifacts();
        hydrateHighlights();
        removeEmptyHighlights();

        // 🔧 FIX: Ajouter des listeners pour synchroniser avec MathJax
        const handleMathJaxBeforeUpdate = () => {
            // MathJax va modifier le DOM, sauvegarder les highlights actuels
            console.log('[Highlight] MathJax va modifier le DOM, sauvegarde des highlights');
            mathjaxUpdatePendingRef.current = true;
            highlightsBackupRef.current = Array.from(highlightsRef.current.values());

            // Nettoyer le timer de rehydration s'il existe
            if (rehydrationTimerRef.current) {
                clearTimeout(rehydrationTimerRef.current);
                rehydrationTimerRef.current = null;
            }
        };

        const handleMathJaxRendered = () => {
            // MathJax a fini son rendu, réappliquer les highlights après un court délai
            console.log('[Highlight] MathJax a fini, réapplication des highlights dans 100ms');
            mathjaxUpdatePendingRef.current = false;

            // Nettoyer le timer précédent
            if (rehydrationTimerRef.current) {
                clearTimeout(rehydrationTimerRef.current);
            }

            // Attendre que le DOM soit stable avant de réappliquer
            rehydrationTimerRef.current = window.setTimeout(() => {
                if (!container) return;

                console.log('[Highlight] Réapplication des highlights sauvegardés');
                clearAllHighlightNodes();

                const backup = highlightsBackupRef.current;
                if (backup.length > 0) {
                    const applied: HighlightRecord[] = [];
                    backup
                        .sort((a, b) => a.startOffset - b.startOffset)
                        .forEach((record) => {
                            if (applyRecord(record)) {
                                applied.push(record);
                            }
                        });

                    highlightsRef.current = new Map(applied.map((record) => [record.id, record]));

                    if (applied.length !== backup.length) {
                        console.warn(`[Highlight] Seulement ${applied.length}/${backup.length} highlights réappliqués`);
                        persistHighlights(applied);
                    }
                }

                highlightsBackupRef.current = [];
                rehydrationTimerRef.current = null;
            }, 100);
        };

        // Écouter les événements MathJax
        container.addEventListener('mathjax-before-update', handleMathJaxBeforeUpdate as EventListener);
        container.addEventListener('mathjax-rendered', handleMathJaxRendered as EventListener);

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target || FORBIDDEN_TAGS.has(target.tagName)) {
                return;
            }

            // 🔧 FIX: Ignorer les clics sur les éléments MathJax
            const mathJaxElement = target.closest('mjx-container, .MathJax, [data-mathml]');
            if (mathJaxElement) {
                console.log('[Highlight] Clic sur élément MathJax ignoré');
                return;
            }

            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            if (highlightElement) {
                const highlightId = highlightElement.getAttribute('data-highlight-id');

                unwrapHighlightElement(highlightElement);

                if (highlightId && highlightsRef.current.has(highlightId)) {
                    highlightsRef.current.delete(highlightId);
                    persistHighlights();
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

            const offsets = getOffsetsFromRange(range);
            if (!offsets) {
                selection.removeAllRanges();
                return;
            }

            const record: HighlightRecord = {
                id: nextHighlightId(),
                startOffset: offsets.start,
                endOffset: offsets.end,
                createdAt: Date.now(),
            };

            wrapRange(range, record);
            selection.removeAllRanges();
        };

        container.addEventListener('dblclick', handleDoubleClick);

        return () => {
            // 🔧 FIX: Nettoyer tous les listeners et timers
            container.removeEventListener('dblclick', handleDoubleClick);
            container.removeEventListener('mathjax-before-update', handleMathJaxBeforeUpdate as EventListener);
            container.removeEventListener('mathjax-rendered', handleMathJaxRendered as EventListener);

            if (rehydrationTimerRef.current) {
                clearTimeout(rehydrationTimerRef.current);
                rehydrationTimerRef.current = null;
            }

            highlightsRef.current.clear();
            highlightsBackupRef.current = [];
        };
    }, [storageKey]);

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
                    background: rgba(255, 214, 77, 0.35);
                    border: 1px solid rgba(255, 193, 7, 0.6);
                    box-shadow: inset 0 -2px 0 rgba(255, 179, 0, 0.75);
                    color: inherit;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
                }

                .lesson-highlight::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.45));
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                }

                .lesson-highlight--grouped {
                    padding: 0.18rem 0.7rem;
                    background: rgba(255, 226, 140, 0.8);
                    border-color: rgba(255, 193, 7, 0.9);
                    box-shadow: inset 0 -2px 0 rgba(255, 193, 0, 0.9), 0 12px 22px rgba(255, 193, 0, 0.18);
                }

                .lesson-highlight--applied {
                    transform: translateY(-1px);
                    box-shadow: inset 0 -2px 0 rgba(255, 193, 0, 0.9), 0 8px 16px rgba(255, 193, 0, 0.25);
                }

                .lesson-highlight:hover {
                    background: rgba(255, 234, 163, 0.9);
                    border-color: rgba(255, 193, 7, 1);
                    box-shadow: inset 0 -3px 0 rgba(255, 193, 0, 0.8), 0 6px 16px rgba(15, 23, 42, 0.12);
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
