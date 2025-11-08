# Terminologie Pédagogique et Motivante

## 🎯 Problème résolu

**Incohérence identifiée :** Les chapitres affichaient "À venir" même quand ils étaient déverrouillés et disponibles, créant une confusion entre :
- Chapitres **disponibles** (déverrouillés, prêts à commencer)
- Chapitres **verrouillés** (pas encore accessibles)

## ✨ Nouvelle terminologie

### 1. Statuts des chapitres (ChapterCard)

| Ancien | Nouveau | Contexte | Sentiment |
|--------|---------|----------|-----------|
| À venir | **Disponible** | Chapitre déverrouillé, non commencé | 🎯 Invitation |
| Verrouillé | **Bientôt** | Chapitre pas encore accessible | ⏳ Anticipation |
| En cours | **En apprentissage** | Chapitre en cours de travail | 📚 Progression |
| Terminé | **Réussi** | Chapitre complété à 100% | 🎉 Accomplissement |

**Icônes mises à jour :**
- Disponible : `auto_stories` (livre ouvert) au lieu de `radio_button_unchecked`
- Autres : conservées

### 2. Labels de cartes (eyebrow)

| Ancien | Nouveau |
|--------|---------|
| Chapitre actif | **Chapitre ouvert** |
| Chapitre complété | **Chapitre maîtrisé** |
| Chapitre verrouillé | **Bientôt disponible** |

### 3. Dashboard - Métriques de progression

| Métrique | Ancien | Nouveau |
|----------|--------|---------|
| **En cours** | En cours | **En apprentissage** |
| Caption | Apprentissages actifs | **Votre parcours actuel** |
| **Acquis** | Acquis | **Maîtrisés** |
| Caption | X travaux remis | **X chapitres réussis** |
| Caption vide | Objectifs à atteindre | **Premiers pas à faire** |
| **Quiz** | Quiz soumis | **Quiz validés** |
| Caption vide | Scores à venir | **Évaluations à venir** |
| **À venir** | À venir | **Disponibles** |
| Icône | calendar_month | **explore** (boussole) |
| Caption vide | Séances programmées | **Nouveaux défis à découvrir** |

### 4. Dashboard - Titres de sections

| Ancien | Nouveau | Emoji |
|--------|---------|-------|
| Chapitres en cours | **Votre apprentissage en cours** | 🎯 |
| Chapitres à venir | **Chapitres disponibles** | 📚 |
| Chapitres achevés | **Chapitres réussis** | ✅ |

**Ordre d'affichage optimisé :**
1. 🎯 Votre apprentissage en cours (priorité maximale)
2. 📚 Chapitres disponibles (invitation à continuer)
3. ✅ Chapitres réussis (valorisation en bas)

### 5. Notifications

| Ancien | Nouveau |
|--------|---------|
| Chapitre verrouillé | **Patience !** |
| Message | Complétez d'abord... | **Ce chapitre sera bientôt disponible** |
| Type | warning | **info** |

### 6. ChapterHubView - Boutons d'étapes

| Contexte | Ancien | Nouveau |
|----------|--------|---------|
| Contenu pas encore disponible | À venir | **Bientôt** |
| Quiz non accessible | Verrouillé | **En attente** |

### 7. ActivityView - Quiz

| Ancien | Nouveau |
|--------|---------|
| Quiz verrouillé | **Quiz en attente** |
| débloquer le quiz | **accéder au quiz** |

## 🎓 Principes pédagogiques appliqués

### 1. **Clarté de l'état**
- ✅ "Disponible" vs "Bientôt" : distinction claire
- ✅ Pas d'ambiguïté entre accessible et verrouillé

### 2. **Positivité et motivation**
- ✅ "Réussi" au lieu de "Terminé" (valorisation)
- ✅ "En apprentissage" au lieu de "En cours" (dynamisme)
- ✅ "Maîtrisés" au lieu de "Acquis" (fierté)
- ✅ "Bientôt" au lieu de "Verrouillé" (anticipation positive)

### 3. **Langage d'action**
- ✅ "Disponible" : appel à l'action
- ✅ "Votre parcours actuel" : personnalisation
- ✅ "Nouveaux défis à découvrir" : curiosité

### 4. **Encouragement**
- ✅ "Patience !" au lieu de message d'erreur
- ✅ "En attente" au lieu de "Verrouillé"
- ✅ "Premiers pas à faire" au lieu de "Remise à venir"

## 📊 Impact utilisateur

### Avant
```
❌ "À venir" pour un chapitre déverrouillé → Confusion
❌ "Verrouillé" → Frustration
❌ "Terminé" → Neutre
❌ "Travaux remis" → Administratif
```

### Après
```
✅ "Disponible" pour un chapitre déverrouillé → Clarté + Invitation
✅ "Bientôt" → Anticipation positive
✅ "Réussi" → Accomplissement
✅ "Chapitres réussis" → Fierté
```

## 🔄 Cohérence du vocabulaire

### Verbes d'action
- **Commencer** : Premier accès à un contenu
- **Continuer** : Reprise d'un contenu en cours
- **Revoir** / **Relire** : Révision d'un contenu terminé
- **Consulter** : Mode lecture seule (chapitre verrouillé)

### États de progression
- **Disponible** : Prêt à commencer (déverrouillé, 0%)
- **En apprentissage** : En cours de réalisation (1-99%)
- **Réussi** / **Maîtrisé** : Complété à 100%
- **Bientôt** : Pas encore accessible (verrouillé)
- **En attente** : Dépend d'une condition (ex: leçon incomplète)

## ✅ Fichiers modifiés

1. **components/ChapterCard.tsx**
   - Badges de statut
   - Labels eyebrow
   - Icônes

2. **components/views/DashboardView.tsx**
   - Métriques de progression
   - Titres de sections
   - Notifications

3. **components/views/ChapterHubView.tsx**
   - Textes des boutons d'étapes

4. **components/views/ActivityView.tsx**
   - Message quiz non accessible

## 🎯 Résultat final

Une terminologie cohérente, motivante et pédagogique qui :
- ✅ Élimine les ambiguïtés
- ✅ Encourage l'apprentissage
- ✅ Valorise les réussites
- ✅ Guide clairement l'élève
- ✅ Crée un sentiment de progression positive
