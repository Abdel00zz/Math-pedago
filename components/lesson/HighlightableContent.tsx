/**
 * Composant pour rendre le contenu highlightable au double-clic
 */

import React, { useRef, useEffect } from 'react';

interface HighlightableContentProps {
    children: React.ReactNode;
    className?: string;
    storageKey?: string;
}

const STORAGE_PREFIX = 'lesson-highlights';
const MAX_STORED_HIGHLIGHTS = 250;

interface StoredHighlight {
    id: string;
    startOffset: number;
    endOffset: number;
    text: string;
    before: string;
    after: string;
    createdAt: number;
}

const buildStorageKey = (lessonKey?: string) => `${STORAGE_PREFIX}:${lessonKey ?? 'global'}`;

const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
    if (!raw) {
        return fallback;
    }

    try {
        return JSON.parse(raw) as T;
    } catch (error) {
        console.warn('[HighlightableContent] Invalid stored highlights', error);
        return fallback;
    }
};

const readStoredHighlights = (storageKey: string): StoredHighlight[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    return safeJsonParse<StoredHighlight[]>(localStorage.getItem(storageKey), []);
};

const writeStoredHighlights = (storageKey: string, highlights: StoredHighlight[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const trimmed = highlights.slice(-MAX_STORED_HIGHLIGHTS);
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
    } catch (error) {
        console.warn('[HighlightableContent] Unable to persist highlights', error);
    }
};

const getCharacterOffset = (root: Node, target: Node, nodeOffset: number): number | null => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let total = 0;

    while (walker.nextNode()) {
        const current = walker.currentNode;
        const length = current.textContent?.length ?? 0;
        if (current === target) {
            return total + nodeOffset;
        }
        total += length;
    }

    return null;
};

const createRangeFromOffsets = (root: Node, start: number, end: number): Range | null => {
    if (start >= end) {
        return null;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let total = 0;
    let startNode: Node | null = null;
    let startNodeOffset = 0;
    let endNode: Node | null = null;
    let endNodeOffset = 0;

    while (walker.nextNode()) {
        const current = walker.currentNode;
        const length = current.textContent?.length ?? 0;
        if (length === 0) {
            continue;
        }

        const nodeStart = total;
        const nodeEnd = total + length;

        if (!startNode && start >= nodeStart && start <= nodeEnd) {
            startNode = current;
            startNodeOffset = start - nodeStart;
        }

        if (startNode && end >= nodeStart && end <= nodeEnd) {
            endNode = current;
            endNodeOffset = end - nodeStart;
            break;
        }

        total = nodeEnd;
    }

    if (!startNode || !endNode) {
        return null;
    }

    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);
    return range;
};

const resolveOffsetsWithContext = (
    containerText: string,
    highlight: StoredHighlight,
): { start: number; end: number } | null => {
    const { text, startOffset, endOffset, before, after } = highlight;
    if (!text) {
        return null;
    }

    if (
        startOffset >= 0 &&
        endOffset > startOffset &&
        containerText.slice(startOffset, endOffset) === text
    ) {
        return { start: startOffset, end: endOffset };
    }

    const occurrences: number[] = [];
    let index = containerText.indexOf(text);
    while (index !== -1) {
        occurrences.push(index);
        index = containerText.indexOf(text, index + 1);
    }

    if (occurrences.length === 0) {
        return null;
    }

    const bestMatch = occurrences.find((candidate) => {
        const beforeSlice = containerText.slice(Math.max(0, candidate - before.length), candidate);
        const afterSlice = containerText.slice(
            candidate + text.length,
            candidate + text.length + after.length,
        );
        const beforeMatches = before.length === 0 || before.endsWith(beforeSlice);
        const afterMatches = after.length === 0 || afterSlice.startsWith(after);
        return beforeMatches && afterMatches;
    });

    const finalIndex = bestMatch ?? occurrences[0];
    return { start: finalIndex, end: finalIndex + text.length };
};

const wrapRangeWithHighlight = (range: Range, highlightId: string): HTMLElement | null => {
    const span = document.createElement('span');
    span.className = 'lesson-highlight';
    span.setAttribute('data-highlight-id', highlightId);

    try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);

        requestAnimationFrame(() => {
            span.classList.add('lesson-highlight--applied');
            setTimeout(() => span.classList.remove('lesson-highlight--applied'), 200);
        });
    } catch (error) {
        console.error('Erreur lors du highlight:', error);
        return null;
    }

    return span;
};

const restoreHighlight = (
    container: HTMLElement,
    entry: StoredHighlight,
): { applied: boolean; updated: boolean } => {
    if (container.querySelector(`[data-highlight-id="${entry.id}"]`)) {
        return { applied: true, updated: false };
    }

    const containerText = container.textContent ?? '';
    const offsets = resolveOffsetsWithContext(containerText, entry);
    if (!offsets) {
        return { applied: false, updated: false };
    }

    const range = createRangeFromOffsets(container, offsets.start, offsets.end);
    if (!range) {
        return { applied: false, updated: false };
    }

    const updatedOffsets = entry.startOffset !== offsets.start || entry.endOffset !== offsets.end;
    const wrapped = wrapRangeWithHighlight(range, entry.id);
    if (!wrapped) {
        return { applied: false, updated: false };
    }

    entry.startOffset = offsets.start;
    entry.endOffset = offsets.end;
    return { applied: true, updated: updatedOffsets };
};

