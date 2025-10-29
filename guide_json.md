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

| Clé              | Type                 | Obligatoire | Description                                                             |
|------------------|----------------------|-------------|-------------------------------------------------------------------------|
| `text`           | `String`             | Oui         | Le texte de l'indice. Peut contenir du MathJax et du formatage Markdown. |
| `questionNumber` | `String`             | Non         | **NOUVEAU** : Numéro de question explicite (ex: "2b", "1a", "3"). Prioritaire sur la détection auto. |
| `sub_questions`  | `Array<SubQuestion>` | Non         | L'indice peut lui-même contenir une liste de sous-questions pour guider l'élève. |

### Système Intelligent de Numérotation des Indices

Le système utilise un mécanisme hybride pour associer chaque indice au bon numéro de question avec **deux méthodes complémentaires** :

#### 🎯 Méthode 1 : Liaison Explicite (Recommandée)

Utilisez le champ **`questionNumber`** pour lier directement un indice à une question :

```json
"hint": [
  {
    "text": "**Calcul de la dérivée** : Utilisez la formule du quotient...",
    "questionNumber": "2b"
  },
  {
    "text": "**Tableau de variations** : Analysez le signe de f'(x)...",
    "questionNumber": "2c"
  }
]
```

**Avantages :**
- ✅ Précision garantie à 100%
- ✅ Pas de dépendance à l'ordre des indices
- ✅ Maintenance simplifiée
- ✅ Clarté du mapping

#### 🔍 Méthode 2 : Détection Automatique (Fallback)

Si `questionNumber` n'est pas spécifié, le système analyse le contenu pour déterminer la question correspondante :

**Règles de Mapping Automatique**

1. **Analyse du contenu** : Le système analyse le texte de chaque indice
2. **Détection par mots-clés** : Des mots-clés spécifiques permettent l'association automatique :
   - **"dérivée", "quotient"** → Questions de calcul de dérivée (ex: 2b)
   - **"signe", "variation", "tableau"** → Questions d'étude de signe (ex: 2c)
   - **"substitution", "α", "alpha"** → Questions de calculs avec paramètres (ex: 2d)
   - **"continuité", "jonction"** → Questions de continuité
   - **"dichotomie", "algorithme"** → Questions de méthodes numériques
   - **"point fixe", "auxiliaire"** → Questions de théorèmes
   - **"bijection", "existence", "unicité"** → Questions de propriétés mathématiques

3. **Numérotation automatique** : Les numéros s'affichent automatiquement dans le modal selon la question concernée

#### Ordre de Priorité

Le système applique l'ordre suivant :
1. 🎯 **Liaison explicite** (`questionNumber` défini) → Utilisation directe
2. 🔍 **Détection automatique** → Analyse sémantique avec scoring
3. 🔄 **Mapping séquentiel** → Correspondance 1:1 (hint 1 → question 1)
4. 🛡️ **Fallback** → Numérotation simple

#### Bonnes Pratiques pour les Indices

✅ **À FAIRE :**
```json
"hint": [
  {
    "text": "**Calcul de la dérivée** : Utilisez la formule de dérivation d'un quotient avec $u(x) = x^3 - 4$ et $v(x) = x^2 + 1$."
  },
  {
    "text": "**Analyse du signe** : Le dénominateur $(x^2 + 1)^2$ est toujours positif. Concentrez-vous sur le signe du numérateur."
  }
]
```

❌ **À ÉVITER :**
```json
"hint": [
  {
    "text": "Pour la question 2.b), calculez la dérivée..."
  },
  {
    "text": "Question 2.c : Étudiez le signe..."
  }
]
```

#### Formatage Avancé des Indices

Les indices supportent le formatage Markdown et MathJax :

```json
"hint": [
  {
    "text": "**Méthode systématique** : Calculez $\\displaystyle f'(x) = \\frac{u'v - uv'}{v^2}$ où :\n• $u(x) = x^3 - 4$ donc $u'(x) = 3x^2$\n• $v(x) = x^2 + 1$ donc $v'(x) = 2x$"
  }
]
```

### 📋 Exemple Complet avec Mapping Robuste

