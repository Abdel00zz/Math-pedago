import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    activityTitle: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, activityTitle }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmation Requise">
            <div className="mt-4 text-center">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-error/10 rounded-full text-error mb-4">
                    <span className="material-symbols-outlined text-4xl">priority_high</span>
                </div>
                <h3 className="text-lg font-semibold text-dark-gray">
                    Envoyer le travail pour cette activité ?
                </h3>
                <p className="font-bold font-serif text-xl my-2 text-primary">{activityTitle}</p>
                <p className="text-sm text-secondary mt-2">
                    Une fois envoyé, vous ne pourrez plus modifier vos réponses. <br/>Cette action est définitive.
                </p>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-4">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2 font-semibold text-secondary bg-light-gray rounded-lg hover:bg-border-color active:scale-95 disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-error rounded-lg transition-transform transform hover:-translate-y-1 active:scale-95 disabled:bg-error/70 disabled:cursor-wait"
                >
                    {isSubmitting ? (
                        <>
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white -ml-1 mr-3"></div>
                            <span>Envoi en cours...</span>
                        </>
                    ) : (
                        "Confirmer l'envoi"
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;