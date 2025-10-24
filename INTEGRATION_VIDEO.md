# Intégration Vidéo - Guide d'Utilisation

## Vue d'ensemble

Le lecteur vidéo pédagogique a été intégré dans la plateforme Math-pedago pour offrir une expérience d'apprentissage optimale, notamment sur smartphone et petits écrans.

## Caractéristiques principales

### 🎯 Design pédagogique
- **Interface épurée** : Contrôles minimaux pour éviter la distraction
- **Auto-masquage** : Les contrôles se cachent automatiquement après 3 secondes
- **Bouton play central** : Large et accessible pour faciliter le démarrage

### 📱 Optimisation mobile
- **Responsive** : S'adapte automatiquement à toutes les tailles d'écran
- **Format natif** : Utilise HTML5 Video (pas d'iframe YouTube)
- **Plein écran mobile** : Mode plein écran optimisé pour smartphones
- **Touch-friendly** : Contrôles adaptés au tactile

### 🎓 Fonctionnalités pédagogiques
- **Timestamps** : Marqueurs temporels pour les concepts clés
- **Navigation rapide** : Avance/recul de 10 secondes
- **Points clés** : Liste des moments importants de la vidéo

### 🚫 Anti-distraction
- **Pas de suggestions** : Aucune vidéo recommandée
- **Pas de publicités** : Lecture pure sans interruption
- **Pas de commentaires** : Focus uniquement sur le contenu pédagogique
- **Mode natif** : Contrôle total sur l'expérience utilisateur

## Structure des données

### Format JSON pour ajouter une vidéo

```json
{
  "exercises": [
    {
      "id": "ex1",
      "title": "Titre de l'exercice",
      "statement": "Énoncé de l'exercice",
      "video": {
        "url": "https://example.com/video.mp4",
        "title": "Titre optionnel de la vidéo",
        "duration": "5:30",
        "timestamps": [
          {
            "time": 0,
            "label": "Introduction"
          },
          {
            "time": 60,
            "label": "Concept principal"
          },
          {
            "time": 180,
            "label": "Exemples"
          }
        ]
      }
    }
  ]
}
```

### Champs de VideoResource

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `url` | string | ✅ Oui | URL de la vidéo (MP4 recommandé) |
| `title` | string | ❌ Non | Titre de la vidéo |
| `duration` | string | ❌ Non | Durée au format "MM:SS" |
| `timestamps` | array | ❌ Non | Points clés avec temps et label |

### Champs de VideoTimestamp

| Champ | Type | Description |
|-------|------|-------------|
| `time` | number | Temps en secondes |
| `label` | string | Description du point clé |

## Contrôles disponibles

### Sur ordinateur
- **Clic sur la vidéo** : Lecture/Pause
- **Barre de progression** : Déplacement dans la vidéo
- **Boutons ◀ 10 / 10 ▶** : Reculer/Avancer de 10 secondes
- **Volume** : Contrôle du son avec slider
- **Plein écran** : Mode immersif

### Sur mobile
- **Tap sur la vidéo** : Lecture/Pause
- **Tap sur les contrôles** : Affiche les contrôles pendant 3s
- **Plein écran** : Rotation automatique en mode paysage
- **Contrôles simplifiés** : Interface optimisée pour petits écrans

## Formats vidéo recommandés

### Format fichier
- **MP4** (H.264) : Meilleure compatibilité navigateurs
- **WebM** : Alternative open-source
- Éviter : AVI, MOV (compatibilité limitée)

### Résolution
- **720p (1280×720)** : Recommandé pour équilibre qualité/poids
- **1080p** : Pour contenu détaillé (tableaux, graphiques)
- **480p** : Acceptable pour connexions lentes

### Hébergement
Plusieurs options :
1. **Stockage local** : Placer les vidéos dans `/public/videos/`
2. **CDN** : Cloudflare, AWS S3, Google Cloud Storage
3. **Services vidéo** : Vimeo (mode privé), Bunny CDN
4. **Auto-hébergé** : Votre propre serveur

⚠️ **Important** : Éviter YouTube pour les iframes (publicités, distractions)

## Exemple d'utilisation

Un fichier exemple complet est disponible dans :
`/public/chapters/VIDEO_EXAMPLE.json`

Pour l'utiliser :
1. Copiez la structure JSON
2. Remplacez l'URL par votre vidéo
3. Ajoutez des timestamps pertinents
4. Intégrez dans votre chapitre

## Avantages de cette solution

### Pour l'élève
- ✅ Expérience sans distraction
- ✅ Navigation facile sur smartphone
- ✅ Points clés accessibles rapidement
- ✅ Interface intuitive

### Pour l'enseignant
- ✅ Contrôle total sur le contenu
- ✅ Pas de dépendance à YouTube/services tiers
- ✅ Aucune publicité
- ✅ Expérience cohérente sur tous les appareils

## Dépannage

### La vidéo ne se charge pas
- Vérifiez que l'URL est accessible
- Testez l'URL dans un navigateur
- Vérifiez le format (MP4 recommandé)
- Assurez-vous que les CORS sont configurés si hébergement externe

### Les contrôles ne s'affichent pas
- Bougez la souris sur la vidéo
- Tapez sur la vidéo (mobile)
- Les contrôles s'affichent automatiquement quand la vidéo est en pause

### Le plein écran ne fonctionne pas
- Certains navigateurs nécessitent une interaction utilisateur
- Vérifiez les permissions du navigateur
- Essayez un autre navigateur

## Performance

### Chargement optimisé
- `preload="metadata"` : Charge uniquement les métadonnées
- Pas de chargement automatique de la vidéo complète
- Économie de bande passante

### Mobile
- Format adaptatif 16:9
- Contrôles tactiles optimisés
- Mode plein écran natif du navigateur

## Accessibilité

Pour améliorer l'accessibilité :
- Ajoutez des sous-titres si possible
- Utilisez des labels clairs pour les timestamps
- Assurez-vous du contraste des contrôles
- Testez avec lecteurs d'écran

## Support navigateurs

Le lecteur vidéo est compatible avec :
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (desktop et iOS)
- ✅ Opera
- ✅ Navigateurs mobiles modernes

Versions minimales :
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Prochaines améliorations possibles

- [ ] Sous-titres/captions
- [ ] Vitesse de lecture (0.5x, 1x, 1.5x, 2x)
- [ ] Mode picture-in-picture
- [ ] Téléchargement pour visionnage hors-ligne
- [ ] Notes temporelles de l'élève
- [ ] Quizz intégrés à la vidéo

---

**Questions ou problèmes ?** Ouvrez une issue sur le dépôt GitHub.
