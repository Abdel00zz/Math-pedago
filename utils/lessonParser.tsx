/**
 * Content Parser pour les Leçons dans Pedago
 * Adapté depuis l'application principale avec MathContent de Pedago
 */

import React, { useEffect, useRef } from 'react';
import MathContent from '../components/MathContent';
import type { LessonImageConfig } from '../types';

// ============================================================================
// WRAPPER POUR MATHCONTENT QUI SUPPORTE LES REACTNODE
// ============================================================================

const MathContentWrapper: React.FC<{ children: React.ReactNode; inline?: boolean }> = ({ children, inline = false }) => {
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Attendre que MathJax soit disponible et traiter les formules
        const typeset = async () => {
            if (!window.MathJax || !containerRef.current) return;

            try {
                if (window.MathJax.startup?.promise) {
                    await window.MathJax.startup.promise;
                }

                if (window.MathJax.typesetClear) {
                    try {
                        if (containerRef.current?.querySelector('mjx-container')) {
                            window.MathJax.typesetClear([containerRef.current]);
                        }
                    } catch (error) {
                        if ((error as DOMException)?.name !== 'NotFoundError') {
                            console.error('MathJax typesetClear error:', error);
                        }
                    }
                }

                if (window.MathJax.typesetPromise) {
                    await window.MathJax.typesetPromise([containerRef.current]);
                }
            } catch (error) {
                console.error('MathJax rendering error:', error);
            }
        };

        const timeoutId = setTimeout(typeset, 50);
        return () => clearTimeout(timeoutId);
    }, [children]);

    const Tag = inline ? 'span' : 'div';
    
    return (
        <Tag
            ref={(node) => {
                containerRef.current = node as HTMLElement | null;
            }}
            className="math-content tex2jax_process"
        >
            {children}
        </Tag>
    );
};

// ============================================================================
// CONTEXTE
// ============================================================================

interface LessonContextType {
    showAnswers: boolean;
}

const LessonContext = React.createContext<LessonContextType>({
    showAnswers: false,
});

export const useLessonContext = () => React.useContext(LessonContext);

export const LessonProvider: React.FC<{ children: React.ReactNode; showAnswers: boolean }> = ({ children, showAnswers }) => (
    <LessonContext.Provider value={{ showAnswers }}>
        {children}
    </LessonContext.Provider>
);

// ============================================================================
// COMPOSANT IMAGE
// ============================================================================

const LessonImage: React.FC<{ config: LessonImageConfig }> = ({ config }) => {
    const { src, alt, width = '100%', caption, align = 'center' } = config;
    
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align];
    
    return (
        <figure className={`my-4 ${alignClass}`}>
            <img
                src={src}
                alt={alt || ''}
                style={{ width, maxWidth: '100%', height: 'auto' }}
                className="rounded-lg shadow-sm mx-auto"
                loading="lazy"
            />
            {caption && (
                <figcaption className="mt-2 text-sm text-slate-600 italic">
                    <MathContent content={caption} inline />
                </figcaption>
            )}
        </figure>
    );
};

// ============================================================================
// WRAPPER POUR CONTENU AVEC IMAGE
// ============================================================================

export const ContentWithImage: React.FC<{
    children: React.ReactNode;
    image?: LessonImageConfig;
    blockAnalysis?: boolean;
}> = ({ children, image, blockAnalysis = false }) => {
    if (!image || blockAnalysis) {
        return <>{children}</>;
    }
    
    const { position = 'bottom' } = image;
    
    // Position top/bottom: stack vertical
    if (position === 'top') {
        return (
            <>
                <LessonImage config={image} />
                {children}
            </>
        );
    }
    
    if (position === 'bottom') {
        return (
            <>
                {children}
                <LessonImage config={image} />
            </>
        );
    }
    
    // Position left/right: disposition horizontale
    if (position === 'left' || position === 'right') {
        return (
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {position === 'left' && (
                    <div className="w-full md:w-2/5 flex-shrink-0">
                        <LessonImage config={image} />
                    </div>
                )}
                <div className="flex-1">{children}</div>
                {position === 'right' && (
                    <div className="w-full md:w-2/5 flex-shrink-0">
                        <LessonImage config={image} />
                    </div>
                )}
            </div>
        );
    }
    
    return <>{children}</>;
};

// ============================================================================
// COMPOSANT BLANK (Texte à trous avec révélation individuelle)
// ============================================================================

const Blank: React.FC<{ content: string }> = ({ content }) => {
    const { showAnswers } = useLessonContext();
    const [isRevealed, setIsRevealed] = React.useState(false);

    const shouldShow = showAnswers || isRevealed;

    const handleClick = () => {
        if (!showAnswers) {
            setIsRevealed(prev => !prev);
        }
    };

    const containerClasses = shouldShow
        ? 'blank relative inline-flex min-w-[32px] select-none items-center justify-center rounded-md bg-indigo-50 px-2 pb-1 font-semibold text-indigo-700 transition-all duration-300 cursor-pointer hover:bg-indigo-100'
        : 'blank relative inline-flex min-w-[32px] select-none items-center justify-center px-2 pb-1 text-slate-600 transition-all duration-300 cursor-pointer hover:bg-blue-50 active:scale-95';

    const renderAnswer = (hidden: boolean = false) => (
        <span
            className={`relative z-10 inline-flex items-center whitespace-nowrap transition-opacity duration-300 ${hidden ? 'pointer-events-none select-none opacity-0' : 'opacity-100'}`}
            aria-hidden={hidden || undefined}
        >
            <MathContent content={content} inline className="blank__answer inline-flex items-center text-[0.95em]" />
        </span>
    );

    return (
        <span 
            className={containerClasses}
            onClick={handleClick}
            title={shouldShow ? (showAnswers ? 'Réponse affichée' : 'Cliquez pour masquer') : '👁️ Cliquez pour révéler la réponse'}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                }
            }}
        >
            {renderAnswer()}
            {!shouldShow && (
                <>
                    {/* Ligne pointillée */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 h-[3px]"
                        style={{
                            width: 'calc(100% - 6px)',
                            backgroundImage: 'repeating-linear-gradient(to right, #1e293b 0, #1e293b 3px, transparent 3px, transparent 7px)',
                        }}
                    />
                    {/* Icône œil pour indiquer qu'on peut cliquer */}
                    <span className="absolute -top-1 -right-1 text-[10px] opacity-60">
                        👁️
                    </span>
                </>
            )}
            {shouldShow && !showAnswers && (
                /* Indicateur que la réponse a été révélée manuellement */
                <span className="absolute -top-1 -right-1 text-[10px]">
                    ✓
                </span>
            )}
        </span>
    );
};

