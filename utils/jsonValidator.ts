/**
 * Système de validation détaillée pour les fichiers JSON de leçons et chapitres
 * Détecte les erreurs de structure et les problèmes de formules mathématiques
 */

export interface ValidationError {
    type: 'structure' | 'math' | 'content' | 'parsing';
    severity: 'error' | 'warning';
    message: string;
    file?: string;
    line?: number;
    path?: string; // Chemin JSON, ex: "sections[0].subsections[1].elements[3]"
    suggestion?: string;
    code?: string; // Code d'erreur pour faciliter le debug
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Extrait le numéro de ligne approximatif d'un chemin JSON dans le texte source
 */
function findLineNumber(jsonText: string, path: string): number {
    try {
        const lines = jsonText.split('\n');
        // Extraire les clés du chemin: "sections[0].subsections[1].elements[3]"
        const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');

        let currentLine = 0;
        let depth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Chercher la clé actuelle
            if (depth < keys.length) {
                const currentKey = keys[depth];
                // Chercher la clé dans la ligne (ex: "sections", "elements", etc.)
                if (trimmed.includes(`"${currentKey}"`) ||
                    (Number.isInteger(Number(currentKey)) && trimmed === '{')) {
                    currentLine = i + 1;
                    depth++;
                }
            }
        }

        return currentLine || 1;
    } catch {
        return 1;
    }
}

/**
 * Valide la structure d'un élément de leçon
 */
function validateLessonElement(
    element: any,
    path: string,
    jsonText?: string
): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!element || typeof element !== 'object') {
        errors.push({
            type: 'structure',
            severity: 'error',
            message: `L'élément n'est pas un objet valide`,
            path,
            line: jsonText ? findLineNumber(jsonText, path) : undefined,
            code: 'INVALID_ELEMENT_TYPE'
        });
        return errors;
    }

    // Vérifier le type d'élément
    const validTypes = [
        'p', 'table', 'definition-box', 'theorem-box', 'proposition-box',
        'property-box', 'example-box', 'remark-box', 'practice-box', 'explain-box'
    ];

    if (element.type && !validTypes.includes(element.type)) {
        errors.push({
            type: 'structure',
            severity: 'error',
            message: `Type d'élément invalide: "${element.type}"`,
            path: `${path}.type`,
            line: jsonText ? findLineNumber(jsonText, path) : undefined,
            suggestion: `Types valides: ${validTypes.join(', ')}`,
            code: 'INVALID_ELEMENT_TYPE'
        });
    }

    // RÈGLE CRITIQUE: Un élément avec listType ne doit PAS avoir type="p"
    if (element.listType && element.type === 'p') {
        errors.push({
            type: 'structure',
            severity: 'error',
            message: `Erreur de structure: un élément avec "listType" ne peut pas avoir "type": "p"`,
            path: `${path}.type`,
            line: jsonText ? findLineNumber(jsonText, path) : undefined,
            suggestion: `Retirez la propriété "type": "p" de cet élément. Les éléments avec listType n'ont pas besoin de type.`,
            code: 'TYPE_P_WITH_LISTTYPE'
        });
    }

    // Vérifier que content est du bon type selon la présence de listType
    if (element.content !== undefined) {
        const contentIsArray = Array.isArray(element.content);
        const contentIsString = typeof element.content === 'string';

        if (element.listType) {
            // Si listType est présent, content DOIT être un tableau
            if (!contentIsArray) {
                errors.push({
                    type: 'structure',
                    severity: 'error',
                    message: `Avec "listType", "content" doit être un tableau, reçu: ${typeof element.content}`,
                    path: `${path}.content`,
                    line: jsonText ? findLineNumber(jsonText, path) : undefined,
                    suggestion: `Convertissez "content" en tableau: ["item 1", "item 2", ...]`,
                    code: 'LISTTYPE_REQUIRES_ARRAY'
                });
            }
        } else if (element.type === 'p') {
            // Pour un paragraphe sans listType, content doit être une chaîne
            if (!contentIsString) {
                errors.push({
                    type: 'structure',
                    severity: 'error',
                    message: `Pour un paragraphe (type: "p"), "content" doit être une chaîne, reçu: ${Array.isArray(element.content) ? 'tableau' : typeof element.content}`,
                    path: `${path}.content`,
                    line: jsonText ? findLineNumber(jsonText, path) : undefined,
                    suggestion: element.content && Array.isArray(element.content)
                        ? `Utilisez "listType": "bullet" ou "numbered", ou fusionnez le tableau en une seule chaîne`
                        : `Assurez-vous que "content" est une chaîne de caractères`,
                    code: 'PARAGRAPH_REQUIRES_STRING'
                });
            }
        }

        // Validation du contenu des tableaux
        if (contentIsArray) {
            element.content.forEach((item: any, index: number) => {
                if (typeof item !== 'string' && typeof item !== 'object') {
                    errors.push({
                        type: 'structure',
                        severity: 'error',
                        message: `L'élément ${index} du tableau "content" doit être une chaîne ou un objet`,
                        path: `${path}.content[${index}]`,
                        line: jsonText ? findLineNumber(jsonText, `${path}.content[${index}]`) : undefined,
                        code: 'INVALID_ARRAY_ITEM'
                    });
                }
            });
        }

        // Validation des formules mathématiques
        if (contentIsString) {
            const mathErrors = validateMathFormulas(element.content, `${path}.content`);
            errors.push(...mathErrors);
        } else if (contentIsArray) {
            element.content.forEach((item: any, index: number) => {
                if (typeof item === 'string') {
                    const mathErrors = validateMathFormulas(item, `${path}.content[${index}]`);
                    errors.push(...mathErrors);
                }
            });
        }
    }

    // Vérifier les practice-box et explain-box
    if (element.type === 'practice-box' || element.type === 'explain-box') {
        // Vérifier que solution existe si content existe
        if (element.content && Array.isArray(element.content)) {
            if (!element.solution || !Array.isArray(element.solution)) {
                errors.push({
                    type: 'structure',
                    severity: 'warning',
                    message: `${element.type} devrait avoir une propriété "solution" de type tableau`,
                    path: `${path}.solution`,
                    line: jsonText ? findLineNumber(jsonText, path) : undefined,
                    suggestion: `Ajoutez une propriété "solution" avec un tableau de réponses correspondant aux questions`,
                    code: 'MISSING_SOLUTION'
                });
            } else if (element.solution.length !== element.content.length) {
                errors.push({
                    type: 'content',
                    severity: 'warning',
                    message: `Le nombre de solutions (${element.solution.length}) ne correspond pas au nombre de questions (${element.content.length})`,
                    path: `${path}.solution`,
                    line: jsonText ? findLineNumber(jsonText, path) : undefined,
                    suggestion: `Assurez-vous qu'il y a une solution pour chaque question`,
                    code: 'SOLUTION_MISMATCH'
                });
            }
        }
    }

    // Vérifier listType valide
    if (element.listType && !['bullet', 'numbered', 'number'].includes(element.listType)) {
        errors.push({
            type: 'structure',
            severity: 'error',
            message: `"listType" invalide: "${element.listType}"`,
            path: `${path}.listType`,
            line: jsonText ? findLineNumber(jsonText, path) : undefined,
            suggestion: `Utilisez "bullet" ou "numbered"`,
            code: 'INVALID_LISTTYPE'
        });
    }

    return errors;
}

