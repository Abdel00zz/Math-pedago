import React, { useState } from 'react';
import { ChapterData, Exercise, SubQuestion, ExerciseImage, FileSystemDirectoryHandle } from '../types';
import { PlusCircleIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, DuplicateIcon, LightBulbIcon, ImageIcon } from './icons';
import { ImageManager } from './ImageManager';

interface ExerciseEditorProps {
    chapter: ChapterData;
    setChapter: React.Dispatch<React.SetStateAction<ChapterData>>;
    dirHandle: FileSystemDirectoryHandle | null;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ chapter, setChapter, dirHandle }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(chapter.exercises.length > 0 ? 0 : null);
    const [editingMainImages, setEditingMainImages] = useState<boolean>(false);
    
    const updateExercise = (index: number, updatedExercise: Partial<Exercise>) => {
        setChapter(c => {
            const newExercises = [...c.exercises];
            newExercises[index] = { ...newExercises[index], ...updatedExercise };
            return { ...c, exercises: newExercises };
        });
    };

    const addExercise = () => {
        const newExercise: Exercise = {
            id: `ex_${Date.now()}`,
            title: `New Exercise ${chapter.exercises.length + 1}`,
            statement: "Exercise statement...",
            sub_questions: [],
        };
        setChapter(c => ({...c, exercises: [...c.exercises, newExercise]}));
        setSelectedIndex(chapter.exercises.length);
    };

    const deleteExercise = (index: number) => {
        if (!window.confirm("Are you sure you want to delete this exercise?")) return;
        setChapter(c => ({...c, exercises: c.exercises.filter((_, i) => i !== index)}));
        if (selectedIndex === index) {
            setSelectedIndex(null);
        } else if (selectedIndex && selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        const newExercises = [...chapter.exercises];
        const item = newExercises.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newExercises.splice(newIndex, 0, item);
        setChapter(c => ({ ...c, exercises: newExercises }));
        setSelectedIndex(newIndex);
    };

    const duplicateExercise = (index: number) => {
        const original = chapter.exercises[index];
        const newExercise: Exercise = JSON.parse(JSON.stringify({
            ...original,
            id: `ex_${Date.now()}`,
            title: `${original.title} (Copy)`,
        }));
        const newExercises = [...chapter.exercises];
        newExercises.splice(index + 1, 0, newExercise);
        setChapter(c => ({ ...c, exercises: newExercises }));
        setSelectedIndex(index + 1);
    };

    const selectedExercise = selectedIndex !== null ? chapter.exercises[selectedIndex] : null;

    return (
        <>
            <div className="flex h-full">
                <aside className="w-1/3 border-r border-slate-200 p-2 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Exercises ({chapter.exercises.length})</h4>
                        <button onClick={addExercise} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Add Exercise</button>
                    </div>
                    <ul>
                        {chapter.exercises.map((ex, index) => (
                            <li key={ex.id || index} onClick={() => setSelectedIndex(index)}
                                className={`p-2 rounded cursor-pointer text-sm text-slate-900 ${selectedIndex === index ? 'bg-blue-100' : 'hover:bg-slate-50'}`}>
                                <span className="font-bold mr-2 text-green-600">#{index + 1}</span>
                                {ex.title || `Exercise ${index+1}`}
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="w-2/3 p-4 overflow-y-auto">
                    {selectedExercise && selectedIndex !== null ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-slate-800">Exercise #{selectedIndex + 1}</h3>
                                <div className="flex items-center gap-1">
                                    <IconButton onClick={() => moveExercise(selectedIndex, 'up')} disabled={selectedIndex === 0}><ArrowUpIcon className="!text-base" /></IconButton>
                                    <IconButton onClick={() => moveExercise(selectedIndex, 'down')} disabled={selectedIndex === chapter.exercises.length - 1}><ArrowDownIcon className="!text-base" /></IconButton>
                                    <IconButton onClick={() => duplicateExercise(selectedIndex)}><DuplicateIcon className="!text-base" /></IconButton>
                                    <IconButton onClick={() => deleteExercise(selectedIndex)}><TrashIcon className="!text-base text-red-500" /></IconButton>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input type="text" value={selectedExercise.title} onChange={(e) => updateExercise(selectedIndex, { title: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-md text-slate-900" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Statement</label>
                                    <button 
                                        onClick={() => setEditingMainImages(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                                        title="Manage images for this exercise"
                                    >
                                        <ImageIcon className={`!text-base ${selectedExercise.images && selectedExercise.images.length > 0 ? 'text-blue-600' : 'text-blue-400'}`} />
                                        <span className="font-medium">{selectedExercise.images && selectedExercise.images.length > 0 ? `${selectedExercise.images.length} image(s)` : 'Add images'}</span>
                                    </button>
                                </div>
                                <textarea value={selectedExercise.statement} rows={4} onChange={(e) => updateExercise(selectedIndex, { statement: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-md text-slate-900" />
                                {selectedExercise.images && selectedExercise.images.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedExercise.images.map((img, idx) => (
                                            <div key={img.id || idx} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                                                <ImageIcon className="!text-sm" />
                                                <span className="truncate max-w-[120px]" title={img.path}>{img.path.split('/').pop()}</span>
                                                <span className="text-slate-400">({img.position})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <SubQuestionsEditor 
                                exercise={selectedExercise} 
                                chapter={chapter}
                                onUpdate={(sub_questions) => updateExercise(selectedIndex, { sub_questions })} 
                                dirHandle={dirHandle}
                            />

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">Select an exercise to edit or add a new one.</div>
                    )}
                </main>
            </div>
            
            {/* Image Manager Modal for Exercise Statement Images */}
            {editingMainImages && selectedIndex !== null && (
                <ImageManager
                    images={chapter.exercises[selectedIndex].images || []}
                    chapter={chapter}
                    onClose={() => setEditingMainImages(false)}
                    onSave={(updatedImages) => {
                        updateExercise(selectedIndex, { images: updatedImages });
                        setEditingMainImages(false);
                    }}
                    dirHandle={dirHandle}
                />
            )}
        </>
    );
};

interface SubQuestionsEditorProps {
    exercise: Exercise;
    chapter: ChapterData;
    onUpdate: (sub_questions: SubQuestion[]) => void;
    dirHandle: FileSystemDirectoryHandle | null;
}

const SubQuestionsEditor: React.FC<SubQuestionsEditorProps> = ({ exercise, chapter, onUpdate, dirHandle }) => {
    const [editingHintIndex, setEditingHintIndex] = useState<number | null>(null);
    const [editingImagesForSQIndex, setEditingImagesForSQIndex] = useState<number | null>(null);

    const updateSubQuestion = (sqIndex: number, updatedFields: Partial<SubQuestion>) => {
        const newSQ = [...exercise.sub_questions];
        newSQ[sqIndex] = { ...newSQ[sqIndex], ...updatedFields };
        onUpdate(newSQ);
    };

    const addSubQuestion = () => {
        onUpdate([...exercise.sub_questions, {text: "New sub-question", sub_sub_questions: [], images: [], hint: null}]);
    };

    const deleteSubQuestion = (sqIndex: number) => {
        onUpdate(exercise.sub_questions.filter((_, i) => i !== sqIndex));
    };

    const updateSubSubQuestion = (sqIndex: number, ssqIndex: number, text: string) => {
        const newSQ = [...exercise.sub_questions];
        const newSSQ = [...newSQ[sqIndex].sub_sub_questions];
        newSSQ[ssqIndex] = { ...newSSQ[ssqIndex], text };
        newSQ[sqIndex] = { ...newSQ[sqIndex], sub_sub_questions: newSSQ };
        onUpdate(newSQ);
    };

    const addSubSubQuestion = (sqIndex: number) => {
        const newSQ = [...exercise.sub_questions];
        const newSSQ = [...newSQ[sqIndex].sub_sub_questions, {text: "New sub-sub-question"}];
        newSQ[sqIndex] = { ...newSQ[sqIndex], sub_sub_questions: newSSQ };
        onUpdate(newSQ);
    };

    const deleteSubSubQuestion = (sqIndex: number, ssqIndex: number) => {
        const newSQ = [...exercise.sub_questions];
        const newSSQ = newSQ[sqIndex].sub_sub_questions.filter((_, i) => i !== ssqIndex);
        newSQ[sqIndex] = { ...newSQ[sqIndex], sub_sub_questions: newSSQ };
        onUpdate(newSQ);
    };

    const handleSaveSubQuestionImages = (sqIndex: number, updatedImages: ExerciseImage[]) => {
        updateSubQuestion(sqIndex, { images: updatedImages });
        setEditingImagesForSQIndex(null);
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mt-6 mb-2">
                    <h4 className="font-semibold">Sub-Questions</h4>
                    <button onClick={addSubQuestion} className="text-sm text-blue-600 hover:underline">+ Add Sub-Question</button>
                </div>
                <div className="space-y-4">
                    {exercise.sub_questions.map((sq, sqIndex) => (
                        <div key={sqIndex} className="p-3 bg-slate-50 rounded border border-slate-200">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-slate-600 pt-2">{sqIndex + 1}.</span>
                                <div className="flex-grow">
                                    <textarea value={sq.text} onChange={e => updateSubQuestion(sqIndex, { text: e.target.value })} rows={1}
                                        className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-900"/>
                                    
                                    {editingHintIndex === sqIndex && (
                                        <div className="mt-2">
                                            <textarea
                                                value={sq.hint || ''}
                                                onChange={e => updateSubQuestion(sqIndex, { hint: e.target.value })}
                                                placeholder="Enter hint text here..."
                                                rows={2}
                                                className="w-full p-2 border border-yellow-300 rounded-md text-sm text-slate-900 bg-yellow-50 focus:ring-yellow-500 focus:border-yellow-500"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="ml-6 mt-2 space-y-2">
                                        {sq.sub_sub_questions.map((ssq, ssqIndex) => (
                                            <div key={ssqIndex} className="flex items-center gap-2">
                                                <span className="text-slate-500">{String.fromCharCode(97 + ssqIndex)}.</span>
                                                <input type="text" value={ssq.text} onChange={e => updateSubSubQuestion(sqIndex, ssqIndex, e.target.value)} 
                                                    className="flex-grow p-1 border border-slate-300 rounded-md text-sm text-slate-900"/>
                                                <IconButton onClick={() => deleteSubSubQuestion(sqIndex, ssqIndex)}><TrashIcon className="!text-sm text-red-500" /></IconButton>
                                            </div>
                                        ))}
                                        <button onClick={() => addSubSubQuestion(sqIndex)} className="text-xs text-blue-600 hover:underline">+ Add a,b,c...</button>
                                    </div>

                                </div>
                                <div className="flex flex-col items-center">
                                    <IconButton onClick={() => deleteSubQuestion(sqIndex)}><TrashIcon className="!text-base text-red-500" /></IconButton>
                                    <IconButton
                                        onClick={() => setEditingHintIndex(editingHintIndex === sqIndex ? null : sqIndex)}
                                        title={sq.hint ? "Edit hint" : "Add hint"}
                                    >
                                        <LightBulbIcon className={`!text-xl transition-colors ${(sq.hint || editingHintIndex === sqIndex) ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-600'}`} />
                                    </IconButton>
                                     <IconButton
                                        onClick={() => setEditingImagesForSQIndex(sqIndex)}
                                        title="Manage images"
                                    >
                                        <ImageIcon className={`!text-xl transition-colors ${sq.images && sq.images.length > 0 ? 'text-blue-500 hover:text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             {editingImagesForSQIndex !== null && (
                <ImageManager
                    images={exercise.sub_questions[editingImagesForSQIndex].images || []}
                    chapter={chapter}
                    onClose={() => setEditingImagesForSQIndex(null)}
                    onSave={(updatedImages) => handleSaveSubQuestionImages(editingImagesForSQIndex, updatedImages)}
                    dirHandle={dirHandle}
                />
            )}
        </>
    );
};

const IconButton: React.FC<{onClick: () => void, disabled?: boolean, title?: string, children: React.ReactNode}> = ({ onClick, disabled = false, title, children}) => (
    <button onClick={onClick} disabled={disabled} title={title} className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent rounded-md transition-colors">
        {children}
    </button>
);
