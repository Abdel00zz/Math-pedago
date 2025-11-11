/**
 * Composant pour render les éléments de leçon (paragraphes, boxes, tables)
 * Style Pedago, indépendant de l'app Lesson
 */

import React, { useMemo, useState, useId } from 'react';
import type { CSSProperties } from 'react';
import type {
    LessonElement as ElementType,
    LessonElementPath,
    LessonTextElement,
    LessonTableElement,
    LessonInfoBoxElement,
    LessonInteractiveBoxElement,
} from '../../types';
import { parseContent, parseTable, ContentWithImage, LessonProvider, LessonImage } from '../../utils/lessonContentParser';
import Modal from '../Modal';
import { useLessonProgress, getParagraphNodeIdFromPath } from '../../context/LessonProgressContext';
import { useNumbering } from '../../context/NumberingContext';

interface LessonElementProps {
    element: ElementType;
    path: LessonElementPath;
    showAnswers?: boolean;
}

// ============================================================================
// CONFIGURATION DES BOXES
// ============================================================================

const BOX_CONFIG = {
        'definition-box': {
            label: 'Définition',
            accent: '#0056D2',
            accentSoft: 'rgba(0, 86, 210, 0.08)',
            accentStrong: 'rgba(0, 86, 210, 0.18)',
        },
        'theorem-box': {
            label: 'Théorème',
            accent: '#1B873F',
            accentSoft: 'rgba(27, 135, 63, 0.08)',
            accentStrong: 'rgba(27, 135, 63, 0.18)',
        },
        'proposition-box': {
            label: 'Proposition',
            accent: '#0E8688',
            accentSoft: 'rgba(14, 134, 136, 0.08)',
            accentStrong: 'rgba(14, 134, 136, 0.18)',
        },
        'property-box': {
            label: 'Propriété',
            accent: '#5C3BFF',
            accentSoft: 'rgba(92, 59, 255, 0.10)',
            accentStrong: 'rgba(92, 59, 255, 0.22)',
        },
        'remark-box': {
            label: 'Remarque',
            accent: '#8B5CF6',
            accentSoft: 'rgba(139, 92, 246, 0.10)',
            accentStrong: 'rgba(139, 92, 246, 0.22)',
        },
        'example-box': {
            label: 'Exemple',
            accent: '#E96D2F',
            accentSoft: 'rgba(233, 109, 47, 0.10)',
            accentStrong: 'rgba(233, 109, 47, 0.22)',
        },
        'explain-box': {
            label: 'Analyse',
            accent: '#0891B2',
            accentSoft: 'rgba(8, 145, 178, 0.08)',
            accentStrong: 'rgba(8, 145, 178, 0.18)',
        },
        'practice-box': {
            label: 'Exercice',
            accent: '#2563EB',
            accentSoft: 'rgba(37, 99, 235, 0.08)',
            accentStrong: 'rgba(37, 99, 235, 0.18)',
        },
} as const;

const INTERACTIVE_CONFIG = {
    'practice-box': {
        label: 'Exercice',
        accent: '#DB3A34',
        accentSoft: 'rgba(219, 58, 52, 0.12)',
        accentStrong: 'rgba(219, 58, 52, 0.26)',
    },
    'explain-box': {
        label: 'Analyse',
        accent: '#0891B2',
        accentSoft: 'rgba(8, 145, 178, 0.12)',
        accentStrong: 'rgba(8, 145, 178, 0.26)',
    },
} as const;

// ============================================================================
// COMPOSANTS
// ============================================================================

const Paragraph: React.FC<{ element: ElementType; path: LessonElementPath; showAnswers?: boolean }> = ({ element, path, showAnswers }) => {
    const textElement = element as LessonTextElement;
    const { isNodeCompleted } = useLessonProgress();
    const nodeId = useMemo(() => getParagraphNodeIdFromPath(path), [path]);
    const isCompleted = isNodeCompleted(nodeId);
    const trimmedContent = (textElement.content ?? '').trim();
    const isCallout = trimmedContent.startsWith('!>') || trimmedContent.startsWith('?>');

    const contentNode = parseContent(textElement.content, false, showAnswers);

    const paragraphClasses = [
        'lesson-paragraph',
        isCompleted ? 'lesson-paragraph--completed' : '',
        isCallout ? 'lesson-paragraph--callout' : '',
    ].filter(Boolean).join(' ');

    return (
        <>
            {textElement.image && <LessonImage config={textElement.image} />}
            <div className={paragraphClasses} data-lesson-node-id={nodeId}>
                <div className="lesson-paragraph__content">
                    {contentNode}
                </div>
            </div>
        </>
    );
};

