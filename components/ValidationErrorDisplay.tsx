import React from 'react';
import type { ValidationError } from '../utils/jsonValidator';

interface ValidationErrorDisplayProps {
    errors: ValidationError[];
    warnings?: ValidationError[];
    filePath?: string;
}

/**
 * Composant pour afficher les erreurs de validation JSON de manière claire et structurée
 */
const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({ errors, warnings = [], filePath }) => {
    const getErrorIcon = (type: string): string => {
        switch (type) {
            case 'structure': return '🏗️';
            case 'math': return '🔢';
            case 'content': return '📝';
            case 'parsing': return '⚙️';
            default: return '⚠️';
        }
    };

    const getErrorColor = (type: string): string => {
        switch (type) {
            case 'structure': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            case 'math': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'content': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-background">
            {/* En-tête */}
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-error mb-2">
                    ❌ Erreur de validation JSON
                </h1>
                {filePath && (
                    <p className="text-sm text-secondary font-mono">
                        📁 {filePath}
                    </p>
                )}
            </div>

            {/* Liste des erreurs */}
            {errors.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-error">error</span>
                        Erreurs ({errors.length})
                    </h2>
                    <div className="space-y-4">
                        {errors.map((error, index) => (
                            <div
                                key={index}
                                className={`border-l-4 rounded-lg p-4 ${getErrorColor(error.type)}`}
                            >
                                {/* En-tête de l'erreur */}
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-2xl">{getErrorIcon(error.type)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                                                {error.code || error.type.toUpperCase()}
                                            </span>
                                            {error.line && (
                                                <span className="text-xs text-secondary">
                                                    Ligne {error.line}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-text">
                                            {error.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Chemin JSON */}
                                {error.path && (
                                    <div className="mb-3 pl-11">
                                        <p className="text-xs text-secondary mb-1">
                                            🔍 Chemin JSON:
                                        </p>
                                        <code className="text-xs font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                                            {error.path}
                                        </code>
                                    </div>
                                )}

                                {/* Suggestion de correction */}
                                {error.suggestion && (
                                    <div className="pl-11 p-3 bg-white dark:bg-gray-900 rounded border">
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                                            💡 Solution:
                                        </p>
                                        <p className="text-xs text-text">
                                            {error.suggestion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Liste des avertissements */}
            {warnings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-600">warning</span>
                        Avertissements ({warnings.length})
                    </h2>
                    <div className="space-y-3">
                        {warnings.map((warning, index) => (
                            <div
                                key={index}
                                className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-xl">⚠️</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-text mb-1">
                                            {warning.message}
                                        </p>
                                        {warning.path && (
                                            <code className="text-xs font-mono text-secondary">
                                                {warning.path}
                                            </code>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exemples de correction */}
            {errors.some(e => e.type === 'structure') && (
                <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
                        ✅ Exemple de structure correcte:
                    </p>
                    <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto border font-mono">
{`// ❌ INCORRECT: type "p" avec listType
{
  "type": "p",
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}

// ✅ CORRECT: Retirer type "p" quand listType est présent
{
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}

// ✅ CORRECT: Paragraphe simple sans liste
{
  "type": "p",
  "content": "Un simple paragraphe de texte"
}`}
                    </pre>
                </div>
            )}

            {errors.some(e => e.type === 'math') && (
                <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                        ✅ Exemples de formules mathématiques correctes:
                    </p>
                    <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto border font-mono">
{`// Math inline (dans le texte)
"La formule est $x^2 + 3x + 2$ et continue..."

// Fraction
"$\\\\frac{numérateur}{dénominateur}$"
"$\\\\dfrac{a+b}{c-d}$"

// Racine carrée
"$\\\\sqrt{x}$" ou "$\\\\sqrt[n]{x}$"

// Math en bloc (centré)
"$$x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}$$"

// ATTENTION: Double backslash dans JSON
// \\\\frac (4 backslashes) devient \\frac en LaTeX`}
                    </pre>
                </div>
            )}

            {/* Aide */}
            <div className="text-center pt-6 border-t border-gray-300 dark:border-gray-700">
                <p className="text-sm text-secondary mb-4">
                    💡 <strong>Besoin d'aide?</strong> Ouvrez la console du navigateur (F12) pour plus de détails.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="font-button px-6 py-2 font-semibold text-text bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    ← Retour
                </button>
            </div>
        </div>
    );
};

export default ValidationErrorDisplay;
