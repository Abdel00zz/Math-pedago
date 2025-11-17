# 🧪 Guide de Test - Persistance PWA

## Problème Résolu

✅ **Le nom et la classe ne sont plus perdus lors de la fermeture de l'application PWA**

## 🚀 Comment Tester

### Option 1 : Test Automatique (Recommandé)

1. Ouvrir le fichier `test_pwa_storage.html` dans votre navigateur :
   ```
   http://localhost:5173/test_pwa_storage.html
   ```

2. Suivre les étapes dans l'interface de test :
   - Cliquer sur "💾 Sauvegarder un profil de test"
   - Vérifier que le profil apparaît dans la section "👤 Profil Utilisateur"
   - Fermer le navigateur complètement
   - Rouvrir et relancer la page de test
   - ✅ Le profil doit toujours être affiché

### Option 2 : Test Manuel dans l'Application

1. **Lancer l'application** :
   ```powershell
   npm run dev
   ```

2. **Se connecter** :
   - Entrer votre nom complet
   - Choisir votre classe
   - Cliquer sur "Accéder à mon espace"

3. **Vérifier la sauvegarde** :
   - Ouvrir la console du navigateur (F12)
   - Chercher les logs suivants :
     ```
     [AppContext] Sauvegarde état avec profil: { name: "...", classId: "..." }
     [AppContext] État sauvegardé avec succès dans nouvelle clé
     ```

4. **Tester la persistance** :
   - Fermer complètement le navigateur (ou l'onglet)
   - Relancer l'application
   - ✅ Le nom doit être pré-rempli et grisé
   - ✅ La classe doit être pré-sélectionnée

### Option 3 : Test sur PWA Mobile

#### Sur Android (Chrome)

1. **Installer la PWA** :
   - Ouvrir l'app dans Chrome
   - Menu (⋮) → "Installer l'application"
   - Confirmer l'installation

2. **Se connecter** :
   - Lancer l'app depuis l'écran d'accueil
   - Se connecter normalement

3. **Test de persistance** :
   - Fermer l'app complètement (swipe up + fermer)
   - Attendre 30 secondes
   - Relancer l'app depuis l'écran d'accueil
   - ✅ Le nom et la classe doivent être conservés

#### Sur iOS (Safari)

1. **Installer la PWA** :
   - Ouvrir l'app dans Safari
   - Partager (📤) → "Sur l'écran d'accueil"
   - Ajouter

2. **Se connecter** :
   - Lancer l'app depuis l'écran d'accueil
   - Se connecter normalement

3. **Test de persistance** :
   - Fermer l'app (swipe up)
   - Attendre 30 secondes
   - Relancer l'app
   - ✅ Le nom et la classe doivent être conservés

## 🔍 Inspecter le localStorage (Console Navigateur)

### Voir toutes les clés stockées
```javascript
console.table(Object.keys(localStorage));
```

### Voir le profil actuel (nouvelle clé)
```javascript
const data = JSON.parse(localStorage.getItem('math-pedago:app:v5.0'));
console.log('Profil:', data?.data?.profile);
```

### Voir le profil actuel (ancienne clé - temporaire)
```javascript
const oldData = JSON.parse(localStorage.getItem('pedagoEleveData_V4.7_React'));
console.log('Profil (ancienne clé):', oldData?.profile);
```

### Vérifier la migration
```javascript
const migrated = JSON.parse(localStorage.getItem('math-pedago:migrations:v1.0'));
console.log('Migration effectuée:', migrated?.data);
```

## 📊 Logs Attendus

### Au Premier Chargement (Nouvelle Installation)
```
[AppContext] Initialisation du StorageService...
[StorageService] Démarrage de la migration...
[StorageService] Migration déjà effectuée (ou aucune donnée à migrer)
[AppContext] 0 entrées nettoyées
[AppContext] Données chargées depuis nouvelle clé undefined
[LoginView] Profile chargé: null
```

### Après Connexion
```
[AppContext] Sauvegarde état avec profil: { name: "Test Utilisateur", classId: "1bac-sm" }
[AppContext] État sauvegardé avec succès dans nouvelle clé
```

### Au Rechargement (Utilisateur Connecté)
```
[AppContext] Initialisation du StorageService...
[AppContext] Données chargées depuis nouvelle clé { profile: { name: "Test Utilisateur", classId: "1bac-sm" }, ... }
[LoginView] Profile chargé: { name: "Test Utilisateur", classId: "1bac-sm" }
[LoginView] Nom pré-rempli: Test Utilisateur
[LoginView] Classe pré-remplie: 1bac-sm
```

### Lors d'une Migration
```
[AppContext] Initialisation du StorageService...
[StorageService] Démarrage de la migration...
[StorageService] Données app migrées
[StorageService] Migration terminée avec succès
[AppContext] 1 entrées nettoyées
[AppContext] Données chargées depuis ancienne clé { profile: {...}, ... }
[AppContext] Données migrées vers nouvelle clé
```

## ❓ Dépannage

### Problème : Le nom n'est toujours pas sauvegardé

1. **Vérifier la console** : Y a-t-il des erreurs ?
2. **Vider le cache** :
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **Réinstaller la PWA** :
   - Désinstaller l'app
   - Vider le cache du navigateur
   - Réinstaller

### Problème : Erreur "localStorage quota exceeded"

Le localStorage est plein. Nettoyer les anciennes données :
```javascript
// Supprimer les anciennes clés
localStorage.removeItem('pedagoEleveData_V4.6_React');
localStorage.removeItem('pedago.lessonProgress.v1');

// Ou vider complètement (ATTENTION : perte de données)
localStorage.clear();
```

### Problème : Migration ne se déclenche pas

Forcer la migration :
```javascript
// Dans la console
localStorage.removeItem('math-pedago:migrations:v1.0');
location.reload();
```

## ✅ Checklist de Validation

- [ ] Nom pré-rempli après reconnexion
- [ ] Classe pré-sélectionnée après reconnexion
- [ ] Nom grisé et non modifiable si déjà stocké
- [ ] Données persistantes après fermeture de l'app PWA
- [ ] Logs corrects dans la console
- [ ] Migration automatique depuis ancienne version
- [ ] Fonctionne en mode hors ligne
- [ ] Pas d'erreur dans la console

## 📝 Notes

- La double sauvegarde (ancienne + nouvelle clé) est **temporaire**
- Dans quelques semaines, l'ancienne clé sera supprimée
- Le StorageService gère automatiquement le versioning et l'expiration
- Les données sont stockées localement (pas de serveur requis)

## 🆘 Besoin d'Aide ?

Si le problème persiste :
1. Copier les logs de la console
2. Prendre une capture d'écran
3. Vérifier le contenu du localStorage (voir commandes ci-dessus)
4. Contacter le support technique

---

**Dernière mise à jour** : 17 novembre 2025
