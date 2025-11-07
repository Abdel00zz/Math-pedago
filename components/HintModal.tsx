import React from 'react';
import Modal from './Modal';
import { Exercise, SubQuestion } from '../types';
import MathContent from './MathContent';

interface HintModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: Exercise | null | undefined;
}

// Fonction robuste pour générer la numérotation exacte des questions
const generateExactQuestionNumbers = (exercise: Exercise): string[] => {
    if (!exercise.sub_questions || exercise.sub_questions.length === 0) {
        // Pas de sous-questions -> pas de numérotation
        return [];
    }

    const allQuestionNumbers: string[] = [];
    let questionCounter = 1;

    exercise.sub_questions.forEach((subQ) => {
        if (subQ.sub_sub_questions && subQ.sub_sub_questions.length > 0) {
            // Sous-questions avec lettres (1a, 1b, etc.)
            subQ.sub_sub_questions.forEach((_, subIndex) => {
                const letter = String.fromCharCode(97 + subIndex); // a, b, c, d...
                allQuestionNumbers.push(`${questionCounter}${letter}`);
            });
        } else {
            // Question simple
            allQuestionNumbers.push(questionCounter.toString());
        }
        questionCounter++;
    });

    return allQuestionNumbers;
};

// Fonction pour compter le nombre total de sous-questions
const countTotalSubQuestions = (exercise: Exercise): number => {
    if (!exercise.sub_questions) return 0;
    
    return exercise.sub_questions.reduce((total, subQ) => {
        if (subQ.sub_sub_questions && subQ.sub_sub_questions.length > 0) {
            return total + subQ.sub_sub_questions.length;
        }
        return total + 1;
    }, 0);
};

// Fonction robuste pour mapper les hints aux questions exactes de l'exercice
const getRobustQuestionMapping = (exercise: Exercise): (string | null)[] => {
    if (!exercise.hint || exercise.hint.length === 0) return [];
    
    // Générer la liste complète des numéros de questions disponibles
    const allQuestionNumbers = generateExactQuestionNumbers(exercise);
    const totalQuestions = allQuestionNumbers.length;
    
    // 🎯 CAS SPÉCIAL: Exercice sans sub_questions
    // Dans ce cas, aucun numéro ne doit être affiché
    if (totalQuestions === 0) {
        return exercise.hint.map(() => null);
    }
    
    const result: (string | null)[] = [];
    
    // Analyser chaque hint pour le mapper précisément
    exercise.hint.forEach((hint, hintIndex) => {
        let mappedQuestion: string | null = '';
        
        // 🎯 PRIORITÉ 1: Utiliser le champ questionNumber si présent (liaison explicite)
        if (hint.questionNumber) {
            // Vérifier que le numéro existe dans la structure
            if (allQuestionNumbers.includes(hint.questionNumber)) {
                mappedQuestion = hint.questionNumber;
            } else {
                console.warn(`⚠️ questionNumber "${hint.questionNumber}" non trouvé. Utilisation de la détection automatique.`);
            }
        }
        
        // 🔍 PRIORITÉ 2: Détection automatique si pas de liaison explicite
        if (!mappedQuestion) {
            const text = hint.text.toLowerCase();
            
            // 1. Recherche de correspondances par mots-clés spécifiques et mapping exact
            if (text.includes('dérivée') || text.includes('derivée') || text.includes('quotient') || text.includes('dériver')) {
                const derivativeQuestionIndex = findQuestionByKeywords(exercise, ['calculer', "f'", 'dériver', 'montrer que']);
                mappedQuestion = derivativeQuestionIndex !== -1 ? allQuestionNumbers[derivativeQuestionIndex] : '2b';
                
            } else if (text.includes('signe') || text.includes('variation') || text.includes('tableau') || text.includes('monotonie')) {
                const signQuestionIndex = findQuestionByKeywords(exercise, ['signe', 'variation', 'tableau', 'croissant', 'décroissant', 'dresser']);
                mappedQuestion = signQuestionIndex !== -1 ? allQuestionNumbers[signQuestionIndex] : '2c';
                
            } else if (text.includes('substitution') || text.includes('α') || text.includes('alpha') || text.includes('g(α)')) {
                const alphaQuestionIndex = findQuestionByKeywords(exercise, ['α', 'alpha', 'relation', 'encadrement', 'g(α)', 'g(\\alpha)']);
                if (alphaQuestionIndex !== -1) {
                    mappedQuestion = allQuestionNumbers[alphaQuestionIndex];
                } else {
                    const encadrementIndex = findQuestionByKeywords(exercise, ['encadrement', 'déduire']);
                    mappedQuestion = encadrementIndex !== -1 ? allQuestionNumbers[encadrementIndex] : '2d';
                }
                
            } else if (text.includes('continuité') || text.includes('limite') || text.includes('jonction')) {
                if (hintIndex < totalQuestions) {
                    mappedQuestion = allQuestionNumbers[hintIndex];
                } else {
                    mappedQuestion = (hintIndex + 1).toString();
                }
                
            } else if (text.includes('dichotomie') || text.includes('algorithme')) {
                const dichotomyIndex = findQuestionByKeywords(exercise, ['dichotomie', 'algorithme', 'encadrer']);
                mappedQuestion = dichotomyIndex !== -1 && allQuestionNumbers[dichotomyIndex] ? allQuestionNumbers[dichotomyIndex] : '1c';
                
            } else {
                // Mapping par défaut : utiliser l'ordre séquentiel si disponible
                if (hintIndex < totalQuestions) {
                    mappedQuestion = allQuestionNumbers[hintIndex];
                } else if (totalQuestions > 0) {
                    mappedQuestion = allQuestionNumbers[hintIndex % totalQuestions];
                } else {
                    // Pas de questions : pas de numéro à afficher
                    mappedQuestion = null;
                }
            }
        }
        
        // Sécurité : pour les exercices avec questions
        if (!mappedQuestion && totalQuestions > 0) {
            mappedQuestion = (hintIndex + 1).toString();
        }
        
        result.push(mappedQuestion);
    });
    
    return result;
};

