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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm animate-fadeIn" aria-hidden="true"></div>
            <div 
                className={`relative w-full max-w-full sm:max-w-lg px-5 py-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl animate-slideInUp ${className}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 pr-4">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                        aria-label="Fermer"
                    >
                         <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;