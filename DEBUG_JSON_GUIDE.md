# 🔍 JSON Debug Tool - Guide d'utilisation

## 📖 Vue d'ensemble

L'outil **JSON Debug Tool** est un débogueur intelligent spécialement conçu pour analyser et valider les fichiers JSON du projet Math-pedago. Il détecte les erreurs de syntaxe, valide la structure selon les conventions du projet, et fournit des suggestions de correction détaillées.

---

## 🚀 Méthodes d'utilisation

### Méthode 1 : Interface Web (Recommandé)

1. **Ouvrir l'interface web** :
   ```
   http://localhost:3000/debug-json.html
   ```
   (Ou selon votre configuration de serveur)

2. **Choisir un mode** :
   - 📁 **Fichier** : Analyser un fichier JSON depuis le serveur
   - 📝 **Texte** : Coller et analyser du JSON directement
   - ❓ **Aide** : Consulter la documentation

3. **Lancer l'analyse** :
   - Sélectionner un fichier rapide ou entrer un chemin
   - Cliquer sur "🔍 Analyser"
   - Les résultats s'affichent en temps réel

### Méthode 2 : Console F12 du navigateur

1. **Charger une page du site** (n'importe laquelle)

2. **Ouvrir la console F12** :
   - Windows/Linux : `F12` ou `Ctrl + Shift + I`
   - Mac : `Cmd + Option + I`

3. **Copier-coller le contenu du fichier** `debug-json-tool.js` dans la console

4. **Utiliser les commandes** :

```javascript
// Analyser un fichier depuis le serveur
await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')

// Analyser du texte JSON
debugJSONContent('{"test": "value"}')

// Afficher l'aide
debugJSONHelp()
```

---

## 🔧 Fonctions disponibles

### 1. `debugJSON(filePath)`

Charge et analyse un fichier JSON depuis le serveur.

**Paramètres :**
- `filePath` (string) : Chemin du fichier JSON à analyser

**Retour :**
- `false` : Si erreur de syntaxe
- `object` : Résultat de l'analyse avec `warnings` et `suggestions`

**Exemples :**

```javascript
// Analyser un chapitre
await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')

// Analyser une leçon
await debugJSON('/chapters/1bsm/lessons/1bsm_le_barycentre_dans_le_plan.json')

// Analyser un fichier quelconque
await debugJSON('/path/to/your/file.json')
```

### 2. `debugJSONContent(jsonString, fileName)`

Analyse directement une chaîne JSON.

**Paramètres :**
- `jsonString` (string) : Le contenu JSON à analyser
- `fileName` (string, optionnel) : Nom du fichier pour l'affichage

**Exemples :**

```javascript
// Analyser une chaîne JSON simple
debugJSONContent('{"name": "test"}')

// Analyser un objet complexe
const jsonText = `{
  "class": "1bsm",
  "exercises": []
}`
debugJSONContent(jsonText, 'mon-fichier.json')

// Analyser depuis le presse-papier
debugJSONContent(navigator.clipboard.readText())
```

### 3. `compareJSON(json1, json2)`

Compare deux objets JSON et affiche les différences.

**Exemples :**

```javascript
const oldVersion = { "name": "old", "value": 1 }
const newVersion = { "name": "new", "value": 2 }

compareJSON(oldVersion, newVersion)
```

### 4. `debugJSONHelp()`

Affiche l'aide complète dans la console.

```javascript
debugJSONHelp()
```

---

## 🎯 Ce que l'outil détecte

### ✅ Erreurs de syntaxe JSON

L'outil détecte :
- Virgules manquantes ou en trop
- Guillemets non fermés
- Accolades `{}` ou crochets `[]` non appariés
- Caractères invalides
- Fin de fichier inattendue

**Affichage :**
```
❌ ERREUR DE SYNTAXE JSON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message:
  Unexpected token } in JSON at position 234

📍 Position:
  Ligne 15, Colonne 5
  Position absolue: 234

📝 Contexte:
   12 │   "title": "Exercice 1",
   13 │   "statement": "Énoncé..."
   14 │   "solution": "Solution..."
❯  15 │ }
       │ ▲
   16 │   "hint": []
   17 │ }

💡 Suggestions:
  1. Il manque probablement une virgule (,) entre deux éléments
```

### 🏗️ Validation de structure

L'outil vérifie automatiquement :

#### Pour les **chapitres** :
- ✅ Champs obligatoires : `class`, `chapter`, `lessonFile`
- ✅ Structure des exercices : `id`, `title`, `statement`, **`solution`**
- ✅ Structure des quiz : `id`, `question`, `options`
- ⚠️ Champ `solution` obligatoire dans tous les exercices

#### Pour les **leçons** :
- ✅ Champ `title` présent
- ✅ Structure `sections` avec `subsections`
- ✅ Éléments avec `type` explicite (definition, property, example...)
- ✅ Exemples avec `solution`

**Affichage :**
```
⚠️ ERREURS DE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type détecté: chapter

❌ Erreurs (3):
  1. Exercice 5: champ "solution" OBLIGATOIRE manquant
  2. Exercice 8 (Étude avec repère): champ "solution" OBLIGATOIRE manquant
  3. Quiz 3: Aucune option marquée comme correcte

⚠️ Avertissements (2):
  1. Section 2, Sous-section 1: ni "content" ni "elements" défini
  2. Quiz 5, Option 2: Ajouter une "explanation" améliorerait la pédagogie
```

### 🔬 Vérifications avancées

L'outil effectue aussi :
- 📊 Calcul de statistiques (taille, nombre de sections/exercices/quiz)
- 💡 Suggestions d'amélioration pédagogique
- ⚠️ Détection des solutions trop courtes
- ✅ Vérification des explications dans les quiz

**Affichage :**
```
📊 ANALYSE AVANCÉE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Statistiques:
  • Taille totale: 45.32 KB
  • Sections: 7
  • Exercices: 16
  • Questions quiz: 20

💡 Suggestions (5):
  1. Exercice 3: La solution semble très courte (48 caractères)
  2. Exercice 7: Il est recommandé d'ajouter des indices (hint)
  3. Quiz 2, Option 1: Ajouter une "explanation" améliorerait la pédagogie
  4. Quiz 4, Option 3: Ajouter une "explanation" améliorerait la pédagogie
  5. Section 5, Subsection 2, Element 3: Les exemples devraient avoir une "solution"

✅ Analyse terminée !
```

---

## 📋 Exemples d'utilisation pratiques

### Exemple 1 : Débogage d'un fichier avec erreur

```javascript
// Analyser le fichier
await debugJSON('/chapters/1bsm/mon_chapitre.json')

// L'outil affiche :
// ❌ ERREUR DE SYNTAXE JSON
// Message: Unexpected token } in JSON at position 1234
// 📍 Position: Ligne 45, Colonne 3
// [Contexte avec la ligne en erreur]
// 💡 Suggestions: Il manque probablement une virgule (,)
```

### Exemple 2 : Vérification avant commit

```javascript
// Vérifier tous les fichiers modifiés
await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')
await debugJSON('/chapters/1bsm/lessons/1bsm_le_barycentre_dans_le_plan.json')

// Si tout est OK :
// ✅ JSON parfaitement valide !
// 🎉 Aucun problème détecté !
```

### Exemple 3 : Tester un JSON avant de l'enregistrer

```javascript
// Copier le JSON depuis l'éditeur
const monJSON = `{
  "class": "1bsm",
  "chapter": "Test",
  "exercises": [
    {
      "id": "ex1",
      "title": "Exercice test"
      // Oups, virgule manquante ici
      "statement": "Énoncé"
    }
  ]
}`

// Analyser
debugJSONContent(monJSON)

// L'outil détecte l'erreur et affiche exactement où
```

### Exemple 4 : Comparer deux versions

```javascript
// Charger l'ancienne version
const response1 = await fetch('/chapters/1bsm/old_version.json')
const oldJSON = await response1.json()

// Charger la nouvelle version
const response2 = await fetch('/chapters/1bsm/new_version.json')
const newJSON = await response2.json()

// Comparer
compareJSON(oldJSON, newJSON)

// Affiche toutes les différences
```

---

## 💡 Bonnes pratiques

### ✅ À faire :

1. **Analyser avant de committer**
   ```bash
   # Avant git add
   # Ouvrir F12 et vérifier le JSON
   await debugJSON('/path/to/modified/file.json')
   ```

2. **Utiliser l'interface web pour les analyses complexes**
   - Plus visuel
   - Résultats colorés et formatés
   - Statistiques détaillées

3. **Copier les suggestions dans un fichier**
   - Clic droit dans la console > "Save as..."
   - Ou copier-coller les suggestions

4. **Vérifier après chaque modification importante**
   - Ajout d'exercices
   - Modification de structure
   - Fusion de branches

### ❌ À éviter :

1. **Ne pas ignorer les avertissements**
   - Même si le JSON est valide syntaxiquement
   - Les avertissements indiquent des problèmes de structure

2. **Ne pas oublier le champ `solution`**
   - Obligatoire dans tous les exercices
   - L'outil le détecte et alerte

3. **Ne pas committer avec des erreurs**
   - Toujours corriger les erreurs détectées
   - Même les petites peuvent bloquer l'application

---

## 🐛 Résolution de problèmes courants

### Problème : "Failed to fetch"

**Cause :** Le fichier n'existe pas ou le chemin est incorrect

**Solution :**
```javascript
// Vérifier le chemin (doit commencer par /)
await debugJSON('/chapters/1bsm/...')  // ✅ Correct
await debugJSON('chapters/1bsm/...')   // ❌ Incorrect
```

### Problème : "SyntaxError: Unexpected token"

**Cause :** JSON invalide

**Solution :** Suivre les suggestions de l'outil :
1. Vérifier les virgules
2. Vérifier les accolades/crochets
3. Vérifier les guillemets

### Problème : "CORS error"

**Cause :** Le serveur n'est pas démarré ou les CORS ne sont pas configurés

**Solution :**
```bash
# Démarrer le serveur de développement
npm run dev
# ou
python -m http.server 3000
```

### Problème : L'outil ne se charge pas

**Cause :** Le fichier `debug-json-tool.js` n'est pas accessible

**Solution :**
1. Vérifier que le fichier est dans `/public/debug-json-tool.js`
2. Recharger la page
3. Vérifier la console pour les erreurs de chargement

---

## 📞 Support

Si vous rencontrez des problèmes avec l'outil :

1. Vérifier ce guide en premier
2. Ouvrir la console F12 et chercher les erreurs
3. Tester avec un JSON simple pour isoler le problème
4. Consulter la section "Résolution de problèmes"

---

## 🎨 Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `F12` | Ouvrir/fermer la console développeur |
| `Ctrl + Shift + I` | Ouvrir la console (alternatif) |
| `Ctrl + L` | Effacer la console |
| `Ctrl + Enter` | Lancer l'analyse (dans les zones de texte) |
| `↑` / `↓` | Naviguer dans l'historique des commandes |

---

## 🔄 Mises à jour

L'outil est régulièrement amélioré. Pour obtenir la dernière version :

1. Recharger la page avec `Ctrl + Shift + R` (hard reload)
2. Ou vider le cache du navigateur
3. Vérifier les mises à jour du dépôt Git

---

## 📚 Exemples de fichiers

### Fichiers disponibles pour test :

```javascript
// Chapitres
await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')

// Leçons
await debugJSON('/chapters/1bsm/lessons/1bsm_le_barycentre_dans_le_plan.json')
await debugJSON('/chapters/1bsm/lessons/1bsm_arithmetique_dans_z.json')
```

---

**🎉 Bon débogage !**
