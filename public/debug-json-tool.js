/**
 * 🔍 JSON Debug Tool - Outil de débogage JSON intelligent
 *
 * Utilisation dans la console F12 :
 * 1. Copier-coller tout ce fichier dans la console
 * 2. Utiliser : await debugJSON('/path/to/file.json')
 *
 * Exemples :
 * - await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')
 * - await debugJSON('/chapters/1bsm/lessons/1bsm_le_barycentre_dans_le_plan.json')
 * - debugJSONContent(jsonString) // Pour déboguer une chaîne JSON directement
 */

(function() {
    'use strict';

    // 🎨 Styles pour la console
    const styles = {
        error: 'color: #ff4444; font-weight: bold; font-size: 14px;',
        success: 'color: #44ff44; font-weight: bold; font-size: 14px;',
        warning: 'color: #ffaa00; font-weight: bold; font-size: 13px;',
        info: 'color: #4488ff; font-weight: bold; font-size: 12px;',
        code: 'background: #2d2d2d; color: #f8f8f8; padding: 2px 6px; font-family: monospace;',
        highlight: 'background: #ff4444; color: white; padding: 2px 6px; font-family: monospace;',
        lineNumber: 'color: #888; font-family: monospace;',
        suggestion: 'color: #44ffaa; font-style: italic;'
    };

    /**
     * 🔍 Analyse et débogue un fichier JSON
     */
    window.debugJSON = async function(filePath) {
        console.log('%c🔍 JSON Debug Tool - Démarrage...', styles.info);
        console.log(`%cFichier: ${filePath}`, styles.info);
        console.log('━'.repeat(80));

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Impossible de charger le fichier: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            console.log(`%c✓ Fichier chargé (${text.length} caractères)`, styles.success);

            return debugJSONContent(text, filePath);
        } catch (error) {
            console.error('%c✗ Erreur de chargement:', styles.error, error.message);
            return false;
        }
    };

    /**
     * 🔍 Débogue directement une chaîne JSON
     */
    window.debugJSONContent = function(jsonString, fileName = 'JSON') {
        console.log('\n%c📋 Analyse du contenu JSON...', styles.info);
        console.log('━'.repeat(80));

        // Étape 1: Vérification de la syntaxe JSON
        const syntaxResult = checkSyntax(jsonString);
        if (!syntaxResult.valid) {
            displaySyntaxError(jsonString, syntaxResult, fileName);
            return false;
        }

        console.log('%c✓ Syntaxe JSON valide', styles.success);

        // Étape 2: Validation de la structure
        const data = syntaxResult.data;
        const structureResult = validateStructure(data, fileName);

        if (!structureResult.valid) {
            displayStructureErrors(structureResult);
            return false;
        }

        // Étape 3: Vérifications avancées
        const advancedResult = advancedChecks(data, fileName);
        displayAdvancedResults(advancedResult);

        console.log('\n%c━'.repeat(80), 'color: #44ff44;');
        console.log('%c✅ Analyse terminée !', styles.success);

        if (advancedResult.warnings.length === 0 && advancedResult.suggestions.length === 0) {
            console.log('%c🎉 Aucun problème détecté ! Votre JSON est parfait.', styles.success);
        }

        return {
            valid: true,
            data: data,
            warnings: advancedResult.warnings,
            suggestions: advancedResult.suggestions
        };
    };

    /**
     * ✅ Vérification de la syntaxe JSON
     */
    function checkSyntax(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return { valid: true, data: data };
        } catch (error) {
            // Extraction des informations d'erreur
            const match = error.message.match(/position (\d+)/i);
            const position = match ? parseInt(match[1]) : null;

            return {
                valid: false,
                error: error,
                message: error.message,
                position: position
            };
        }
    }

    /**
     * 🎯 Affichage détaillé d'une erreur de syntaxe
     */
    function displaySyntaxError(jsonString, result, fileName) {
        console.log('\n%c❌ ERREUR DE SYNTAXE JSON', styles.error);
        console.log('━'.repeat(80));

        console.log('%cMessage:', styles.error);
        console.log(`  ${result.message}`);

        if (result.position !== null) {
            const { line, column, context } = getErrorContext(jsonString, result.position);

            console.log('\n%c📍 Position:', styles.error);
            console.log(`  Ligne ${line}, Colonne ${column}`);
            console.log(`  Position absolue: ${result.position}`);

            console.log('\n%c📝 Contexte:', styles.info);
            displayContext(context, line);

            // Suggestions de correction
            const suggestions = getSyntaxSuggestions(jsonString, result.position, context);
            if (suggestions.length > 0) {
                console.log('\n%c💡 Suggestions:', styles.suggestion);
                suggestions.forEach((s, i) => {
                    console.log(`  ${i + 1}. ${s}`);
                });
            }
        }

        // Erreurs courantes
        displayCommonErrors(result.message);
    }

    /**
     * 📍 Obtenir le contexte autour d'une erreur
     */
    function getErrorContext(text, position, contextLines = 3) {
        const lines = text.split('\n');
        let currentPos = 0;
        let errorLine = 0;
        let errorColumn = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 pour \n
            if (currentPos + lineLength > position) {
                errorLine = i + 1;
                errorColumn = position - currentPos + 1;
                break;
            }
            currentPos += lineLength;
        }

        const startLine = Math.max(0, errorLine - contextLines - 1);
        const endLine = Math.min(lines.length, errorLine + contextLines);
        const contextLinesArray = lines.slice(startLine, endLine);

        return {
            line: errorLine,
            column: errorColumn,
            context: contextLinesArray.map((line, idx) => ({
                number: startLine + idx + 1,
                content: line,
                isError: startLine + idx + 1 === errorLine
            }))
        };
    }

    /**
     * 📝 Affichage du contexte avec coloration
     */
    function displayContext(context, errorLine) {
        context.forEach(ctx => {
            const lineNum = String(ctx.number).padStart(4, ' ');
            const prefix = ctx.isError ? '❯' : ' ';

            if (ctx.isError) {
                console.log(`%c${prefix} ${lineNum} │ %c${ctx.content}`,
                    styles.error, styles.highlight);
                console.log(`      │ %c${'▲'.padStart(ctx.content.length, ' ')}`,
                    styles.error);
            } else {
                console.log(`%c${prefix} ${lineNum} │ ${ctx.content}`, styles.lineNumber);
            }
        });
    }

    /**
     * 💡 Suggestions de correction pour erreurs de syntaxe
     */
    function getSyntaxSuggestions(text, position, context) {
        const suggestions = [];
        const errorContext = context.find(c => c.isError);
        if (!errorContext) return suggestions;

        const line = errorContext.content;
        const beforeError = text.substring(Math.max(0, position - 50), position);
        const afterError = text.substring(position, Math.min(text.length, position + 50));

        // Virgule manquante
        if (/"\s*\n\s*"/.test(beforeError + afterError)) {
            suggestions.push('Il manque probablement une virgule (,) entre deux éléments');
        }

        // Guillemets non fermés
        const quotesBefore = (beforeError.match(/"/g) || []).length;
        if (quotesBefore % 2 !== 0) {
            suggestions.push('Guillemet non fermé détecté');
        }

        // Accolades/crochets non fermés
        const openBraces = (beforeError.match(/{/g) || []).length;
        const closeBraces = (beforeError.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
            suggestions.push(`${openBraces - closeBraces} accolade(s) ouvrante(s) { non fermée(s)`);
        }

        const openBrackets = (beforeError.match(/\[/g) || []).length;
        const closeBrackets = (beforeError.match(/]/g) || []).length;
        if (openBrackets > closeBrackets) {
            suggestions.push(`${openBrackets - closeBrackets} crochet(s) ouvrant(s) [ non fermé(s)`);
        }

        // Virgule finale
        if (/,\s*[}\]]/.test(line)) {
            suggestions.push('Virgule finale interdite avant } ou ]');
        }

        // Caractères spéciaux non échappés
        if (/["\n\r\t]/.test(line) && !line.includes('\\')) {
            suggestions.push('Caractère spécial non échappé dans une chaîne');
        }

        return suggestions;
    }

    /**
     * 📚 Affichage des erreurs courantes
     */
    function displayCommonErrors(message) {
        const commonErrors = [
            {
                pattern: /unexpected token/i,
                title: 'Token inattendu',
                help: [
                    '• Vérifiez qu\'il n\'y a pas de virgule en trop',
                    '• Assurez-vous que tous les guillemets sont fermés',
                    '• Vérifiez que les accolades {} et crochets [] sont bien appariés'
                ]
            },
            {
                pattern: /expected.*comma/i,
                title: 'Virgule manquante',
                help: [
                    '• Ajoutez une virgule (,) entre les éléments d\'un objet ou tableau',
                    '• Ne mettez PAS de virgule après le dernier élément'
                ]
            },
            {
                pattern: /unexpected end/i,
                title: 'Fin inattendue',
                help: [
                    '• Il manque probablement une accolade } ou un crochet ]',
                    '• Comptez vos accolades ouvrantes { et fermantes }',
                    '• Comptez vos crochets ouvrants [ et fermants ]'
                ]
            },
            {
                pattern: /invalid.*character/i,
                title: 'Caractère invalide',
                help: [
                    '• Caractère spécial non échappé dans une chaîne',
                    '• Utilisez \\" pour les guillemets dans les chaînes',
                    '• Utilisez \\n pour les retours à la ligne'
                ]
            }
        ];

        const matchedError = commonErrors.find(e => e.pattern.test(message));
        if (matchedError) {
            console.log('\n%c📖 Aide pour cette erreur:', styles.warning);
            console.log(`%c${matchedError.title}`, styles.info);
            matchedError.help.forEach(h => console.log(`  ${h}`));
        }
    }

    /**
     * 🏗️ Validation de la structure
     */
    function validateStructure(data, fileName) {
        const errors = [];
        const warnings = [];

        // Détection du type de fichier
        const isLesson = fileName.includes('lessons/') || data.title;
        const isChapter = data.class && data.chapter && !isLesson;

        if (isLesson) {
            // Validation d'une leçon
            if (!data.title) errors.push('Champ "title" manquant dans la leçon');
            if (!data.sections || !Array.isArray(data.sections)) {
                errors.push('Champ "sections" manquant ou invalide');
            } else {
                data.sections.forEach((section, i) => {
                    if (!section.title) {
                        errors.push(`Section ${i + 1}: "title" manquant`);
                    }
                    if (section.subsections && Array.isArray(section.subsections)) {
                        section.subsections.forEach((sub, j) => {
                            if (!sub.content && !sub.elements) {
                                warnings.push(`Section ${i + 1}, Sous-section ${j + 1}: ni "content" ni "elements" défini`);
                            }
                        });
                    }
                });
            }
        } else if (isChapter) {
            // Validation d'un chapitre
            if (!data.class) errors.push('Champ "class" manquant');
            if (!data.chapter) errors.push('Champ "chapter" manquant');
            if (!data.lessonFile) errors.push('Champ "lessonFile" manquant');

            if (data.exercises && Array.isArray(data.exercises)) {
                data.exercises.forEach((ex, i) => {
                    if (!ex.id) errors.push(`Exercice ${i + 1}: "id" manquant`);
                    if (!ex.title) errors.push(`Exercice ${i + 1}: "title" manquant`);
                    if (!ex.statement) errors.push(`Exercice ${i + 1}: "statement" manquant`);
                    if (!ex.solution) {
                        errors.push(`Exercice ${i + 1} (${ex.title || 'sans titre'}): champ "solution" OBLIGATOIRE manquant`);
                    }
                });
            }

            if (data.quiz && Array.isArray(data.quiz)) {
                data.quiz.forEach((q, i) => {
                    if (!q.id) errors.push(`Quiz ${i + 1}: "id" manquant`);
                    if (!q.question) errors.push(`Quiz ${i + 1}: "question" manquant`);
                    if (!q.options || !Array.isArray(q.options)) {
                        errors.push(`Quiz ${i + 1}: "options" manquant ou invalide`);
                    }
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            type: isLesson ? 'lesson' : isChapter ? 'chapter' : 'unknown'
        };
    }

    /**
     * 📊 Affichage des erreurs de structure
     */
    function displayStructureErrors(result) {
        console.log('\n%c⚠️ ERREURS DE STRUCTURE', styles.error);
        console.log('━'.repeat(80));

        console.log(`%cType détecté: ${result.type}`, styles.info);

        if (result.errors.length > 0) {
            console.log(`\n%c❌ Erreurs (${result.errors.length}):`, styles.error);
            result.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. ${err}`);
            });
        }

        if (result.warnings.length > 0) {
            console.log(`\n%c⚠️ Avertissements (${result.warnings.length}):`, styles.warning);
            result.warnings.forEach((warn, i) => {
                console.log(`  ${i + 1}. ${warn}`);
            });
        }
    }

    /**
     * 🔬 Vérifications avancées
     */
    function advancedChecks(data, fileName) {
        const warnings = [];
        const suggestions = [];
        const stats = {
            totalSize: JSON.stringify(data).length,
            sections: 0,
            exercises: 0,
            quiz: 0
        };

        // Statistiques
        if (data.sections) {
            stats.sections = data.sections.length;
        }
        if (data.exercises) {
            stats.exercises = data.exercises.length;
        }
        if (data.quiz) {
            stats.quiz = data.quiz.length;
        }

        // Vérifications pour les leçons
        if (data.sections) {
            data.sections.forEach((section, i) => {
                // Vérifier les types d'éléments
                if (section.subsections) {
                    section.subsections.forEach((sub, j) => {
                        if (sub.content && Array.isArray(sub.content)) {
                            sub.content.forEach((item, k) => {
                                if (!item.type) {
                                    warnings.push(`Section ${i + 1}, Subsection ${j + 1}, Element ${k + 1}: "type" manquant (definition, property, example, etc.)`);
                                }
                                if (item.type === 'example' && !item.solution) {
                                    suggestions.push(`Section ${i + 1}, Subsection ${j + 1}, Element ${k + 1}: Les exemples devraient avoir une "solution"`);
                                }
                            });
                        }
                    });
                }
            });
        }

        // Vérifications pour les exercices
        if (data.exercises) {
            data.exercises.forEach((ex, i) => {
                // Solution obligatoire
                if (!ex.solution) {
                    warnings.push(`Exercice ${i + 1}: La "solution" est OBLIGATOIRE selon le guide`);
                }

                // Vérifier la longueur de la solution
                if (ex.solution && ex.solution.length < 50) {
                    suggestions.push(`Exercice ${i + 1}: La solution semble très courte (${ex.solution.length} caractères)`);
                }

                // Hint recommandé
                if (!ex.hint || ex.hint.length === 0) {
                    suggestions.push(`Exercice ${i + 1}: Il est recommandé d'ajouter des indices (hint)`);
                }
            });
        }

        // Vérifications pour les quiz
        if (data.quiz) {
            data.quiz.forEach((q, i) => {
                if (q.options) {
                    const correctAnswers = q.options.filter(opt => opt.is_correct);
                    if (correctAnswers.length === 0) {
                        warnings.push(`Quiz ${i + 1}: Aucune option marquée comme correcte`);
                    }
                    if (correctAnswers.length > 1 && q.type !== 'multiple') {
                        warnings.push(`Quiz ${i + 1}: Plusieurs réponses correctes mais type n'est pas "multiple"`);
                    }

                    q.options.forEach((opt, j) => {
                        if (!opt.explanation) {
                            suggestions.push(`Quiz ${i + 1}, Option ${j + 1}: Ajouter une "explanation" améliorerait la pédagogie`);
                        }
                    });
                }
            });
        }

        return {
            warnings: warnings,
            suggestions: suggestions,
            stats: stats
        };
    }

    /**
     * 📈 Affichage des résultats avancés
     */
    function displayAdvancedResults(result) {
        console.log('\n%c📊 ANALYSE AVANCÉE', styles.info);
        console.log('━'.repeat(80));

        // Statistiques
        console.log('%c📈 Statistiques:', styles.info);
        console.log(`  • Taille totale: ${(result.stats.totalSize / 1024).toFixed(2)} KB`);
        if (result.stats.sections > 0) {
            console.log(`  • Sections: ${result.stats.sections}`);
        }
        if (result.stats.exercises > 0) {
            console.log(`  • Exercices: ${result.stats.exercises}`);
        }
        if (result.stats.quiz > 0) {
            console.log(`  • Questions quiz: ${result.stats.quiz}`);
        }

        // Avertissements
        if (result.warnings.length > 0) {
            console.log(`\n%c⚠️ Avertissements (${result.warnings.length}):`, styles.warning);
            result.warnings.forEach((warn, i) => {
                console.log(`  ${i + 1}. ${warn}`);
            });
        }

        // Suggestions
        if (result.suggestions.length > 0) {
            console.log(`\n%c💡 Suggestions (${result.suggestions.length}):`, styles.suggestion);
            result.suggestions.forEach((sug, i) => {
                console.log(`  ${i + 1}. ${sug}`);
            });
        }

        if (result.warnings.length === 0 && result.suggestions.length === 0) {
            console.log('\n%c✨ Aucun problème détecté !', styles.success);
        }
    }

    /**
     * 🛠️ Utilitaire: Comparer deux versions JSON
     */
    window.compareJSON = function(json1, json2) {
        console.log('%c🔄 Comparaison de deux JSONs...', styles.info);

        const diff = findDifferences(json1, json2);

        if (diff.length === 0) {
            console.log('%c✓ Les deux JSONs sont identiques', styles.success);
        } else {
            console.log(`%c⚠️ ${diff.length} différence(s) trouvée(s):`, styles.warning);
            diff.forEach((d, i) => {
                console.log(`\n${i + 1}. ${d.path}`);
                console.log(`   Ancien: ${JSON.stringify(d.old)}`);
                console.log(`   Nouveau: ${JSON.stringify(d.new)}`);
            });
        }
    };

    function findDifferences(obj1, obj2, path = '') {
        const differences = [];

        const keys1 = Object.keys(obj1 || {});
        const keys2 = Object.keys(obj2 || {});
        const allKeys = new Set([...keys1, ...keys2]);

        allKeys.forEach(key => {
            const newPath = path ? `${path}.${key}` : key;
            const val1 = obj1?.[key];
            const val2 = obj2?.[key];

            if (val1 === undefined) {
                differences.push({ path: newPath, old: undefined, new: val2, type: 'added' });
            } else if (val2 === undefined) {
                differences.push({ path: newPath, old: val1, new: undefined, type: 'removed' });
            } else if (typeof val1 === 'object' && typeof val2 === 'object') {
                differences.push(...findDifferences(val1, val2, newPath));
            } else if (val1 !== val2) {
                differences.push({ path: newPath, old: val1, new: val2, type: 'modified' });
            }
        });

        return differences;
    }

    /**
     * 📋 Afficher l'aide
     */
    window.debugJSONHelp = function() {
        console.log('%c🔍 JSON Debug Tool - Guide d\'utilisation', styles.info);
        console.log('━'.repeat(80));
        console.log('\n%cFonctions disponibles:', styles.info);
        console.log('');
        console.log('%c1. debugJSON(filePath)', styles.code);
        console.log('   Charge et analyse un fichier JSON depuis le serveur');
        console.log('   Exemple: await debugJSON("/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json")');
        console.log('');
        console.log('%c2. debugJSONContent(jsonString)', styles.code);
        console.log('   Analyse une chaîne JSON directement');
        console.log('   Exemple: debugJSONContent(\'{"test": "value"}\')');
        console.log('');
        console.log('%c3. compareJSON(json1, json2)', styles.code);
        console.log('   Compare deux objets JSON et affiche les différences');
        console.log('');
        console.log('%c4. debugJSONHelp()', styles.code);
        console.log('   Affiche cette aide');
        console.log('\n' + '━'.repeat(80));
    };

    // Message d'initialisation
    console.log('%c🔍 JSON Debug Tool chargé avec succès!', styles.success);
    console.log('%cTapez debugJSONHelp() pour voir les commandes disponibles', styles.info);

})();