// ============================================================================
// PARSING DE LIGNE
// ============================================================================

const parseLine = (line: string): React.ReactNode => {
    if (!line || !line.trim()) return null;

    const regex = /___(.+?)___|(\*\*(.+?)\*\*)/g;
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(line)) !== null) {
        const fullMatch = match[0];
        const blankContent = match[1];
        const boldContent = match[3];
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
            result.push(line.substring(lastIndex, matchIndex));
        }

        if (boldContent !== undefined) {
            result.push(<strong key={matchIndex}>{parseLine(boldContent)}</strong>);
        } else if (blankContent !== undefined) {
            result.push(<Blank key={matchIndex} content={blankContent} />);
        }

        lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < line.length) {
        result.push(line.substring(lastIndex));
    }

    return result.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
};

// ============================================================================
// LISTES
// ============================================================================

const NumberBullet: React.FC<{ number: number }> = ({ number }) => (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 font-['Rubik'] text-[0.7rem] font-semibold text-slate-700 shadow-sm">
        {number}
    </span>
);

const StarBullet: React.FC = () => (
    <span className="mt-1 text-2xl leading-none text-amber-500" role="presentation">
        ★
    </span>
);

const formatNumberedList = (lines: string[]) => {
    const validLines = lines.filter(line => line && line.trim());
    
    if (validLines.length === 0) return null;
    
    return (
        <ol className="my-4 space-y-3.5">
            {validLines.map((line, i) => {
                const paragraphs = line.split('\n\n').filter(p => p.trim());
                
                return (
                    <li key={i} className="flex items-start gap-2.5 text-[0.95rem] leading-[1.68] text-slate-700">
                        <NumberBullet number={i + 1} />
                        <div className="flex-1 pt-[2px] space-y-2">
                            {paragraphs.map((para, j) => (
                                <div key={j} className="math-content">
                                    {parseLine(para)}
                                </div>
                            ))}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

const formatBulletedList = (lines: string[]) => {
    const validLines = lines.filter(line => line && line.trim());
    
    if (validLines.length === 0) return null;
    
    return (
        <ul className="my-4 space-y-3">
            {validLines.map((line, i) => {
                const paragraphs = line.split('\n\n').filter(p => p.trim());
                
                return (
                    <li key={i} className="flex items-start gap-3 text-[0.95rem] leading-[1.68] text-slate-700">
                        <StarBullet />
                        <div className="flex-1 space-y-2">
                            {paragraphs.map((para, j) => (
                                <div key={j} className="math-content">
                                    {parseLine(para)}
                                </div>
                            ))}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

// ============================================================================
// PARSE CONTENT PRINCIPAL
// ============================================================================

export const parseContent = (
    content: string | string[] | undefined,
    isNumberedList = false,
    inline = false
): React.ReactNode => {
    if (Array.isArray(content)) {
        if (content.length === 0) return null;
        const validContent = content.filter(item => item && item.trim());
        if (validContent.length === 0) return null;
        return isNumberedList ? formatNumberedList(validContent) : formatBulletedList(validContent);
    }

    if (!content) return null;

    const text = content || '';
    if (!text.trim()) return null;

    const parsed = parseLine(text);
    
    // Si le contenu parsé contient des composants React (Blank), utiliser le wrapper
    if (React.isValidElement(parsed) || (Array.isArray(parsed) && parsed.some(p => React.isValidElement(p)))) {
        return <MathContentWrapper inline={inline}>{parsed}</MathContentWrapper>;
    }
    
    // Sinon, utiliser MathContent normal pour les strings
    return <MathContent content={parsed as string} inline={inline} />;
};

// ============================================================================
// PARSE TABLE
// ============================================================================

export const parseTable = (content: string): React.ReactNode => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return null;

    const rows = lines.map(line =>
        line
            .split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
    );

    const [headers, separators, ...body] = rows;

    if (!headers || !separators) return null;

    return (
        <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full border-collapse bg-white">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                className="border-b-2 border-slate-300 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-slate-700"
                            >
                                <MathContentWrapper inline={true}>
                                    {parseLine(header)}
                                </MathContentWrapper>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {body.map((row, i) => (
                        <tr key={i} className="transition-colors hover:bg-slate-50/50">
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="border-b border-slate-200 px-4 py-3 text-[0.95rem] leading-relaxed text-slate-700 last:border-b-0"
                                >
                                    <MathContentWrapper inline={true}>
                                        {parseLine(cell)}
                                    </MathContentWrapper>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