const Table: React.FC<{ element: ElementType }> = ({ element }) => {
    const tableElement = element as LessonTableElement;
    
    return (
        <>
            {tableElement.image && <LessonImage config={tableElement.image} />}
            {parseTable(tableElement.content)}
        </>
    );
};

const InfoBox: React.FC<{ element: ElementType; showAnswers?: boolean }> = ({ element, showAnswers }) => {
    const infoElement = element as LessonInfoBoxElement;
    const config = BOX_CONFIG[infoElement.type as keyof typeof BOX_CONFIG];
    const { getNextNumber } = useNumbering();
    
    // Obtenir le numéro pour cette box AVANT le check de config
    const boxNumber = useMemo(() => getNextNumber(infoElement.type as keyof typeof BOX_CONFIG), [infoElement.type, getNextNumber]);
    
    if (!config) return null;

    const wantsNumbering = infoElement.listType === 'number' || infoElement.listType === 'numbered';
    const isNumbered = Array.isArray(infoElement.content) && wantsNumbering;

    // Pour les exemples, showAnswers est toujours false (les solutions sont dans les ___blanks___)
    const effectiveShowAnswers = false;
    const boxStyle = {
        '--lesson-accent': config.accent,
        '--lesson-accent-soft': config.accentSoft,
        '--lesson-accent-strong': config.accentStrong,
    } as CSSProperties;

    const isInlineVariant = infoElement.type === 'example-box' || infoElement.type === 'remark-box';

    if (isInlineVariant) {
        const inlineStyle = {
            '--lesson-inline-accent': config.accent,
            '--lesson-inline-accent-soft': config.accentSoft,
        } as CSSProperties;

    return (
        <LessonProvider showAnswers={effectiveShowAnswers}>
            <div className={`lesson-inline lesson-inline--${infoElement.type === 'example-box' ? 'example' : 'remark'}`} style={inlineStyle}>
                <header className="lesson-inline__header">
                    <span className="lesson-inline__badge">{config.label}</span>
                    {infoElement.preamble && (
                        <>
                            <span className="lesson-inline__divider">|</span>
                            <span className="lesson-inline__title">
                                {parseContent(infoElement.preamble.replace(/\s*:+\s*$/, ''), false, effectiveShowAnswers)}
                            </span>
                        </>
                    )}
                </header>
                {infoElement.image && <LessonImage config={infoElement.image} />}
                <div className="lesson-inline__content">
                    {infoElement.content && (
                        <div className="lesson-inline__body">
                            {parseContent(infoElement.content, isNumbered, effectiveShowAnswers)}
                        </div>
                    )}
                </div>
            </div>
        </LessonProvider>
    );
    }

    return (
        <LessonProvider showAnswers={effectiveShowAnswers}>
            <div className="lesson-box" style={boxStyle}>
                <header className="lesson-box__header">
                    <span className="lesson-box__badge">{config.label} {boxNumber}</span>
                    {infoElement.preamble && (
                        <>
                            <span className="lesson-box__divider">|</span>
                            <span className="lesson-box__title">
                                {parseContent(infoElement.preamble.replace(/\s*:+\s*$/, ''), false, effectiveShowAnswers)}
                            </span>
                        </>
                    )}
                </header>
                {infoElement.image && <LessonImage config={infoElement.image} />}

                {infoElement.content && (
                    <div className="lesson-box__body">
                        {parseContent(infoElement.content, isNumbered, effectiveShowAnswers)}
                    </div>
                )}
            </div>
        </LessonProvider>
    );
};

