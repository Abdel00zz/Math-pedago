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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/35 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl lg:max-w-7xl max-h-[88vh] min-h-[320px] overflow-hidden"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 px-6 sm:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl text-blue-600 drop-shadow-[0_0_14px_rgba(37,99,235,0.35)]">
                                lightbulb
                            </span>
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
                <div className="overflow-y-auto max-h-[calc(88vh-120px)] px-6 sm:px-8 py-6">
                    {renderSolution()}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 sm:px-8 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-md"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};
