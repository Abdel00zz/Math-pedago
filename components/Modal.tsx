import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
    /** Remove the bottom border under the header */
    hideHeaderBorder?: boolean;
    /** Additional classes to apply to the title element */
    titleClassName?: string;
    /** Position of the close button */
    closePosition?: 'left' | 'right';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, hideHeaderBorder = false, titleClassName = '', closePosition = 'right' }) => {
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
            {/* Backdrop: use themed modal backdrop color for consistency */}
            <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-sm animate-fadeIn" aria-hidden="true"></div>
            <div 
                className={`relative w-full max-w-full sm:max-w-lg px-5 py-4 sm:px-6 sm:py-5 bg-surface text-text border border-border rounded-lg shadow-xl animate-slideInUp ${className}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`relative flex items-center justify-center mb-0.5 ${hideHeaderBorder ? '' : 'border-b border-border pb-3'}`}>
                        <h2 id="modal-title" className={`text-lg sm:text-xl font-semibold text-text ${titleClassName}`}>{title}</h2>
                        <button 
                            onClick={onClose} 
                            className={`${closePosition === 'left' ? 'absolute left-2' : 'absolute right-2'} p-1.5 text-text-secondary hover:text-text transition-colors duration-200 rounded hover:bg-surface/60 focus:outline-none focus:ring-2 focus:ring-primary/30`}
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