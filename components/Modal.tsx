import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn transition-all duration-500" aria-hidden="true"></div>
            <div 
                className={`relative w-full max-w-full sm:max-w-lg p-0 bg-white shadow-2xl animate-slideInUp max-h-[95vh] overflow-hidden border border-gray-200 ${className}`}
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: 'Inter, Poppins, system-ui, sans-serif', borderRadius: '12px' }}
            >
                {/* Header avec bouton de fermeture */}
                <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Fermer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Contenu avec scroll */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;