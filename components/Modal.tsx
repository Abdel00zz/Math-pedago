import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
    hideHeaderBorder?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, hideHeaderBorder = false }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose, isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`modal-content ${className ?? ''}`.trim()}
                onClick={e => e.stopPropagation()}
            >
                <div className={`modal-header ${hideHeaderBorder ? '' : 'modal-header--border'}`}>
                    <h2 id="modal-title" className="modal-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        aria-label="Fermer"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;