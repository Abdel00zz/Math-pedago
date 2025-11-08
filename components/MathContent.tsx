import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathContentProps {
    content: string;
    className?: string;
    inline?: boolean;
}

/**
 * Traite uniquement le Markdown de base (gras/italique)
 * SANS toucher aux délimiteurs LaTeX $ $ et $$ $$
 */
const processMarkdown = (text: string): string => {
    if (!text) return text;

    let processed = text;

    // Protéger temporairement les expressions LaTeX
    const mathExpressions: string[] = [];
    let mathIndex = 0;

    // Sauvegarder les expressions $...$ et $$...$$
    processed = processed.replace(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/g, (match) => {
        const placeholder = `__MATH_${mathIndex}__`;
        mathExpressions.push(match);
        mathIndex++;
        return placeholder;
    });

    // Maintenant convertir le Markdown sans toucher aux maths
    // **texte** → <strong>texte</strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // *texte* → <em>texte</em> (mais pas si déjà dans **)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Restaurer les expressions LaTeX
    mathExpressions.forEach((mathExpr, idx) => {
        processed = processed.replace(`__MATH_${idx}__`, mathExpr);
    });

    return processed;
};

/**
 * Remplace les expressions mathématiques par du HTML rendu par KaTeX
 */
const renderMathWithKaTeX = (text: string): string => {
    if (!text) return text;

    let result = text;

    // Traiter les math display ($$...$$)
    result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), {
                displayMode: true,
                throwOnError: false,
                strict: false,
            });
        } catch (e) {
            console.error('KaTeX display error:', e, 'Math:', math);
            return match;
        }
    });

    // Traiter les math inline ($...$)
    result = result.replace(/\$([^\$]+?)\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), {
                displayMode: false,
                throwOnError: false,
                strict: false,
            });
        } catch (e) {
            console.error('KaTeX inline error:', e, 'Math:', math);
            return match;
        }
    });

    return result;
};

/**
 * MathContent - Composant pour afficher du contenu avec formules mathématiques
 * Utilise KaTeX pour le rendu mathématique (plus rapide que MathJax)
 */
const MathContent: React.FC<MathContentProps> = ({ content, className = '', inline = true }) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const latestContent = useRef<string>('');

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Traiter le Markdown en protégeant les expressions LaTeX
        const processedMarkdown = processMarkdown(content);

        // Rendre les formules mathématiques avec KaTeX
        const renderedContent = renderMathWithKaTeX(processedMarkdown);

        if (latestContent.current !== renderedContent) {
            el.innerHTML = renderedContent || '';
            latestContent.current = renderedContent;
        }
    }, [content]);

    const Tag = inline ? 'span' : 'div';
    const combinedClassName = ['math-content', className].filter(Boolean).join(' ');

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
