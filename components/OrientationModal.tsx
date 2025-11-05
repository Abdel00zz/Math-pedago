import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import MathContent from './MathContent';
import { CLASS_OPTIONS } from '../constants';

interface OrientationModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
}

interface Chapter {
    id: number;
    title: string;
    section: 'Géométrie' | 'Algèbre' | 'Analyse';
    contents: string[];
    capacities: string[];
}

const SECTION_DESCRIPTIONS: Record<Chapter['section'], string> = {
    Algèbre: 'Structures et langage mathématique pour poser des fondations solides et raisonner avec rigueur.',
    Analyse: 'Fonctions, limites et dérivation pour modéliser des phénomènes et anticiper leurs variations.',
    Géométrie: 'Visualisation dans le plan et l’espace pour manipuler vecteurs, transformations et repères.'
};

const GUIDANCE_CARDS: Array<{ icon: string; title: string; description: string; tips: string[] }> = [
    {
        icon: 'explore',
        title: 'Tracer ton parcours',
        description: 'Repère les chapitres clés et organise ton étude en séquences digestes et ciblées.',
        tips: [
            'Commence par un chapitre court pour te mettre en confiance.',
            'Sélectionne ensuite un thème plus dense à consolider sur la semaine.'
        ]
    },
    {
        icon: 'lightbulb',
        title: 'Activer la compréhension',
        description: 'Construis un carnet de notions et relie chaque nouveau concept à un exercice concret.',
        tips: [
            'Résume chaque partie en deux lignes dans tes mots.',
            'Associe au moins un exemple ou schéma par notion.'
        ]
    },
    {
        icon: 'verified',
        title: 'Valider tes acquis',
        description: 'Alterner quiz, exercices et capsules pour faire émerger les automatismes attendus.',
        tips: [
            'Planifie un quiz court dès qu’un chapitre est terminé.',
            'Retiens deux capacités clés à maîtriser avant de passer au suivant.'
        ]
    }
];

const SECTION_ORDER: Chapter['section'][] = ['Algèbre', 'Analyse', 'Géométrie'];

