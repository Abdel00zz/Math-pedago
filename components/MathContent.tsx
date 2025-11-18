import React, { useEffect, useRef } from 'react';

interface MathContentProps {
    content: string;
    className?: string;
    inline?: boolean;
}

// 🔍 DIAGNOSTIC MATHJAX - Active les logs détaillés
const MATHJAX_DEBUG = false; // Désactivé pour production

const logDebug = (...args: any[]) => {
    if (MATHJAX_DEBUG) {
        console.log('[MathJax Debug]', ...args);
    }
};

/**
 * Traite uniquement le Markdown de base (gras/italique)
 * SANS toucher aux délimiteurs LaTeX $ $ et $$ $$
 */
const processMarkdown = (text: string): string => {
    if (!text) return text;

    let processed = text;

    // 🔧 FIX: Protéger temporairement les expressions LaTeX avec un placeholder unique
    const mathExpressions: string[] = [];
    let mathIndex = 0;
    // Utiliser un UUID-like placeholder pour éviter les collisions
    const placeholderPrefix = `__MATHPEDAGO_${Date.now()}_`;

    // Sauvegarder les expressions $$...$$ d'abord (pour éviter les conflits avec $...$)
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
        const placeholder = `${placeholderPrefix}${mathIndex}__`;
        mathExpressions.push(match);
        mathIndex++;
        return placeholder;
    });

    // Puis sauvegarder les expressions $...$
    processed = processed.replace(/\$([^\$]+?)\$/g, (match) => {
        const placeholder = `${placeholderPrefix}${mathIndex}__`;
        mathExpressions.push(match);
        mathIndex++;
        return placeholder;
    });

    // Maintenant convertir le Markdown sans toucher aux maths
    // **texte** → <strong>texte</strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // *texte* → <em>texte</em> (mais pas si déjà dans **)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Restaurer les expressions LaTeX dans l'ordre
    mathExpressions.forEach((mathExpr, idx) => {
        const placeholder = `${placeholderPrefix}${idx}__`;
        processed = processed.replace(placeholder, mathExpr);
    });

    logDebug('Markdown processed:', { original: text, processed });

    return processed;
};

/**
 * MathContent - Composant pour afficher du contenu avec formules MathJax
 * Utilise UNIQUEMENT MathJax pour le rendu mathématique
 */
