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
| `options`     | `Array<Option>`   | Oui         | Un tableau contenant 2 à 4 objets `Option`.                                            |
| `explanation` | `String`          | Non         | Une explication générale qui s'affiche après que l'utilisateur a répondu.                |
| `hints`       | `Array<String>`   | Non         | Un tableau d'indices textuels pour aider l'élève. À réserver aux questions difficiles. |

### Structure de l'objet `Option`

Chaque objet dans le tableau `options` d'une question.

| Clé           | Type      | Obligatoire | Description                                                                        |
|---------------|-----------|-------------|------------------------------------------------------------------------------------|
| `text`        | `String`  | Oui         | Le texte de l'option de réponse. Peut contenir du formatage MathJax.               |
| `isCorrect`   | `Boolean` | Oui         | `true` si c'est la bonne réponse, sinon `false`. Une seule option doit être correcte. |
| `explanation` | `String`  | Non         | Une explication spécifique si cette option est choisie (peut compléter l'explication générale). |

### Exemple d'une `Question`

```json
{
  "id": "q_implication_5",
  "question": "L'implication $P \\Rightarrow Q$ est fausse uniquement quand :",
  "options": [
    { "text": "$P$ est vraie et $Q$ est fausse", "isCorrect": true },
    { "text": "$P$ est fausse et $Q$ est vraie", "isCorrect": false }
  ],
  "explanation": "Une implication $P \\Rightarrow Q$ n'est fausse que dans le cas où la prémisse $P$ est vraie et la conclusion $Q$ est fausse.",
  "hints": [
    "Une implication est comme une promesse. 'Si P, alors Q'.",
    "La seule façon de briser la promesse est que P soit vrai, mais que Q soit fausse."
  ]
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

| Clé    | Type     | Obligatoire | Description                               |
|--------|----------|-------------|-------------------------------------------|
| `text` | `String` | Oui         | Le texte de la sous-question. Peut contenir du MathJax. |

### Structure de l'objet `ExerciseHint`

| Clé             | Type                 | Obligatoire | Description                                                             |
|-----------------|----------------------|-------------|-------------------------------------------------------------------------|
| `text`          | `String`             | Oui         | Le texte de l'indice. Peut contenir du MathJax.                           |
| `sub_questions` | `Array<SubQuestion>` | Non         | L'indice peut lui-même contenir une liste de sous-questions pour guider l'élève. |

### Exemple d'un `Exercise`

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
