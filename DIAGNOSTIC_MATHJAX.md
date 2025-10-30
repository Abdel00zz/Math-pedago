# 🔍 Guide de Diagnostic MathJax

## Problème: Les formules LaTeX s'affichent comme `$ D_f $` au lieu d'être rendues

## Solution: Utiliser l'outil de diagnostic

### Étape 1: Ouvrir la console du navigateur
- Appuyez sur **F12**
- Allez dans l'onglet **Console**

### Étape 2: Lancer le diagnostic
Tapez dans la console:
```javascript
window.diagnoseMathJax()
```

### Étape 3: Analyser les résultats

Le diagnostic va vérifier:

1. **📦 MathJax est-il chargé?**
   - ✅ Si OUI: MathJax est disponible
   - ❌ Si NON: Le script MathJax n'est pas dans index.html

2. **⚙️ Configuration MathJax**
   - Affiche les délimiteurs configurés ($...$ et $$...$$)

3. **🔎 Expressions LaTeX dans le DOM**
   - Compte combien d'expressions $...$ existent
   - Affiche des exemples

4. **📊 Conteneurs MathJax rendus**
   - ✅ Si `mjx-container` existe: MathJax fonctionne!
   - ❌ Si AUCUN `mjx-container`: MathJax ne rend pas les formules

5. **🎯 Éléments math-content**
   - Vérifie si les composants React passent bien le contenu

## Solutions selon le diagnostic

### Cas 1: MathJax n'est pas chargé
```
❌ PROBLÈME: MathJax n'est pas chargé
```
**Solution**: Vérifiez que `index.html` contient:
```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async></script>
```

### Cas 2: Expressions $ $ existent mais ne sont PAS rendues
```
❌ PROBLÈME: Des expressions $ $ existent mais ne sont PAS rendues
```
**Solutions possibles**:
1. Les délimiteurs ne sont pas configurés → Vérifier la config dans index.html
2. Conflit avec le traitement Markdown → Vérifier que formatText ne touche pas aux $ $
3. Forcer le rendu:
   ```javascript
   window.MathJax.typesetPromise([document.body])
   ```

### Cas 3: Tout fonctionne
```
✅ TOUT FONCTIONNE! MathJax rend correctement les formules
```
Si vous voyez toujours des `$ $`, videz le cache: **Ctrl+Shift+R**

## Modifications effectuées

### 1. MathContent.tsx
- ✅ Protection des expressions LaTeX pendant le traitement Markdown
- ✅ Logs de diagnostic détaillés avec `MATHJAX_DEBUG = true`
- ✅ Vérifications à chaque étape du rendu

### 2. Exercises.tsx
- ✅ Suppression du traitement Markdown (délégué à MathContent)
- ✅ Le texte brut est passé directement à MathContent

### 3. mathJaxDiagnostic.ts
- ✅ Outil de diagnostic complet accessible via `window.diagnoseMathJax()`

## Désactiver les logs de debug

Pour désactiver les logs détaillés, dans `MathContent.tsx`:
```typescript
const MATHJAX_DEBUG = false;  // Changez true en false
```

## Test manuel

Dans la console F12:
```javascript
// Forcer le rendu de toute la page
window.MathJax.typesetPromise([document.body])

// Forcer le rendu d'un élément spécifique
const element = document.querySelector('.math-content');
window.MathJax.typesetPromise([element])
```