/**
 * Valide les formules mathématiques dans une chaîne
 */
function validateMathFormulas(text: string, path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!text || typeof text !== 'string') return errors;

    // Vérifier les $ non fermés
    const dollarCount = (text.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
        errors.push({
            type: 'math',
            severity: 'error',
            message: `Formule mathématique non fermée: nombre impair de "$" (${dollarCount})`,
            path,
            suggestion: `Assurez-vous que chaque "$" d'ouverture a un "$" de fermeture`,
            code: 'UNCLOSED_MATH_DELIMITER'
        });
    }

    // Vérifier les \( \) non fermés
    const openParenCount = (text.match(/\\\(/g) || []).length;
    const closeParenCount = (text.match(/\\\)/g) || []).length;
    if (openParenCount !== closeParenCount) {
        errors.push({
            type: 'math',
            severity: 'error',
            message: `Formule mathématique non fermée: \\( (${openParenCount}) et \\) (${closeParenCount}) ne correspondent pas`,
            path,
            suggestion: `Vérifiez que chaque "\\(" a un "\\)" correspondant`,
            code: 'UNCLOSED_PAREN_DELIMITER'
        });
    }

    // Vérifier les \[ \] non fermés
    const openBracketCount = (text.match(/\\\[/g) || []).length;
    const closeBracketCount = (text.match(/\\\]/g) || []).length;
    if (openBracketCount !== closeBracketCount) {
        errors.push({
            type: 'math',
            severity: 'error',
            message: `Formule mathématique non fermée: \\[ (${openBracketCount}) et \\] (${closeBracketCount}) ne correspondent pas`,
            path,
            suggestion: `Vérifiez que chaque "\\[" a un "\\]" correspondant`,
            code: 'UNCLOSED_BRACKET_DELIMITER'
        });
    }

    // Vérifier les accolades {} dans les formules
    const mathRegions: string[] = [];
    let inMath = false;
    let currentMath = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1] || '';

        if (char === '$') {
            if (inMath) {
                mathRegions.push(currentMath);
                currentMath = '';
            }
            inMath = !inMath;
        } else if (inMath) {
            currentMath += char;
        }
    }

    // Vérifier les accolades dans chaque région mathématique
    mathRegions.forEach((mathText, index) => {
        const openBraces = (mathText.match(/\{/g) || []).length;
        const closeBraces = (mathText.match(/\}/g) || []).length;

        if (openBraces !== closeBraces) {
            errors.push({
                type: 'math',
                severity: 'error',
                message: `Accolades non équilibrées dans la formule mathématique: { (${openBraces}) et } (${closeBraces})`,
                path,
                suggestion: `Vérifiez que chaque "{" a un "}" correspondant dans la formule: "${mathText.substring(0, 50)}..."`,
                code: 'UNBALANCED_BRACES'
            });
        }
    });

    // Vérifier les commandes LaTeX courantes mal formées
    const commonErrors = [
        { pattern: /\\frac[^{]/, message: '\\frac doit être suivi de {numérateur}{dénominateur}', code: 'MALFORMED_FRAC' },
        { pattern: /\\sqrt[^[{]/, message: '\\sqrt doit être suivi de {contenu} ou [n]{contenu}', code: 'MALFORMED_SQRT' },
        { pattern: /\\dfrac[^{]/, message: '\\dfrac doit être suivi de {numérateur}{dénominateur}', code: 'MALFORMED_DFRAC' },
    ];

    commonErrors.forEach(({ pattern, message, code }) => {
        if (pattern.test(text)) {
            errors.push({
                type: 'math',
                severity: 'error',
                message: `Erreur LaTeX: ${message}`,
                path,
                code
            });
        }
    });

    return errors;
}

/**
 * Valide une structure de leçon complète
 */
export function validateLesson(
    lessonData: any,
    filePath?: string,
    jsonText?: string
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
        // Vérifier que c'est un objet
        if (!lessonData || typeof lessonData !== 'object') {
            errors.push({
                type: 'structure',
                severity: 'error',
                message: 'Le JSON doit être un objet',
                file: filePath,
                code: 'INVALID_ROOT_TYPE'
            });
            return { valid: false, errors, warnings };
        }

        // Vérifier la présence de sections
        const lesson = lessonData.lesson || lessonData;

        if (!lesson.sections || !Array.isArray(lesson.sections)) {
            errors.push({
                type: 'structure',
                severity: 'error',
                message: 'La leçon doit avoir une propriété "sections" de type tableau',
                file: filePath,
                path: 'sections',
                code: 'MISSING_SECTIONS'
            });
            return { valid: false, errors, warnings };
        }

        // Valider chaque section
        lesson.sections.forEach((section: any, sectionIndex: number) => {
            const sectionPath = `sections[${sectionIndex}]`;

            if (!section.subsections || !Array.isArray(section.subsections)) {
                errors.push({
                    type: 'structure',
                    severity: 'error',
                    message: `La section ${sectionIndex} doit avoir une propriété "subsections" de type tableau`,
                    file: filePath,
                    path: `${sectionPath}.subsections`,
                    line: jsonText ? findLineNumber(jsonText, sectionPath) : undefined,
                    code: 'MISSING_SUBSECTIONS'
                });
                return;
            }

            // Valider chaque sous-section
            section.subsections.forEach((subsection: any, subsectionIndex: number) => {
                const subsectionPath = `${sectionPath}.subsections[${subsectionIndex}]`;

                if (!subsection.elements || !Array.isArray(subsection.elements)) {
                    errors.push({
                        type: 'structure',
                        severity: 'error',
                        message: `La sous-section ${subsectionIndex} de la section ${sectionIndex} doit avoir une propriété "elements" de type tableau`,
                        file: filePath,
                        path: `${subsectionPath}.elements`,
                        line: jsonText ? findLineNumber(jsonText, subsectionPath) : undefined,
                        code: 'MISSING_ELEMENTS'
                    });
                    return;
                }

                // Valider chaque élément
                subsection.elements.forEach((element: any, elementIndex: number) => {
                    const elementPath = `${subsectionPath}.elements[${elementIndex}]`;
                    const elementErrors = validateLessonElement(element, elementPath, jsonText);

                    elementErrors.forEach(err => {
                        err.file = filePath;
                        if (err.severity === 'error') {
                            errors.push(err);
                        } else {
                            warnings.push(err);
                        }
                    });
                });
            });
        });

    } catch (error) {
        errors.push({
            type: 'parsing',
            severity: 'error',
            message: `Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            file: filePath,
            code: 'VALIDATION_ERROR'
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Valide un chapitre (avec quiz et exercices)
 */
export function validateChapter(
    chapterData: any,
    filePath?: string,
    jsonText?: string
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
        if (!chapterData || typeof chapterData !== 'object') {
            errors.push({
                type: 'structure',
                severity: 'error',
                message: 'Le JSON doit être un objet',
                file: filePath,
                code: 'INVALID_ROOT_TYPE'
            });
            return { valid: false, errors, warnings };
        }

        // Valider les quiz
        if (chapterData.quiz && Array.isArray(chapterData.quiz)) {
            chapterData.quiz.forEach((question: any, index: number) => {
                const path = `quiz[${index}]`;

                if (!question.question) {
                    errors.push({
                        type: 'structure',
                        severity: 'error',
                        message: `Question ${index} manque la propriété "question"`,
                        file: filePath,
                        path: `${path}.question`,
                        line: jsonText ? findLineNumber(jsonText, path) : undefined,
                        code: 'MISSING_QUESTION'
                    });
                }

                if (!question.options || !Array.isArray(question.options)) {
                    errors.push({
                        type: 'structure',
                        severity: 'error',
                        message: `Question ${index} manque la propriété "options" de type tableau`,
                        file: filePath,
                        path: `${path}.options`,
                        line: jsonText ? findLineNumber(jsonText, path) : undefined,
                        code: 'MISSING_OPTIONS'
                    });
                }

                // Valider les formules dans les questions et options
                if (typeof question.question === 'string') {
                    const mathErrors = validateMathFormulas(question.question, `${path}.question`);
                    mathErrors.forEach(err => {
                        err.file = filePath;
                        errors.push(err);
                    });
                }

                if (question.options && Array.isArray(question.options)) {
                    question.options.forEach((opt: any, optIndex: number) => {
                        if (typeof opt === 'string') {
                            const mathErrors = validateMathFormulas(opt, `${path}.options[${optIndex}]`);
                            mathErrors.forEach(err => {
                                err.file = filePath;
                                errors.push(err);
                            });
                        }
                    });
                }
            });
        }

        // Valider les exercices
        if (chapterData.exercises && Array.isArray(chapterData.exercises)) {
            chapterData.exercises.forEach((exercise: any, index: number) => {
                const path = `exercises[${index}]`;

                if (!exercise.statement) {
                    warnings.push({
                        type: 'structure',
                        severity: 'warning',
                        message: `Exercice ${index} manque la propriété "statement"`,
                        file: filePath,
                        path: `${path}.statement`,
                        line: jsonText ? findLineNumber(jsonText, path) : undefined,
                        code: 'MISSING_STATEMENT'
                    });
                }

                // Valider les formules dans l'énoncé
                if (typeof exercise.statement === 'string') {
                    const mathErrors = validateMathFormulas(exercise.statement, `${path}.statement`);
                    mathErrors.forEach(err => {
                        err.file = filePath;
                        if (err.severity === 'error') {
                            errors.push(err);
                        } else {
                            warnings.push(err);
                        }
                    });
                }
            });
        }

    } catch (error) {
        errors.push({
            type: 'parsing',
            severity: 'error',
            message: `Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            file: filePath,
            code: 'VALIDATION_ERROR'
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Formatte un message d'erreur pour l'affichage
 */
export function formatValidationError(error: ValidationError): string {
    const parts: string[] = [];

    // Type et sévérité avec emoji
    const emoji = error.type === 'math' ? '🔢' :
                  error.type === 'structure' ? '🏗️' :
                  error.type === 'content' ? '📝' : '⚠️';
    const severity = error.severity === 'error' ? '❌ ERREUR' : '⚠️ AVERTISSEMENT';

    parts.push(`${emoji} ${severity} [${error.code || error.type.toUpperCase()}]`);

    // Fichier et ligne
    if (error.file) {
        const location = error.line ? `${error.file}:${error.line}` : error.file;
        parts.push(`📍 Fichier: ${location}`);
    }

    // Chemin JSON
    if (error.path) {
        parts.push(`🔍 Chemin: ${error.path}`);
    }

    // Message
    parts.push(`💬 ${error.message}`);

    // Suggestion
    if (error.suggestion) {
        parts.push(`💡 Solution: ${error.suggestion}`);
    }

    return parts.join('\n');
}

/**
 * Formatte tous les résultats de validation pour l'affichage
 */
export function formatValidationResults(result: ValidationResult): string {
    const parts: string[] = [];

    if (result.errors.length > 0) {
        parts.push('═══ ERREURS ═══\n');
        result.errors.forEach((error, index) => {
            parts.push(`\n${index + 1}. ${formatValidationError(error)}`);
        });
    }

    if (result.warnings.length > 0) {
        if (parts.length > 0) parts.push('\n\n');
        parts.push('═══ AVERTISSEMENTS ═══\n');
        result.warnings.forEach((warning, index) => {
            parts.push(`\n${index + 1}. ${formatValidationError(warning)}`);
        });
    }

    if (result.valid) {
        parts.push('✅ Validation réussie : aucune erreur détectée');
    }

    return parts.join('\n');
}
