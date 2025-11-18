/**
 * Parser de contenu pour les leçons dans Pedago
 * Réutilise MathContent existant de Pedago
 * Version améliorée avec support complet des listes, tableaux et formatage
 */

import React, { useEffect, useMemo, useRef, useId } from 'react';
import type { CSSProperties } from 'react';
import MathContent from '../components/MathContent';
import type { LessonImageConfig } from '../types';

// ============================================================================
// CONTEXTE POUR SHOWANS WERS
// ============================================================================

interface BlankRevealPersistence {
    isBlankRevealed: (blankId: string) => boolean;
    setBlankReveal: (blankId: string, revealed: boolean) => void;
}

interface LessonContextType {
    showAnswers: boolean;
    lessonId?: string;
    blankPersistence?: BlankRevealPersistence;
}

const LessonContext = React.createContext<LessonContextType>({
    showAnswers: false,
});

export const useLessonContext = () => React.useContext(LessonContext);

interface LessonProviderProps {
    children: React.ReactNode;
    showAnswers?: boolean;
    lessonId?: string;
    blankPersistence?: BlankRevealPersistence;
}

export const LessonProvider: React.FC<LessonProviderProps> = ({ children, showAnswers, lessonId, blankPersistence }) => {
    const parentContext = useLessonContext();

    const value = useMemo<LessonContextType>(() => ({
        showAnswers: showAnswers ?? parentContext.showAnswers,
        lessonId: lessonId ?? parentContext.lessonId,
        blankPersistence: blankPersistence ?? parentContext.blankPersistence,
    }), [showAnswers, lessonId, blankPersistence, parentContext]);

    return (
        <LessonContext.Provider value={value}>
            {children}
        </LessonContext.Provider>
    );
};

// ============================================================================
// WRAPPER POUR MATHCONTENT QUI SUPPORTE LES REACTNODE
// ============================================================================

