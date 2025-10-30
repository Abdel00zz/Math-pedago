import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Feedback, SubQuestion, Exercise, ExerciseImage } from '../types';
import HintModal from './HintModal';
import MathContent from './MathContent';

const feedbackConfig: { [key in Feedback]: { base: string; selected: string } } = {
    'Facile':    { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-success text-white border-success' },
    'Moyen':     { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-warning text-white border-warning' },
    'Difficile': { base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-error text-white border-error' },
    'Non traité':{ base: 'bg-white border-[#d7ccc8] text-[#a1887f] hover:bg-gray-100', selected: 'bg-secondary text-white border-secondary' },
};


const FeedbackButton: React.FC<{
    feedback: Feedback;
    currentFeedback: Feedback | undefined;
    onClick: (feedback: Feedback) => void;
    disabled?: boolean;
}> = ({ feedback, currentFeedback, onClick, disabled }) => {
    const isSelected = feedback === currentFeedback;
    const config = feedbackConfig[feedback];

    return (
        <button
            onClick={() => onClick(feedback)}
            disabled={disabled}
            className={`font-button px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 transform active:scale-95 ${
                isSelected ? config.selected : config.base
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            <span>{feedback}</span>
        </button>
    );
};

interface ExercisesProps {
    onAllCompleted: () => void;
}

const Exercises: React.FC<ExercisesProps> = ({ onAllCompleted }) => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;
    const [hintModalExerciseId, setHintModalExerciseId] = useState<string | null>(null);

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const endTime = Date.now();
            const durationInSeconds = Math.round((endTime - startTime) / 1000);
            if (durationInSeconds > 0 && currentChapterId) {
                dispatch({ type: 'UPDATE_EXERCISES_DURATION', payload: { duration: durationInSeconds } });
            }
        };
    }, [dispatch, currentChapterId]);
    
    if (!currentChapterId) return null;
    const chapter = activities[currentChapterId];
    const chapterProgress = progress[currentChapterId];
    const exercisesFeedback = chapterProgress.exercisesFeedback;

    const isOutdatedSubmission = useMemo(() => (
        chapterProgress.isWorkSubmitted &&
        !!chapter.version &&
        !!chapterProgress.submittedVersion &&
        chapter.version !== chapterProgress.submittedVersion
    ), [chapter, chapterProgress]);
    
    const isChapterLocked = chapterProgress.isWorkSubmitted && !isOutdatedSubmission;
    
    const totalExercises = chapter.exercises.length;
    
    const evaluatedExercisesCount = useMemo(() => {
        return Object.keys(exercisesFeedback).length;
    }, [exercisesFeedback]);

    const wasCompleted = useRef(false);
    useEffect(() => {
        const areAllEvaluated = totalExercises > 0 && evaluatedExercisesCount === totalExercises;
        if (areAllEvaluated && !wasCompleted.current) {
            onAllCompleted();
            wasCompleted.current = true;
        } else if (!areAllEvaluated) {
            wasCompleted.current = false;
        }
    }, [evaluatedExercisesCount, totalExercises, onAllCompleted]);

    const handleOpenHintModal = (exId: string) => {
        setHintModalExerciseId(exId);
    };
    
    const handleFeedback = (exId: string, feedback: Feedback) => {
        if (isChapterLocked) return;
        dispatch({ type: 'UPDATE_EXERCISE_FEEDBACK', payload: { exId, feedback } });
    };

    // 🔍 SUPPRESSION DU TRAITEMENT MARKDOWN ICI
    // Le formatage est maintenant géré uniquement par MathContent.tsx
    // Cela évite les conflits avec les délimiteurs LaTeX $ $
    const formatText = (text: string) => {
        // On retourne le texte brut sans transformation
        // MathContent s'occupera du Markdown ET du LaTeX
        console.log('[Exercises] Text passed to MathContent:', text);
        return text;
    };

    const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => {
            if (!subQuestions || subQuestions.length === 0) return null;

            return (
                <ol className="list-decimal pl-6 mt-4 space-y-4 text-base sm:text-lg text-black">
                    {subQuestions.map((sq, index) => {
                        const sqImages = organizeImages(sq.images);
                        
                        return (
                            <li key={index} className="pl-2 text-sm sm:text-base leading-relaxed">
                                {/* Images en position top pour la sous-question */}
                                {sqImages.top.length > 0 && (
                                    <div className="mb-4 space-y-4">
                                        {sqImages.top.map((img, imgIndex) => renderImage(img, imgIndex))}
                                    </div>
                                )}
                                
                                <div className="font-medium text-black">
                                    <MathContent content={formatText(sq.text)} className="text-sm sm:text-base" inline={true} />
                                </div>

                                {/* Images de contenu (center/float) pour la sous-question */}
                                {sqImages.content.length > 0 && (
                                    <div className="my-4 space-y-4 clear-both">
                                        {sqImages.content.map((img, imgIndex) => renderImage(img, imgIndex))}
                                    </div>
                                )}

                                {sq.sub_sub_questions && sq.sub_sub_questions.length > 0 && (
                                    <ol 
                                        className="list-none pl-0 mt-2 space-y-2"
                                        style={{ 
                                            counterReset: 'subsub-counter',
                                            marginLeft: '1.5rem'
                                        }}
                                    >
                                        {sq.sub_sub_questions.map((ssq, ssqIndex) => (
                                            <li 
                                                key={ssqIndex} 
                                                className="relative pl-8 text-sm sm:text-base leading-relaxed text-black"
                                                style={{
                                                    counterIncrement: 'subsub-counter',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span 
                                                    className="absolute left-0 top-0 font-medium text-black"
                                                    style={{
                                                        content: 'counter(subsub-counter, lower-alpha) ". "',
                                                    }}
                                                >
                                                    {String.fromCharCode(97 + ssqIndex)}.
                                                </span>
                                                <MathContent content={formatText(ssq.text)} className="text-sm sm:text-base" inline={true} />
                                            </li>
                                        ))}
                                    </ol>
                                )}
                                
                                {/* Images en position bottom pour la sous-question */}
                                {sqImages.bottom.length > 0 && (
                                    <div className="mt-4 space-y-4 clear-both">
                                        {sqImages.bottom.map((img, imgIndex) => renderImage(img, imgIndex))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            );
        };

    const hintExercise = useMemo(() => {
        if (!hintModalExerciseId) return null;
        return chapter.exercises.find(ex => ex.id === hintModalExerciseId);
    }, [hintModalExerciseId, chapter.exercises]);

    // Fonction pour obtenir les classes CSS basées sur la taille de l'image
    const getImageSizeClass = (image: ExerciseImage): string => {
        switch (image.size) {
            case 'small': return 'max-w-xs'; // 320px
            case 'medium': return 'max-w-md'; // 448px
            case 'large': return 'max-w-2xl'; // 672px
            case 'full': return 'w-full max-w-full';
            case 'custom': return ''; // Utilise les dimensions personnalisées
            default: return 'max-w-md';
        }
    };

    // Fonction pour obtenir les classes CSS basées sur l'alignement horizontal
    const getImageAlignmentClass = (alignment: string = 'center'): string => {
        switch (alignment) {
            case 'left': return 'mr-auto';
            case 'center': return 'mx-auto';
            case 'right': return 'ml-auto';
            case 'justify': return 'w-full';
            default: return 'mx-auto';
        }
    };

    // Fonction intelligente pour obtenir les classes CSS basées sur la position de l'image
    const getImagePositionClass = (position: string = 'center', alignment: string = 'center'): string => {
        const baseClasses = 'block'; // Toujours en display block pour un meilleur contrôle
        const alignmentClass = getImageAlignmentClass(alignment);
        
        switch (position) {
            case 'top': 
                return `${baseClasses} ${alignmentClass} mb-6`;
            case 'bottom': 
                return `${baseClasses} ${alignmentClass} mt-6`;
            case 'float-left': 
                return `float-left mr-4 mb-4 clear-left`;
            case 'float-right': 
                return `float-right ml-4 mb-4 clear-right`;
            case 'center': 
                return `${baseClasses} ${alignmentClass} my-6`;
            case 'inline': 
                return `inline-block ${alignmentClass} mx-2 my-2`;
            default: 
                return `${baseClasses} ${alignmentClass} my-6`;
        }
    };

    // Composant pour rendre une image avec toutes ses options
    const renderImage = (image: ExerciseImage, index: number) => {
        const sizeClass = getImageSizeClass(image);
        const positionClass = getImagePositionClass(image.position, image.alignment);
        const alignment = image.alignment || 'center';
        
        const customStyle = image.size === 'custom' ? {
            width: image.customWidth ? `${image.customWidth}px` : 'auto',
            height: image.customHeight ? `${image.customHeight}px` : 'auto'
        } : {};

        // Container avec alignement approprié
        const containerAlignmentClass = alignment === 'center' ? 'flex justify-center' : 
                                       alignment === 'right' ? 'flex justify-end' : 
                                       alignment === 'left' ? 'flex justify-start' : '';

        return (
            <figure 
                key={image.id || `img-${index}`} 
                className={`${positionClass} ${containerAlignmentClass}`}
            >
                <div className={alignment === 'center' || alignment === 'right' || alignment === 'left' ? '' : 'inline-block'}>
                    <img
                        src={`/${image.path}`}
                        alt={image.alt || image.caption || 'Image de l\'exercice'}
                        className={`${sizeClass} rounded-lg shadow-md object-contain`}
                        style={customStyle}
                    />
                    {image.caption && (
                        <figcaption className={`text-sm text-black italic mt-2 ${
                            alignment === 'center' ? 'text-center' : 
                            alignment === 'right' ? 'text-right' : 
                            alignment === 'left' ? 'text-left' : 'text-center'
                        }`}>
                            {image.caption}
                        </figcaption>
                    )}
                </div>
            </figure>
        );
    };

    // Fonction intelligente pour organiser les images selon leur position
    const organizeImages = (images: ExerciseImage[] | undefined) => {
        if (!images || images.length === 0) return { top: [], bottom: [], content: [] };
        
        const top: ExerciseImage[] = [];
        const bottom: ExerciseImage[] = [];
        const content: ExerciseImage[] = [];
        
        images.forEach(img => {
            const position = img.position || 'center';
            if (position === 'top') {
                top.push(img);
            } else if (position === 'bottom') {
                bottom.push(img);
            } else {
                // center, float-left, float-right, inline vont dans le contenu
                content.push(img);
            }
        });
        
        return { top, bottom, content };
    };

    return (
        <div id="exercises-container" className="space-y-4 pb-4">
            {chapter.exercises.map((exercise, index) => {
                const organizedImages = organizeImages(exercise.images);
                
                return (
                    <div key={exercise.id} className="bg-amber-50 p-6 rounded-lg border border-amber-200 shadow-lg shadow-amber-900/5">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl sm:text-2xl font-display text-black pr-4">
                                <span className="text-primary font-bold">{`Exercice ${index + 1}`}</span>
                                <span className="text-base sm:text-lg text-black font-normal">{` | ${exercise.title}`}</span>
                            </h3>
                            {exercise.hint && exercise.hint.length > 0 && (
                                <button 
                                    onClick={() => handleOpenHintModal(exercise.id)}
                                    className="font-button flex-shrink-0 w-10 h-10 text-info bg-info/10 rounded-full flex items-center justify-center hover:bg-info/20 transition-colors active:scale-95"
                                    aria-label={`Voir l'indice pour l'exercice ${index + 1}`}
                                >
                                    <span className="material-symbols-outlined text-base">lightbulb</span>
                                </button>
                            )}
                        </div>
                        
                        {/* Images en position top */}
                        {organizedImages.top.length > 0 && (
                            <div className="mb-6 space-y-4">
                                {organizedImages.top.map((img, imgIndex) => renderImage(img, imgIndex))}
                            </div>
                        )}
                        
                        {/* Énoncé avec images de contenu (center, float-left, float-right, inline) */}
                        <div className="text-base sm:text-lg font-sans text-black leading-relaxed exercise-content">
                            <div className="math-render exercise-text font-sans leading-relaxed">
                                <MathContent content={formatText(exercise.statement)} inline={false} />
                            </div>
                            
                            {/* Images dans le contenu (center/float-left/float-right/inline) */}
                            {organizedImages.content.length > 0 && (
                                <div className="my-6 space-y-4 clear-both">
                                    {organizedImages.content.map((img, imgIndex) => renderImage(img, imgIndex))}
                                </div>
                            )}
                        </div>
                        
                        {exercise.sub_questions && renderSubQuestions(exercise.sub_questions)}
                        
                        {/* Images en position bottom */}
                        {organizedImages.bottom.length > 0 && (
                            <div className="mt-6 space-y-4 clear-both">
                                {organizedImages.bottom.map((img, imgIndex) => renderImage(img, imgIndex))}
                            </div>
                        )}

                        <div className="mt-6 border-t border-amber-200 pt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                            <p className="text-sm font-semibold text-black serif-text">Comment vous êtes-vous senti face à cet exercice ?</p>
                            <div className="flex flex-wrap gap-2 shrink-0">
                               {(['Facile', 'Moyen', 'Difficile', 'Non traité'] as Feedback[]).map(f => (
                                    <FeedbackButton 
                                        key={f} 
                                        feedback={f}
                                        currentFeedback={exercisesFeedback[exercise.id]}
                                        onClick={(fb) => handleFeedback(exercise.id, fb)}
                                        disabled={isChapterLocked}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
            <HintModal
                isOpen={!!hintModalExerciseId}
                onClose={() => setHintModalExerciseId(null)}
                exercise={hintExercise}
            />
        </div>
    );
};

export default Exercises;