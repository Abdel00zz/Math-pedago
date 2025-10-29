import React, { useEffect, useRef } from 'react';

interface MathContentProps {
    content: string;
    className?: string;
    inline?: boolean;
}

/**
 * Traite le contenu Markdown et MathJax
 * Convertit **texte** en <strong>texte</strong> et *texte* en <em>texte</em>
 */
const processMarkdown = (text: string): string => {
    if (!text) return text;
    
    let processed = text;
    
    // Convertir Markdown en HTML
    // **texte** → <strong>texte</strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // *texte* → <em>texte</em> (mais pas si déjà dans **)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    return processed;
};

/**
 * MathContent - Composant robuste pour afficher du contenu avec formules MathJax et formatage Markdown
 * Gère automatiquement le rendu des formules mathématiques et du formatage Markdown
 */
const MathContent: React.FC<MathContentProps> = ({ content, className = '', inline = true }) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const latestContent = useRef<string>('');

    useEffect(() => {
        let cancelled = false;
        let timeoutId: number | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 50; // Augmenté pour attendre plus longtemps

        const el = containerRef.current;
        if (!el) return;

        // Traiter le Markdown avant d'injecter dans le DOM
        const processedContent = processMarkdown(content);

        if (latestContent.current !== processedContent) {
            el.innerHTML = processedContent || '';
            latestContent.current = processedContent;
        }

        const typeset = async () => {
            if (!containerRef.current || cancelled) {
                return;
            }

            // Vérifier si MathJax est disponible
            if (!window.MathJax) {
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    timeoutId = window.setTimeout(typeset, 100);
                } else {
                    console.warn('MathJax non disponible après', MAX_RETRIES, 'tentatives');
                }
                return;
            }

            try {
                // Attendre que MathJax soit complètement initialisé
                if (window.MathJax.startup?.promise) {
                    await window.MathJax.startup.promise;
                }

                if (!containerRef.current || cancelled) {
                    return;
                }

                // Nettoyer les rendus précédents si disponible
                if (window.MathJax.typesetClear) {
                    window.MathJax.typesetClear([containerRef.current]);
                }

                // Rendre les nouvelles formules
                if (window.MathJax.typesetPromise) {
                    await window.MathJax.typesetPromise([containerRef.current]);
                }
            } catch (error) {
                console.error('MathJax rendering error:', error);
                // Réessayer une fois en cas d'erreur
                if (retryCount < 2) {
                    retryCount++;
                    timeoutId = window.setTimeout(typeset, 200);
                }
            }
        };

        // Démarrer le rendu avec un petit délai pour laisser MathJax se charger
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
