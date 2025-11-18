# Nouvelle Fonctionnalité : Édition de Concours dans Smart Chapter v1

## Vue d'ensemble

Smart Chapter v1 a été modernisé avec l'ajout d'une fonctionnalité complète d'édition de concours. Cette fonctionnalité permet de gérer des contenus pédagogiques spécifiques aux concours (Médecine, ENSA, ENSAM) directement dans l'interface de Smart Chapter.

## Nouvelles Fonctionnalités

### 1. Onglet Concours

Un nouvel onglet **"Concours"** a été ajouté à l'éditeur de chapitre, permettant de :
- Créer et gérer plusieurs concours par chapitre
- Éditer les informations de base (type de concours, année, thème)
- Gérer le résumé pédagogique avec différentes sections
- Créer et éditer des questions de quiz spécifiques au concours

### 2. Types de Concours Supportés

- **Médecine** - Préparation au concours de médecine
- **ENSA** - École Nationale des Sciences Appliquées
- **ENSAM** - École Nationale Supérieure d'Arts et Métiers

### 3. Structure du Résumé Pédagogique

Chaque concours peut inclure un résumé pédagogique avec plusieurs types de sections :

- **Définitions** 📘 - Définitions clés à retenir par cœur
- **Formules** 📜 - Formules essentielles
- **Méthodes** 🎓 - Méthodes et astuces
- **Pièges** ⚠️ - Pièges à éviter absolument
- **Réflexion** 💡 - Points de réflexion importants
- **Astuces** ✨ - Astuces et raccourcis

Chaque section peut contenir plusieurs éléments avec support complet de LaTeX (notation mathématique avec `$...$`).

### 4. Quiz de Concours

Chaque concours peut avoir son propre ensemble de questions avec :
- Questions au format QCM (choix multiples)
- Options de réponse (avec indication des bonnes réponses)
- Explications détaillées pour chaque question
- Indices multiples pour aider les étudiants
- Support LaTeX pour les formules mathématiques

## Structure des Données

### Format JSON

```json
{
  "class": "2bse",
  "chapter": "Dérivation et étude des fonctions",
  "sessionDates": ["2025-11-02T01:30:00Z"],
  "lessonFile": "lessons/2bse_derivation.json",
  "videos": [...],
  "quiz": [...],
  "exercises": [...],
  "concours": [
    {
      "id": "medecine-2024-derivation",
      "concours": "Médecine",
      "annee": "2024",
      "theme": "Dérivation et applications",
      "resume": {
        "title": "Dérivation - L'essentiel",
        "introduction": "Les dérivées sont essentielles pour...",
        "sections": [
          {
            "type": "definitions",
            "title": "Définitions clés",
            "items": [
              "**Dérivée** : $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$",
              "**Tangente** : Droite d'équation $y = f'(a)(x-a) + f(a)$"
            ]
          },
          {
            "type": "formules",
            "title": "Formules de dérivation",
            "items": [
              "$(u+v)' = u' + v'$",
              "$(uv)' = u'v + uv'$",
              "$(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$"
            ]
          }
        ]
      },
      "quiz": [
        {
          "id": "q1",
          "theme": "Dérivation",
          "question": "Quelle est la dérivée de $f(x) = x^2 + 3x$ ?",
          "type": "mcq",
          "options": [
            { "id": "a", "text": "$2x + 3$", "isCorrect": true },
            { "id": "b", "text": "$2x$", "isCorrect": false },
            { "id": "c", "text": "$x + 3$", "isCorrect": false },
            { "id": "d", "text": "$2x^2 + 3$", "isCorrect": false }
          ],
          "explanation": "La dérivée de $x^2$ est $2x$ et la dérivée de $3x$ est $3$. Par la règle de la somme : $(x^2 + 3x)' = 2x + 3$",
          "hints": [
            "Utilise la formule $(x^n)' = nx^{n-1}$",
            "N'oublie pas la règle de la somme"
          ]
        }
      ]
    }
  ],
  "version": "v1.2.0-abc123"
}
```

## Interface Utilisateur

### Navigation par Arbre (TreeView)

Le TreeView a été étendu pour afficher les concours :

