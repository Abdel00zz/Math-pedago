import React from 'react';
import { Chapter, ChapterProgress } from '../types';
import ChapterCard from './ChapterCard';

interface ChapterSectionProps {
    title: string;
    chapters: Chapter[];
    progress: { [chapterId: string]: ChapterProgress };
    onSelect: (chapterId: string) => void;
    icon?: string;
}

const ChapterSection: React.FC<ChapterSectionProps> = ({ title, chapters, progress, onSelect, icon }) => {
    if (chapters.length === 0) {
        return null;
    }

    return (
        <section className="dashboard-section">
            <div className="dashboard-section__header">
                {icon && (
                    <span className="dashboard-section__icon" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <h2 className="dashboard-section__title">{title}</h2>
                <span className="dashboard-section__count">({chapters.length})</span>
            </div>
            <div className="dashboard-section__items">
                {chapters.map((chapter) => (
                    <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        progress={progress[chapter.id]}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </section>
    );
};

export default ChapterSection;
