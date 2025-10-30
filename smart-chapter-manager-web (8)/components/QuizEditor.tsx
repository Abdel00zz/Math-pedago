import React, { useState, useCallback } from 'react';
import { ChapterData, QuizQuestion, QuizOption } from '../types';
import { PlusCircleIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface QuizEditorProps {
    chapter: ChapterData;
    setChapter: React.Dispatch<React.SetStateAction<ChapterData>>;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ chapter, setChapter }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(chapter.quiz_questions.length > 0 ? 0 : null);
    
    const updateQuestion = useCallback((index: number, updatedQuestion: Partial<QuizQuestion>) => {
        setChapter(c => {
            const newQuestions = [...c.quiz_questions];
            newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
            return { ...c, quiz_questions: newQuestions };
        });
    }, [setChapter]);
    
    const addQuestion = (type: 'mcq' | 'ordering') => {
        const newQuestion: QuizQuestion = type === 'mcq' ? {
            id: `q_${Date.now()}`,
            question: "New Multiple Choice Question",
            type: "mcq",
            options: [
                { text: "Option 1", is_correct: true, explanation: "This is the correct answer." },
                { text: "Option 2", is_correct: false },
            ],
            steps: [],
        } : {
            id: `q_${Date.now()}`,
            question: "New Ordering Question",
            type: "ordering",
            steps: ["First step", "Second step", "Third step"],
            options: [ { text: "First step", is_correct: true, explanation: "The correct order is important." } ],
        };
        
        setChapter(c => ({...c, quiz_questions: [...c.quiz_questions, newQuestion]}));
        setSelectedIndex(chapter.quiz_questions.length);
    };
    
    const deleteQuestion = (index: number) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        setChapter(c => ({...c, quiz_questions: c.quiz_questions.filter((_, i) => i !== index)}));
        if (selectedIndex === index) {
            setSelectedIndex(null);
        } else if (selectedIndex && selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };
    
    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...chapter.quiz_questions];
        const item = newQuestions.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newQuestions.splice(newIndex, 0, item);
        setChapter(c => ({...c, quiz_questions: newQuestions}));
        setSelectedIndex(newIndex);
    };

    const selectedQuestion = selectedIndex !== null ? chapter.quiz_questions[selectedIndex] : null;

    return (
        <div className="flex h-full">
            <aside className="w-1/3 border-r border-slate-200 p-2 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Quiz Questions ({chapter.quiz_questions.length})</h4>
                    <div className="flex gap-1">
                        <button onClick={() => addQuestion('mcq')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">MCQ</button>
                        <button onClick={() => addQuestion('ordering')} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Order</button>
                    </div>
                </div>
                <ul>
                    {chapter.quiz_questions.map((q, index) => (
                        <li key={q.id || index} onClick={() => setSelectedIndex(index)}
                            className={`p-2 rounded cursor-pointer text-sm text-slate-900 ${selectedIndex === index ? 'bg-blue-100' : 'hover:bg-slate-50'}`}>
                            <span className={`font-bold mr-2 ${q.type === 'mcq' ? 'text-blue-600' : 'text-purple-600'}`}>#{index + 1} [{q.type.toUpperCase()}]</span>
                            {q.question.substring(0, 40)}{q.question.length > 40 && '...'}
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="w-2/3 p-4 overflow-y-auto">
                {selectedQuestion && selectedIndex !== null ? (
                    <div>
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-slate-800">
                                Question #{selectedIndex + 1} - <span className="font-mono text-xs bg-slate-200 p-1 rounded">{selectedQuestion.type}</span>
                            </h3>
                            <div className="flex items-center gap-1">
                                <IconButton onClick={() => moveQuestion(selectedIndex, 'up')} disabled={selectedIndex === 0}><ArrowUpIcon className="!text-base" /></IconButton>
                                <IconButton onClick={() => moveQuestion(selectedIndex, 'down')} disabled={selectedIndex === chapter.quiz_questions.length - 1}><ArrowDownIcon className="!text-base" /></IconButton>
                                <IconButton onClick={() => deleteQuestion(selectedIndex)}><TrashIcon className="!text-base text-red-500" /></IconButton>
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                        <textarea value={selectedQuestion.question} rows={3} onChange={(e) => updateQuestion(selectedIndex, { question: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-md text-slate-900" />

                        {selectedQuestion.type === 'mcq' && <MCQEditor question={selectedQuestion} onUpdate={(q) => updateQuestion(selectedIndex, q)} />}
                        {selectedQuestion.type === 'ordering' && <OrderingEditor question={selectedQuestion} onUpdate={(q) => updateQuestion(selectedIndex, q)} />}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">Select a question to edit or add a new one.</div>
                )}
            </main>
        </div>
    );
};

const MCQEditor: React.FC<{question: QuizQuestion, onUpdate: (q: Partial<QuizQuestion>) => void}> = ({ question, onUpdate }) => {
    const explanation = question.options.find(o => o.is_correct)?.explanation || '';

    const handleOptionChange = (optIndex: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[optIndex].text = text;
        onUpdate({ options: newOptions });
    };

    const handleCorrectChange = (optIndex: number) => {
        const newOptions = question.options.map((opt, i) => ({
            ...opt,
            is_correct: i === optIndex,
            explanation: i === optIndex ? explanation : undefined
        }));
        onUpdate({ options: newOptions });
    };

    const handleAddOption = () => {
        onUpdate({options: [...question.options, {text: "New Option", is_correct: false}]});
    };
    
    const handleDeleteOption = (optIndex: number) => {
        onUpdate({options: question.options.filter((_,i) => i !== optIndex)});
    };
    
    const handleExplanationChange = (text: string) => {
        const newOptions = question.options.map(opt => opt.is_correct ? {...opt, explanation: text} : opt);
        onUpdate({ options: newOptions });
    };
    
    return (
        <div className="mt-4 space-y-3">
             <h4 className="font-semibold">Options</h4>
            {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                    <input type="radio" name={`correct_${question.id}`} checked={opt.is_correct} onChange={() => handleCorrectChange(i)} />
                    <input type="text" value={opt.text} onChange={(e) => handleOptionChange(i, e.target.value)} className="flex-grow p-2 border border-slate-300 rounded-md text-slate-900"/>
                    <IconButton onClick={() => handleDeleteOption(i)}><TrashIcon className="!text-base text-red-500" /></IconButton>
                </div>
            ))}
             <button onClick={handleAddOption} className="text-sm text-blue-600 hover:underline">+ Add Option</button>
             <div className="mt-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (for correct answer)</label>
                 <textarea value={explanation} onChange={(e) => handleExplanationChange(e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md text-slate-900"/>
             </div>
        </div>
    );
};

const OrderingEditor: React.FC<{question: QuizQuestion, onUpdate: (q: Partial<QuizQuestion>) => void}> = ({ question, onUpdate }) => {
    const explanation = question.options.find(o => o.is_correct)?.explanation || '';
    
    const handleStepChange = (stepIndex: number, text: string) => {
        const newSteps = [...question.steps];
        newSteps[stepIndex] = text;
        onUpdate({steps: newSteps});
    };
    
    const handleAddStep = () => {
        onUpdate({steps: [...question.steps, "New Step"]});
    };
    
    const handleDeleteStep = (stepIndex: number) => {
        onUpdate({steps: question.steps.filter((_,i) => i !== stepIndex)});
    };
    
    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...question.steps];
        const item = newSteps.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newSteps.splice(newIndex, 0, item);
        onUpdate({steps: newSteps});
    };
    
    const handleExplanationChange = (text: string) => {
        onUpdate({options: [{...question.options[0], explanation: text}]});
    };

    return (
         <div className="mt-4 space-y-3">
             <h4 className="font-semibold">Steps (in correct order)</h4>
             {question.steps.map((step, i) => (
                 <div key={i} className="flex items-center gap-2">
                     <span className="text-slate-500 font-mono">{i+1}.</span>
                     <input type="text" value={step} onChange={(e) => handleStepChange(i, e.target.value)} className="flex-grow p-2 border border-slate-300 rounded-md text-slate-900"/>
                     <IconButton onClick={() => handleMoveStep(i, 'up')} disabled={i === 0}><ArrowUpIcon className="!text-base" /></IconButton>
                     <IconButton onClick={() => handleMoveStep(i, 'down')} disabled={i === question.steps.length - 1}><ArrowDownIcon className="!text-base" /></IconButton>
                     <IconButton onClick={() => handleDeleteStep(i)}><TrashIcon className="!text-base text-red-500" /></IconButton>
                 </div>
             ))}
             <button onClick={handleAddStep} className="text-sm text-blue-600 hover:underline">+ Add Step</button>
             <div className="mt-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (shown after completion)</label>
                 <textarea value={explanation} onChange={(e) => handleExplanationChange(e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md text-slate-900"/>
             </div>
        </div>
    );
};

const IconButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({ onClick, disabled = false, children}) => (
    <button onClick={onClick} disabled={disabled} className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent rounded-md transition-colors">
        {children}
    </button>
);