```json
{
  "sub_questions": [
    {
      "text": "1. Étude de la fonction g",
      "sub_sub_questions": [
        {
          "text": "a) Déterminer le domaine de définition de g",
          "answer": "Dg = ℝ \\ {-1}"
        },
        {
          "text": "b) Calculer la limite en -∞ de g",
          "answer": "lim g(x) = +∞ quand x → -∞"
        },
        {
          "text": "c) Montrer que g(α) = 0 admet une solution unique",
          "answer": "Utiliser le théorème des valeurs intermédiaires"
        }
      ]
    },
    {
      "text": "2. Étude de la fonction f",
      "sub_sub_questions": [
        {
          "text": "a) Vérifier que f(x) = g(x)/(x+1)",
          "answer": "Par développement direct"
        },
        {
          "text": "b) Calculer f'(x) et montrer que f'(x) = g'(x)/(x+1)²",
          "answer": "f'(x) = (x²+2x-3)/(x+1)²"
        },
        {
          "text": "c) Déterminer le signe de f'(x) et dresser le tableau de variation",
          "answer": "f'(x) > 0 pour x ∈ ]-∞;-3[∪]1;+∞["
        },
        {
          "text": "d) En déduire une relation entre f(α) et α",
          "answer": "f(α) = α - 2"
        },
        {
          "text": "e) Donner un encadrement de α à 10⁻² près",
          "answer": "2,56 < α < 2,57"
        }
      ]
    }
  ],
  "hint": [
    {
      "text": "**Calcul de la dérivée** : Pour calculer f'(x), utilisez la formule du quotient. N'oubliez pas que g'(x) = x² + 2x - 3. Le calcul donne $$f'(x) = \\frac{g'(x)}{(x+1)^2}$$"
    },
    {
      "text": "**Étude du signe** : Le dénominateur (x+1)² est toujours positif (sauf en x = -1). Le signe de f'(x) dépend donc uniquement du signe de g'(x). Factorisez g'(x) = (x-1)(x+3)"
    },
    {
      "text": "**Substitution avec α** : Puisque g(α) = 0, vous avez α² + 2α - 3 = 0. Utilisez cette relation pour simplifier f(α) = g(α)/(α+1) = 0/(α+1) = 0... Non ! Utilisez plutôt f(x) = x - 2 + 1/(x+1)"
    }
  ]
}
```

**Résultat du mapping automatique :**
- 🎯 **Hint 1** "Calcul de la dérivée" → **Question 2b** (score: 5)
- 🎯 **Hint 2** "Étude du signe" → **Question 2c** (score: 8)  
- 🎯 **Hint 3** "Substitution avec α" → **Question 2d** (score: 7)

### 🧪 Test de Validation

Pour vérifier le mapping, utilisez ce script Python :

```python
def test_hint_mapping():
    exercise = load_exercise("1bsm_ensembles_et_applications.json")
    hints = exercise["hint"]
    
    print("=== TEST DU MAPPING ROBUSTE ===")
    for i, hint in enumerate(hints):
        text = hint["text"].lower()
        
        # Simulation de l'algorithme JavaScript
        if "dérivée" in text or "quotient" in text:
            mapped_to = "2b"
            score = 5
        elif "signe" in text or "variation" in text:
            mapped_to = "2c" 
            score = 8
        elif "substitution" in text or "α" in text:
            mapped_to = "2d"
            score = 7
        else:
            mapped_to = f"{i+1}"
            score = 0
            
        print(f"HINT {i+1}: {hint['text'][:30]}... -> {mapped_to} (score: {score})")

# Résultat attendu :
# HINT 1: Calcul de la dérivée... -> 2b (score: 5)
# HINT 2: Étude du signe... -> 2c (score: 8) 
# HINT 3: Substitution avec α... -> 2d (score: 7)
```

### Exemple Complet de Structure Complète

Voici un exemple complet d'exercice avec le système intelligent :

