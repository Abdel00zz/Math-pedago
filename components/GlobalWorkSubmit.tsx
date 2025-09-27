import React, { useState } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';


interface GlobalWorkSubmitProps {
    isReady: boolean;
    isSubmitted: boolean;
    chapterId: string;
    chapterTitle: string;
}

const GlobalWorkSubmit: React.FC<GlobalWorkSubmitProps> = ({ isReady, isSubmitted, chapterId, chapterTitle }) => {
    const dispatch = useAppDispatch();
    const { addNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ type: 'SUBMIT_WORK', payload: { chapterId } });
        addNotification('Votre travail a été envoyé avec succès !', 'success');
        setIsSubmitting(false);
        setIsModalOpen(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
    };

    

    return (
        <div className="p-6 bg-surface border border-border rounded-lg text-center">
            <h3 className="text-2xl font-bold text-text">Étape 3: Finaliser votre travail</h3>
            <p className="text-secondary mt-2 max-w-2xl mx-auto">
                {isReady 
                    ? "Vous avez terminé toutes les activités. Vous pouvez maintenant soumettre votre travail pour que votre professeur puisse le consulter."
                    : "Terminez le quiz et évaluez tous les exercices pour pouvoir envoyer votre travail."}
            </p>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={!isReady}
                className="font-button mt-6 px-8 py-4 font-bold text-white bg-primary rounded-lg hover:bg-primary-hover transition-transform transform hover:-translate-y-px active:scale-95 disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
                Envoyer mon travail au professeur
            </button>

            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                chapterTitle={chapterTitle}
            />
        </div>
    );
};

export default GlobalWorkSubmit;