const InteractiveBox: React.FC<{ element: ElementType; showAnswers?: boolean }> = ({ element, showAnswers }) => {
    const interactiveElement = element as LessonInteractiveBoxElement;
    const config = INTERACTIVE_CONFIG[interactiveElement.type as keyof typeof INTERACTIVE_CONFIG];
    const { getNextNumber } = useNumbering();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const bulbGradientId = useId();
    const bulbGlowId = `${bulbGradientId}-glow`;
    
    // Obtenir le numéro pour cette box AVANT le check de config
    const boxNumber = useMemo(() => getNextNumber(interactiveElement.type as keyof typeof INTERACTIVE_CONFIG), [interactiveElement.type, getNextNumber]);
    
    if (!config) return null;

    // Vérifier si c'est un exercice (practice-box)
    const isExercise = interactiveElement.type === 'practice-box';
    const hasSolution = interactiveElement.solution && (
        (typeof interactiveElement.solution === 'string' && interactiveElement.solution.trim() !== '') ||
        (Array.isArray(interactiveElement.solution) && interactiveElement.solution.length > 0)
    );
    
    // Les exercices n'affichent jamais les solutions directement dans le contenu
    const effectiveShowAnswers = false;

    const boxStyle = {
        '--lesson-accent': config.accent,
        '--lesson-accent-soft': config.accentSoft,
        '--lesson-accent-strong': config.accentStrong,
    } as CSSProperties;

    return (
        <div className="lesson-box lesson-box--activity" style={boxStyle}>
            <header className="lesson-box__header lesson-box__header--activity">
                <span className="lesson-box__badge">{config.label} {boxNumber}</span>
                {isExercise && hasSolution && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="lesson-box__action"
                        title="Voir la solution détaillée"
                        aria-label="Afficher la solution"
                    >
                        <span className="lesson-box__action-icon" aria-hidden="true">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                role="img"
                                focusable="false"
                            >
                                <defs>
                                    <radialGradient id={bulbGlowId} cx="50%" cy="40%" r="65%">
                                        <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.92" />
                                        <stop offset="55%" stopColor="#d9efff" stopOpacity="0.46" />
                                        <stop offset="100%" stopColor="#8ab4ff" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id={bulbGradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#fff7c2" />
                                        <stop offset="55%" stopColor="#fcd34d" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                                <circle cx="12" cy="10" r="7.6" fill={`url(#${bulbGlowId})`} opacity="0.65" />
                                <path
                                    d="M12 3.5c-3.03 0-5.5 2.43-5.5 5.43 0 2.1 1.15 3.97 2.98 4.94.34.18.52.54.52.9v1.58c0 .31.25.56.56.56h3.88c.31 0 .56-.25.56-.56v-1.58c0-.36.2-.7.52-.88 1.86-.96 3.02-2.86 3.02-4.97 0-3-2.47-5.42-5.5-5.42Zm-2.5 16.1c0 .22.18.4.4.4h4.2c.22 0 .4-.18.4-.4v-.4H9.5v.4Z"
                                    style={{ fill: `url(#${bulbGradientId})`, stroke: '#2563eb', strokeWidth: 0.6, paintOrder: 'fill' }}
                                />
                                <path
                                    d="M10 18.7h4"
                                    stroke="#1d4ed8"
                                    strokeWidth="1.1"
                                    strokeLinecap="round"
                                    opacity="0.65"
                                />
                                <circle cx="12" cy="6.4" r="1.55" fill="#ffffff" opacity="0.82" />
                            </svg>
                        </span>
                    </button>
                )}
            </header>

            <LessonProvider showAnswers={effectiveShowAnswers}>
                {interactiveElement.image && <LessonImage config={interactiveElement.image} />}
                <div className="lesson-box__body lesson-box__body--activity">
                    {interactiveElement.statement && (
                        <div className="lesson-box__statement">
                            {parseContent(interactiveElement.statement, false, effectiveShowAnswers)}
                        </div>
                    )}
                    {interactiveElement.type === 'practice-box' && interactiveElement.content && (
                        <div className="lesson-box__exercises">
                            {parseContent(interactiveElement.content, true, effectiveShowAnswers)}
                        </div>
                    )}
                </div>
            </LessonProvider>

            {hasSolution && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Solution - ${config.label}`}
                    hideHeaderBorder={true}
                    titleClassName="lesson-solution__title"
                    closePosition="right"
                    className="lesson-solution-modal"
                >
                    <LessonProvider showAnswers={true}>
                        <div className="lesson-solution">
                            {(Array.isArray(interactiveElement.solution) ? interactiveElement.solution : [interactiveElement.solution]).map((step, index) => {
                                let normalizedStep = typeof step === 'string' ? step : '';
                                normalizedStep = normalizedStep.replace(/\\n/g, '\n');
                                normalizedStep = normalizedStep.replace(/^- /gm, '\n');
                                normalizedStep = normalizedStep.replace(/\n- /g, '\n\n');

                                return (
                                    <div key={index} className="lesson-solution__step">
                                        <span className="lesson-solution__step-index">{index + 1}</span>
                                        <div className="lesson-solution__step-body">
                                            {parseContent(normalizedStep, false, true)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </LessonProvider>
                </Modal>
            )}
        </div>
    );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const LessonElement: React.FC<LessonElementProps> = ({ element, path, showAnswers = false }) => {
    switch (element.type) {
        case 'p':
            return <Paragraph element={element} path={path} showAnswers={showAnswers} />;
        
        case 'table':
            return <Table element={element} />;
        
        case 'practice-box':
        case 'explain-box':
            return <InteractiveBox element={element} showAnswers={showAnswers} />;
        
        case 'definition-box':
        case 'theorem-box':
        case 'proposition-box':
        case 'property-box':
        case 'remark-box':
        case 'example-box':
            return <InfoBox element={element} showAnswers={showAnswers} />;
        
        default:
            return null;
    }
};

