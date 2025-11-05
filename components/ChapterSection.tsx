import React, { useId } from 'react';
import { Chapter, ChapterProgress } from '../types';
import ChapterCard from './ChapterCard';

interface ChapterSectionProps {
    title: string;
    chapters: Chapter[];
    progress: { [chapterId: string]: ChapterProgress };
    onSelect: (chapterId: string) => void;
    icon?: string;
    variant?: 'default' | 'upcoming';
}

const ChapterSection: React.FC<ChapterSectionProps> = ({ title, chapters, progress, onSelect, icon, variant = 'default' }) => {
    if (chapters.length === 0) {
        return null;
    }

    const headingId = useId();

    return (
        <section className="dashboard-section" aria-labelledby={headingId} data-variant={variant}>
            <header className="dashboard-section__header">
                {icon && (
                    <span className="dashboard-section__icon" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <h2 id={headingId} className="dashboard-section__title">{title}</h2>
                <span className="dashboard-section__count" aria-label={`${chapters.length} chapitre${chapters.length > 1 ? 's' : ''}`}>({chapters.length})</span>
            </header>
            <ul className="dashboard-section__items" role="list">
                {chapters.map((chapter) => (
                    <li key={chapter.id} className="dashboard-section__item" role="listitem">
                        <ChapterCard
                            chapter={chapter}
                            progress={progress[chapter.id]}
                            onSelect={onSelect}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ChapterSection;
