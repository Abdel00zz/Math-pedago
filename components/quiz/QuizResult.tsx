import React from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { Chapter, QuizProgress } from '../../types';

interface QuizResultProps {
    chapter: Chapter;
    quizProgress: QuizProgress;
}

const QuizResult: React.FC<QuizResultProps> = ({ chapter, quizProgress }) => {
    const dispatch = useAppDispatch();
    const { score, duration, hintsUsed } = quizProgress;
    const totalQuestions = chapter.quiz.length;

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const { color, message } = percentage >= 80 ? { color: 'text-success', message: 'Excellent travail !' }
        : percentage >= 50 ? { color: 'text-warning', message: 'Bien joué !' }
        : { color: 'text-error', message: 'Continuez vos efforts !' };

    return (
        <div className="text-center p-6 animate-fadeIn">
            <div className="bg-surface border border-border rounded-2xl shadow-claude max-w-2xl mx-auto p-8">
                <h2 className="text-4xl font-title text-text mb-2">{message}</h2>
                <p className="text-secondary serif-text text-lg">Votre score au quiz est de :</p>
                <p className={`text-7xl font-bold my-4 ${color}`}>{percentage}%</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
                    <div className="bg-background p-4 rounded-lg border border-border">
                        <p className="font-bold text-text text-xl">{score} / {totalQuestions}</p>
                        <p className="text-secondary text-sm">Bonnes réponses</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-border">
                        <p className="font-bold text-text text-xl">{Math.floor(duration / 60)}m {duration % 60}s</p>
                        <p className="text-secondary text-sm">Temps écoulé</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-border">
                        <p className="font-bold text-text text-xl">{hintsUsed}</p>
                        <p className="text-secondary text-sm">Indices utilisés</p>
                    </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
                    <button 
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: { view: 'activity', chapterId: chapter.id, subView: 'exercises' } })}
                        className="font-button w-full sm:w-auto px-8 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-transform transform hover:-translate-y-px active:scale-95 text-lg"
                    >
                        Passer aux exercices
                    </button>
                    <button 
                        onClick={() => dispatch({ type: 'TOGGLE_REVIEW_MODE', payload: true })}
                        className="font-button w-full sm:w-auto px-6 py-2 font-semibold text-primary border border-primary rounded-lg hover:bg-primary-light"
                    >
                        Revoir mes réponses
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResult;