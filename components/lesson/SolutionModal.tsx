/**
 * Modale pour afficher les solutions détaillées des exercices
 * Style minimaliste cohérent avec Pedago
 */

import React, { useEffect, useRef } from 'react';
import MathContent from '../MathContent';

interface SolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    solution: string | string[];
    title?: string;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({ 
    isOpen, 
    onClose, 
    solution, 
    title = "Solution détaillée" 
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Fermer avec Échap
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Fermer en cliquant à l'extérieur
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const renderSolution = () => {
        if (Array.isArray(solution)) {
            return (
                <ol className="space-y-3">
                    {solution.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-[0.5rem] flex items-center justify-center shadow-sm">
                                {i + 1}
                            </span>
                            <div className="flex-1 text-gray-800 leading-relaxed">
                                <MathContent content={step} inline={false} />
                            </div>
                        </li>
                    ))}
                </ol>
            );
        }

        return (
            <div className="text-gray-800 leading-relaxed">
                <MathContent content={solution} inline={false} />
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden animate-slideUp"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    role="img"
                                    focusable="false"
                                >
                                    <defs>
                                        <radialGradient id="bulb-glow-modal" cx="50%" cy="40%" r="65%">
                                            <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.92" />
                                            <stop offset="55%" stopColor="#d9efff" stopOpacity="0.46" />
                                            <stop offset="100%" stopColor="#8ab4ff" stopOpacity="0" />
                                        </radialGradient>
                                        <linearGradient id="bulb-gradient-modal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fff7c2" />
                                            <stop offset="55%" stopColor="#fcd34d" />
                                            <stop offset="100%" stopColor="#f97316" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="12" cy="10" r="7.6" fill="url(#bulb-glow-modal)" opacity="0.65" />
                                    <path
                                        d="M12 3.5c-3.03 0-5.5 2.43-5.5 5.43 0 2.1 1.15 3.97 2.98 4.94.34.18.52.54.52.9v1.58c0 .31.25.56.56.56h3.88c.31 0 .56-.25.56-.56v-1.58c0-.36.2-.7.52-.88 1.86-.96 3.02-2.86 3.02-4.97 0-3-2.47-5.42-5.5-5.42Zm-2.5 16.1c0 .22.18.4.4.4h4.2c.22 0 .4-.18.4-.4v-.4H9.5v.4Z"
                                        fill="url(#bulb-gradient-modal)"
                                        stroke="#ffffff"
                                        strokeWidth="0.6"
                                        paintOrder="fill"
                                    />
                                    <path
                                        d="M10 18.7h4"
                                        stroke="#ffffff"
                                        strokeWidth="1.1"
                                        strokeLinecap="round"
                                        opacity="0.85"
                                    />
                                    <circle cx="12" cy="6.4" r="1.55" fill="#ffffff" opacity="0.95" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center group"
                            aria-label="Fermer"
                        >
                            <svg 
                                className="w-5 h-5 text-gray-500 group-hover:text-gray-700" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-6">
                    {renderSolution()}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles pour les animations (à ajouter dans le CSS global ou Tailwind config)
const styles = `
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(20px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
    animation: slideUp 0.3s ease-out;
}
`;
