# Guide de la Structure JSON pour les Chapitres

Ce document décrit la structure des fichiers JSON utilisés pour définir le contenu de chaque chapitre de cours. Chaque fichier représente un chapitre complet, incluant un quiz et des exercices.

## Structure Globale du Fichier

Le fichier JSON d'un chapitre est un objet unique avec les clés principales suivantes :

| Clé            | Type                | Obligatoire | Description                                                                 |
|----------------|---------------------|-------------|-----------------------------------------------------------------------------|
| `class`        | `String`            | Oui         | L'identifiant de la classe (ex: `"1bsm"`, `"tcs"`).                           |
| `chapter`      | `String`            | Oui         | Le titre du chapitre (ex: `"Logique mathématique"`).                          |
| `sessionDates` | `Array<String>`     | Oui         | Un tableau des dates de sessions prévues au format ISO 8601 (UTC).          |
| `quiz`         | `Array<Question>`   | Oui         | Un tableau d'objets `Question` constituant le quiz du chapitre.             |
| `exercises`    | `Array<Exercise>`   | Oui         | Un tableau d'objets `Exercise` constituant les exercices du chapitre.        |

### Exemple

```json
{
  "class": "1bsm",
  "chapter": "Logique mathématique",
  "sessionDates": [
    "2025-09-25T18:00:00Z",
    "2025-09-30T17:00:00Z"
  ],
  "quiz": [
    // ... objets Question
  ],
  "exercises": [
    // ... objets Exercise
  ]
}
```

---

## Structure de l'objet `Question` (pour les Quiz)

Chaque objet dans le tableau `quiz` représente une question.

| Clé           | Type              | Obligatoire | Description                                                                            |
|---------------|-------------------|-------------|----------------------------------------------------------------------------------------|
| `id`          | `String`          | Oui         | Un identifiant unique pour la question (ex: `"q_proposition_1"`).                      |
| `question`    | `String`          | Oui         | Le texte de la question. Peut contenir du formatage MathJax (ex: `$P \\land Q$`).      |
| `type`        | `String`          | Non         | Le type de question. `"mcq"` (choix multiples) par défaut, ou `"ordering"` (ordonnancement). |
| `options`     | `Array<Option>`   | Si `type`=`"mcq"` | Un tableau contenant 2 à 4 objets `Option`. Ne pas utiliser pour `type`=`"ordering"`. |
| `steps`       | `Array<String>`   | Si `type`=`"ordering"` | Un tableau de chaînes de caractères représentant les étapes **dans l'ordre correct**. <br> **Attention :** Dans certains cas, plusieurs étapes peuvent être interchangeables. L'application considère la séquence définie ici comme la seule réponse correcte. Si plusieurs ordres sont valides, il est préférable d'utiliser une question de type `mcq`. |
| `explanation` | `String`          | Non         | Une explication générale qui s'affiche après que l'utilisateur a répondu.                |
| `hints`       | `Array<String>`   | Non         | Un tableau d'indices textuels pour aider l'élève. |

### Structure de l'objet `Option` (pour `type: "mcq"`)

Chaque objet dans le tableau `options` d'une question.