export const HighlightableContent: React.FC<HighlightableContentProps> = ({
    children,
    className = '',
    storageKey,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const storedHighlightsRef = useRef<StoredHighlight[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof window === 'undefined') {
            return;
        }

        const storageIdentifier = buildStorageKey(storageKey);
        storedHighlightsRef.current = readStoredHighlights(storageIdentifier);

        const applyStoredHighlights = () => {
            let didUpdateOffsets = false;
            let allApplied = true;

            storedHighlightsRef.current.forEach((entry) => {
                const result = restoreHighlight(container, entry);
                if (result.updated) {
                    didUpdateOffsets = true;
                }
                if (!result.applied) {
                    allApplied = false;
                }
            });

            if (didUpdateOffsets) {
                writeStoredHighlights(storageIdentifier, storedHighlightsRef.current);
            }

            return allApplied;
        };

        const initialRestoreSucceeded = applyStoredHighlights();
        let observer: MutationObserver | null = null;

        if (!initialRestoreSucceeded) {
            observer = new MutationObserver(() => {
                if (applyStoredHighlights()) {
                    observer?.disconnect();
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        }

        const persistHighlights = (nextHighlights: StoredHighlight[]) => {
            storedHighlightsRef.current = nextHighlights;
            writeStoredHighlights(storageIdentifier, nextHighlights);
        };

        const removeHighlightElement = (highlightElement: HTMLElement) => {
            const highlightId = highlightElement.getAttribute('data-highlight-id');
            const parentNode = highlightElement.parentNode;
            if (parentNode) {
                parentNode.replaceChild(
                    document.createTextNode(highlightElement.textContent || ''),
                    highlightElement,
                );
                parentNode.normalize();
            }

            if (highlightId) {
                const filtered = storedHighlightsRef.current.filter((entry) => entry.id !== highlightId);
                persistHighlights(filtered);
            }
        };

        const highlightCurrentSelection = (): boolean => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                return false;
            }

            const selectedTextRaw = selection.toString();
            if (selectedTextRaw.trim() === '') {
                selection.removeAllRanges();
                return false;
            }

            const range = selection.getRangeAt(0);
            if (!container.contains(range.commonAncestorContainer)) {
                selection.removeAllRanges();
                return false;
            }

            const startOffset = getCharacterOffset(container, range.startContainer, range.startOffset);
            const endOffset = getCharacterOffset(container, range.endContainer, range.endOffset);
            if (startOffset === null || endOffset === null || endOffset <= startOffset) {
                selection.removeAllRanges();
                return false;
            }

            const selectionSnapshot = range.cloneRange();
            const snapshotText = selectionSnapshot.toString();
            const containerTextSnapshot = container.textContent ?? '';
            const highlightId =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? `highlight-${crypto.randomUUID()}`
                    : `highlight-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            if (!wrapRangeWithHighlight(range, highlightId)) {
                selection.removeAllRanges();
                return false;
            }

            const before = containerTextSnapshot.slice(Math.max(0, startOffset - 32), startOffset);
            const after = containerTextSnapshot.slice(endOffset, endOffset + 32);

            const newHighlight: StoredHighlight = {
                id: highlightId,
                startOffset,
                endOffset,
                text: snapshotText || selectedTextRaw,
                before,
                after,
                createdAt: Date.now(),
            };

            persistHighlights([...storedHighlightsRef.current, newHighlight]);
            selection.removeAllRanges();
            return true;
        };

        const shouldIgnoreTarget = (target: HTMLElement) => {
            const tagName = target.tagName;
            return tagName === 'BUTTON' || tagName === 'INPUT' || tagName === 'A' || target.isContentEditable;
        };

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (shouldIgnoreTarget(target)) {
                return;
            }

            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            if (highlightElement) {
                removeHighlightElement(highlightElement);
                return;
            }

            highlightCurrentSelection();
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (!container.contains(e.target as Node)) {
                return;
            }

            const target = e.target as HTMLElement;
            if (shouldIgnoreTarget(target)) {
                return;
            }

            if (e.pointerType !== 'touch' && e.pointerType !== 'pen') {
                return;
            }

            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            const selection = window.getSelection();

            if (highlightElement && (!selection || selection.toString().trim() === '')) {
                removeHighlightElement(highlightElement);
                return;
            }

            setTimeout(() => {
                highlightCurrentSelection();
            }, 0);
        };

        container.addEventListener('dblclick', handleDoubleClick);
        container.addEventListener('pointerup', handlePointerUp);

        return () => {
            observer?.disconnect();
            container.removeEventListener('dblclick', handleDoubleClick);
            container.removeEventListener('pointerup', handlePointerUp);
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
