import React, { useState, useRef, useEffect } from 'react';
import { ChapterData, ExerciseImage, FileSystemDirectoryHandle } from '../types';
import { TrashIcon, UploadCloudIcon, ImageIcon } from './icons';

interface ImageManagerProps {
    images: ExerciseImage[];
    chapter: ChapterData;
    onClose: () => void;
    onSave: (images: ExerciseImage[]) => void;
    dirHandle: FileSystemDirectoryHandle | null;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ images: initialImages, chapter, onClose, onSave, dirHandle }) => {
    const [images, setImages] = useState<ExerciseImage[]>(() => JSON.parse(JSON.stringify(initialImages)));
    const [selectedIndex, setSelectedIndex] = useState<number | null>(images.length > 0 ? 0 : null);
    const [isUploading, setIsUploading] = useState(false);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(URL.revokeObjectURL);
        };
    }, [previews]);


    const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

    const handleUpdateImage = (field: keyof ExerciseImage, value: any) => {
        if (selectedIndex === null) return;
        const newImages = [...images];
        newImages[selectedIndex] = { ...newImages[selectedIndex], [field]: value };
        setImages(newImages);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!dirHandle) {
            alert("Project directory handle is missing. Cannot save the image file.");
            return;
        }

        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);

        try {
            // Get/Create directory structure: pictures -> [class_type] -> [chapter_id]
            const picturesDir = await dirHandle.getDirectoryHandle('pictures', { create: true });
            const classDir = await picturesDir.getDirectoryHandle(chapter.class_type, { create: true });
            const chapterDir = await classDir.getDirectoryHandle(chapter.id, { create: true });

            // Create unique filename and get file handle
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const filename = `img_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const fileHandle = await chapterDir.getFileHandle(filename, { create: true });

            // Write the file
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            const relativePath = `pictures/${chapter.class_type}/${chapter.id}/${filename}`;

            const newImage: ExerciseImage = {
                id: `img_${Date.now()}`,
                path: relativePath,
                caption: file.name,
                size: 'medium',
                position: 'center',
                alignment: 'center',
                alt: '',
            };
            
            setPreviews(prev => ({ ...prev, [newImage.path]: objectUrl }));
            
            setImages(prevImages => {
                const updatedImages = [...prevImages, newImage];
                setSelectedIndex(updatedImages.length - 1);
                return updatedImages;
            });

        } catch (error) {
            URL.revokeObjectURL(objectUrl); // Clean up on failure
            console.error("Error saving image to project folder:", error);
            alert(`Error saving image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleDeleteImage = (index: number) => {
        if (!window.confirm("Are you sure you want to delete this image reference? (The actual file will not be deleted from your folder.)")) return;
        
        const imageToDelete = images[index];
        if (previews[imageToDelete.path]) {
            URL.revokeObjectURL(previews[imageToDelete.path]);
            const newPreviews = { ...previews };
            delete newPreviews[imageToDelete.path];
            setPreviews(newPreviews);
        }

        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages);

        if (selectedIndex === index) {
            setSelectedIndex(newImages.length > 0 ? 0 : null);
        } else if (selectedIndex && selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const previewUrl = selectedImage ? previews[selectedImage.path] : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Image Manager</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
                </header>
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-1/3 border-r border-slate-200 p-2 overflow-y-auto">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-sm">Images ({images.length})</h4>
                            <button onClick={handleImportClick} disabled={isUploading} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50">
                                <UploadCloudIcon className="!text-base"/> {isUploading ? 'Uploading...' : 'Import'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/svg+xml, image/gif" />
                        </div>
                        <ul>
                            {images.map((img, index) => (
                                <li key={img.id || index} onClick={() => setSelectedIndex(index)}
                                    className={`p-2 rounded cursor-pointer text-sm flex justify-between items-center ${selectedIndex === index ? 'bg-blue-100' : 'hover:bg-slate-50'}`}>
                                    <span className="truncate pr-2">{img.caption || (img.path.split('/').pop() || '')}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(index); }} className="p-1 hover:bg-red-100 rounded">
                                        <TrashIcon className="!text-base text-red-500"/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                    <main className="w-2/3 p-4 overflow-y-auto space-y-4">
                        {selectedImage ? (
                            <>
                                <div className="p-2 border rounded-md bg-slate-50 flex justify-center items-center h-48 overflow-hidden">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt={selectedImage.alt || selectedImage.caption} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="text-slate-500 text-center">
                                            <ImageIcon className="!text-5xl" />
                                            <p className="text-sm mt-2">No preview available for existing image.</p>
                                            <p className="font-mono text-xs break-all">{selectedImage.path}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Caption" value={selectedImage.caption} onChange={e => handleUpdateImage('caption', e.target.value)} />
                                    <InputField label="Alt Text (Accessibility)" value={selectedImage.alt} onChange={e => handleUpdateImage('alt', e.target.value)} />
                                    <SelectField label="Size" value={selectedImage.size} onChange={e => handleUpdateImage('size', e.target.value)} options={['small', 'medium', 'large', 'full', 'custom']} />
                                    <SelectField label="Position" value={selectedImage.position} onChange={e => handleUpdateImage('position', e.target.value)} options={['top', 'bottom', 'center', 'float-left', 'float-right', 'inline']} />
                                    <SelectField label="Alignment" value={selectedImage.alignment} onChange={e => handleUpdateImage('alignment', e.target.value)} options={['left', 'center', 'right', 'justify']} />
                                </div>
                                {selectedImage.size === 'custom' && (
                                     <div className="grid grid-cols-2 gap-4 p-3 border rounded-md bg-slate-50">
                                          <InputField label="Custom Width (px)" type="number" value={selectedImage.custom_width || ''} onChange={e => handleUpdateImage('custom_width', e.target.value ? parseInt(e.target.value) : null)} />
                                           <InputField label="Custom Height (px)" type="number" value={selectedImage.custom_height || ''} onChange={e => handleUpdateImage('custom_height', e.target.value ? parseInt(e.target.value) : null)} />
                                     </div>
                                )}
                            </>
                        ) : (
                             <div className="flex items-center justify-center h-full text-slate-500">Select an image or import a new one.</div>
                        )}
                    </main>
                </div>
                 <footer className="flex justify-end items-center p-4 border-t border-slate-200 bg-slate-50/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
                        Cancel
                    </button>
                    <button onClick={() => onSave(images)} className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                        Apply Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string}> = ({label, value, onChange, type="text"}) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <input type={type} value={value} onChange={onChange} className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900" />
    </div>
);

const SelectField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, value, onChange, options}) => (
     <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