const MathContentWrapper: React.FC<{ children: React.ReactNode; inline?: boolean; hostKey?: string }> = ({ children, inline = false, hostKey }) => {
    const containerRef = useRef<HTMLElement | null>(null);
    const blankHandlersRef = useRef(new Map<HTMLElement, { click: EventListener; keydown: EventListener }>());
    const { showAnswers, blankPersistence, lessonId } = useLessonContext();
    const generatedHostId = useId();
    const hostIdentifier = useMemo(() => {
        if (hostKey) return hostKey;
        if (lessonId) return `${lessonId}::${generatedHostId}`;
        return generatedHostId;
    }, [hostKey, lessonId, generatedHostId]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const detachHandlers = () => {
            blankHandlersRef.current.forEach((handlers, element) => {
                element.removeEventListener('click', handlers.click);
                element.removeEventListener('keydown', handlers.keydown);
            });
            blankHandlersRef.current.clear();
        };

        const ensureBlankStructure = (blank: HTMLElement) => {
            if (!blank.dataset.blankInitialized) {
                const contentWrapper = document.createElement('span');
                contentWrapper.className = 'blank-math-answer__content';
                while (blank.firstChild) {
                    contentWrapper.appendChild(blank.firstChild);
                }
                blank.appendChild(contentWrapper);

                const placeholder = document.createElement('span');
                placeholder.className = 'blank-math-answer__placeholder';
                placeholder.setAttribute('aria-hidden', 'true');
                blank.appendChild(placeholder);

                blank.dataset.blankInitialized = 'true';
            }

            const contentWrapper = blank.querySelector<HTMLElement>('.blank-math-answer__content');
            const placeholder = blank.querySelector<HTMLElement>('.blank-math-answer__placeholder');
            return { contentWrapper, placeholder };
        };

        const applyInteractivity = () => {
            const host = containerRef.current;
            if (!host) return;

            const blanks = Array.from(host.querySelectorAll('.blank-math-answer')) as HTMLElement[];

            // Nettoyer les anciens handlers avant de recréer les interactions
            detachHandlers();

            blanks.forEach((blank, index) => {
                const { contentWrapper, placeholder } = ensureBlankStructure(blank);
                if (!contentWrapper || !placeholder) {
                    return;
                }

                const rawAnswer = contentWrapper.textContent?.trim() ?? '';
                const semanticLength = Math.max(4, Math.min(rawAnswer.replace(/\s+/g, '').length || 4, 18));
                blank.style.setProperty('--blank-answer-length', semanticLength.toString());

                const blankId = hostIdentifier ? `${hostIdentifier}::${index}` : undefined;
                if (blankId) {
                    blank.dataset.blankId = blankId;
                } else {
                    delete blank.dataset.blankId;
                }

                const persistedReveal = blankId && blankPersistence
                    ? blankPersistence.isBlankRevealed(blankId)
                    : false;
                const baseReveal = blank.dataset.revealed === 'true' || persistedReveal;
                const shouldReveal = showAnswers || baseReveal;

                blank.dataset.revealed = shouldReveal ? 'true' : 'false';
                blank.classList.toggle('blank-math-answer--revealed', shouldReveal);
                blank.setAttribute('data-blank-index', index.toString());

                if (showAnswers) {
                    blank.removeAttribute('role');
                    blank.removeAttribute('tabindex');
                    blank.removeAttribute('aria-label');
                    blank.removeAttribute('aria-pressed');
                    return;
                }

                blank.setAttribute('role', 'button');
                blank.setAttribute('tabindex', '0');
                blank.setAttribute('aria-pressed', shouldReveal ? 'true' : 'false');
                blank.setAttribute('aria-label', shouldReveal ? 'Masquer la réponse' : 'Révéler la réponse');

                const toggleReveal = () => {
                    const currentlyRevealed = blank.dataset.revealed === 'true';
                    const nextState = !currentlyRevealed;
                    blank.dataset.revealed = nextState ? 'true' : 'false';
                    blank.classList.toggle('blank-math-answer--revealed', nextState);
                    blank.setAttribute('aria-pressed', nextState ? 'true' : 'false');
                    blank.setAttribute('aria-label', nextState ? 'Masquer la réponse' : 'Révéler la réponse');

                    if (!showAnswers && blankId && blankPersistence) {
                        blankPersistence.setBlankReveal(blankId, nextState);
                    }
                };

                const handleKeydown = (event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleReveal();
                    }
                };

                blank.addEventListener('click', toggleReveal);
                blank.addEventListener('keydown', handleKeydown);
                blankHandlersRef.current.set(blank, { click: toggleReveal, keydown: handleKeydown });
            });
        };

        const typeset = async () => {
            if (!window.MathJax || !containerRef.current) {
                applyInteractivity();
                return;
            }

            try {
                if (window.MathJax.startup?.promise) {
                    await window.MathJax.startup.promise;
                }

                const currentContainer = containerRef.current;
                if (!currentContainer) return;

                if (window.MathJax.typesetClear) {
                    try {
                        window.MathJax.typesetClear([currentContainer]);
                    } catch (e) {
                        // Silently ignore if the node vanished
                    }
                }

                if (window.MathJax.typesetPromise) {
                    await window.MathJax.typesetPromise([currentContainer]);
                }
            } catch (error) {
                console.error('MathJax rendering error:', error);
            } finally {
                applyInteractivity();
            }
        };

        const typesetTimeout = window.setTimeout(typeset, 50);
        const fallbackTimeout = window.setTimeout(applyInteractivity, 120);

        return () => {
            window.clearTimeout(typesetTimeout);
            window.clearTimeout(fallbackTimeout);
            detachHandlers();
        };
    }, [children, showAnswers, blankPersistence, hostIdentifier]);

    const Tag = inline ? 'span' : 'div';

    return (
        <Tag
            ref={(node) => {
                containerRef.current = node as HTMLElement | null;
            }}
            className="math-content-wrapper"
            data-blank-host-id={hostIdentifier}
        >
            {children}
        </Tag>
    );
};

// ============================================================================
// COMPOSANT BLANK (Texte à trous avec révélation individuelle)
// ============================================================================

const Blank: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showAnswers } = useLessonContext();
    const content = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : String(child)))
        .join('');

    return (
        <span
            className="blank-math-answer"
            data-revealed={showAnswers ? 'true' : 'false'}
        >
            {content}
        </span>
    );
};

