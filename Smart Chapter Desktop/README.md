# Smart Chapter Manager - Application Desktop Professionnelle

Application desktop PyQt6 professionnelle pour gérer les chapitres pédagogiques et les concours de la plateforme Math-pedago.

## 🚀 Fonctionnalités

### 📚 Gestion des Chapitres
- **Visualisation par classe** : TCS, 1BSE, 1BSM, 2BSE, 2BSM
- **Édition complète** : Informations, vidéos, quiz, exercices
- **Statut actif/inactif** : Gestion de la visibilité des chapitres
- **Versioning automatique** : Suivi des modifications

### 🏆 Gestion des Concours
- **Multi-types** : Médecine, ENSA, ENSAM
- **Organisation par année** : Gestion chronologique
- **Résumé pédagogique** : 6 types de sections (définitions, formules, méthodes, pièges, réflexion, astuces)
- **Quiz intégrés** : Questions avec explications et indices
- **Synchronisation automatique** : Mise à jour de l'index.json

### 📁 Import / Export
- **Import JSON** : Importation de concours depuis fichiers externes
- **Export complet** : Exportation de tous les concours
- **Export sélectif** : Exportation de concours spécifiques
- **Validation** : Vérification de l'intégrité des données

### 📊 Statistiques
- **Vue globale** : Nombre total de chapitres et concours
- **Par classe** : Statistiques détaillées par niveau
- **Par type** : Statistiques par type de concours
- **Temps réel** : Actualisation automatique

## 🛠️ Installation

### Prérequis
- Python 3.9 ou supérieur
- pip (gestionnaire de paquets Python)

### Installation des dépendances

```bash
# Cloner le dépôt
cd "Smart Chapter Desktop"

# Installer les dépendances
pip install -r requirements.txt
```

## 🎯 Utilisation

### Lancer l'application

```bash
python main.py
```

### Ouvrir un projet

1. Cliquer sur **"📂 Ouvrir Projet"** dans la barre d'outils
2. Sélectionner le répertoire racine de Math-pedago
3. L'application charge automatiquement :
   - Le fichier `public/manifest.json`
   - Le fichier `public/concours/index.json`
   - Tous les chapitres et concours

### Gérer les chapitres

1. **Onglet "📚 Chapitres"**
2. Sélectionner une classe dans le menu déroulant
3. Double-cliquer sur un chapitre pour l'éditer
4. Utiliser les boutons :
   - **➕ Nouveau Chapitre** : Créer un nouveau chapitre
   - **✏️ Éditer** : Éditer le chapitre sélectionné
   - **🗑️ Supprimer** : Supprimer un chapitre

### Gérer les concours

1. **Onglet "🏆 Concours"**
2. Sélectionner le type de concours (Médecine, ENSA, ENSAM)
3. Visualiser tous les concours disponibles
4. Utiliser les boutons :
   - **➕ Nouveau Concours** : Créer un nouveau concours
   - **✏️ Éditer** : Éditer le concours sélectionné
   - **🔄 Synchroniser Index** : Mettre à jour l'index automatiquement

### Import / Export

**Import :**
1. **Onglet "📁 Import/Export"**
2. Section **"📥 Import"**
3. Cliquer sur **"📁 Parcourir"** pour sélectionner un fichier JSON
4. Cliquer sur **"⬆️ Importer"**

**Export :**
1. **Onglet "📁 Import/Export"**
2. Section **"📤 Export"**
3. Options :
   - **⬇️ Exporter Tous les Concours** : Exporte tous les concours en un seul fichier
   - **⬇️ Exporter la Sélection** : Exporte uniquement les concours sélectionnés

### Visualiser les statistiques

1. **Onglet "📊 Statistiques"**
2. Voir les statistiques globales :
   - Nombre de chapitres par classe
   - Nombre de concours par type
   - Dernière mise à jour
3. Cliquer sur **"🔄 Actualiser les Statistiques"** pour rafraîchir

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+O` | Ouvrir un projet |
| `Ctrl+S` | Sauvegarder toutes les modifications |
| `Ctrl+N` | Nouveau chapitre |
| `Ctrl+Q` | Quitter l'application |

## 🎨 Interface

### Style Moderne
- **Design épuré** : Interface claire et professionnelle
- **Couleurs cohérentes** : Palette de couleurs moderne
- **Icônes expressives** : Emojis pour une meilleure UX
- **Responsive** : Adaptation à différentes tailles d'écran

### Organisation
- **Onglets principaux** : Navigation facile entre les sections
- **Splitters** : Panneaux redimensionnables
- **Tables interactives** : Tri et filtrage des données
- **Barre de statut** : Informations en temps réel

## 📦 Structure des Données

### Format Concours JSON

```json
{
  "id": "medecine-2024-nombres-complexes",
  "concours": "Médecine",
  "annee": "2024",
  "theme": "Les nombres complexes",
  "resume": {
    "title": "Les nombres complexes - L'essentiel",
    "introduction": "Introduction avec support LaTeX $...$",
    "sections": [
      {
        "type": "definitions",
        "title": "Définitions clés",
        "items": ["**Définition 1** : ...", "**Définition 2** : ..."]
      }
    ]
  },
  "quiz": [
    {
      "id": "q1",
      "theme": "Les nombres complexes",
      "question": "Question avec support LaTeX $...$",
      "type": "mcq",
      "options": [...],
      "explanation": "Explication détaillée",
      "hints": ["Indice 1", "Indice 2"]
    }
  ]
}
```

## 🔧 Configuration

### Fichiers Principaux

- **`main.py`** : Point d'entrée de l'application
- **`requirements.txt`** : Dépendances Python
- **`README.md`** : Documentation (ce fichier)

### Dossiers Projet Math-pedago

- **`public/manifest.json`** : Index des chapitres
- **`public/concours/index.json`** : Index des concours
- **`public/concours/medecine/`** : Concours de médecine
- **`public/concours/ensa/`** : Concours ENSA
- **`public/concours/ensam/`** : Concours ENSAM

## 🐛 Débogage

### Logs
Les erreurs sont affichées dans :
- Boîtes de dialogue d'erreur
- Barre de statut
- Console Python (si lancé depuis terminal)

### Problèmes Courants

**L'application ne démarre pas :**
- Vérifier que Python 3.9+ est installé : `python --version`
- Vérifier que PyQt6 est installé : `pip list | grep PyQt6`

**Le projet ne se charge pas :**
- Vérifier que le répertoire contient `public/manifest.json`
- Vérifier les permissions du dossier

**Erreur lors de la sauvegarde :**
- Vérifier les permissions d'écriture
- Vérifier que le format JSON est valide

## 🚀 Développement Futur

### Fonctionnalités Planifiées
- [ ] Éditeur WYSIWYG pour les résumés
- [ ] Prévisualisation LaTeX en temps réel
- [ ] Import depuis Excel/CSV
- [ ] Export PDF des résumés
- [ ] Recherche avancée
- [ ] Filtres multiples
- [ ] Mode sombre
- [ ] Multi-langue
- [ ] Backup automatique
- [ ] Historique des modifications

### Améliorations Techniques
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] CI/CD
- [ ] Documentation API
- [ ] Packaging (exe, dmg, deb)

## 📝 Licence

Ce projet fait partie de la plateforme Math-pedago.

## 👥 Contribution

Pour contribuer :
1. Fork le projet
2. Créer une branche feature
3. Commit les modifications
4. Push vers la branche
5. Créer une Pull Request

## 📧 Contact

Pour toute question ou suggestion, veuillez ouvrir une issue sur GitHub.

---

**Développé avec ❤️ pour l'éducation mathématique**
