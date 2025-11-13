import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface ParsedErrorInfo {
    type: 'structure' | 'math' | 'content' | 'runtime' | 'unknown';
    title: string;
    message: string;
    file?: string;
    line?: number;
    path?: string;
    suggestion?: string;
    details?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    /**
     * Analyse l'erreur pour extraire des informations détaillées
     */
    private parseError(error: Error, errorInfo: ErrorInfo | null): ParsedErrorInfo {
        const errorMessage = error.message || error.toString();
        const stack = error.stack || '';

        // Erreur .trim is not a function
        if (errorMessage.includes('.trim is not a function')) {
            return {
                type: 'structure',
                title: 'Erreur de structure JSON',
                message: 'Un élément de type "p" (paragraphe) contient un tableau au lieu d\'une chaîne de caractères',
                suggestion: 'Si vous voulez une liste, retirez "type": "p" et utilisez "listType": "bullet" ou "numbered"',
                details: this.extractFileFromStack(stack),
            };
        }

        // Erreur map is not a function / forEach is not a function
        if (errorMessage.includes('map is not a function') || errorMessage.includes('forEach is not a function')) {
            return {
                type: 'structure',
                title: 'Erreur de type de données',
                message: 'Un tableau était attendu mais une autre valeur a été fournie',
                suggestion: 'Vérifiez que les propriétés comme "content", "sections", "elements" sont bien des tableaux []',
                details: this.extractFileFromStack(stack),
            };
        }

        // Erreur JSON.parse
        if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
            return {
                type: 'structure',
                title: 'Erreur de syntaxe JSON',
                message: 'Le fichier JSON contient des erreurs de syntaxe',
                suggestion: 'Vérifiez les virgules, accolades et guillemets. Utilisez un validateur JSON en ligne.',
                details: this.extractFileFromStack(stack),
            };
        }

        // Erreur mathématique (LaTeX)
        if (errorMessage.includes('KaTeX') || errorMessage.includes('Math') ||
            errorMessage.includes('$') || errorMessage.includes('\\')) {
            return {
                type: 'math',
                title: 'Erreur dans une formule mathématique',
                message: 'Une formule LaTeX est mal formée',
                suggestion: 'Vérifiez que les $ sont bien fermés, les accolades {} équilibrées, et les commandes LaTeX correctes',
                details: this.extractFileFromStack(stack),
            };
        }

        // Erreur Cannot read property
        if (errorMessage.includes('Cannot read property') || errorMessage.includes('Cannot read properties')) {
            const match = errorMessage.match(/Cannot read propert(?:y|ies) of (undefined|null)/);
            return {
                type: 'content',
                title: 'Propriété manquante',
                message: `Tentative d'accès à une propriété sur ${match ? match[1] : 'une valeur inexistante'}`,
                suggestion: 'Vérifiez que toutes les propriétés requises sont présentes dans le JSON',
                details: this.extractFileFromStack(stack),
            };
        }

        // Erreur générique
        return {
            type: 'runtime',
            title: 'Erreur d\'exécution',
            message: errorMessage,
            details: stack,
        };
    }

    /**
     * Extrait le nom du fichier depuis la stack trace
     */
    private extractFileFromStack(stack: string): string {
        // Chercher les patterns comme "lessons/xxx.json" ou "chapters/xxx.json"
        const jsonMatch = stack.match(/(?:lessons|chapters|public)\/[^\s)]+\.json/);
        if (jsonMatch) {
            return jsonMatch[0];
        }

        // Chercher les components React dans la stack
        const componentMatch = stack.match(/at (\w+) \(/);
        if (componentMatch) {
            return `Component: ${componentMatch[1]}`;
        }

        return stack.split('\n')[0] || 'Stack trace non disponible';
    }

    private handleReset = () => {
        window.location.reload();
    };

    private handleGoBack = () => {
        window.history.back();
    };

    private getErrorIcon(type: string): string {
        switch (type) {
            case 'structure': return '🏗️';
            case 'math': return '🔢';
            case 'content': return '📝';
            case 'runtime': return '⚙️';
            default: return '⚠️';
        }
    }

    private getErrorColor(type: string): string {
        switch (type) {
            case 'structure': return 'text-red-600';
            case 'math': return 'text-blue-600';
            case 'content': return 'text-yellow-600';
            case 'runtime': return 'text-purple-600';
            default: return 'text-error';
        }
    }

    render() {
        if (this.state.hasError && this.state.error) {
            const parsedError = this.parseError(this.state.error, this.state.errorInfo);

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-text">
                    <div className="max-w-3xl w-full p-8 bg-surface border-2 border-error rounded-lg coursera-shadow-card">
                        {/* En-tête avec icône */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-6xl">{this.getErrorIcon(parsedError.type)}</span>
                            <div>
                                <h1 className="text-3xl font-bold text-text font-title">
                                    {parsedError.title}
                                </h1>
                                <p className={`text-sm font-medium mt-1 ${this.getErrorColor(parsedError.type)}`}>
                                    Type: {parsedError.type.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        {/* Message principal */}
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                            <p className="text-text font-medium">
                                {parsedError.message}
                            </p>
                        </div>

                        {/* Fichier concerné */}
                        {parsedError.file && (
                            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <p className="text-sm text-secondary">
                                    <span className="font-semibold">📍 Fichier concerné:</span> {parsedError.file}
                                </p>
                            </div>
                        )}

                        {/* Ligne du problème */}
                        {parsedError.line && (
                            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <p className="text-sm text-secondary">
                                    <span className="font-semibold">📍 Ligne:</span> {parsedError.line}
                                </p>
                            </div>
                        )}

                        {/* Chemin JSON */}
                        {parsedError.path && (
                            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
                                <p className="text-sm text-secondary">
                                    <span className="font-semibold">🔍 Chemin JSON:</span> {parsedError.path}
                                </p>
                            </div>
                        )}

                        {/* Suggestion de correction */}
                        {parsedError.suggestion && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    💡 Comment corriger:
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {parsedError.suggestion}
                                </p>
                            </div>
                        )}

                        {/* Exemples de correction selon le type */}
                        {parsedError.type === 'structure' && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                                    ✅ Exemple de structure correcte:
                                </p>
                                <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-x-auto">
{`// ❌ INCORRECT:
{
  "type": "p",
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}

// ✅ CORRECT:
{
  "content": ["item 1", "item 2"],
  "listType": "bullet"
}`}
                                </pre>
                            </div>
                        )}

                        {parsedError.type === 'math' && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                                    ✅ Exemples de formules correctes:
                                </p>
                                <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-x-auto">
{`// Inline math:
"La formule est $x^2 + 3x + 2$"

// Fraction:
"$\\\\frac{a}{b}$" ou "$\\\\dfrac{a}{b}$"

// Racine:
"$\\\\sqrt{x}$" ou "$\\\\sqrt[3]{x}$"

// Display math:
"$$x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}$$"`}
                                </pre>
                            </div>
                        )}

                        {/* Détails techniques */}
                        <details className="mb-6 text-left bg-gray-100 dark:bg-gray-800 p-4 border rounded-md text-xs">
                            <summary className="cursor-pointer font-semibold text-secondary hover:text-text">
                                🔧 Détails techniques (pour développeurs)
                            </summary>
                            <pre className="mt-3 whitespace-pre-wrap break-all text-xs text-secondary font-mono">
                                {parsedError.details || this.state.error.stack}
                            </pre>
                        </details>

                        {/* Boutons d'action */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleGoBack}
                                className="font-button px-6 py-2 font-semibold text-text bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                ← Retour
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="font-button px-6 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                🔄 Recharger l'application
                            </button>
                        </div>

                        {/* Aide supplémentaire */}
                        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700 text-center">
                            <p className="text-sm text-secondary">
                                💡 <strong>Besoin d'aide?</strong> Vérifiez la console du navigateur (F12) pour plus de détails.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
