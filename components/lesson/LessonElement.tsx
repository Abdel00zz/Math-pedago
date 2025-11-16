/**
 * Composant pour render les éléments de leçon (paragraphes, boxes, tables)
 * Style Pedago, indépendant de l'app Lesson
 */

import React, { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type {
    LessonElement as ElementType,
    LessonElementPath,
    LessonTextElement,
    LessonTableElement,
    LessonInfoBoxElement,
    LessonInteractiveBoxElement,
} from '../../types';
import { parseContent, parseTable, ContentWithImage, LessonProvider } from '../../utils/lessonContentParser';
import { encodeLessonPath } from '../../services/lessonProgressService';
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
            accent: '#DB3A34',
            accentSoft: 'rgba(219, 58, 52, 0.12)',
            accentStrong: 'rgba(219, 58, 52, 0.26)',
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
    const pathKey = useMemo(() => encodeLessonPath(path), [path]);

    // Protection: Vérifier que content est bien une chaîne
    const content = textElement.content;
    if (typeof content !== 'string') {
        console.error('Paragraph element avec content non-string:', { path, content });
        return (
            <div className="lesson-paragraph p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-900 dark:text-red-100 font-semibold">
                    ⚠️ Erreur de structure: Un paragraphe (type: "p") doit avoir un "content" de type chaîne
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-2 font-mono">
                    Chemin: {path.join(' → ')}
                </p>
            </div>
        );
    }

    const trimmedContent = content.trim();
    const isCallout = trimmedContent.startsWith('!>') || trimmedContent.startsWith('?>');

    const contentNode = parseContent(content, false, showAnswers, `${pathKey}.paragraph`);

    const paragraphClasses = [
        'lesson-paragraph',
        isCompleted ? 'lesson-paragraph--completed' : '',
        isCallout ? 'lesson-paragraph--callout' : '',
    ].filter(Boolean).join(' ');

    const paragraphNode = (
        <div className={paragraphClasses} data-lesson-node-id={nodeId}>
            <div className="lesson-paragraph__content">
                {contentNode}
            </div>
        </div>
    );

    return (
        <ContentWithImage image={textElement.image}>
            {paragraphNode}
        </ContentWithImage>
    );
};

const Table: React.FC<{ element: ElementType }> = ({ element }) => {
    const tableElement = element as LessonTableElement;
    
    return (
        <ContentWithImage image={tableElement.image}>
            {parseTable(tableElement.content)}
        </ContentWithImage>
    );
};