const getChaptersForClass = (classId: string): Chapter[] => {
    switch (classId) {
        case '1bsm':
            return [
                // Géométrie
                {
                    id: 1, section: 'Géométrie', title: 'Le barycentre dans le plan',
                    contents: [
                        'Barycentre de n points ($\\displaystyle 2 \\le n \\le 4$) ; centre de gravité ;',
                        'Propriété caractéristique du barycentre; invariance; associativité ;',
                        'Coordonnées du barycentre dans un repère donné.'
                    ],
                    capacities: [
                        'Utiliser le barycentre pour simplifier une expression vectorielle ;',
                        'Utiliser le barycentre pour établir l\'alignement de trois points d\'un plan ;',
                        'Utiliser le barycentre pour établir l\'intersection de droites ;',
                        'Construire le barycentre de n points ($\\displaystyle 2 \\le n \\le 4$);',
                        'Utiliser le barycentre pour résoudre des problèmes et pour déterminer des lieux géométriques.'
                    ]
                },
                {
                    id: 2, section: 'Géométrie', title: 'Analytique du produit scalaire et applications',
                    contents: [
                        'Expression analytique du produit scalaire dans un repère orthonormé ;',
                        'Expression analytique de la norme d\'un vecteur et de la distance de deux points.',
                        'Expression de $\\displaystyle \\cos \\theta$ et expression de $\\displaystyle \\sin \\theta$;',
                        'Inégalité de Cauchy-Schwartz et inégalité triangulaire.',
                        'La droite dans le plan (Etude analytique)',
                        'Le cercle (Etude analytique) : Équation cartésienne, représentation paramétrique, étude de l\'ensemble $\\displaystyle \\{M(x,y) \\mid x^2+y^2 + ax + by +c = 0\\}$',
                        'Etude de la position relative d\'un cercle et d\'une droite ;',
                        'Equation cartésienne d\'une droite tangente à un cercle en un point donné de ce cercle.'
                    ],
                    capacities: [
                        'Exprimer le parallélisme et l\'orthogonalité de deux droites ;',
                        'Utiliser le produit scalaire pour calculer des distances, des aires et des mesures d\'angles ;',
                        'Reconnaitre l\'ensemble des points M du plan vérifiant la relation : $\\displaystyle \\vec{MA} \\cdot \\vec{MB} = 0$',
                        'Déterminer le centre et le rayon d\'un cercle défini à l\'aide d\'une équation cartésienne ;',
                        'Passer d\'une équation cartésienne à une représentation paramétrique et inversement;',
                        'Utiliser l\'analytique du produit scalaire pour résoudre des problèmes géométriques et algébriques.'
                    ]
                },
                {
                    id: 3, section: 'Géométrie', title: 'La rotation dans le plan',
                    contents: [
                        'Définition d\'une rotation; la rotation réciproque ; décomposition comme composée de deux symétries axiales ;',
                        'Propriétés : Conservation de la distance, de la mesure des angles orientés, du barycentre, de l\'équipollence, du parallélisme et de l\'orthogonalité ;',
                        'Image par une rotation d\'une droite, d\'un segment, d\'un cercle, d\'un angle et de l\'intersection de deux figures géométriques ;',
                        'Composée de deux rotations.'
                    ],
                    capacities: [
                        'Utiliser une rotation donnée dans une situation géométrique ;',
                        'Construire les images de figures usuelles par une rotation donnée ;',
                        'Reconnaitre une rotation et l\'utiliser pour résoudre des problèmes géométriques (déterminer des lieux géométriques, constructions géométriques ...) ;',
                        'Reconnaitre des figures isométriques en utilisant une rotation.'
                    ]
                },
                {
                    id: 4, section: 'Géométrie', title: 'Géométrie dans l\'espace',
                    contents: [
                        'Calcul vectoriel dans l\'espace; Vecteurs colinéaires; définition vectorielle d\'une droite ; Définition vectorielle d\'un plan ; Vecteurs coplanaires.',
                        'Coordonnées d\'un point dans un repère, coordonnées d\'un vecteur dans une base ; coordonnées de $\\vec{u}+\\vec{v}$ et de $\\lambda\\vec{u}$ ; coordonnées de $\\vec{AB}$ ;',
                        'Déterminant de trois vecteurs ;',
                        'Représentation paramétrique d\'une droite ; positions relatives de deux droites ;',
                        'Représentation paramétrique d\'un plan ; Equation cartésienne d\'un plan; positions relatives de deux plans;',
                        'Deux équations cartésiennes d\'une droite ; Positions relatives d\'une droite et d\'un plan.'
                    ],
                    capacities: [
                        'Maitriser les règles du calcul vectoriel dans l\'espace ;',
                        'Reconnaitre et exprimer la colinéarité de deux vecteurs ; Reconnaitre et exprimer la coplanarité de trois vecteurs ;',
                        'Appliquer l\'alignement et la coplanarité pour résoudre des problèmes géométriques.',
                        'Exprimer les notions et les propriétés de la géométrie affine et de la géométrie vectorielle à l\'aide des coordonnées ;',
                        'Choisir la représentation convenable (cartésienne ou paramétrique) pour étudier les positions relatives de droites et de plans et pour interpréter les résultats.'
                    ]
                },
                 {
                    id: 5, section: 'Géométrie', title: 'Produit scalaire dans l\'espace et ses applications',
                    contents: [
                        'Définition; Propriétés: symétrie, bilinéarité; Orthogonalité de deux vecteurs ;',
                        'Repère orthonormé, base orthonormée ;',
                        'Expression analytique du produit scalaire, de la norme d\'un vecteur et de la distance de deux points.',
                        'Détermination analytique de l\'ensemble $\\displaystyle \\{M \\in P \\mid \\vec{u} \\cdot \\vec{AM} = k\\}$;',
                        'Vecteur normal à un plan ; Équation cartésienne d\'un plan défini par un point et un vecteur normal à ce plan;',
                        'Distance d\'un point à un plan; Étude analytique de la sphère ;',
                        'Etude de l\'ensemble des points $\\displaystyle M(x,y,z)$ tels que : $\\displaystyle x^2+y^2+z^2+ax+by+cz+d = 0$;',
                        'Intersection d\'une sphère et d\'un plan; plan tangent à une sphère en un point donné; intersection d\'une sphère et d\'une droite.'
                    ],
                    capacities: [
                        'Utiliser le produit scalaire pour exprimer et pour montrer l\'orthogonalité de deux vecteurs ;',
                        'Exprimer vectoriellement et analytiquement l\'orthogonalité de deux vecteurs.',
                        'Déterminer un plan défini par un point et un vecteur normal à ce plan;',
                        'Déterminer la droite passant par un point et orthogonale à un plan ;',
                        'Déterminer une équation cartésienne d\'une sphère définie par son centre et son rayon ;',
                        'Déterminer une représentation paramétrique d\'une sphère ;',
                        'Reconnaitre l\'ensemble des points M de l\'espace tels que : $\\displaystyle \\vec{MA} \\cdot \\vec{MB} = 0$'
                    ]
                },
                {
                    id: 6, section: 'Géométrie', title: 'Produit vectoriel',
                    contents: [
                        'Orientation de l\'espace; trièdre ; repère et base orientés;',
                        'Définition géométrique du produit vectoriel et interprétation de sa norme ;',
                        'Propriétés : antisymétrie ; Bilinéarité ;',
                        'Coordonnées du produit vectoriel de deux vecteurs dans une base orthonormée directe ;',
                        'Distance d\'un point à une droite.'
                    ],
                    capacities: [
                        'Calculer l\'aire d\'un triangle en utilisant le produit vectoriel ;',
                        'Déterminer une équation d\'un plan défini par trois points non alignés ;',
                        'Appliquer le produit vectoriel dans la résolution de problèmes géométriques et physiques.'
                    ]
                },
                // Algèbre
                {
                    id: 7, section: 'Algèbre', title: 'Notions de logique',
                    contents: [
                        'Propositions ; opérations sur les propositions ; fonctions propositionnelles ;',
                        'Les quantificateurs ; les propositions quantifiées ; les lois logiques.',
                        'Les raisonnements mathématiques : raisonnement par l\'absurde; raisonnement par contraposée ; raisonnement par disjonction des cas; raisonnement par équivalence; raisonnement par récurrence.'
                    ],
                    capacities: [
                        'Transformer un énoncé mathématique en écriture symbolique en utilisant les connecteurs et les quantificateurs logiques et inversement ;',
                        'Utiliser le type de raisonnement convenable selon la situation étudiée ;',
                        'Rédiger des raisonnements et des démonstrations mathématiques claires et logiquement correctes.'
                    ]
                },
                {
                    id: 8, section: 'Algèbre', title: 'Les ensembles',
                    contents: [
                        'Définition d\'un ensemble par compréhension et par extension, partie d\'un ensemble ;',
                        'Ensemble des parties d\'un ensemble ; la notation $P(E)$;',
                        'Inclusion; égalité; complémentaire ;',
                        'Intersection, réunion et différence de deux ensembles, lois de Morgan ;',
                        'Propriétés de l\'intersection et de la réunion ;',
                        'Produit cartésien de deux ensembles.'
                    ],
                    capacities: [
                        'Déterminer un ensemble par compréhension ou par extension ;',
                        'Maitriser la relation entre les règles de la logique et les opérations sur les ensembles.'
                    ]
                },
                {
                    id: 9, section: 'Algèbre', title: 'Les applications',
                    contents: [
                        'Egalité de deux applications',
                        'Image et image réciproque d\'une partie par une application;',
                        'Application injective, application surjective; application bijective; application réciproque d\'une bijection;',
                        'Composée de deux applications ;',
                        'Restriction et prolongement d\'une application.'
                    ],
                    capacities: [
                        'Déterminer l\'image et l\'image réciproque d\'un ensemble par une application;',
                        'Déterminer la bijection et la bijection réciproque d\'une application et son utilisation dans la résolution de problèmes ;',
                        'Déterminer la composée de deux applications et la décomposition d\'une application en deux applications en vue d\'explorer ses propriétés.'
                    ]
                },
                {
                    id: 10, section: 'Algèbre', title: 'Arithmétique dans $\\displaystyle \\mathbb{Z}$',
                    contents: [
                        'La division euclidienne et ses propriétés ;',
                        'Les nombres premiers ; la décomposition en produit de facteurs premiers ;',
                        'Le plus petit commun multiple (PPCM ; $\\displaystyle a \\lor b$ ); le plus grand commun diviseur (PGCD ; $\\displaystyle a \\land b$ ) ; propriétés ;',
                        'Algorithme d\'Euclide ;',
                        'Congruence modulo n ; l\'ensemble $\\displaystyle \\mathbb{Z} / n\\mathbb{Z}$ et opérations.'
                    ],
                    capacities: [
                        'Appliquer l\'algorithme d\'Euclide pour la détermination du PGCD de deux nombres entiers ;',
                        'Reconnaitre l\'ensemble $\\displaystyle \\mathbb{Z}/n\\mathbb{Z}$ et les règles de calcul modulo n ;',
                        'Utiliser la congruence modulo n dans l\'étude de la divisibilité et inversement.'
                    ]
                },
                {
                    id: 11, section: 'Algèbre', title: 'Dénombrement',
                    contents: [
                        'Ensemble fini; cardinal d\'un ensemble fini: la notation card;',
                        'Principe général du dénombrement, cardinal du produit cartésien;',
                        'Cardinal de l\'ensemble des applications d\'un ensemble fini vers un autre ensemble fini ;',
                        'Cardinal de l\'ensemble des parties d\'un ensemble fini;',
                        'Cardinal de la réunion et de l\'intersection de deux ensembles finis ;',
                        'Nombre d\'arrangements; la notation $\\displaystyle A_n^p$;',
                        'Nombre de permutations ; la notation $\\displaystyle n!$;',
                        'Nombre de combinaisons ; la notation $\\displaystyle C_n^p$;',
                        'Propriétés des nombres $\\displaystyle C_n^p$',
                        'Formule du binôme.'
                    ],
                    capacities: [
                        'Utiliser l\'arbre des choix dans des situations combinatoires;',
                        'Utiliser le modèle combinatoire (ou de dénombrement) adéquat à la situation étudiée;',
                        'Application du dénombrement dans la résolution de problèmes variés.'
                    ]
                },
                // Analyse
                {
                    id: 12, section: 'Analyse', title: 'Généralités sur les fonctions numériques',
                    contents: [
                        'Fonction majorée ; fonction minorée ; fonctions bornée ; fonction périodique ;',
                        'Comparaison de deux fonctions, interprétation géométrique ;',
                        'Extrémums d\'une fonction numérique ;',
                        'Monotonie d\'une fonction numérique ;',
                        'Composée de deux fonctions numériques;',
                        'Monotonie de la composée de deux fonctions numériques monotones ;',
                        'Représentation graphique des fonctions : $\\displaystyle x \\mapsto \\sqrt{x+a}$, $\\displaystyle x \\mapsto ax^3$ et $\\displaystyle x \\mapsto E(x)$.'
                    ],
                    capacities: [
                        'Comparer deux expressions en utilisant différentes techniques ;',
                        'Déduire les variations ou les extrémums ou le signe d\'une fonction à partir de sa représentation graphique ou à partir de son tableau de variation ;',
                        'Déterminer les variations des fonctions $\\displaystyle f + \\lambda$ et $\\displaystyle \\lambda f$ à partir des variations de la fonction $\\displaystyle f$ ;',
                        'Discuter les solutions d\'une équation de type $\\displaystyle f(x)=c$ et $\\displaystyle f(x) = g(x)$ à partir de la représentation graphique ;',
                        'Etude d\'équations et d\'inéquations en utilisant et en représentant les fonctions.'
                    ]
                },
                {
                    id: 13, section: 'Analyse', title: 'Généralités sur les suites numériques',
                    contents: [
                        'Suites numériques ; Suites récurrentes ;',
                        'Suites majorées, suites minorées, suites bornées ;',
                        'Monotonie d\'une suite ; Suites arithmétiques ; Suites géométriques.'
                    ],
                    capacities: [
                        'Utiliser le raisonnement par récurrence;',
                        'Etudier une suite numérique (majoration, minoration, monotonie);',
                        'Reconnaitre une suite arithmétique ou géométrique ;',
                        'Calculer la somme de n termes consécutifs d\'une suite arithmétique ou géométrique ;',
                        'Reconnaitre une situation de suite arithmétique ou géométrique ;',
                        'Utiliser une suite arithmétique ou géométrique pour résoudre des problèmes.'
                    ]
                },
                {
                    id: 14, section: 'Analyse', title: 'Trigonométrie',
                    contents: [
                        'Formules de transformation ; Transformation de l\'expression : $\\displaystyle a \\cos x + b \\sin x$.'
                    ],
                    capacities: [
                        'Maitriser les différentes formules de transformation ;',
                        'Résoudre les équations et les inéquations trigonométriques se ramenant à la résolution d\'équations et d\'inéquations fondamentales;',
                        'Représenter et lire les solutions d\'une équation et d\'une inéquation sur le cercle trigonométrique.'
                    ]
                },
                {
                    id: 15, section: 'Analyse', title: 'Limite d’une fonction numérique',
                    contents: [
                        'Limite finie en un point; limite infinie en un point;',
                        'Limite finie en $\\displaystyle +\\infty$ et en $\\displaystyle -\\infty$; limite infinie en $\\displaystyle +\\infty$ et en $\\displaystyle -\\infty$;',
                        'Limite à gauche, limite à droite ; Opérations sur les limites ;',
                        'Limites de fonction polynôme, de fonction rationnelle et limites de fonction de la forme $\\displaystyle \\sqrt{f}$ où f est une fonction usuelle ;',
                        'Les limites: $\\displaystyle \\lim_{x\\to 0} \\frac{\\sin x}{x}$, $\\displaystyle \\lim_{x\\to 0} \\frac{\\tan x}{x}$, $\\displaystyle \\lim_{x\\to 0} \\frac{1-\\cos x}{x^2}$ et $\\displaystyle \\lim_{x\\to 0} \\frac{\\sin(ax)}{x}$;',
                        'Limites et ordre.'
                    ],
                    capacities: [
                        'Calculer les limites des fonctions polynômes, des fonctions rationnelles et des fonctions irrationnelles ;',
                        'Calculer les limites de fonctions trigonométriques simples en utilisant les limites usuelles ;',
                        'Résoudre des inéquations de type $\\displaystyle |f(x)-l| < \\varepsilon$ et de type $\\displaystyle f(x) > A$ pour montrer que $\\displaystyle f(x)$ tend vers $\\displaystyle l$ dans des situations simples.'
                    ]
                },
                {
                    id: 16, section: 'Analyse', title: 'Dérivation',
                    contents: [
                        'Dérivabilité en un point; nombre dérivé ; interprétation géométrique ; tangente à une courbe; approximation d\'une fonction dérivable par une fonction affine en un point;',
                        'Dérivabilité à droite ; dérivabilité à gauche; interprétation géométrique et, demi- tangente; tangente ou demi- tangente verticale; point anguleux ;',
                        'Dérivabilité sur un intervalle; dérivée première; dérivée seconde ; dérivées successives ;',
                        'Dérivation de $\\displaystyle f+g$, $\\displaystyle \\lambda f$, $\\displaystyle f \\times g$, $\\displaystyle 1/g$, $\\displaystyle f/g$, $\\displaystyle f^n$ ($\\displaystyle n \\in \\mathbb{Z}^*$), $\\displaystyle f(ax+b)$ et $\\displaystyle \\sqrt{f}$;',
                        'Equation différentielle : $\\displaystyle y\'\' + \\omega^2y = 0$.'
                    ],
                    capacities: [
                        'Approcher une fonction au voisinage d\'un point;',
                        'Reconnaitre que le nombre dérivée de la fonction en $\\displaystyle x_0$ est le coefficient directeur de la tangente à cette courbe au point d\'abscisse $\\displaystyle x_0$',
                        'Reconnaitre les dérivées des fonctions de référence ;',
                        'Maitriser les techniques de calcul de la dérivée de fonctions ;',
                        'Déterminer une équation de la tangente à une courbe en un point et construire cette tangente;',
                        'Déterminer la monotonie d\'une fonction à partir de l\'étude du signe de sa dérivée ;',
                        'Déterminer le signe d\'une fonction à partir de son tableau de variation ou de sa courbe représentative;',
                        'Résoudre des problèmes concernant des valeurs minimales et des valeurs maximales.',
                        'Appliquer la dérivation dans le calcul de certaines limites.'
                    ]
                },
                {
                    id: 17, section: 'Analyse', title: 'Représentation graphique d’une fonction numérique',
                    contents: [
                        'Branches infinies; droites asymptotes ; directions asymptotiques;',
                        'Point d\'inflexion; concavité de la courbe d\'une fonction ;',
                        'Eléments de symétrie de la courbe d\'une fonction.'
                    ],
                    capacities: [
                        'Résoudre graphiquement des équations et des inéquations ;',
                        'Utiliser la périodicité et les éléments de symétrie d\'une courbe pour réduire le domaine d\'étude d\'une fonction ;',
                        'Utiliser le signe de la dérivée seconde pour étudier la concavité d\'une courbe et déterminer ses points d\'inflexion;',
                        'Etudier et représenter des fonctions polynômes, des fonctions rationnelles et des fonctions irrationnelles.',
                        'Etudier et représenter des fonctions trigonométriques simples.'
                    ]
                }
            ];
        default:
            return [];
    }
};