const MathContent: React.FC<MathContentProps> = ({ content, className = '', inline = true }) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const latestContent = useRef<string>('');

    useEffect(() => {
        let cancelled = false;
        let timeoutId: number | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 30; // Réduit de 100 à 30 (suffisant avec defer)

        const el = containerRef.current;
        if (!el) return;

        // Ajouter la classe pour masquer le contenu non compilé
        el.classList.remove('math-initialized');

        // Traiter le Markdown en protégeant les expressions LaTeX
        const processedContent = processMarkdown(content);

        logDebug('Content update:', {
            raw: content,
            processed: processedContent,
            hasMath: /\$/.test(content)
        });

        if (latestContent.current !== processedContent) {
            el.innerHTML = processedContent || '';
            latestContent.current = processedContent;
            logDebug('DOM updated with:', processedContent);
        }

        const typeset = async () => {
            if (!containerRef.current || cancelled) {
                return;
            }

            // 🔍 DIAGNOSTIC 1: Vérifier si MathJax existe
            logDebug('Checking MathJax availability...', {
                exists: !!window.MathJax,
                retryCount,
                maxRetries: MAX_RETRIES
            });

            // Vérifier si MathJax est disponible
            if (!window.MathJax) {
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    // Délai réduit : 50ms au lieu de 100-200ms
                    const delay = retryCount < 5 ? 30 : 50;
                    logDebug('MathJax not ready, retrying in', delay, 'ms... (attempt', retryCount, '/', MAX_RETRIES, ')');
                    timeoutId = window.setTimeout(typeset, delay);
                } else {
                    console.error('❌ MathJax NON DISPONIBLE après', MAX_RETRIES, 'tentatives');
                    console.error('❌ Vérifiez que le script MathJax est bien chargé dans index.html');
                    console.error('❌ Contenu non rendu:', containerRef.current?.textContent);
                    // Rendre visible même sans MathJax pour ne pas bloquer l'affichage
                    if (containerRef.current) {
                        containerRef.current.classList.add('math-initialized');
                    }
                }
                return;
            }

            // 🔍 DIAGNOSTIC 2: MathJax est disponible
            logDebug('✅ MathJax is available!', {
                hasTypesetPromise: !!window.MathJax.typesetPromise,
                hasTypesetClear: !!window.MathJax.typesetClear,
                hasStartup: !!window.MathJax.startup
            });

            try {
                // Attendre que MathJax soit complètement initialisé
                if (window.MathJax.startup?.promise) {
                    logDebug('Waiting for MathJax startup...');
                    await window.MathJax.startup.promise;
                    logDebug('✅ MathJax startup complete');
                }

                if (!containerRef.current || cancelled) {
                    return;
                }

                // 🔍 DIAGNOSTIC 3: Contenu avant rendu
                logDebug('Content before typesetting:', {
                    html: containerRef.current.innerHTML,
                    textContent: containerRef.current.textContent,
                    hasDollarSigns: /\$/.test(containerRef.current.innerHTML)
                });

                // Nettoyer les rendus précédents si disponible
                if (window.MathJax.typesetClear) {
                    try {
                        if (containerRef.current?.querySelector('mjx-container')) {
                            window.MathJax.typesetClear([containerRef.current]);
                            logDebug('Previous MathJax render cleared');
                        }
                    } catch (clearError) {
                        if ((clearError as DOMException)?.name !== 'NotFoundError') {
                            console.error('MathJax typesetClear error:', clearError);
                        }
                    }
                }

                // Rendre les nouvelles formules
                if (window.MathJax.typesetPromise) {
                    logDebug('Starting MathJax typesetting...');
                    await window.MathJax.typesetPromise([containerRef.current]);
                    logDebug('✅ MathJax typesetting complete!');

                    // Rendre le contenu visible après le rendu réussi
                    if (containerRef.current) {
                        containerRef.current.classList.add('math-initialized');

                        // Émettre un événement pour notifier que MathJax a fini
                        containerRef.current.dispatchEvent(new CustomEvent('mathjax-rendered', {
                            bubbles: true,
                            detail: { timestamp: Date.now() }
                        }));
                        logDebug('Événement mathjax-rendered émis');
                    }

                    // 🔍 DIAGNOSTIC 4: Contenu après rendu
                    logDebug('Content after typesetting:', {
                        html: containerRef.current.innerHTML,
                        hasMjxContainer: containerRef.current.querySelector('mjx-container') !== null,
                        mjxCount: containerRef.current.querySelectorAll('mjx-container').length
                    });
                } else {
                    console.error('❌ window.MathJax.typesetPromise n\'existe pas');
                    console.error('Structure MathJax:', Object.keys(window.MathJax || {}));
                    // Rendre visible même si typesetPromise n'existe pas
                    if (containerRef.current) {
                        containerRef.current.classList.add('math-initialized');
                    }
                }
            } catch (error) {
                console.error('❌ MathJax rendering error:', error);
                logDebug('Error details:', {
                    error,
                    stack: (error as Error).stack,
                    content: containerRef.current?.innerHTML
                });
                // Réessayer jusqu'à 3 fois en cas d'erreur
                if (retryCount < 3) {
                    retryCount++;
                    logDebug(`Retrying after error (attempt ${retryCount}/3)...`);
                    timeoutId = window.setTimeout(typeset, 100);
                }
                // Rendre visible même en cas d'erreur pour ne pas bloquer l'affichage
                if (containerRef.current) {
                    containerRef.current.classList.add('math-initialized');
                }
            }
        };

        // 🔧 FIX: Augmenter le délai pour éviter les race conditions avec HighlightableContent
        // Démarrer le rendu avec un délai de 50ms pour laisser le temps au DOM de se stabiliser
        timeoutId = window.setTimeout(typeset, 50);

        return () => {
            cancelled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [content]);

    const Tag = inline ? 'span' : 'div';
    const combinedClassName = ['math-content tex2jax_process', className].filter(Boolean).join(' ');

    return (
        <Tag
            ref={(node) => {
                containerRef.current = node as HTMLElement | null;
            }}
            className={combinedClassName}
        />
    );
};

export default MathContent;