```
📘 Chapitre
├── ℹ️ Informations générales
├── 📖 Leçon
├── 🎥 Vidéos (3)
├── ❓ Quiz (5)
├── ✏️ Exercices (4)
└── 🏆 Concours (2)
    ├── 🏆 Médecine 2024 - Dérivation
    │   ├── 📖 Résumé (5 sections)
    │   └── ❓ Quiz (10 questions)
    └── 🏆 ENSA 2023 - Limites
        ├── 📖 Résumé (4 sections)
        └── ❓ Quiz (8 questions)
```

### Statistiques

Le panneau de statistiques en bas du TreeView affiche maintenant :
- Nombre de vidéos (rouge)
- Nombre de quiz (violet)
- Nombre d'exercices (orange)
- **Nombre de concours (jaune)** ← NOUVEAU

### Éditeur de Concours

L'éditeur de concours offre une interface moderne avec :

1. **Vue Liste** - Tous les concours du chapitre avec possibilité de les développer/réduire
2. **Informations de Base** - Sélection du type, année et thème
3. **Éditeur de Résumé** - Interface à sections colorées selon le type
4. **Éditeur de Quiz** - Création/édition de questions avec options et indices

### Couleurs par Type de Section

Chaque type de section a sa propre couleur pour une meilleure lisibilité :

- Définitions : Bleu 🔵
- Formules : Violet 🟣
- Méthodes : Vert 🟢
- Pièges : Rouge 🔴
- Réflexion : Jaune 🟡
- Astuces : Indigo 🟣

## Modifications Techniques

### Fichiers Modifiés

1. **types.ts** - Ajout des interfaces :
   - `ConcoursResumeSection`
   - `ConcoursResume`
   - `ConcoursQuestion`
   - `ConcoursData`
   - Modification de `ChapterData` pour inclure `concours?: ConcoursData[]`

2. **icons.tsx** - Ajout de nouvelles icônes :
   - `TrophyIcon` - Pour les concours
   - `SparklesIcon` - Pour les astuces
   - `AcademicCapIcon` - Pour les méthodes
   - `ExclamationTriangleIcon` - Pour les pièges

3. **ConcoursEditor.tsx** - Nouveau composant complet pour l'édition de concours

4. **ChapterEditor.tsx** - Ajout de l'onglet concours et intégration de `ConcoursEditor`

5. **TreeView.tsx** - Extension pour afficher les concours dans l'arborescence

6. **parser.ts** - Ajout du parsing des données concours depuis JSON

7. **App.tsx** - Modification de la sauvegarde pour inclure les concours

## Utilisation

### Créer un Nouveau Concours

1. Ouvrir un chapitre dans l'éditeur
2. Cliquer sur l'onglet **"Concours"** (icône trophée 🏆)
3. Cliquer sur **"Ajouter un Concours"**
4. Remplir les informations de base (type, année, thème)
5. Ajouter des sections au résumé pédagogique
6. Créer des questions de quiz
7. Sauvegarder les modifications

### Éditer un Concours Existant

1. Dans l'onglet Concours, cliquer sur un concours pour le développer
2. Modifier les informations selon vos besoins
3. Les modifications sont sauvegardées en temps réel dans l'état
4. Cliquer sur "Sauvegarder les Modifications" dans le footer pour persister

### Navigation via TreeView

1. Ouvrir le panneau TreeView (à gauche)
2. Développer la section "Concours" (🏆)
3. Cliquer sur un concours pour accéder directement à l'onglet
4. Naviguer entre résumé et quiz

## Support LaTeX

Tous les champs texte supportent la notation LaTeX avec la syntaxe `$...$` :

- Formules inline : `$f(x) = x^2$`
- Expressions complexes : `$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$`
- Matrices, fractions, racines, etc.

## Compatibilité

Cette fonctionnalité est :
- ✅ Compatible avec tous les chapitres existants (le champ `concours` est optionnel)
- ✅ Rétrocompatible avec les anciens formats JSON
- ✅ Sauvegardée automatiquement avec versioning
- ✅ Intégrée au système de File System Access API

## Prochaines Évolutions Possibles

- Import/Export de concours entre chapitres
- Templates de concours prédéfinis
- Statistiques avancées par concours
- Mode prévisualisation étudiant
- Export PDF des résumés pédagogiques
- Recherche et filtrage de concours par type/année

## Conclusion

Cette nouvelle fonctionnalité transforme Smart Chapter v1 en un outil complet pour la gestion de contenus pédagogiques orientés concours, tout en conservant sa simplicité d'utilisation et sa modernité.