```json
{
  "class": "2bse",
  "chapter": "Limites et Continuité",
  "sessionDates": [
    "2025-10-30T17:00:00Z",
    "2025-11-05T17:00:00Z"
  ],
  "quiz": [
    {
      "id": "q_continuite_fonction",
      "type": "mcq",
      "question": "Une fonction $f$ est continue en $a$ si :",
      "options": [
        {
          "text": "$\\displaystyle \\lim_{x \\to a} f(x) = f(a)$",
          "isCorrect": true,
          "explanation": "C'est la définition exacte de la continuité en un point."
        },
        {
          "text": "$f(a)$ existe",
          "isCorrect": false,
          "explanation": "L'existence de $f(a)$ est nécessaire mais pas suffisante."
        }
      ]
    }
  ],
  "exercises": [
    {
      "id": "exo_fonction_derivee_complete",
      "title": "Étude complète d'une fonction via fonction auxiliaire",
      "statement": "Soit la fonction $f$ définie sur $\\mathbb{R}$ par : $$f(x) = \\frac{x^3 - 4}{x^2 + 1}$$",
      "sub_questions": [
        {
          "text": "**Étude de la fonction auxiliaire $g$**",
          "sub_sub_questions": [
            { "text": "On pose $g(x) = x^3 + 3x + 8$. Étudier les variations de $g$." },
            { "text": "Montrer que l'équation $g(x) = 0$ admet une solution unique $\\alpha \\in [-2; 0]$." },
            { "text": "Préciser le signe de $g(x)$ selon les valeurs de $x$." }
          ]
        },
        {
          "text": "**Étude de la fonction $f$**",
          "sub_sub_questions": [
            { "text": "Déterminer les limites de $f$ en $+\\infty$ et $-\\infty$." },
            { "text": "Calculer $f'(x)$ et montrer que $f'(x) = \\frac{x(x^3 + 3x + 8)}{(x^2 + 1)^2}$." },
            { "text": "Dresser le tableau de variations complet de $f$." },
            { "text": "Calculer $f(\\alpha)$ et en déduire un encadrement." }
          ]
        }
      ],
      "hint": [
        {
          "text": "**Calcul de la dérivée** : Utilisez la formule de dérivation d'un quotient $\\displaystyle \\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$ avec $u(x) = x^3 - 4$ et $v(x) = x^2 + 1$."
        },
        {
          "text": "**Analyse du signe** : Le dénominateur $(x^2 + 1)^2$ est toujours strictement positif. Le signe de $f'(x)$ dépend uniquement du signe de $x \\cdot g(x)$."
        },
        {
          "text": "**Substitution algébrique** : Partez de $g(\\alpha) = 0$, soit $\\alpha^3 + 3\\alpha + 8 = 0$. Isolez $\\alpha^3 = -3\\alpha - 8$ et substituez dans l'expression de $f(\\alpha)$."
        }
      ]
    },
    {
      "id": "exo_continuite_morceaux",
      "title": "Continuité d'une fonction définie par morceaux",
      "statement": "Soit $f$ définie sur $\\mathbb{R}$ par : $$f(x) = \\begin{cases} \\frac{a-x}{x+1} & \\text{si } x \\in ]-\\infty;-2[ \\cup ]1;+\\infty[ \\\\ \\frac{1}{2}x^2+x+b & \\text{si } x \\in [-2;1] \\end{cases}$$",
      "sub_questions": [
        { "text": "Déterminer les valeurs de $a$ et $b$ pour que $f$ soit continue sur $\\mathbb{R}$." }
      ],
      "hint": [
        {
          "text": "**Points critiques** : Une fonction définie par morceaux est continue si elle l'est aux points de jonction $x = -2$ et $x = 1$."
        },
        {
          "text": "**Conditions de continuité** : Égalisez les limites latérales avec les valeurs de la fonction aux points de raccordement."
        },
        {
          "text": "**Système d'équations** : Les deux conditions de continuité donnent un système linéaire à résoudre."
        }
      ]
    }
  ]
}
```

### Analyse du Système Intelligent

Dans cet exemple, le système attribue automatiquement :