// ============================================================================
// PARSING DE LIGNE AVEC SUPPORT ___solution___
// ============================================================================

/**
 * Pré-traite les blanks (___content___) dans les formules mathématiques
 * Les convertit en commandes LaTeX \class pour éviter de briser la syntaxe MathJax
 */
const preprocessMathBlanks = (text: string): string => {
    if (!text || !text.includes('___')) return text;

    let result = text;

    // Trouver toutes les formules mathématiques ($$...$$ et $...$)
    // On traite d'abord $$ pour éviter les conflits avec $
    const mathPatterns = [
        { regex: /\$\$([\s\S]+?)\$\$/g, delimiter: '$$' },
        { regex: /\$([^\$]+?)\$/g, delimiter: '$' }
    ];

    mathPatterns.forEach(({ regex, delimiter }) => {
        result = result.replace(regex, (fullMatch, mathContent) => {
            // Vérifier si cette formule contient des blanks
            if (!mathContent.includes('___')) {
                return fullMatch;
            }

            // Remplacer les ___content___ par \class{blank-math-answer}{content}
            const processedMath = mathContent.replace(/___(.+?)___/g, (match: string, content: string) => {
                // Utiliser \class de MathJax pour appliquer un style CSS personnalisé
                // Le contenu reste dans la formule mathématique, donc MathJax le compile correctement
                return `\\class{blank-math-answer}{${content}}`;
            });

            return delimiter + processedMath + delimiter;
        });
    });

    return result;
};

const parseLine = (line: string): React.ReactNode => {
    if (!line || !line.trim()) return null;

    // Pré-traiter pour convertir les blanks dans les formules mathématiques
    const preprocessedLine = preprocessMathBlanks(line);

    const regex = /___(.+?)___|(\*\*(.+?)\*\*)/g;
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(preprocessedLine)) !== null) {
        const fullMatch = match[0];
        const blankContent = match[1];
        const boldContent = match[3];
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
            result.push(preprocessedLine.substring(lastIndex, matchIndex));
        }

        if (boldContent !== undefined) {
            result.push(<strong key={matchIndex}>{parseLine(boldContent)}</strong>);
        } else if (blankContent !== undefined) {
            result.push(<Blank key={matchIndex}>{blankContent}</Blank>);
        }

        lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < preprocessedLine.length) {
        result.push(preprocessedLine.substring(lastIndex));
    }

    return result.length === 0 ? preprocessedLine : result.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
};

// ============================================================================
// COMPOSANT IMAGE
// ============================================================================