// Fonction utilitaire robuste pour trouver une question par mots-clés
const findQuestionByKeywords = (exercise: Exercise, keywords: string[]): number => {
    if (!exercise.sub_questions) return -1;
    
    let questionIndex = 0;
    const matches: {index: number, score: number, text: string}[] = [];
    
    for (let i = 0; i < exercise.sub_questions.length; i++) {
        const subQ = exercise.sub_questions[i];
        
        if (subQ.sub_sub_questions && subQ.sub_sub_questions.length > 0) {
            for (let j = 0; j < subQ.sub_sub_questions.length; j++) {
                const subSubQ = subQ.sub_sub_questions[j];
                const questionText = subSubQ.text.toLowerCase();
                
                // Calculer un score de correspondance
                let score = 0;
                keywords.forEach(keyword => {
                    const keywordLower = keyword.toLowerCase();
                    if (questionText.includes(keywordLower)) {
                        // Score plus élevé pour correspondance exacte
                        score += keywordLower.length;
                        // Bonus si le mot-clé est au début
                        if (questionText.startsWith(keywordLower)) {
                            score += 10;
                        }
                        // Bonus pour certains mots-clés importants
                        if (['calculer', 'montrer', 'dériver', 'signe', 'tableau'].includes(keywordLower)) {
                            score += 5;
                        }
                    }
                });
                
                if (score > 0) {
                    matches.push({index: questionIndex, score: score, text: questionText});
                }
                questionIndex++;
            }
        } else {
            const questionText = subQ.text.toLowerCase();
            let score = 0;
            keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                if (questionText.includes(keywordLower)) {
                    score += keywordLower.length;
                    if (questionText.startsWith(keywordLower)) {
                        score += 10;
                    }
                }
            });
            
            if (score > 0) {
                matches.push({index: questionIndex, score: score, text: questionText});
            }
            questionIndex++;
        }
    }
    
    // Retourner l'index avec le meilleur score
    if (matches.length > 0) {
        matches.sort((a, b) => b.score - a.score);
        return matches[0].index;
    }
    
    return -1; // Pas trouvé
};

const renderSubQuestions = (subQuestions: SubQuestion[] | undefined) => (
    <ol className="list-decimal pl-6 mt-4 space-y-3 text-gray-900 text-base marker:text-gray-400 marker:font-medium">
        {subQuestions?.map((sq, index) => (
            <li key={index} className="leading-relaxed pl-2">
                <MathContent content={cleanAndWrapTeX(sq.text)} inline={false} />
            </li>
        ))}
    </ol>
);