| Clé           | Type      | Obligatoire | Description                                                                        |
|---------------|-----------|-------------|------------------------------------------------------------------------------------|
| `text`        | `String`  | Oui         | Le texte de l'option de réponse. Peut contenir du formatage MathJax.               |
| `isCorrect`   | `Boolean` | Oui         | `true` si c'est la bonne réponse, sinon `false`. Une seule option doit être correcte. |
| `explanation` | `String`  | Non         | Une explication spécifique si cette option est choisie (peut compléter l'explication générale). |

### Exemple d'une `Question` de type `"mcq"`

```json
{
  "id": "q_implication_5",
  "type": "mcq",
  "question": "L'implication $P \\Rightarrow Q$ est fausse uniquement quand :",
  "options": [
    { "text": "$P$ est vraie et $Q$ est fausse", "isCorrect": true },
    { "text": "$P$ est fausse et $Q$ est vraie", "isCorrect": false }
  ],
  "explanation": "Une implication $P \\Rightarrow Q$ n'est fausse que dans le cas où la prémisse $P$ est vraie et la conclusion $Q$ est fausse."
}
```

### Exemple d'une `Question` de type `"ordering"`

```json
{
  "id": "q_ordering_recurrence",
  "type": "ordering",
  "question": "Remettez dans l'ordre les étapes d'un raisonnement par récurrence.",
  "steps": [
    "Initialisation : Vérifier que la propriété est vraie pour le premier rang.",
    "Hérédité : Supposer que la propriété est vraie pour un rang n (Hypothèse de récurrence).",
    "Hérédité : Démontrer que la propriété est vraie pour le rang n+1.",
    "Conclusion : Conclure que la propriété est vraie pour tous les rangs."
  ],
  "explanation": "Un raisonnement par récurrence se déroule en trois phases : l'initialisation, l'hérédité, et la conclusion."
}
```

---

## Structure de l'objet `Exercise`

Chaque objet dans le tableau `exercises` représente un exercice.

| Clé             | Type                    | Obligatoire | Description                                                                     |
|-----------------|-------------------------|-------------|---------------------------------------------------------------------------------|
| `id`            | `String`                | Oui         | Un identifiant unique pour l'exercice (ex: `"exo_propositions_quantificateurs"`).|
| `title`         | `String`                | Oui         | Le titre de l'exercice.                                                         |
| `statement`     | `String`                | Oui         | L'énoncé principal de l'exercice. Peut contenir du MathJax.                       |
| `sub_questions` | `Array<SubQuestion>`    | Non         | Un tableau de sous-questions numérotées pour l'exercice.                        |
| `hint`          | `Array<ExerciseHint>`   | Non         | Un tableau d'indices pour l'exercice.                                           |

### Structure de l'objet `SubQuestion`

| Clé                  | Type                      | Obligatoire | Description                                                    |
|----------------------|---------------------------|-------------|----------------------------------------------------------------|
| `text`               | `String`                  | Oui         | Le texte de la sous-question. Peut contenir du MathJax.       |
| `sub_sub_questions`  | `Array<SubSubQuestion>`   | Non         | Un tableau de sous-sous-questions (a., b., c., etc.).         |

### Structure de l'objet `SubSubQuestion`

| Clé    | Type     | Obligatoire | Description                                      |
|--------|----------|-------------|--------------------------------------------------|
| `text` | `String` | Oui         | Le texte de la sous-sous-question. Peut contenir du MathJax. |

### Structure de l'objet `ExerciseHint`

| Clé             | Type                 | Obligatoire | Description                                                             |
|-----------------|----------------------|-------------|-------------------------------------------------------------------------|
| `text`          | `String`             | Oui         | Le texte de l'indice. Peut contenir du MathJax.                           |
| `sub_questions` | `Array<SubQuestion>` | Non         | L'indice peut lui-même contenir une liste de sous-questions pour guider l'élève. |

### Exemple d'un `Exercise` sans sous-sous-questions

```json
{
  "id": "exo_raisonnement_absurde",
  "title": "Raisonnement par l'Absurde",
  "statement": "Utiliser le raisonnement par l'absurde pour démontrer les propositions suivantes :",
  "sub_questions": [
    { "text": "Montrer que $\\sqrt{2} \\notin \\mathbb{Q}$." },
    { "text": "Soit $n \\in \\mathbb{N}$, on pose : $A = \\frac{n+3}{n+5}$. Montrer que $A \\neq 1$." }
  ],
  "hint": [
      { 
          "text": "Pour la première question, supposez que $\\sqrt{2}$ est rationnel, c'est-à-dire qu'il peut s'écrire comme une fraction irréductible $\\frac{p}{q}$."
      }
  ]
}
```

### Exemple d'un `Exercise` avec sous-sous-questions

```json
{
  "id": "exo_derivation_complete",
  "title": "Étude d'une Fonction Dérivée",
  "statement": "Soit la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x) = x^3 - 6x^2 + 9x + 1$",
  "sub_questions": [
    {
      "text": "Calculer la dérivée $f'(x)$ de la fonction $f$.",
      "sub_sub_questions": [
        { "text": "Appliquer la règle de dérivation : $(x^n)' = nx^{n-1}$" },
        { "text": "Simplifier l'expression obtenue." }
      ]
    },
    {
      "text": "Étudier le signe de la dérivée $f'(x)$.",
      "sub_sub_questions": [
        { "text": "Factoriser $f'(x)$." },
        { "text": "Résoudre l'équation $f'(x) = 0$." },
        { "text": "Construire le tableau de signes de $f'(x)$." }
      ]
    },
    {
      "text": "En déduire les variations de la fonction $f$."
    }
  ],
  "hint": [
    { "text": "Pour factoriser le trinôme, cherchez deux nombres dont la somme et le produit correspondent aux coefficients." }
  ]
}
```

**Notes importantes :**
- Les **sous-questions** sont numérotées automatiquement : 1., 2., 3., etc.
- Les **sous-sous-questions** sont lettrées automatiquement : a., b., c., etc.
- Les sous-sous-questions permettent de décomposer une question complexe en étapes guidées.
- Une sous-question peut avoir zéro, une ou plusieurs sous-sous-questions.
- Les sous-sous-questions s'affichent avec une indentation pour une meilleure lisibilité.