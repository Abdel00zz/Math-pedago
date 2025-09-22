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
            <div className={`flex items-center gap-3 mb-6 ${!icon ? 'ml-1' : ''}`}>
                {icon && <span className="text-text-secondary text-2xl">{icon}</span>}
                <h2 className="text-3xl sm:text-4xl antique-title text-text">
                    {title}
                    <span className="text-lg font-normal text-text-secondary ml-3">
                        ({chapters.length})
                    </span>
                </h2>
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