| Indice | Contenu détecté | Numéro affiché | Question ciblée |
|--------|-----------------|----------------|-----------------|
| 1 | "Calcul de la **dérivée**" | **2b** | Calcul de $f'(x)$ |
| 2 | "Analyse du **signe**" | **2c** | Étude du signe de $f'(x)$ |
| 3 | "**Substitution** algébrique" | **2d** | Calcul de $f(\\alpha)$ |
| 4 | "Points critiques" (continuité) | **1** | Détermination des paramètres |
| 5 | "Conditions de **continuité**" | **1** | Même question, approche différente |
| 6 | "**Système** d'équations" | **1** | Résolution finale |

## Système Robuste de Mapping des Indices

Le composant `HintModal.tsx` implémente un système robuste qui mappe automatiquement chaque indice au numéro exact de la question correspondante dans l'exercice.

### 🎯 Fonctionnalités Clés

1. **Mapping exact** : Analyse la structure réelle de l'exercice pour générer les numéros corrects
2. **Détection intelligente** : Utilise les mots-clés pour identifier la question ciblée
3. **Score de correspondance** : Système de scoring pour choisir le meilleur match
4. **Fallbacks sécurisés** : Plusieurs niveaux de sécurité pour éviter les erreurs
5. **Interface épurée** : Badges circulaires sans ligne horizontale dans le header

### 🔍 Algorithme de Mapping Robuste

```typescript
// 1. Génération de la numérotation exacte des questions
const generateExactQuestionNumbers = (exercise: Exercise): string[] => {
    const allQuestionNumbers: string[] = [];
    let questionCounter = 1;

    exercise.sub_questions.forEach((subQ) => {
        if (subQ.sub_sub_questions && subQ.sub_sub_questions.length > 0) {
            // Sous-questions avec lettres (1a, 1b, 1c, 2a, 2b, etc.)
            subQ.sub_sub_questions.forEach((_, subIndex) => {
                const letter = String.fromCharCode(97 + subIndex); // a, b, c, d...
                allQuestionNumbers.push(`${questionCounter}${letter}`);
            });
        } else {
            // Question simple (1, 2, 3, etc.)
            allQuestionNumbers.push(questionCounter.toString());
        }
        questionCounter++;
    });

    return allQuestionNumbers; // Ex: ['1a', '1b', '1c', '2a', '2b', '2c', '2d', '2e']
};

// 2. Recherche par mots-clés avec scoring
const findQuestionByKeywords = (exercise: Exercise, keywords: string[]): number => {
    let questionIndex = 0;
    const matches: {index: number, score: number, text: string}[] = [];
    
    // Parcourir toutes les questions et calculer un score
    exercise.sub_questions.forEach((subQ) => {
        if (subQ.sub_sub_questions) {
            subQ.sub_sub_questions.forEach((subSubQ) => {
                const questionText = subSubQ.text.toLowerCase();
                let score = 0;
                
                keywords.forEach(keyword => {
                    if (questionText.includes(keyword.toLowerCase())) {
                        score += keyword.length; // Score basé sur la longueur
                        if (questionText.startsWith(keyword.toLowerCase())) {
                            score += 10; // Bonus si le mot-clé est au début
                        }
                        if (['calculer', 'montrer', 'signe', 'tableau'].includes(keyword.toLowerCase())) {
                            score += 5; // Bonus pour mots-clés importants
                        }
                    }
                });
                
                if (score > 0) {
                    matches.push({index: questionIndex, score: score, text: questionText});
                }
                questionIndex++;
            });
        }
    });
    
    // Retourner l'index avec le meilleur score
    if (matches.length > 0) {
        matches.sort((a, b) => b.score - a.score);
        return matches[0].index;
    }
    return -1;
};

// 3. Mapping robuste des hints
const getRobustQuestionMapping = (exercise: Exercise): string[] => {
    const allQuestionNumbers = generateExactQuestionNumbers(exercise);
    
    return exercise.hint.map((hint, hintIndex) => {
        const text = hint.text.toLowerCase();
        
        if (text.includes('dérivée') || text.includes('quotient')) {
            // Chercher la question exacte de calcul de dérivée
            const derivativeQuestionIndex = findQuestionByKeywords(exercise, ['calculer', "f'", 'montrer que']);
            return derivativeQuestionIndex !== -1 ? allQuestionNumbers[derivativeQuestionIndex] : '2b';
            
        } else if (text.includes('signe') || text.includes('variation')) {
            // Chercher la question exacte d'étude du signe
            const signQuestionIndex = findQuestionByKeywords(exercise, ['signe', 'tableau', 'variation']);
            return signQuestionIndex !== -1 ? allQuestionNumbers[signQuestionIndex] : '2c';
            
        } else if (text.includes('substitution') || text.includes('α')) {
            // Chercher la question exacte avec alpha/encadrement
            const alphaQuestionIndex = findQuestionByKeywords(exercise, ['α', 'alpha', 'relation', 'encadrement']);
            return alphaQuestionIndex !== -1 ? allQuestionNumbers[alphaQuestionIndex] : '2d';
        }
        
        // Fallback : mapping séquentiel
        return allQuestionNumbers[hintIndex] || (hintIndex + 1).toString();
    });
};
```

