/**
 * Composant d'affichage des leçons pour Pedago
 * Style adapté à Pedago, complètement indépendant de l'app Lesson
 */

import React, { useEffect, useMemo } from 'react';
import type {
    LessonContent,
    LessonSection as SectionType,
    LessonSubsection as SubsectionType,
    LessonSubsubsection as SubsubsectionType,
    LessonElement as ElementType,
    LessonElementPath,
} from '../../types';
import { LessonElement } from './LessonElement';
import {
    useLessonProgress,
    getSectionAnchor,
    getSubsectionAnchor,
    getSubsubsectionAnchor,
} from '../../context/LessonProgressContext';
import { NumberingProvider } from '../../context/NumberingContext';
import StandardHeader from '../StandardHeader';
import { MathTitle } from './MathTitle';

interface LessonDisplayProps {
    lesson: LessonContent;
    showAnswers?: boolean;
    showHeader?: boolean;
    onBack?: () => void;
}

const toAlphabetic = (index: number, uppercase = true) => {
    let n = index + 1;
    let result = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        result = String.fromCharCode((uppercase ? 65 : 97) + rem) + result;
        n = Math.floor((n - 1) / 26);
    }
    return result;
};

const Header: React.FC<{ headerData: LessonContent['header']; onBack?: () => void }> = ({ headerData, onBack }) => (
    <StandardHeader
        variant="lesson"
        title={headerData.title}
        subtitle={headerData.chapter}
        onBack={onBack}
        backLabel="Retour au chapitre"
    />
);

const Subsubsection: React.FC<{ 
    subsubsection: SubsubsectionType; 
    index: number; 
    sectionIndex: number;
    subsectionIndex: number;
    pathPrefix: LessonElementPath;
    showAnswers?: boolean;
}> = ({ subsubsection, index, sectionIndex, subsectionIndex, pathPrefix, showAnswers }) => {
    const anchor = useMemo(
        () => getSubsubsectionAnchor(sectionIndex, subsectionIndex, subsubsection, index),
        [sectionIndex, subsectionIndex, subsubsection, index]
    );

    return (
        <div
            className="lesson-subitem"
            id={anchor}
            data-lesson-anchor="subsubsection"
            data-lesson-subsub-id={anchor}
        >
            <h4 className="lesson-subitem__title">
                <span className="lesson-subitem__marker">{`${toAlphabetic(index, false)}.`}</span>
                <span>{subsubsection.title}</span>
            </h4>
            <div className="lesson-subitem__body">
                {subsubsection.elements.map((element, i) => (
                    <LessonElement
                        key={i}
                        element={element}
                        path={[...pathPrefix, 'elements', i]}
                        showAnswers={showAnswers}
                    />
                ))}
            </div>
        </div>
    );
};

const Subsection: React.FC<{ 
    subsection: SubsectionType; 
    index: number; 
    sectionIndex: number;
    pathPrefix: LessonElementPath;
    showAnswers?: boolean;
}> = ({ subsection, index, sectionIndex, pathPrefix, showAnswers }) => {
    const anchor = useMemo(
        () => getSubsectionAnchor(sectionIndex, subsection, index),
        [sectionIndex, subsection, index]
    );

    return (
        <div
            className="lesson-subsection"
            id={anchor}
            data-lesson-anchor="subsection"
            data-lesson-subsection-id={anchor}
        >
            <div className="lesson-subsection__header">
                <span className="lesson-subsection__index">{index + 1}</span>
                <MathTitle className="lesson-subsection__title" tag="h3">
                    {subsection.title}
                </MathTitle>
            </div>
            <div className="lesson-subsection__body">
                {subsection.subsubsections?.map((subsubsection, i) => (
                    <Subsubsection 
                        key={i} 
                        subsubsection={subsubsection} 
                        index={i} 
                        sectionIndex={sectionIndex}
                        subsectionIndex={index}
                        pathPrefix={[...pathPrefix, 'subsubsections', i]}
                        showAnswers={showAnswers}
                    />
                ))}
                {subsection.elements && (
                    <div className="lesson-subsection__elements">
                        {subsection.elements.map((element, i) => (
                            <LessonElement
                                key={i}
                                element={element}
                                path={[...pathPrefix, 'elements', i]}
                                showAnswers={showAnswers}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Section: React.FC<{ 
    section: SectionType; 
    index: number; 
    pathPrefix: LessonElementPath;
    showAnswers?: boolean;
}> = ({ section, index, pathPrefix, showAnswers }) => {
    const anchor = useMemo(() => getSectionAnchor(section, index), [section, index]);

    return (
        <section
            className="lesson-section"
            id={anchor}
            data-lesson-anchor="section"
            data-lesson-section-id={anchor}
        >
            <div className="lesson-section__header">
                <span className="lesson-section__index">{toAlphabetic(index)}</span>
                <MathTitle className="lesson-section__title" tag="h2">
                    {section.title}
                </MathTitle>
            </div>
            {section.intro && (
                <div className="lesson-section__intro">
                    {section.intro}
                </div>
            )}
            <div className="lesson-section__body">
                {section.subsections.map((subsection, i) => (
                    <Subsection 
                        key={i} 
                        subsection={subsection} 
                        index={i} 
                        sectionIndex={index}
                        pathPrefix={[...pathPrefix, 'subsections', i]}
                        showAnswers={showAnswers}
                    />
                ))}
            </div>
        </section>
    );
};

export const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, showAnswers = false, showHeader = true, onBack }) => {
    const { setActiveSubsectionId } = useLessonProgress();
    const numberingResetKey = useMemo(() => {
        const headerSignature = [lesson.header?.title, lesson.header?.chapter, lesson.header?.classe]
            .filter(Boolean)
            .join('::');
        const sectionsSignature = lesson.sections.map((section) => section.title).join('||');
        return `${headerSignature}__${sectionsSignature}`;
    }, [lesson]);

    useEffect(() => {
        const subsectionElements = Array.from(
            document.querySelectorAll('[data-lesson-anchor="subsection"]')
        ) as HTMLElement[];

        if (subsectionElements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.05)
                    .sort((a, b) => {
                        // Priorité 1: Plus grande surface visible
                        if (Math.abs(b.intersectionRatio - a.intersectionRatio) > 0.1) {
                            return b.intersectionRatio - a.intersectionRatio;
                        }
                        // Priorité 2: Plus proche du haut de la zone visible
                        const aTop = a.boundingClientRect.top;
                        const bTop = b.boundingClientRect.top;
                        return Math.abs(aTop) - Math.abs(bTop);
                    });

                if (visible.length > 0) {
                    const current = visible[0].target as HTMLElement;
                    const subsectionId = current.getAttribute('data-lesson-subsection-id');
                    if (subsectionId) {
                        setActiveSubsectionId(subsectionId);
                    }
                }
            },
            {
                root: null,
                rootMargin: '-10% 0px -50% 0px',
                threshold: [0, 0.05, 0.1, 0.15, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85, 1],
            }
        );

        subsectionElements.forEach((element) => observer.observe(element));

        return () => {
            observer.disconnect();
        };
    }, [lesson, setActiveSubsectionId]);

    return (
        <NumberingProvider resetKey={numberingResetKey}>
            <div className="lesson-canvas">
                {showHeader && <Header headerData={lesson.header} onBack={onBack} />}
                <div className="lesson-stack">
                    {lesson.sections.map((section, i) => (
                        <Section 
                            key={i} 
                            section={section} 
                            index={i} 
                            pathPrefix={['sections', i]}
                            showAnswers={showAnswers}
                        />
                    ))}
                </div>
            </div>
        </NumberingProvider>
    );
};
