import React from 'react';
import { ChapterData, Video } from '../types';
import { PlusCircleIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, DuplicateIcon } from './icons';

interface VideoEditorProps {
    chapter: ChapterData;
    setChapter: React.Dispatch<React.SetStateAction<ChapterData>>;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ chapter, setChapter }) => {
    
    const handleAddVideo = () => {
        const newVideo: Video = {
            id: `video_${Date.now()}`,
            title: 'New Video',
            youtubeId: '',
            duration: '',
            description: '',
            thumbnail: '',
        };
        setChapter(c => ({ ...c, videos: [...c.videos, newVideo] }));
    };

    const handleUpdateVideo = (index: number, field: keyof Video, value: string) => {
        const newVideos = [...chapter.videos];
        newVideos[index] = { ...newVideos[index], [field]: value };
        setChapter(c => ({ ...c, videos: newVideos }));
    };

    const handleDeleteVideo = (index: number) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            const newVideos = chapter.videos.filter((_, i) => i !== index);
            setChapter(c => ({ ...c, videos: newVideos }));
        }
    };
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === chapter.videos.length - 1)) {
            return;
        }
        const newVideos = [...chapter.videos];
        const item = newVideos.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newVideos.splice(newIndex, 0, item);
        setChapter(c => ({ ...c, videos: newVideos }));
    };
    
    const handleDuplicate = (index: number) => {
        const originalVideo = chapter.videos[index];
        const newVideo: Video = {
            ...originalVideo,
            id: `video_${Date.now()}`,
            title: `${originalVideo.title} (Copy)`
        };
        const newVideos = [...chapter.videos];
        newVideos.splice(index + 1, 0, newVideo);
        setChapter(c => ({...c, videos: newVideos}));
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">Video Capsules ({chapter.videos.length})</h3>
                <button onClick={handleAddVideo} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                    <PlusCircleIcon className="!text-xl" /> Add Video
                </button>
            </div>

            <div className="space-y-4">
                {chapter.videos.map((video, index) => (
                    <div key={video.id || index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Title" value={video.title} onChange={e => handleUpdateVideo(index, 'title', e.target.value)} />
                            <InputField label="YouTube ID" value={video.youtubeId} onChange={e => handleUpdateVideo(index, 'youtubeId', e.target.value)} placeholder="e.g., dQw4w9WgXcQ" />
                            <InputField label="Duration" value={video.duration} onChange={e => handleUpdateVideo(index, 'duration', e.target.value)} placeholder="e.g., 5:42" />
                            <InputField label="Thumbnail URL (Optional)" value={video.thumbnail} onChange={e => handleUpdateVideo(index, 'thumbnail', e.target.value)} />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={video.description}
                                    onChange={e => handleUpdateVideo(index, 'description', e.target.value)}
                                    rows={3}
                                    className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-200">
                            <IconButton onClick={() => handleMove(index, 'up')} disabled={index === 0} title="Move Up"><ArrowUpIcon className="!text-base" /></IconButton>
                            <IconButton onClick={() => handleMove(index, 'down')} disabled={index === chapter.videos.length - 1} title="Move Down"><ArrowDownIcon className="!text-base" /></IconButton>
                            <IconButton onClick={() => handleDuplicate(index)} title="Duplicate"><DuplicateIcon className="!text-base" /></IconButton>
                            <IconButton onClick={() => handleDeleteVideo(index)} title="Delete"><TrashIcon className="!text-base text-red-500" /></IconButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string}> = ({label, value, onChange, placeholder}) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900" />
    </div>
);

const IconButton: React.FC<{onClick: () => void, disabled?: boolean, title?: string, children: React.ReactNode}> = ({ onClick, disabled = false, title, children}) => (
    <button onClick={onClick} disabled={disabled} title={title} className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent rounded-md transition-colors">
        {children}
    </button>
);