const InfoBox: React.FC<{ element: ElementType; showAnswers?: boolean; pathKey: string }> = ({ element, showAnswers, pathKey }) => {
    const infoElement = element as LessonInfoBoxElement;
    const config = BOX_CONFIG[infoElement.type as keyof typeof BOX_CONFIG];
    const { getNumberFor } = useNumbering();
    
    // Obtenir le numéro pour cette box AVANT le check de config
    const boxNumber = useMemo(
        () => getNumberFor(infoElement.type as keyof typeof BOX_CONFIG, pathKey),
        [infoElement.type, pathKey, getNumberFor]
    );
    
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

    const hasStructuredContent = Array.isArray(infoElement.content)
        ? infoElement.content.some(item => (item || '').toString().trim().length > 0)
        : typeof infoElement.content === 'string'
            ? infoElement.content.trim().length > 0
            : false;

    if (isInlineVariant) {
        const inlineStyle = {
            '--lesson-inline-accent': config.accent,
            '--lesson-inline-accent-soft': config.accentSoft,
        } as CSSProperties;

        const inlineBody = (
            <div className="lesson-inline__content">
                {hasStructuredContent && (
                    <div className="lesson-inline__body">
                        {parseContent(infoElement.content, isNumbered, effectiveShowAnswers, `${pathKey}.content`)}
                    </div>
                )}
            </div>
        );

        const inlineBadgeLabel = infoElement.type === 'example-box'
            ? `${config.label} ${boxNumber}`
            : config.label;

        return (
            <LessonProvider showAnswers={effectiveShowAnswers}>
                <div className={`lesson-inline lesson-inline--${infoElement.type === 'example-box' ? 'example' : 'remark'}`} style={inlineStyle}>
                    <header className="lesson-inline__header">
                        <span className="lesson-inline__badge">{inlineBadgeLabel}</span>
                        {infoElement.preamble && (
                            <>
                                <span className="lesson-inline__divider">|</span>
                                <span className="lesson-inline__title">
                                    {parseContent(infoElement.preamble.replace(/\s*:+\s*$/, ''), false, effectiveShowAnswers, `${pathKey}.preamble`)}
                                </span>
                            </>
                        )}
                    </header>
                    <ContentWithImage image={infoElement.image}>
                        {inlineBody}
                    </ContentWithImage>
                </div>
            </LessonProvider>
        );
    }

    const shouldRenderBody = hasStructuredContent || !!infoElement.image;

    return (
        <LessonProvider showAnswers={effectiveShowAnswers}>
            <div className="lesson-box" style={boxStyle}>
                <header className="lesson-box__header">
                    <span className="lesson-box__badge">{config.label} {boxNumber}</span>
                    {infoElement.preamble && (
                        <>
                            <span className="lesson-box__divider">|</span>
                            <span className="lesson-box__title">
                                {parseContent(infoElement.preamble.replace(/\s*:+\s*$/, ''), false, effectiveShowAnswers, `${pathKey}.preamble`)}
                            </span>
                        </>
                    )}
                </header>

                {shouldRenderBody && (
                    <div className="lesson-box__body">
                        <ContentWithImage image={infoElement.image}>
                            {hasStructuredContent ? parseContent(infoElement.content, isNumbered, effectiveShowAnswers, `${pathKey}.content`) : null}
                        </ContentWithImage>
                    </div>
                )}
            </div>
        </LessonProvider>
    );
};

const InteractiveBox: React.FC<{ element: ElementType; showAnswers?: boolean; pathKey: string }> = ({ element, showAnswers, pathKey }) => {
    const interactiveElement = element as LessonInteractiveBoxElement;
    const config = INTERACTIVE_CONFIG[interactiveElement.type as keyof typeof INTERACTIVE_CONFIG];
    const { getNumberFor } = useNumbering();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Obtenir le numéro pour cette box AVANT le check de config
    const boxNumber = useMemo(
        () => getNumberFor(interactiveElement.type as keyof typeof INTERACTIVE_CONFIG, pathKey),
        [interactiveElement.type, pathKey, getNumberFor]
    );
    
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
                            <span className="material-symbols-outlined text-base text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.35)]">
                                lightbulb
                            </span>
                        </span>
                    </button>
                )}
            </header>

            <LessonProvider showAnswers={effectiveShowAnswers}>
                <div className="lesson-box__body lesson-box__body--activity">
                    <ContentWithImage image={interactiveElement.image}>
                        <div className="space-y-4">
                            {interactiveElement.statement && (
                                <div className="lesson-box__statement">
                                    {parseContent(interactiveElement.statement, false, effectiveShowAnswers, `${pathKey}.statement`)}
                                </div>
                            )}
                            {interactiveElement.type === 'practice-box' && interactiveElement.content && (
                                <div className="lesson-box__exercises">
                                    {parseContent(interactiveElement.content, true, effectiveShowAnswers, `${pathKey}.content`)}
                                </div>
                            )}
                        </div>
                    </ContentWithImage>
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
                                            {parseContent(normalizedStep, false, true, `${pathKey}.solution.${index}`)}
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
    const pathKey = useMemo(() => encodeLessonPath(path), [path]);

    switch (element.type) {
        case 'p':
            return <Paragraph element={element} path={path} showAnswers={showAnswers} />;
        
        case 'table':
            return <Table element={element} />;
        
        case 'practice-box':
        case 'explain-box':
            return <InteractiveBox element={element} showAnswers={showAnswers} pathKey={pathKey} />;
        
        case 'definition-box':
        case 'theorem-box':
        case 'proposition-box':
        case 'property-box':
        case 'remark-box':
        case 'example-box':
            return <InfoBox element={element} showAnswers={showAnswers} pathKey={pathKey} />;
        
        default:
            return null;
    }
};

