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
                <ol className="space-y-4">
                    {solution.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
                                {i + 1}
                            </span>
                            <div className="flex-1 text-gray-700 leading-relaxed">
                                <MathContent content={step} inline={false} />
                            </div>
                        </li>
                    ))}
                </ol>
            );
        }

        return (
            <div className="text-gray-700 leading-relaxed">
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
                className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-slideUp"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">💡</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center group"
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