// Fonction de nettoyage et d'amélioration du texte des hints
const cleanAndWrapTeX = (text: string): string => {
    if (!text) return text;
    
    let processedText = text;
    
    // 1. Nettoyage des artefacts de formatage (backticks)
    processedText = processedText.replace(/`([^`]+)`/g, '$1'); // Supprimer les backticks
    
    // 2. Traitement Markdown (gras et italique) - convertir en HTML
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // **text** -> <strong>
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>'); // *text* -> <em>
    
    // 3. Si le texte contient déjà des délimiteurs mathématiques, le retourner après nettoyage minimal
    if (processedText.includes('$') || processedText.includes('\\(') || processedText.includes('\\[')) {
        // Suppression des références aux questions UNIQUEMENT en dehors des formules mathématiques
        // On protège le contenu entre $ ... $
        const parts: Array<{text: string, isMath: boolean}> = [];
        let inMath = false;
        let currentPart = '';
        
        for (let i = 0; i < processedText.length; i++) {
            if (processedText[i] === '$') {
                if (currentPart) {
                    parts.push({ text: currentPart, isMath: inMath });
                }
                currentPart = '';
                inMath = !inMath;
            } else {
                currentPart += processedText[i];
            }
        }
        if (currentPart) {
            parts.push({ text: currentPart, isMath: inMath });
        }
        
        // Nettoyer uniquement les parties non-mathématiques
        processedText = parts.map((part) => {
            if (part.isMath) {
                return '$' + part.text + '$';
            } else {
                let cleaned = part.text;
                // Suppression des références aux questions
                cleaned = cleaned.replace(/\(Question[s]?\s+\d+[a-z]*\.?[a-z]*\)\s*/gi, '');
                cleaned = cleaned.replace(/Question[s]?\s+\d+[a-z]*\.?\s*[:\-]?\s*/gi, '');
                cleaned = cleaned.replace(/Pour\s+la\s+question[s]?\s+\d+[a-z]*\.?\s*/gi, '');
                cleaned = cleaned.replace(/Pour\s+\d+[a-z]*[\)\.]\s*/gi, '');
                // Nettoyer les références de style "2a) :" ou "1. " mais PAS dans les formules
                cleaned = cleaned.replace(/^\s*\d+[a-z]*[\)\.]\s*[:\-]?\s*/gm, '');
                cleaned = cleaned.replace(/^\s*[:\-]\s*/gm, '');
                return cleaned;
            }
        }).join('');
        
        return processedText;
    }

    // 4. Si pas de math, suppression des références
    processedText = processedText.replace(/\(Question[s]?\s+\d+[a-z]*\.?[a-z]*\)\s*/gi, '');
    processedText = processedText.replace(/Question[s]?\s+\d+[a-z]*\.?\s*[:\-]?\s*/gi, '');
    processedText = processedText.replace(/Pour\s+la\s+question[s]?\s+\d+[a-z]*\.?\s*/gi, '');
    processedText = processedText.replace(/Pour\s+\d+[a-z]*[\)\.]\s*/gi, '');
    processedText = processedText.replace(/\d+[a-z]*[\)\.]\s*[:\-]?\s*/g, '');
    processedText = processedText.replace(/^\s*[:\-]\s*/gm, '');

    // 5. Traitement intelligent avec \displaystyle pour le texte sans délimiteurs
    const displayStylePatterns = [
        /\\frac\{[^}]*\}\{[^}]*\}/g,  // Fractions
        /\\lim_\{[^}]*\}/g,           // Limites
        /\\sum_\{[^}]*\}/g,           // Sommes
        /\\int_\{[^}]*\}/g,           // Intégrales
        /\\sqrt\[[^\]]*\]\{[^}]*\}/g, // Racines n-ièmes
        /\\displaystyle/g             // Déjà présent
    ];
    
    // Vérifier si le texte contient des expressions nécessitant \displaystyle
    const needsDisplayStyle = displayStylePatterns.some(pattern => pattern.test(processedText));
    
    // Remplacer les commandes TeX
    processedText = processedText.replace(/\\([a-zA-Z]+(?:\{[^}]*\})?)/g, (match) => {
        if (needsDisplayStyle && !processedText.includes('\\displaystyle')) {
            return `$\\displaystyle ${match}$`;
        }
        return `$${match}$`;
    });

    return processedText;
};

// Alias pour compatibilité
const autoWrapTeX = cleanAndWrapTeX;

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise || !exercise.hint || exercise.hint.length === 0) {
        return null;
    }

    // Génération robuste du mapping questions-indices
    const questionNumbers = getRobustQuestionMapping(exercise);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Indices"
            className="sm:max-w-3xl bg-white text-gray-900 max-h-[85vh] overflow-y-auto"
            hideHeaderBorder={true}
        >
            <div className="px-4 sm:px-8 py-6 space-y-8">
                {exercise.hint.map((hint, index) => {
                    const questionNumber = questionNumbers[index];
                    const hasQuestionNumber = questionNumber !== null && questionNumber !== undefined;
                    
                    return (
                        <div key={index} className="relative pl-12">
                            {/* Numéro de question - position absolue à gauche */}
                            {hasQuestionNumber && (
                                <div className="absolute left-0 top-0">
                                    <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                                        {questionNumber}
                                    </div>
                                </div>
                            )}
                            
                            {/* Contenu de l'indice */}
                            <div className="text-gray-900 text-base leading-relaxed border-l-2 border-gray-200 pl-6">
                                <MathContent content={cleanAndWrapTeX(hint.text)} inline={false} />
                                {hint.sub_questions && renderSubQuestions(hint.sub_questions)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default HintModal;