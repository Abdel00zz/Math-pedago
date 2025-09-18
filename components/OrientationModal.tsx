import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MathJax } from 'better-react-mathjax';

interface OrientationModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
}

interface Chapter {
    id: number;
    title: string;
    contents: string[];
    capacities: string[];
}

const OrientationModal: React.FC<OrientationModalProps> = ({ isOpen, onClose, classId }) => {
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [showChapterList, setShowChapterList] = useState(true);

    // Réinitialiser l'état quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            setSelectedChapter(null);
            setShowChapterList(true);
        }
    }, [isOpen]);

    const getChaptersForClass = (classId: string): Chapter[] => {
        switch (classId) {
            case '1bsm':
                return [
                    {
                        id: 1,
                        title: 'Notions de logique',
                        contents: [
                            'Propositions; opérations sur les propositions; fonctions propositionnelles.',
                            'Les quantificateurs; les propositions quantifiées; les lois logiques.',
                            'Les raisonnements mathématiques: raisonnement par l\'absurde; raisonnement par contraposée; raisonnement par disjonction des cas; raisonnement par équivalence; raisonnement par récurrence.'
                        ],
                        capacities: [
                            'Transformer un énoncé mathématique en écriture symbolique en utilisant les connecteurs et les quantificateurs logiques et inversement.',
                            'Utiliser le type de raisonnement convenable selon la situation étudiée.',
                            'Rédiger des raisonnements et des démonstrations mathématiques claires et logiquement correctes.'
                        ]
                    },
                    {
                        id: 2,
                        title: 'Les ensembles',
                        contents: [
                            'Définition d\'un ensemble par compréhension et par extension, partie d\'un ensemble.',
                            'Ensemble des parties d\'un ensemble; la notation $\\displaystyle P(E)$.',
                            'Inclusion; égalité; complémentaire.',
                            'Intersection, réunion et différence de deux ensembles, lois de Morgan.',
                            'Propriétés de l\'intersection et de la réunion.',
                            'Produit cartésien de deux ensembles.'
                        ],
                        capacities: [
                            'Déterminer un ensemble par compréhension ou par extension.',
                            'Maîtriser la relation entre les règles de la logique et les opérations sur les ensembles.'
                        ]
                    },
                    {
                        id: 3,
                        title: 'Les applications',
                        contents: [
                            'Égalité de deux applications.',
                            'Image et image réciproque d\'une partie par une application.',
                            'Application injective, surjective, bijective; application réciproque d\'une bijection.',
                            'Composée de deux applications.',
                            'Restriction et prolongement d\'une application.'
                        ],
                        capacities: [
                            'Déterminer l\'image et l\'image réciproque d\'un ensemble par une application.',
                            'Déterminer la bijection et la bijection réciproque d\'une application.',
                            'Déterminer la composée de deux applications et la décomposition d\'une application.'
                        ]
                    },
                    {
                        id: 4,
                        title: 'Généralités sur les fonctions numériques',
                        contents: [
                            'Fonction majorée, minorée, bornée, périodique.',
                            'Comparaison de deux fonctions, interprétation géométrique.',
                            'Extrémums d\'une fonction numérique.',
                            'Monotonie d\'une fonction numérique.',
                            'Composée de deux fonctions numériques; monotonie de la composée.'
                        ],
                        capacities: [
                            'Comparer deux expressions en utilisant différentes techniques.',
                            'Déduire les variations, les extrémums ou le signe d\'une fonction à partir de sa représentation.',
                            'Déterminer les variations des fonctions $\\displaystyle f+\\lambda$ et $\\displaystyle \\lambda f$ à partir des variations de $\\displaystyle f$.',
                            'Discuter les solutions d\'une équation de type $\\displaystyle f(x)=c$ et $\\displaystyle f(x)=g(x)$ graphiquement.',
                            'Étudier des équations et inéquations en utilisant les fonctions.'
                        ]
                    },
                    {
                        id: 5,
                        title: 'Généralités sur les suites numériques',
                        contents: [
                            'Suites numériques; suites récurrentes.',
                            'Suites majorées, suites minorées, suites bornées.',
                            'Monotonie d\'une suite.',
                            'Suites arithmétiques; suites géométriques.'
                        ],
                        capacities: [
                            'Utiliser le raisonnement par récurrence.',
                            'Étudier une suite numérique (majoration, minoration, monotonie).',
                            'Reconnaître une suite arithmétique ou géométrique.',
                            'Calculer la somme de $n$ termes consécutifs d\'une suite arithmétique ou géométrique.',
                            'Utiliser une suite arithmétique ou géométrique pour résoudre des problèmes.'
                        ]
                    },
                    {
                        id: 6,
                        title: 'Le barycentre dans le plan',
                        contents: [
                            'Barycentre de $n$ points $(2 \\le n \\le 4)$; centre de gravité.',
                            'Propriété caractéristique du barycentre; invariance; associativité.',
                            'Coordonnées du barycentre dans un repère donné.'
                        ],
                        capacities: [
                            'Utiliser le barycentre pour simplifier une expression vectorielle.',
                            'Utiliser le barycentre pour établir l\'alignement de trois points d\'un plan.',
                            'Utiliser le barycentre pour établir l\'intersection de droites.',
                            'Construire le barycentre de $n$ points $(2 \\le n \\le 4)$.',
                            'Utiliser le barycentre pour résoudre des problèmes et pour déterminer des lieux géométriques.'
                        ]
                    },
                    {
                        id: 7,
                        title: 'Analytique du produit scalaire et applications',
                        contents: [
                            'Expression analytique du produit scalaire dans un repère orthonormé.',
                            'Expression analytique de la norme d\'un vecteur et de la distance de deux points.',
                            'Expression de $\\cos \\theta$ et de $\\sin \\theta$.',
                            'Inégalité de Cauchy-Schwartz et inégalité triangulaire.',
                            'La droite dans le plan: Vecteur normal, Équation cartésienne, Distance d\'un point à une droite.',
                            'Le cercle: Équation cartésienne, Représentation paramétrique, Étude de $x^2 + y^2 + ax + by + c = 0$, Position relative d\'un cercle et d\'une droite.'
                        ],
                        capacities: [
                            'Exprimer le parallélisme et l\'orthogonalité de deux droites.',
                            'Utiliser le produit scalaire pour calculer des distances, des aires et des mesures d\'angles.',
                            'Reconnaître l\'ensemble des points M du plan vérifiant $\\vec{MA} \\cdot \\vec{MB} = 0$.',
                            'Déterminer le centre et le rayon d\'un cercle défini par une équation cartésienne.',
                            'Passer d\'une équation cartésienne à une représentation paramétrique et inversement.',
                            'Utiliser l\'analytique du produit scalaire pour résoudre des problèmes géométriques.'
                        ]
                    },
                    {
                        id: 8,
                        title: 'Trigonométrie',
                        contents: [
                            'Formules de transformation.',
                            'Transformation de l\'expression: $\\displaystyle a \\cos x + b \\sin x$.'
                        ],
                        capacities: [
                            'Maîtriser les différentes formules de transformation.',
                            'Résoudre les équations et les inéquations trigonométriques.',
                            'Représenter et lire les solutions sur le cercle trigonométrique.'
                        ]
                    },
                    {
                        id: 9,
                        title: 'La rotation dans le plan',
                        contents: [
                            'Définition, rotation réciproque, décomposition en deux symétries axiales.',
                            'Propriétés: Conservation de la distance, des angles orientés, du barycentre, etc.',
                            'Image par une rotation d\'une droite, d\'un segment, d\'un cercle.',
                            'Composée de deux rotations.'
                        ],
                        capacities: [
                            'Utiliser une rotation dans une situation géométrique.',
                            'Construire les images de figures usuelles par une rotation.',
                            'Reconnaître une rotation pour résoudre des problèmes géométriques.',
                            'Reconnaître des figures isométriques en utilisant une rotation.'
                        ]
                    },
                    {
                        id: 10,
                        title: 'Limite d\'une fonction numérique',
                        contents: [
                            'Limite finie/infinie en un point; limite finie/infinie en $\\pm\\infty$.',
                            'Limite à gauche, limite à droite; opérations sur les limites.',
                            'Limites de fonctions polynômes, rationnelles et de la forme $\\sqrt{f}$.',
                            'Limites usuelles: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$, $\\lim_{x \\to 0} \\frac{\\tan x}{x}$, $\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2}$.',
                            'Limites et ordre.'
                        ],
                        capacities: [
                            'Calculer les limites de fonctions polynômes, rationnelles et irrationnelles.',
                            'Calculer les limites de fonctions trigonométriques en utilisant les limites usuelles.',
                            'Résoudre des inéquations de type $|f(x)-l| \\le u(x)$ ou $f(x) > A$ dans des cas simples.'
                        ]
                    },
                    {
                        id: 11,
                        title: 'Dérivation',
                        contents: [
                            'Dérivabilité en un point, nombre dérivé, interprétation géométrique, approximation affine.',
                            'Dérivée à droite, à gauche; demi-tangentes, point anguleux.',
                            'Fonction dérivée, dérivées successives.',
                            'Opérations: $f+g$, $\\lambda f$, $f \\times g$, $1/f$, $f/g$, $f^n$, $\\sqrt{f}$, $f(ax+b)$.',
                            'Équation différentielle: $y\'\' + \\omega^2 y = 0$.'
                        ],
                        capacities: [
                            'Reconnaître le nombre dérivé comme coefficient directeur de la tangente.',
                            'Maîtriser les techniques de calcul de dérivées.',
                            'Déterminer l\'équation de la tangente et la construire.',
                            'Déterminer la monotonie d\'une fonction avec le signe de sa dérivée.',
                            'Résoudre des problèmes d\'optimisation (minimum/maximum).',
                            'Appliquer la dérivation au calcul de limites.'
                        ]
                    },
                    {
                        id: 12,
                        title: 'Représentation graphique d’une fonction numérique',
                        contents: [
                            'Branches infinies; droites asymptotes; directions asymptotiques.',
                            'Point d’inflexion; concavité de la courbe d’une fonction.',
                            'Éléments de symétrie de la courbe d’une fonction.'
                        ],
                        capacities: [
                            'Résoudre graphiquement des équations et des inéquations.',
                            'Utiliser la périodicité et les symétries pour réduire le domaine d’étude.',
                            'Utiliser le signe de la dérivée seconde pour étudier la concavité et les points d’inflexion.',
                            'Étudier et représenter des fonctions polynômes, rationnelles et irrationnelles.',
                            'Étudier et représenter des fonctions trigonométriques simples.'
                        ]
                    },
                    {
                        id: 13,
                        title: 'Dénombrement',
                        contents: [
                            'Cardinal d\'un ensemble fini, principe général du dénombrement.',
                            'Cardinal de $P(E)$, de la réunion et de l\'intersection.',
                            'Arrangements $(A_n^p)$, permutations $(n!)$, combinaisons $(C_n^p)$.',
                            'Propriétés des $C_n^p$ et formule du binôme.'
                        ],
                        capacities: [
                            'Utiliser l\'arbre des choix dans des situations combinatoires.',
                            'Utiliser le modèle combinatoire adéquat (arrangement, permutation, combinaison).',
                            'Application du dénombrement dans la résolution de problèmes variés.'
                        ]
                    },
                    {
                        id: 14,
                        title: 'Arithmétique dans $\\mathbb{Z}$',
                        contents: [
                            'La division euclidienne et ses propriétés.',
                            'Les nombres premiers; la décomposition en produit de facteurs premiers.',
                            'PPCM $(a \\vee b)$; PGCD $(a \\wedge b)$; Algorithme d\'Euclide.',
                            'Congruence modulo $n$; l\'ensemble $\\mathbb{Z}/n\\mathbb{Z}$ et opérations.'
                        ],
                        capacities: [
                            'Appliquer l\'algorithme d\'Euclide pour la détermination du PGCD.',
                            'Reconnaître l\'ensemble $\\mathbb{Z}/n\\mathbb{Z}$ et les règles de calcul modulo $n$.',
                            'Utiliser la congruence modulo $n$ dans l\'étude de la divisibilité.'
                        ]
                    },
                    {
                        id: 15,
                        title: 'Géométrie dans l\'espace',
                        contents: [
                            'Calcul vectoriel, vecteurs colinéaires et coplanaires.',
                            'Coordonnées d\'un point et d\'un vecteur. Déterminant de trois vecteurs.',
                            'Représentation paramétrique et équation cartésienne d\'une droite et d\'un plan.',
                            'Positions relatives de droites et de plans.',
                            'Produit scalaire dans $V_3$: Définition, propriétés, orthogonalité.',
                            'Expression analytique du produit scalaire, norme, distance.'
                        ],
                        capacities: [
                            'Maîtriser le calcul vectoriel dans l\'espace.',
                            'Reconnaître et exprimer la colinéarité et la coplanarité.',
                            'Exprimer les notions de la géométrie à l\'aide des coordonnées.',
                            'Choisir la représentation convenable (cartésienne ou paramétrique).',
                            'Utiliser le produit scalaire pour exprimer et montrer l\'orthogonalité.'
                        ]
                    },
                    {
                        id: 16,
                        title: 'Produit scalaire dans l\'espace: applications',
                        contents: [
                            'Détermination de l\'ensemble $\\{M \\in P / \\vec{u} \\cdot \\vec{AM} = k\\}$.',
                            'Vecteur normal à un plan et équation cartésienne d\'un plan.',
                            'Distance d\'un point à un plan.',
                            'Étude analytique de la sphère: $x^2+y^2+z^2+ax+by+cz+d=0$.',
                            'Intersection d\'une sphère avec un plan ou une droite.'
                        ],
                        capacities: [
                            'Déterminer un plan défini par un point et un vecteur normal.',
                            'Déterminer la droite orthogonale à un plan.',
                            'Déterminer l\'équation d\'une sphère (centre et rayon).',
                            'Reconnaître l\'ensemble de points $\\{ M \\text{ de l\'espace } / \\vec{MA} \\cdot \\vec{MB} = 0 \\}$.'
                        ]
                    },
                    {
                        id: 17,
                        title: 'Produit vectoriel',
                        contents: [
                            'Orientation de l\'espace; trièdre; repère et base orientés.',
                            'Définition géométrique du produit vectoriel et interprétation de sa norme.',
                            'Propriétés: antisymétrie; bilinéarité.',
                            'Coordonnées du produit vectoriel dans une base orthonormée directe.',
                            'Distance d\'un point à une droite.'
                        ],
                        capacities: [
                            'Calculer l\'aire d\'un triangle en utilisant le produit vectoriel.',
                            'Déterminer une équation d\'un plan défini par trois points non alignés.',
                            'Appliquer le produit vectoriel dans la résolution de problèmes géométriques.'
                        ]
                    }
                ];
            case '1bse':
                return [];
            case '2bse':
                return [];
            case '2bsm':
                return [];
            case '2beco':
                return [];
            case 'tcs':
                return [];
            default:
                return [];
        }
    };

    const chapters = getChaptersForClass(classId);

    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setShowChapterList(false);
    };

    const handleBackToList = () => {
        setSelectedChapter(null);
        setShowChapterList(true);
    };

    const renderMathContent = (text: string) => {
        return <MathJax dynamic>{text}</MathJax>;
    };

    // Fonction pour déterminer la couleur selon le domaine du chapitre
    const getChapterDomainColor = (title: string) => {
        const titleLower = title.toLowerCase();
        
        // Géométrie
        if (titleLower.includes('barycentre') || titleLower.includes('géométrie') || 
            titleLower.includes('rotation') || titleLower.includes('produit vectoriel') ||
            titleLower.includes('produit scalaire') || titleLower.includes('vecteurs')) {
            return {
                bg: 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80',
                hover: 'hover:from-emerald-200/90 hover:to-teal-200/90',
                border: 'border-emerald-200/60 hover:border-emerald-300/80',
                icon: 'from-emerald-400 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-600'
            };
        }
        
        // Analyse
        if (titleLower.includes('fonction') || titleLower.includes('limite') ||
            titleLower.includes('continuité') || titleLower.includes('dérivée') ||
            titleLower.includes('trigonométrie') || titleLower.includes('logarithme') ||
            titleLower.includes('exponentielle') || titleLower.includes('suites')) {
            return {
                bg: 'bg-gradient-to-br from-blue-100/80 to-indigo-100/80',
                hover: 'hover:from-blue-200/90 hover:to-indigo-200/90',
                border: 'border-blue-200/60 hover:border-blue-300/80',
                icon: 'from-blue-400 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-600'
            };
        }
        
        // Algèbre
        if (titleLower.includes('logique') || titleLower.includes('dénombrement') ||
            titleLower.includes('arithmétique') || titleLower.includes('congruence') ||
            titleLower.includes('ensembles')) {
            return {
                bg: 'bg-gradient-to-br from-rose-100/80 to-pink-100/80',
                hover: 'hover:from-rose-200/90 hover:to-pink-200/90',
                border: 'border-rose-200/60 hover:border-rose-300/80',
                icon: 'from-rose-400 to-pink-500 group-hover:from-rose-500 group-hover:to-pink-600'
            };
        }
        
        // Couleur par défaut
        return {
            bg: 'bg-gradient-to-br from-slate-100/80 to-gray-100/80',
            hover: 'hover:from-slate-200/90 hover:to-gray-200/90',
            border: 'border-slate-200/60 hover:border-slate-300/80',
            icon: 'from-slate-400 to-gray-500 group-hover:from-slate-500 group-hover:to-gray-600'
        };
    };

    const renderChapterList = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 pb-4">
                <h2 className="text-3xl font-bold text-slate-700 mb-2 text-center font-['Fira_Sans',sans-serif]">
                    Programme de Mathématiques
                </h2>
                <p className="text-slate-500 text-sm text-center">
                    {chapters.length} chapitres disponibles
                </p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-4 sm:pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {chapters.map((chapter, index) => {
                        const colors = getChapterDomainColor(chapter.title);
                        
                        return (
                            <button
                                key={chapter.id}
                                onClick={() => handleChapterSelect(chapter)}
                                title={`Chapitre ${chapter.id}: ${chapter.title}\n${chapter.contents.length} contenus • ${chapter.capacities.length} capacités`}
                                className={`group relative ${colors.bg} ${colors.hover} border ${colors.border} rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-lg flex items-center text-left h-auto font-['Fira_Sans',sans-serif] touch-manipulation active:scale-95`}
                            >
                                <div className="flex items-center w-full gap-3 sm:gap-4">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${colors.icon} text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        {chapter.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight truncate">
                                            <MathJax dynamic>
                                                {renderMathContent(chapter.title)}
                                            </MathJax>
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1 hidden sm:block">{chapter.contents.length} contenus • {chapter.capacities.length} capacités</p>
                                        <p className="text-xs text-gray-600 mt-1 sm:hidden">{chapter.contents.length}c • {chapter.capacities.length}cap</p>
                                    </div>
                                </div>

                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderChapterDetail = () => {
        if (!selectedChapter) return null;

        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 p-4 pb-4">
                    <button
                        onClick={handleBackToList}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-600 hover:text-slate-800 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md border-0 focus:outline-none"
                        title="Retour à la liste des chapitres"
                        aria-label="Retour"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-700 text-center font-['Fira_Sans',sans-serif] chapter-title">
                            Chapitre {selectedChapter.id}: {selectedChapter.title}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-4 sm:pb-8">
                    <div className="space-y-8">
                        {/* Section Contenus */}
                        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border-2 border-slate-300/80 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-semibold text-slate-800 mb-6 font-sans">
                                Contenus
                            </h3>
                            <ul className="space-y-4">
                                {selectedChapter.contents.map((content, index) => (
                                    <li key={index} className="flex items-start gap-4 text-slate-600">
                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full mt-1 flex-shrink-0 shadow-sm">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1 leading-relaxed text-slate-800 font-sans font-medium">
                                            {renderMathContent(content)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section Capacités attendues */}
                        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border-2 border-slate-300/80 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-semibold text-slate-800 mb-6 font-sans">
                                Capacités attendues
                            </h3>
                            <ul className="space-y-4">
                                {selectedChapter.capacities.map((capacity, index) => (
                                    <li key={index} className="flex items-start gap-4 text-slate-600">
                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-full mt-1 flex-shrink-0 shadow-sm">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1 leading-relaxed text-slate-800 font-sans font-medium">
                                            {renderMathContent(capacity)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Gestion de la touche Escape
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="orientation-modal-title"
        >
            {/* Overlay avec animation */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300 ease-out animate-in fade-in" 
                aria-hidden="true"
            ></div>
            
            {/* Conteneur du modal avec animation */}
            <div 
                className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl sm:rounded-3xl w-full max-w-[98vw] sm:max-w-[95vw] h-[98vh] sm:h-[95vh] overflow-hidden shadow-2xl border border-slate-200/50 transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 zoom-in-95"
                onClick={e => e.stopPropagation()}
                style={{ 
                    fontFamily: 'Inter, Poppins, system-ui, sans-serif'
                }}
            >
                {/* Bouton de fermeture optimisé */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-20 p-3 text-slate-400 hover:text-slate-600 transition-all duration-200 focus:outline-none touch-manipulation"
                    aria-label="Fermer le modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {showChapterList ? renderChapterList() : renderChapterDetail()}
            </div>
        </div>,
        document.body
    );
};

export default OrientationModal;