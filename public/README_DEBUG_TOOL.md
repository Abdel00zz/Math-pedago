# 🔍 JSON Debug Tool

Outil intelligent de débogage pour fichiers JSON pédagogiques.

## 🚀 Démarrage rapide

### Option 1 : Interface Web (Recommandé)
Ouvrir dans le navigateur : `http://localhost:3000/debug-json.html`

### Option 2 : Console F12
1. Ouvrir n'importe quelle page du site
2. Appuyer sur `F12`
3. Dans la console :
```javascript
// L'outil est déjà chargé automatiquement
await debugJSON('/chapters/1bsm/1bsm_le_barycentre_dans_le_plan.json')
```

## 📚 Documentation complète
Voir : `../DEBUG_JSON_GUIDE.md`

## ✨ Fonctionnalités

- ✅ Détection précise des erreurs de syntaxe (ligne + colonne)
- 🎯 Validation de structure (chapitres/leçons)
- 💡 Suggestions de correction intelligentes
- 📊 Statistiques sur le contenu
- 🔬 Vérifications avancées (champs obligatoires, etc.)
- 🎨 Affichage coloré et contexte d'erreur

## 🔧 Commandes principales

```javascript
// Analyser un fichier
await debugJSON('/path/to/file.json')

// Analyser du texte
debugJSONContent('{"test": "value"}')

// Comparer deux versions
compareJSON(json1, json2)

// Aide
debugJSONHelp()
```

## 📁 Fichiers

- `debug-json-tool.js` - Script principal
- `debug-json.html` - Interface web
- `../DEBUG_JSON_GUIDE.md` - Documentation détaillée