const OrientationModal: React.FC<OrientationModalProps> = ({ isOpen, onClose, classId }) => {
    const [openChapterId, setOpenChapterId] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<'all' | Chapter['section']>('all');

    const chapters = useMemo(() => getChaptersForClass(classId), [classId]);

    const classLabel = useMemo(() => {
        const match = CLASS_OPTIONS.find(option => option.value === classId);
        return match ? match.label : `Classe ${classId.toUpperCase()}`;
    }, [classId]);

    const sections = useMemo(() => {
        const grouped: Record<Chapter['section'], Chapter[]> = {
            Algèbre: [],
            Analyse: [],
            Géométrie: []
        };

        chapters.forEach(chapter => {
            grouped[chapter.section].push(chapter);
        });

        return grouped;
    }, [chapters]);

    const totals = useMemo(() => {
        let totalContents = 0;
        let totalCapacities = 0;
        const counts: Record<Chapter['section'], number> = {
            Algèbre: 0,
            Analyse: 0,
            Géométrie: 0
        };

        chapters.forEach(chapter => {
            totalContents += chapter.contents.length;
            totalCapacities += chapter.capacities.length;
            counts[chapter.section] += 1;
        });

        return {
            totalChapters: chapters.length,
            totalContents,
            totalCapacities,
            perSection: SECTION_ORDER.map(section => ({
                section,
                count: counts[section]
            }))
        };
    }, [chapters]);

    const availableSections = useMemo(
        () => SECTION_ORDER.filter(section => sections[section].length > 0),
        [sections]
    );

    useEffect(() => {
        if (activeSection === 'all') {
            return;
        }

        const current = sections[activeSection];
        if (!current.length) {
            setOpenChapterId(null);
            return;
        }

        const existsInSection = current.some(chapter => chapter.id === openChapterId);
        if (!existsInSection) {
            setOpenChapterId(current[0].id);
        }
    }, [activeSection, sections, openChapterId]);

    const toggleChapter = (id: number) => {
        setOpenChapterId(prev => (prev === id ? null : id));
    };

    const handleSectionChange = (section: 'all' | Chapter['section']) => {
        setActiveSection(section);
    };

    const sectionsToDisplay = activeSection === 'all'
        ? availableSections
        : availableSections.includes(activeSection)
            ? [activeSection]
            : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Programme d'Orientation"
            titleClassName="text-slate-800 text-xl sm:text-2xl font-semibold text-left tracking-tight"
            hideHeaderBorder={true}
            className="sm:max-w-6xl lg:max-w-7xl"
        >
            <div className="mt-4 max-h-[78vh] overflow-y-auto -mr-2 pr-2 space-y-8">
                <section className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-100 px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(255,176,72,0.28),_transparent_55%)]" />
                    <div className="relative space-y-6">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600 shadow-sm">
                                <span className="material-symbols-outlined text-sm">flag</span>
                                Parcours accompagné
                            </span>
                            <h3 className="text-2xl font-semibold text-text sm:text-3xl">
                                Orientation pour {classLabel}
                            </h3>
                            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
                                Visualise l’ensemble du programme, identifie les blocs prioritaires et prépare un plan de révision qui articule découverte des notions, appropriation progressive et validation par la pratique.
                            </p>
                        </div>
                        <dl className="grid gap-3 sm:grid-cols-3">
                            {[{
                                label: 'Chapitres',
                                value: totals.totalChapters,
                                description: 'thématiques structurantes'
                            }, {
                                label: 'Contenus clés',
                                value: totals.totalContents,
                                description: 'notions à explorer'
                            }, {
                                label: 'Capacités',
                                value: totals.totalCapacities,
                                description: 'compétences à valider'
                            }].map(stat => (
                                <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                                        {stat.label}
                                    </dt>
                                    <dd className="mt-2 text-2xl font-semibold text-text">
                                        {stat.value}
                                    </dd>
                                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                                        {stat.description}
                                    </p>
                                </div>
                            ))}
                        </dl>
                        <div className="flex flex-wrap gap-2">
                            {totals.perSection.filter(section => section.count > 0).map(section => (
                                <span
                                    key={section.section}
                                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-3 py-1 text-xs font-medium text-orange-700 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm text-orange-500">auto_awesome</span>
                                    {section.section} · {section.count} chapitres
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {chapters.length === 0 ? (
                    <div className="relative flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-surface px-6 py-10 text-center text-text-secondary shadow-sm">
                        <span className="material-symbols-outlined text-4xl text-orange-500">upcoming</span>
                        <p className="text-sm sm:text-base">
                            Le programme pour cette classe sera bientôt disponible.
                        </p>
                    </div>
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-3">
                            {GUIDANCE_CARDS.map(card => (
                                <article
                                    key={card.title}
                                    className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface px-5 py-6 shadow-sm"
                                >
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                        <span className="material-symbols-outlined text-xl">{card.icon}</span>
                                    </span>
                                    <div className="space-y-2">
                                        <h4 className="text-base font-semibold text-text sm:text-lg">{card.title}</h4>
                                        <p className="text-sm leading-relaxed text-text-secondary">{card.description}</p>
                                    </div>
                                    <ul className="space-y-2 text-xs text-text-secondary sm:text-sm">
                                        {card.tips.map(tip => (
                                            <li key={tip} className="flex items-start gap-2">
                                                <span className="mt-[0.3em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                                                <span className="flex-1">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </section>

                        <section className="rounded-3xl border border-border/60 bg-surface shadow-sm">
                            <header className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-text sm:text-xl">Explorer le programme</h3>
                                    <p className="text-sm text-text-secondary">
                                        Filtre selon tes priorités ou parcours le programme complet pour planifier tes révisions.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSectionChange('all')}
                                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                                            activeSection === 'all'
                                                ? 'border-orange-400 bg-orange-100/80 text-orange-700'
                                                : 'border-border/70 bg-white/70 text-text hover:border-border-hover'
                                        }`}
                                    >
                                        Tout le programme
                                    </button>
                                    {availableSections.map(section => (
                                        <button
                                            key={section}
                                            type="button"
                                            onClick={() => handleSectionChange(section)}
                                            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                                                activeSection === section
                                                    ? 'border-orange-400 bg-orange-100/80 text-orange-700'
                                                    : 'border-border/70 bg-white/70 text-text hover:border-border-hover'
                                            }`}
                                        >
                                            {section}
                                        </button>
                                    ))}
                                </div>
                            </header>

                            <div className="space-y-7 px-5 py-6">
                                {sectionsToDisplay.map(section => {
                                    const sectionChapters = sections[section];
                                    const chapterCount = sectionChapters.length;

                                    if (!chapterCount) {
                                        return null;
                                    }

                                    return (
                                        <div key={section} className="space-y-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-semibold text-text sm:text-lg">{section}</h4>
                                                    <p className="text-sm text-text-secondary">
                                                        {SECTION_DESCRIPTIONS[section]}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                                    <span className="text-orange-500">{chapterCount}</span>
                                                    chapitres
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {sectionChapters.map((chapter, index) => (
                                                    <article
                                                        key={chapter.id}
                                                        className={`overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-sm transition-all duration-300 ${
                                                            openChapterId === chapter.id
                                                                ? 'ring-1 ring-orange-300/70'
                                                                : 'hover:border-border-hover hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleChapter(chapter.id)}
                                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                                            aria-expanded={openChapterId === chapter.id}
                                                        >
                                                            <div className="flex-1 space-y-1">
                                                                <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                                                                    Chapitre {index + 1}
                                                                </span>
                                                                <h5 className="text-base font-semibold text-text sm:text-lg">
                                                                    <MathContent content={chapter.title} inline={true} />
                                                                </h5>
                                                            </div>
                                                            <div className="flex flex-col gap-1 text-xs text-text-secondary sm:flex-row sm:items-center sm:gap-4">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm text-orange-400">list_alt</span>
                                                                    {chapter.contents.length} contenus
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm text-orange-400">task_alt</span>
                                                                    {chapter.capacities.length} capacités
                                                                </span>
                                                                <span
                                                                    className={`material-symbols-outlined text-[20px] text-orange-500 transition-transform duration-200 ${
                                                                        openChapterId === chapter.id ? 'rotate-180' : ''
                                                                    }`}
                                                                >
                                                                    expand_more
                                                                </span>
                                                            </div>
                                                        </button>
                                                        <div
                                                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                                                openChapterId === chapter.id ? 'max-h-[1200px]' : 'max-h-0'
                                                            }`}
                                                        >
                                                            <div className="grid gap-6 border-t border-border/60 bg-surface px-5 pb-6 pt-4 md:grid-cols-2">
                                                                <div className="space-y-3">
                                                                    <h6 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                                                        Concepts clés
                                                                    </h6>
                                                                    <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                                                                        {chapter.contents.map(content => (
                                                                            <li key={content} className="flex items-start gap-3">
                                                                                <span className="mt-[0.35em] flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                                                                                <span className="flex-1 leading-relaxed">
                                                                                    <MathContent content={content} inline={true} />
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <h6 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                                                        Capacités attendues
                                                                    </h6>
                                                                    <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
                                                                        {chapter.capacities.map(capacity => (
                                                                            <li key={capacity} className="flex items-start gap-3">
                                                                                <span className="mt-[0.35em] flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                                                                                <span className="flex-1 leading-relaxed">
                                                                                    <MathContent content={capacity} inline={true} />
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default OrientationModal;