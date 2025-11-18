/**
 * Composant pour rendre le contenu highlightable au double-clic avec persistance
 * VERSION 2.0 - Architecture moderne basée sur le contenu textuel
 */

import React, { useEffect, useRef } from 'react';

interface HighlightableContentProps {
    children: React.ReactNode;
    className?: string;
    storageKey?: string;
}

/**
 * Nouveau format de sauvegarde basé sur le CONTENU au lieu des offsets
 * Plus robuste face aux mutations DOM de MathJax
 */
type HighlightRecord = {
    id: string;
    text: string;              // Le texte exact qui a été surligné
    contextBefore: string;     // 20 caractères avant pour contexte
    contextAfter: string;      // 20 caractères après pour contexte
    createdAt: number;
};

const FORBIDDEN_TAGS = new Set(['BUTTON', 'INPUT', 'A', 'TEXTAREA', 'MJX-CONTAINER']);
const INVISIBLE_CHARACTERS = /[\u200b\u200c\u200d\uFEFF]/g;
const VISIBLE_GLYPH_PATTERN = /[^\s\u00a0]/;
const CONTEXT_LENGTH = 20;

export const HighlightableContent: React.FC<HighlightableContentProps> = ({ children, className = '', storageKey }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightsRef = useRef<Map<string, HighlightRecord>>(new Map());
    const incrementalIdRef = useRef(0);
    const rehydrationTimerRef = useRef<number | null>(null);
    const sessionId = useRef(`session-${Date.now()}`);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isBrowser = typeof window !== 'undefined';

        /**
         * Génère un ID unique basé sur la session + compteur
         */
        const nextHighlightId = () => `hl-${sessionId.current}-${incrementalIdRef.current++}`;

        /**
         * Normalise le texte en supprimant les caractères invisibles
         */
        const normalizeText = (text?: string | null): string => {
            return (text ?? '').replace(INVISIBLE_CHARACTERS, '').trim();
        };

        /**
         * Vérifie si le texte contient des caractères visibles
         */
        const hasVisibleGlyph = (text?: string | null): boolean => {
            return VISIBLE_GLYPH_PATTERN.test(normalizeText(text));
        };

        /**
         * Obtient tout le texte visible du container en ignorant MathJax
         */
        const getVisibleText = (): string => {
            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        let parent = node.parentElement;
                        while (parent) {
                            // Ignorer les éléments MathJax et les highlights existants
                            if (parent.tagName === 'MJX-CONTAINER' ||
                                parent.classList?.contains('MathJax') ||
                                parent.hasAttribute('data-mathml')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            if (parent === container) break;
                            parent = parent.parentElement;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let text = '';
            let node;
            while ((node = walker.nextNode())) {
                text += node.textContent || '';
            }
            return normalizeText(text);
        };

        /**
         * Trouve un texte dans le DOM et retourne un Range
         * Utilise le contexte avant/après pour être sûr de trouver la bonne occurrence
         */
        const findTextInDOM = (record: HighlightRecord): Range | null => {
            const fullText = getVisibleText();
            const searchPattern = record.contextBefore + record.text + record.contextAfter;
            const index = fullText.indexOf(searchPattern);

            if (index === -1) {
                console.warn('[Highlight] Texte introuvable:', record.text);
                return null;
            }

            // Calculer la position de début du texte à surligner
            const startOffset = index + record.contextBefore.length;
            const endOffset = startOffset + record.text.length;

            // Créer un TreeWalker pour parcourir uniquement les nœuds texte valides
            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        let parent = node.parentElement;
                        while (parent) {
                            if (parent.tagName === 'MJX-CONTAINER' ||
                                parent.classList?.contains('MathJax') ||
                                parent.hasAttribute('data-mathml') ||
                                parent.hasAttribute('data-highlight-id')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            if (parent === container) break;
                            parent = parent.parentElement;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let currentOffset = 0;
            let startNode: Text | null = null;
            let startNodeOffset = 0;
            let endNode: Text | null = null;
            let endNodeOffset = 0;

            let node;
            while ((node = walker.nextNode() as Text)) {
                const nodeText = normalizeText(node.textContent);
                const nodeLength = nodeText.length;

                // Trouver le nœud de début
                if (!startNode && currentOffset + nodeLength > startOffset) {
                    startNode = node;
                    startNodeOffset = startOffset - currentOffset;
                }

                // Trouver le nœud de fin
                if (currentOffset + nodeLength >= endOffset) {
                    endNode = node;
                    endNodeOffset = endOffset - currentOffset;
                    break;
                }

                currentOffset += nodeLength;
            }

            if (!startNode || !endNode) {
                console.warn('[Highlight] Impossible de créer le Range pour:', record.text);
                return null;
            }

            try {
                const range = document.createRange();
                range.setStart(startNode, Math.min(startNodeOffset, startNode.length));
                range.setEnd(endNode, Math.min(endNodeOffset, endNode.length));
                return range;
            } catch (error) {
                console.error('[Highlight] Erreur création Range:', error);
                return null;
            }
        };

        /**
         * Supprime un élément highlight et restaure le texte
         */
        const unwrapHighlightElement = (element: HTMLElement) => {
            const parent = element.parentNode;
            if (!parent) return;

            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
            parent.normalize();
        };

        /**
         * Supprime tous les highlights vides
         */
        const removeEmptyHighlights = () => {
            const highlights = container.querySelectorAll('.lesson-highlight');
            highlights.forEach((node) => {
                const element = node as HTMLElement;
                if (!hasVisibleGlyph(element.textContent)) {
                    const id = element.getAttribute('data-highlight-id');
                    unwrapHighlightElement(element);
                    if (id) highlightsRef.current.delete(id);
                }
            });
        };

        /**
         * Nettoie tous les highlights du DOM
         */
        const clearAllHighlights = () => {
            const highlights = container.querySelectorAll('[data-highlight-id]');
            highlights.forEach((node) => unwrapHighlightElement(node as HTMLElement));
            container.normalize();
            highlightsRef.current.clear();
        };

        /**
         * Sauvegarde les highlights dans localStorage
         */
        const saveHighlights = (data?: HighlightRecord[]) => {
            if (!isBrowser || !storageKey) return;

            removeEmptyHighlights();
            const records = data ?? Array.from(highlightsRef.current.values());

            try {
                localStorage.setItem(storageKey, JSON.stringify(records));
                console.log(`[Highlight] ${records.length} highlights sauvegardés`);
            } catch (error) {
                console.error('[Highlight] Erreur sauvegarde:', error);
            }
        };

        /**
         * Crée un span de highlight à partir d'un Range
         */
        const createHighlightSpan = (range: Range, record: HighlightRecord): HTMLElement | null => {
            // Vérifier qu'il n'y a pas de MathJax dans la sélection
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(range.cloneContents());
            const hasMathJax = tempDiv.querySelector('mjx-container, .MathJax, [data-mathml]') !== null;

            if (hasMathJax) {
                console.warn('[Highlight] Sélection contient MathJax, ignorée');
                return null;
            }

            // Extraire le contenu
            const fragment = range.extractContents();
            const text = normalizeText(fragment.textContent);

            if (!hasVisibleGlyph(text)) {
                range.insertNode(fragment);
                return null;
            }

            // Créer le span de highlight
            const span = document.createElement('span');
            span.className = 'lesson-highlight';
            span.setAttribute('data-highlight-id', record.id);
            span.appendChild(fragment);

            // Insérer dans le DOM
            range.insertNode(span);

            // Animation
            requestAnimationFrame(() => {
                span.classList.add('lesson-highlight--applied');
                setTimeout(() => span.classList.remove('lesson-highlight--applied'), 200);
            });

            return span;
        };

        /**
         * Applique un highlight depuis un record sauvegardé
         */
        const applyHighlight = (record: HighlightRecord): boolean => {
            const range = findTextInDOM(record);
            if (!range) return false;

            const span = createHighlightSpan(range, record);
            if (!span) {
                range.detach();
                return false;
            }

            highlightsRef.current.set(record.id, record);
            range.detach();
            return true;
        };

        /**
         * Nettoie les anciennes données corrompues du localStorage
         * Détecte l'ancien format avec startOffset/endOffset et le supprime
         */
        const cleanupLegacyData = () => {
            if (!isBrowser || !storageKey) return;

            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) return;

                const data = JSON.parse(raw);
                if (!Array.isArray(data) || data.length === 0) return;

                // Vérifier si c'est l'ancien format (avec startOffset/endOffset)
                const hasLegacyFormat = data.some((item: any) =>
                    item && ('startOffset' in item || 'endOffset' in item)
                );

                if (hasLegacyFormat) {
                    console.warn('[Highlight] Ancien format détecté, nettoyage du localStorage');
                    localStorage.removeItem(storageKey);

                    // Nettoyer aussi tous les highlights avec pattern legacy
                    Object.keys(localStorage).forEach((key) => {
                        if (key.startsWith('lesson-highlights:')) {
                            try {
                                const value = localStorage.getItem(key);
                                if (value) {
                                    const parsed = JSON.parse(value);
                                    if (Array.isArray(parsed) && parsed.some((item: any) =>
                                        item && ('startOffset' in item || 'endOffset' in item)
                                    )) {
                                        console.warn('[Highlight] Nettoyage clé legacy:', key);
                                        localStorage.removeItem(key);
                                    }
                                }
                            } catch (e) {
                                // Ignorer les erreurs de parsing
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('[Highlight] Erreur nettoyage legacy:', error);
            }
        };

        /**
         * Charge et applique les highlights depuis localStorage
         */
        const loadHighlights = () => {
            if (!isBrowser || !storageKey) {
                highlightsRef.current = new Map();
                return;
            }

            // Nettoyer les anciennes données avant de charger
            cleanupLegacyData();

            let stored: HighlightRecord[] = [];
            try {
                const raw = localStorage.getItem(storageKey);
                if (raw) {
                    stored = JSON.parse(raw);
                }
            } catch (error) {
                console.error('[Highlight] Erreur chargement:', error);
                // En cas d'erreur, supprimer la clé corrompue
                try {
                    localStorage.removeItem(storageKey);
                } catch (e) {
                    // Ignorer
                }
            }

            if (!Array.isArray(stored) || stored.length === 0) {
                highlightsRef.current = new Map();
                return;
            }

            console.log(`[Highlight] Chargement de ${stored.length} highlights...`);

            // Appliquer chaque highlight
            const applied: HighlightRecord[] = [];
            stored.forEach((record) => {
                if (record && record.text && hasVisibleGlyph(record.text)) {
                    if (applyHighlight(record)) {
                        applied.push(record);
                    } else {
                        console.warn('[Highlight] Échec application:', record.text);
                    }
                }
            });

            console.log(`[Highlight] ${applied.length}/${stored.length} highlights appliqués`);

            // Nettoyer le localStorage si certains highlights n'ont pas pu être appliqués
            if (applied.length !== stored.length) {
                saveHighlights(applied);
            }
        };

        /**
         * Gère le double-clic pour créer/supprimer des highlights
         */
        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target || FORBIDDEN_TAGS.has(target.tagName)) {
                return;
            }

            // Vérifier si on clique sur un élément MathJax
            const mathJaxElement = target.closest('mjx-container, .MathJax, [data-mathml]');
            if (mathJaxElement) {
                console.log('[Highlight] Clic sur MathJax ignoré');
                return;
            }

            // Si on clique sur un highlight existant, le supprimer
            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            if (highlightElement) {
                const id = highlightElement.getAttribute('data-highlight-id');
                unwrapHighlightElement(highlightElement);
                if (id) {
                    highlightsRef.current.delete(id);
                    saveHighlights();
                }
                return;
            }

            // Créer un nouveau highlight
            createHighlightFromSelection();
        };

        /**
         * Crée un highlight à partir de la sélection courante
         */
        const createHighlightFromSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const selectedText = normalizeText(selection.toString());
            if (!hasVisibleGlyph(selectedText)) {
                selection.removeAllRanges();
                return;
            }

            const range = selection.getRangeAt(0);
            if (!container.contains(range.commonAncestorContainer)) {
                selection.removeAllRanges();
                return;
            }

            // Obtenir le contexte avant/après
            const fullText = getVisibleText();
            const rangeText = normalizeText(range.toString());
            const rangeIndex = fullText.indexOf(rangeText);

            if (rangeIndex === -1) {
                console.warn('[Highlight] Texte introuvable dans le contexte');
                selection.removeAllRanges();
                return;
            }

            const contextBefore = fullText.substring(
                Math.max(0, rangeIndex - CONTEXT_LENGTH),
                rangeIndex
            );
            const contextAfter = fullText.substring(
                rangeIndex + rangeText.length,
                Math.min(fullText.length, rangeIndex + rangeText.length + CONTEXT_LENGTH)
            );

            // Créer le record
            const record: HighlightRecord = {
                id: nextHighlightId(),
                text: rangeText,
                contextBefore,
                contextAfter,
                createdAt: Date.now(),
            };

            // Créer le highlight
            const span = createHighlightSpan(range, record);
            if (span) {
                highlightsRef.current.set(record.id, record);
                saveHighlights();
            }

            selection.removeAllRanges();
        };

        /**
         * Gère les événements tactiles pour mobile (long-press)
         */
        let touchTimer: number | null = null;
        let touchStartX = 0;
        let touchStartY = 0;
        const LONG_PRESS_DURATION = 500; // 500ms pour long-press
        const MOVE_THRESHOLD = 10; // pixels de mouvement autorisés

        const handleTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            if (!target || FORBIDDEN_TAGS.has(target.tagName)) {
                return;
            }

            // Vérifier si on touche un élément MathJax
            const mathJaxElement = target.closest('mjx-container, .MathJax, [data-mathml]');
            if (mathJaxElement) {
                return;
            }

            // Si on touche un highlight existant, le supprimer
            const highlightElement = target.closest('[data-highlight-id]') as HTMLElement | null;
            if (highlightElement) {
                e.preventDefault();
                const id = highlightElement.getAttribute('data-highlight-id');
                unwrapHighlightElement(highlightElement);
                if (id) {
                    highlightsRef.current.delete(id);
                    saveHighlights();
                }
                return;
            }

            // Enregistrer la position de départ
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Démarrer le timer pour long-press
            touchTimer = window.setTimeout(() => {
                console.log('[Highlight] Long-press détecté');
                createHighlightFromSelection();
                touchTimer = null;
            }, LONG_PRESS_DURATION);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchTimer) return;

            // Annuler si l'utilisateur bouge trop
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);

            if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
                if (touchTimer) {
                    clearTimeout(touchTimer);
                    touchTimer = null;
                }
            }
        };

        const handleTouchEnd = () => {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        };

        /**
         * Gère la synchronisation avec MathJax
         */
        const handleMathJaxRendered = () => {
            console.log('[Highlight] MathJax rendu détecté, réapplication des highlights dans 150ms');

            if (rehydrationTimerRef.current) {
                clearTimeout(rehydrationTimerRef.current);
            }

            rehydrationTimerRef.current = window.setTimeout(() => {
                console.log('[Highlight] Réapplication après MathJax...');

                // Sauvegarder les records actuels
                const currentRecords = Array.from(highlightsRef.current.values());

                // Nettoyer tout
                clearAllHighlights();

                // Réappliquer
                const applied: HighlightRecord[] = [];
                currentRecords.forEach((record) => {
                    if (applyHighlight(record)) {
                        applied.push(record);
                    }
                });

                console.log(`[Highlight] ${applied.length}/${currentRecords.length} highlights réappliqués`);

                if (applied.length !== currentRecords.length) {
                    saveHighlights(applied);
                }

                rehydrationTimerRef.current = null;
            }, 150);
        };

        // Initialisation
        clearAllHighlights();
        loadHighlights();
        removeEmptyHighlights();

        // Event listeners
        container.addEventListener('dblclick', handleDoubleClick);
        container.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
        container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
        container.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
        container.addEventListener('mathjax-rendered', handleMathJaxRendered as EventListener);

        // Cleanup
        return () => {
            container.removeEventListener('dblclick', handleDoubleClick);
            container.removeEventListener('touchstart', handleTouchStart as EventListener);
            container.removeEventListener('touchmove', handleTouchMove as EventListener);
            container.removeEventListener('touchend', handleTouchEnd as EventListener);
            container.removeEventListener('mathjax-rendered', handleMathJaxRendered as EventListener);

            if (rehydrationTimerRef.current) {
                clearTimeout(rehydrationTimerRef.current);
                rehydrationTimerRef.current = null;
            }

            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }

            highlightsRef.current.clear();
        };
    }, [storageKey, children]); // Ajouter children comme dépendance

    return (
        <div ref={containerRef} className={`highlightable-content ${className}`}>
            {children}
            <style>{`
                .lesson-highlight {
                    display: inline;
                    position: relative;
                    padding: 0.15rem 0.5rem;
                    margin: 0 0.12rem;
                    border-radius: 999px;
                    background: rgba(255, 214, 77, 0.35);
                    border: 1px solid rgba(255, 193, 7, 0.6);
                    box-shadow: inset 0 -2px 0 rgba(255, 179, 0, 0.75);
                    color: inherit;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
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

                .lesson-highlight--applied {
                    transform: translateY(-1px);
                    box-shadow: inset 0 -2px 0 rgba(255, 193, 0, 0.9), 0 8px 16px rgba(255, 193, 0, 0.25);
                }

                .lesson-highlight:hover {
                    background: rgba(255, 234, 163, 0.9);
                    border-color: rgba(255, 193, 7, 1);
                    box-shadow: inset 0 -3px 0 rgba(255, 193, 0, 0.8), 0 6px 16px rgba(15, 23, 42, 0.12);
                    cursor: pointer;
                }

                .lesson-highlight:hover::before {
                    opacity: 1;
                }

                .highlightable-content p,
                .highlightable-content li,
                .highlightable-content td,
                .highlightable-content th {
                    cursor: text;
                    user-select: text;
                }

                .highlightable-content p:hover,
                .highlightable-content li:hover,
                .highlightable-content td:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                /* Optimisations mobile */
                @media (hover: none) and (pointer: coarse) {
                    .lesson-highlight {
                        /* Plus d'espacement pour le toucher */
                        padding: 0.25rem 0.6rem;
                        margin: 0.1rem 0.15rem;
                        /* Désactiver les transitions hover */
                        transition: background 0.15s ease;
                    }

                    /* Indicateur visuel de suppression sur mobile */
                    .lesson-highlight::after {
                        content: '×';
                        position: relative;
                        margin-left: 0.3rem;
                        font-size: 1.1em;
                        font-weight: bold;
                        color: rgba(255, 87, 34, 0.8);
                        opacity: 0.7;
                    }

                    /* Feedback tactile */
                    .lesson-highlight:active {
                        background: rgba(255, 234, 163, 0.95);
                        transform: scale(0.98);
                    }

                    /* Pas de hover sur mobile */
                    .lesson-highlight:hover {
                        background: rgba(255, 214, 77, 0.35);
                        border-color: rgba(255, 193, 7, 0.6);
                        box-shadow: inset 0 -2px 0 rgba(255, 179, 0, 0.75);
                    }

                    .lesson-highlight:hover::before {
                        opacity: 0;
                    }

                    /* Améliorer la lisibilité du texte sélectionné sur mobile */
                    .highlightable-content {
                        -webkit-user-select: text;
                        user-select: text;
                        -webkit-touch-callout: default;
                    }
                }

                /* Cacher l'indicateur × sur desktop */
                @media (hover: hover) and (pointer: fine) {
                    .lesson-highlight::after {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};