const resolveImageSrc = (rawSrc: string): string => {
    if (!rawSrc) return '';
    const trimmed = rawSrc.trim();
    if (!trimmed) return '';
    if (/^(https?:)?\/\//i.test(trimmed)) return trimmed; // absolute HTTP(S)
    const cleaned = trimmed
        .replace(/^public\//i, '')
        .replace(/^\.\//, '')
        .replace(/^\/+/, '');
    return `/${cleaned}`;
};

const LessonImage: React.FC<{ config: LessonImageConfig }> = ({ config }) => {
    const alignClass = config.align === 'center'
        ? 'mx-auto'
        : config.align === 'right'
            ? 'ml-auto'
            : config.align === 'left'
                ? 'mr-auto'
                : 'mx-auto';

    const resolvedSrc = resolveImageSrc(config.src);
    const targetWidth = config.width || '100%';
    const figureStyle: CSSProperties = {
        width: targetWidth,
        maxWidth: '100%',
    };

    return (
        <figure
            className={`lesson-figure my-4 ${alignClass}`}
            style={figureStyle}
            data-image-align={config.align || 'center'}
            data-image-position={config.position || 'stack'}
        >
            <div className="lesson-figure__media relative">
                <img
                    src={resolvedSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E'}
                    alt={config.alt || ''}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        console.error('Image failed to load:', config.src);
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                    }}
                />
            </div>
            {config.caption && (
                <figcaption className="lesson-figure__caption mt-2 text-sm text-center text-gray-600 italic">
                    {config.caption}
                </figcaption>
            )}
        </figure>
    );
};

// ============================================================================
// WRAPPER AVEC IMAGE (4 POSITIONS)
// ============================================================================

interface ContentWithImageProps {
    image?: LessonImageConfig;
    children: React.ReactNode;
}

const ContentWithImage: React.FC<ContentWithImageProps> = ({ image, children }) => {
    if (!image) return <>{children}</>;

    const position = image.position || 'bottom';

        const sideWrapperStyle: CSSProperties | undefined = (image.position === 'left' || image.position === 'right')
            ? {
                flexBasis: image.width || '420px',
                maxWidth: image.width || '420px',
                width: '100%'
            }
            : undefined;

    const sideImageConfig = (image.position === 'left' || image.position === 'right')
        ? { ...image, width: '100%' as const }
        : image;

    if (position === 'center') {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <LessonImage config={sideImageConfig} />
                <div className="w-full text-left">{children}</div>
            </div>
        );
    }

    if (position === 'top' || position === 'bottom') {
        return (
            <div className="flex flex-col gap-4">
                {position === 'top' && <LessonImage config={sideImageConfig} />}
                <div>{children}</div>
                {position === 'bottom' && <LessonImage config={sideImageConfig} />}
            </div>
        );
    }

    if (position === 'left' || position === 'right') {
            const imageBlock = (
                <div className="w-full sm:w-auto sm:flex-shrink-0" style={sideWrapperStyle}>
                    <LessonImage config={sideImageConfig} />
                </div>
            );
            const contentBlock = <div className="flex-1 w-full">{children}</div>;

            return (
                <div className={`flex flex-col sm:flex-row gap-6 items-start`}>
                    {position === 'left' ? (
                        <>
                            {imageBlock}
                            {contentBlock}
                        </>
                    ) : (
                        <>
                            {contentBlock}
                            {imageBlock}
                        </>
                    )}
                </div>
            );
    }

    return (
        <div className="flex flex-col gap-4">
            <LessonImage config={sideImageConfig} />
            <div>{children}</div>
        </div>
    );
};

// ============================================================================
// COMPOSANTS DE LISTES AMÉLIORÉS AVEC SUPPORT NOBULLET
// ============================================================================

const NumberBullet: React.FC<{ number: number }> = ({ number }) => (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-100 font-semibold text-xs text-gray-700 shadow-sm">
        {number}
    </span>
);

const StarBullet: React.FC = () => (
    <span className="flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="drop-shadow-sm">
            <path 
                d="M8 1.5L9.5 6H14L10.5 9L12 13.5L8 10.5L4 13.5L5.5 9L2 6H6.5L8 1.5Z" 
                fill="url(#starGradient)"
            />
            <defs>
                <linearGradient id="starGradient" x1="2" y1="1.5" x2="14" y2="13.5" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
        </svg>
    </span>
);

// ============================================================================
// PARSING DE CONTENU
// ============================================================================

const normalizeLineBreaks = (text: string): string => {
    if (!text) return '';
    // Le JSON a déjà converti \\n en \n (newline)
    // On n'a rien à faire, les newlines sont déjà là
    return text;
};

const buildHostKey = (baseKey: string | undefined, ...segments: (string | number)[]): string | undefined => {
    if (!baseKey) return undefined;
    if (segments.length === 0) return baseKey;
    return `${baseKey}.${segments.map((segment) => String(segment)).join('.')}`;
};

/**
 * Parse du contenu avec support des listes, tableaux inline, formules, et NoBullet
 */
export const parseContent = (
    content: string | string[] | undefined,
    isNumberedList: boolean = false,
    showAnswers: boolean = false,
    contextKey?: string
): React.ReactNode => {
    if (!content) return null;

    // Si c'est un tableau, formatter en liste stylée
    if (Array.isArray(content)) {
        if (content.length === 0) return null;
        const normalizedContent = content.map(item => normalizeLineBreaks(item));
        const validContent = normalizedContent.filter(item => item && item.trim());
        if (validContent.length === 0) return null;

        // Liste numérotée
        if (isNumberedList) {
            return (
                <ol className="my-4 space-y-3">
                    {validContent.map((item, i) => {
                        // Détecter le préfixe >> pour NoBullet
                        const isNoBullet = item.trim().startsWith('>>');
                        const cleanItem = isNoBullet ? item.trim().substring(2).trim() : item;
                        const paragraphs = cleanItem.split('\n\n').filter(p => p.trim());
                        
                        if (isNoBullet) {
                            // Ligne sans puce
                            return (
                                <li key={i} className="flex gap-3 text-gray-700 leading-relaxed list-none ml-0">
                                    <div className="flex-1 space-y-2">
                                        {paragraphs.map((para, idx) => (
                                            <div key={idx}>
                                                <MathContentWrapper
                                                    inline={false}
                                                    hostKey={buildHostKey(contextKey, 'list', i, 'paragraph', idx)}
                                                >
                                                    {parseLine(para.trim())}
                                                </MathContentWrapper>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            );
                        }
                        
                        return (
                            <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                                <div className="flex-shrink-0 pt-0.5">
                                    <NumberBullet number={i + 1} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    {paragraphs.map((para, idx) => (
                                        <div key={idx}>
                                            <MathContentWrapper
                                                inline={false}
                                                hostKey={buildHostKey(contextKey, 'list', i, 'paragraph', idx)}
                                            >
                                                {parseLine(para.trim())}
                                            </MathContentWrapper>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            );
        }

        // Liste à puces
        return (
            <ul className="my-4 space-y-2.5">
                {validContent.map((item, i) => {
                    // Détecter le préfixe >> pour NoBullet
                    const isNoBullet = item.trim().startsWith('>>');
                    const cleanItem = isNoBullet ? item.trim().substring(2).trim() : item;
                    const paragraphs = cleanItem.split('\n\n').filter(p => p.trim());
                    
                    if (isNoBullet) {
                        // Ligne sans puce
                        return (
                            <li key={i} className="flex gap-3 text-gray-700 leading-relaxed list-none ml-0">
                                <div className="flex-1 space-y-2">
                                    {paragraphs.map((para, idx) => (
                                        <div key={idx}>
                                            <MathContentWrapper
                                                inline={false}
                                                hostKey={buildHostKey(contextKey, 'list', i, 'paragraph', idx)}
                                            >
                                                {parseLine(para.trim())}
                                            </MathContentWrapper>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        );
                    }
                    
                    return (
                        <li key={i} className="flex gap-3 text-gray-700 leading-relaxed">
                            <div className="flex-shrink-0 pt-0.5">
                                <StarBullet />
                            </div>
                            <div className="flex-1 space-y-2">
                                {paragraphs.map((para, idx) => (
                                    <div key={idx}>
                                        <MathContentWrapper
                                            inline={false}
                                            hostKey={buildHostKey(contextKey, 'list', i, 'paragraph', idx)}
                                        >
                                            {parseLine(para.trim())}
                                        </MathContentWrapper>
                                    </div>
                                ))}
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    // Texte simple avec MathContent
    const text = normalizeLineBreaks(content);
    if (!text.trim()) return null;

    // ========================================================================
    // DÉTECTER LES SYNTAXES SPÉCIALES !> (Attention) et ?> (Astuce)
    // ========================================================================
    const trimmedText = text.trim();

    const renderCallout = (variant: 'warning' | 'tip', body: string, key?: React.Key) => {
        const paragraphs = body.split('\n\n').filter(p => p.trim());
        const icon = variant === 'warning' ? 'error' : 'lightbulb';

        return (
            <div className={`lesson-callout lesson-callout--${variant}`} key={key}>
                <div className="lesson-callout__icon" aria-hidden="true">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="lesson-callout__body">
                    {paragraphs.map((para, idx) => (
                        <MathContent key={idx} content={para} />
                    ))}
                </div>
            </div>
        );
    };

    if (trimmedText.startsWith('!> ')) {
        const contentText = trimmedText.substring(3);
        return renderCallout('warning', contentText);
    }

    if (trimmedText.startsWith('?> ')) {
        const contentText = trimmedText.substring(3);
        return renderCallout('tip', contentText);
    }
    // ========================================================================

    // Détecter si le texte contient un tableau Markdown
    const hasTable = /\|.*\|.*\|/.test(text);
    
    if (hasTable) {
        // Séparer le contenu en sections (texte avant, tableau, texte après)
        const parts: React.ReactNode[] = [];
        const lines = text.split('\n');
        let currentSection: string[] = [];
        let inTable = false;
        let tableLines: string[] = [];
        let sectionIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Début de tableau (ligne avec |)
            if (!inTable && line.trim().startsWith('|')) {
                // Sauvegarder le texte avant le tableau
                if (currentSection.length > 0) {
                    const sectionText = currentSection.join('\n').trim();
                    if (sectionText) {
                        const paragraphs = sectionText.split('\n\n').filter(p => p.trim());
                        paragraphs.forEach((para, idx) => {
                            parts.push(
                                <div key={`text-${sectionIndex}-${idx}`} className="mb-3">
                                    <MathContent content={para} />
                                </div>
                            );
                        });
                    }
                    currentSection = [];
                    sectionIndex++;
                }
                inTable = true;
                tableLines.push(line);
            }
            // Fin de tableau (ligne sans | après une ligne avec |)
            else if (inTable && !line.trim().startsWith('|')) {
                // Render le tableau
                parts.push(
                    <div key={`table-${sectionIndex}`}>
                        {parseTable(tableLines.join('\n'))}
                    </div>
                );
                tableLines = [];
                inTable = false;
                sectionIndex++;
                
                // Ajouter la ligne courante au nouveau texte
                if (line.trim()) {
                    currentSection.push(line);
                }
            }
            // Dans un tableau
            else if (inTable) {
                tableLines.push(line);
            }
            // Texte normal
            else {
                currentSection.push(line);
            }
        }

        // Traiter le dernier tableau s'il existe
        if (inTable && tableLines.length > 0) {
            parts.push(
                <div key={`table-${sectionIndex}`}>
                    {parseTable(tableLines.join('\n'))}
                </div>
            );
        }
        // Ou le dernier texte
        else if (currentSection.length > 0) {
            const sectionText = currentSection.join('\n').trim();
            if (sectionText) {
                const paragraphs = sectionText.split('\n\n').filter(p => p.trim());
                paragraphs.forEach((para, idx) => {
                    parts.push(
                        <div key={`text-${sectionIndex}-${idx}`} className="mb-3">
                            <MathContent content={para} />
                        </div>
                    );
                });
            }
        }

        return <>{parts}</>;
    }

    // Pas de tableau : traitement normal avec blocs d'alerte
    const nodes: React.ReactNode[] = [];
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach((para, i) => {
        // Bloc d'alerte (!>)
        const trimmedPara = para.trim();
        if (trimmedPara.startsWith('!>')) {
            const alertText = trimmedPara.replace(/^!>\s*/, '');
            nodes.push(renderCallout('warning', alertText, `alert-${i}`));
        } else if (trimmedPara.startsWith('?>')) {
            const tipText = trimmedPara.replace(/^\?>\s*/, '');
            nodes.push(renderCallout('tip', tipText, `tip-${i}`));
        } else {
            nodes.push(
                <div key={`para-${i}`} className="mb-3">
                    <MathContentWrapper
                        inline={false}
                        hostKey={buildHostKey(contextKey, 'paragraph', i)}
                    >
                        {parseLine(para)}
                    </MathContentWrapper>
                </div>
            );
        }
    });

    return <>{nodes}</>;
};

/**
 * Parse tableau Markdown avec style amélioré
 */
export const parseTable = (markdown: string): React.ReactNode => {
    if (!markdown || !markdown.trim()) return null;

    const normalizedMarkdown = normalizeLineBreaks(markdown);
    const lines = normalizedMarkdown.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        return <p className="text-sm text-red-600">Erreur: Tableau mal formé.</p>;
    }

    // Extraire les cellules (enlever les | au début et à la fin)
    const getCells = (line: string) => {
        return line.split('|')
            .slice(1, -1)  // Enlever premier et dernier élément (vides)
            .map(cell => cell.trim());
    };

    const headers = getCells(lines[0]);
    const rows = lines.slice(2).map(getCells); // Skip separator line

    return (
        <div className="my-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-center">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, i) => (
                            <th 
                                key={i} 
                                className="border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 text-center"
                            >
                                <MathContent content={header} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-sm text-gray-700 text-center">
                                    <MathContent content={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export { ContentWithImage, LessonImage };
