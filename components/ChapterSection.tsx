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
        <section>
            <div className="flex items-baseline gap-4 mb-6">
                {icon && <span className="text-3xl text-primary/70 font-sans not-italic">{icon}</span>}
                <h2 className="text-3xl sm:text-4xl font-playfair text-text tracking-tight">
                    {title}
                </h2>
                <span className="text-xl font-garamond text-text-secondary -translate-y-px">
                    ({chapters.length})
                </span>
            </div>
            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id}>
                        <ChapterCard 
                            chapter={chapter} 
                            progress={progress[chapter.id]} 
                            onSelect={onSelect} 
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ChapterSection;