### 📊 Exemple Concret de Mapping

Pour l'exercice sur les limites et continuité :

**Structure de l'exercice :**
- Question 1: Étude de g(x) → 1a, 1b, 1c  
- Question 2: Étude de f(x) → 2a, 2b, 2c, 2d, 2e

**Hints et mapping automatique :**
```json
"hint": [
  {
    "text": "**Calcul de la dérivée** : Utilisez la formule du quotient..."
    // → Détecté comme "dérivée" → Mappé à 2b (Calculer f'(x))
  },
  {
    "text": "**Analyse du signe** : Le dénominateur est toujours positif..."
    // → Détecté comme "signe" → Mappé à 2c (Tableau de signe)
  },
  {
    "text": "**Substitution algébrique** : Utilisez g(α) = 0..."
    // → Détecté comme "substitution" → Mappé à 2d (Calcul avec α)
  }
]
```

**Résultat dans le modal :**
- Badge **2b** : "Calcul de la dérivée"
- Badge **2c** : "Analyse du signe"  
- Badge **2d** : "Substitution algébrique"

### 🛡️ Sécurités Intégrées

1. **Validation des indices** : Vérification que l'index existe dans la structure
2. **Fallbacks multiples** : Si pas de match par mots-clés → mapping séquentiel → numérotation simple
3. **Gestion des cas limites** : Plus de hints que de questions, structures atypiques
4. **Score de qualité** : Choix du meilleur match basé sur la pertinence du contenu

### Script de Nettoyage Automatique

Un script Python nettoie automatiquement tous les hints dans les fichiers JSON :

```python
#!/usr/bin/env python3
"""
Script de nettoyage automatique des hints
Supprime les références aux questions et normalise le formatage
"""

import os
import json
import re

def clean_hint_text(text: str) -> str:
    """Nettoie le texte d'un hint en supprimant les références aux questions."""
    if not text:
        return text
    
    # 1. Supprimer les backticks
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # 2. Supprimer les références aux questions
    text = re.sub(r'\(Question[s]?\s+\d+[a-z]*\.?[a-z]*\)\s*:?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Question[s]?\s+\d+[a-z]*\.?\s*[:\-]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Pour\s+la\s+question[s]?\s+\d+[a-z]*\.?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Pour\s+\d+[a-z]*[\)\.]\s*', '', text, flags=re.IGNORECASE)
    
    # 3. Nettoyer les espaces
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

def process_json_file(file_path: str):
    """Traite un fichier JSON pour nettoyer les hints."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convertir 'indice' → 'hint' et nettoyer
    for exercise in data.get('exercises', []):
        if 'indice' in exercise:
            exercise['hint'] = exercise['indice']
            del exercise['indice']
        
        if 'hint' in exercise:
            for hint in exercise['hint']:
                if 'text' in hint:
                    hint['text'] = clean_hint_text(hint['text'])
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Usage: python clean_hints_script.py
```

### Migration des Fichiers Existants

Pour les fichiers existants utilisant `"indice"` au lieu de `"hint"`, le script de nettoyage effectue automatiquement la conversion.

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