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
        <section className="animate-slide-in-up">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                {icon && <span className="text-4xl text-primary-600 font-sans not-italic">{icon}</span>}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-text-primary tracking-tight font-bold">
                    {title}
                </h2>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 font-sans font-bold text-sm rounded-full">
                    {chapters.length}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {chapters.map((chapter, index) => (
                    <div
                        key={chapter.id}
                        className="animate-scale-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
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
