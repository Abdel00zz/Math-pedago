"""
Script d'optimisation complète de la structure des chapitres.
Ce script:
1. Fixe les IDs dupliqués dans le manifest
2. Réorganise les fichiers par classe dans des sous-dossiers
3. Met à jour tous les chemins dans le manifest
4. Vérifie la cohérence entre les fichiers JSON et le manifest
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Set

# Configuration
PUBLIC_DIR = Path(__file__).parent / "public"
CHAPTERS_DIR = PUBLIC_DIR / "chapters"
MANIFEST_PATH = PUBLIC_DIR / "manifest.json"
BACKUP_DIR = PUBLIC_DIR / "backups"

CLASSES = ["tcs", "1bse", "1bsm", "2bse", "2bsm"]

class ChapterOptimizer:
    def __init__(self):
        self.manifest = None
        self.all_ids: Set[str] = set()
        self.duplicates: Dict[str, List[str]] = {}
        self.stats = {
            'fixed_ids': 0,
            'moved_files': 0,
            'errors': 0
        }
    
    def create_backup(self):
        """Crée une sauvegarde complète avant les modifications."""
        print("\n📦 Création de la sauvegarde...")
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = BACKUP_DIR / timestamp
        backup_path.mkdir(parents=True, exist_ok=True)
        
        # Sauvegarder le manifest
        shutil.copy2(MANIFEST_PATH, backup_path / "manifest.json")
        
        # Sauvegarder le dossier chapters
        chapters_backup = backup_path / "chapters"
        shutil.copytree(CHAPTERS_DIR, chapters_backup, dirs_exist_ok=True)
        
        print(f"✓ Sauvegarde créée: {backup_path}")
        return backup_path
    
    def load_manifest(self):
        """Charge le manifest."""
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            self.manifest = json.load(f)
        print(f"✓ Manifest chargé: {len(self.manifest)} classes")
    
    def detect_duplicate_ids(self):
        """Détecte les IDs dupliqués dans le manifest."""
        print("\n🔍 Détection des IDs dupliqués...")
        id_to_classes: Dict[str, List[str]] = {}
        
        for class_name, chapters in self.manifest.items():
            if class_name not in CLASSES:
                continue
            for chapter in chapters:
                chapter_id = chapter['id']
                if chapter_id not in id_to_classes:
                    id_to_classes[chapter_id] = []
                id_to_classes[chapter_id].append(class_name)
        
        # Identifier les doublons
        for chapter_id, classes in id_to_classes.items():
            if len(classes) > 1:
                self.duplicates[chapter_id] = classes
                print(f"  ⚠️  ID dupliqué '{chapter_id}' trouvé dans: {', '.join(classes)}")
        
        if not self.duplicates:
            print("  ✓ Aucun ID dupliqué détecté")
        else:
            print(f"  ⚠️  {len(self.duplicates)} ID(s) dupliqué(s) détecté(s)")
        
        return len(self.duplicates)
    
    def fix_duplicate_ids(self):
        """Fixe les IDs dupliqués en les préfixant avec le nom de la classe."""
        if not self.duplicates:
            return
        
        print("\n🔧 Correction des IDs dupliqués...")
        
        for duplicate_id, classes in self.duplicates.items():
            for class_name in classes:
                # Trouver le chapitre avec cet ID dans cette classe
                for i, chapter in enumerate(self.manifest[class_name]):
                    if chapter['id'] == duplicate_id:
                        # Créer un nouvel ID unique
                        new_id = f"{class_name}-{duplicate_id}"
                        old_id = chapter['id']
                        chapter['id'] = new_id
                        
                        print(f"  ✓ {class_name}: '{old_id}' → '{new_id}'")
                        self.stats['fixed_ids'] += 1
                        self.all_ids.add(new_id)
                        break
    
    def create_class_directories(self):
        """Crée les sous-dossiers pour chaque classe."""
        print("\n📁 Création des dossiers de classes...")
        for class_name in CLASSES:
            class_dir = CHAPTERS_DIR / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            print(f"  ✓ {class_dir}")
    
    def reorganize_files(self):
        """Réorganise les fichiers dans des sous-dossiers et met à jour le manifest."""
        print("\n🔄 Réorganisation des fichiers...")
        
        for class_name in CLASSES:
            if class_name not in self.manifest:
                continue
            
            print(f"\n  📂 Classe: {class_name.upper()}")
            
            for chapter in self.manifest[class_name]:
                old_file_path = CHAPTERS_DIR / chapter['file']
                
                # Nouveau chemin avec sous-dossier
                file_name = chapter['file']
                
                # Si le fichier n'est pas déjà dans un sous-dossier
                if '/' not in file_name:
                    new_file_path = CHAPTERS_DIR / class_name / file_name
                    
                    try:
                        if old_file_path.exists():
                            # Déplacer le fichier
                            shutil.move(str(old_file_path), str(new_file_path))
                            
                            # Mettre à jour le chemin dans le manifest
                            chapter['file'] = f"{class_name}/{file_name}"
                            
                            print(f"    ✓ {file_name} → {class_name}/{file_name}")
                            self.stats['moved_files'] += 1
                        else:
                            print(f"    ⚠️  Fichier introuvable: {file_name}")
                            self.stats['errors'] += 1
                    except Exception as e:
                        print(f"    ❌ Erreur: {file_name} - {e}")
                        self.stats['errors'] += 1
                else:
                    print(f"    ℹ️  Déjà organisé: {file_name}")
    
    def verify_consistency(self):
        """Vérifie la cohérence entre les fichiers JSON et le manifest."""
        print("\n✅ Vérification de la cohérence...")
        
        inconsistencies = []
        
        for class_name in CLASSES:
            if class_name not in self.manifest:
                continue
            
            for chapter in self.manifest[class_name]:
                file_path = CHAPTERS_DIR / chapter['file']
                
                if not file_path.exists():
                    inconsistencies.append(f"Fichier manquant: {chapter['file']}")
                    continue
                
                # Vérifier le contenu du fichier
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Vérifier que la classe correspond
                    if data.get('class', '').lower() != class_name.lower():
                        inconsistencies.append(
                            f"{chapter['file']}: class='{data.get('class')}' "
                            f"(attendu: '{class_name}')"
                        )
                except Exception as e:
                    inconsistencies.append(f"Erreur de lecture {chapter['file']}: {e}")
        
        if inconsistencies:
            print(f"  ⚠️  {len(inconsistencies)} incohérence(s) détectée(s):")
            for inc in inconsistencies[:10]:  # Limiter l'affichage
                print(f"    - {inc}")
            if len(inconsistencies) > 10:
                print(f"    ... et {len(inconsistencies) - 10} autres")
        else:
            print("  ✓ Tout est cohérent!")
        
        return len(inconsistencies)
    
    def save_manifest(self):
        """Sauvegarde le manifest mis à jour."""
        print("\n💾 Sauvegarde du manifest...")
        with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.manifest, f, indent=2, ensure_ascii=False)
        print("  ✓ Manifest sauvegardé")
    
    def print_summary(self):
        """Affiche un résumé des opérations."""
        print("\n" + "=" * 70)
        print("RÉSUMÉ DE L'OPTIMISATION")
        print("=" * 70)
        print(f"  • IDs dupliqués corrigés: {self.stats['fixed_ids']}")
        print(f"  • Fichiers déplacés: {self.stats['moved_files']}")
        print(f"  • Erreurs rencontrées: {self.stats['errors']}")
        print("\n📊 Structure finale:")
        print("  public/")
        print("    chapters/")
        for class_name in CLASSES:
            class_dir = CHAPTERS_DIR / class_name
            if class_dir.exists():
                count = len(list(class_dir.glob("*.json")))
                print(f"      {class_name}/  ({count} fichiers)")
        print("=" * 70)

def main():
    print("=" * 70)
    print("OPTIMISATION COMPLÈTE DE LA STRUCTURE DES CHAPITRES")
    print("=" * 70)
    
    # Vérifications préliminaires
    if not CHAPTERS_DIR.exists():
        print(f"❌ Erreur: Le dossier {CHAPTERS_DIR} n'existe pas!")
        return 1
    
    if not MANIFEST_PATH.exists():
        print(f"❌ Erreur: Le fichier {MANIFEST_PATH} n'existe pas!")
        return 1
    
    # Créer l'optimiseur
    optimizer = ChapterOptimizer()
    
    # Créer une sauvegarde
    backup_path = optimizer.create_backup()
    
    print("\n⚠️  Cette opération va:")
    print("  1. Corriger les IDs dupliqués dans le manifest")
    print("  2. Réorganiser les fichiers dans des sous-dossiers par classe")
    print("  3. Mettre à jour tous les chemins dans le manifest")
    print(f"\n📦 Une sauvegarde a été créée: {backup_path}")
    
    response = input("\nContinuer? (oui/non): ")
    
    if response.lower() not in ['oui', 'o', 'yes', 'y']:
        print("\n❌ Opération annulée.")
        return 0
    
    try:
        # Charger le manifest
        optimizer.load_manifest()
        
        # Détecter et corriger les IDs dupliqués
        if optimizer.detect_duplicate_ids() > 0:
            optimizer.fix_duplicate_ids()
        
        # Créer les dossiers de classes
        optimizer.create_class_directories()
        
        # Réorganiser les fichiers
        optimizer.reorganize_files()
        
        # Sauvegarder le manifest
        optimizer.save_manifest()
        
        # Vérifier la cohérence
        optimizer.verify_consistency()
        
        # Afficher le résumé
        optimizer.print_summary()
        
        print("\n✅ Optimisation terminée avec succès!")
        print(f"💡 En cas de problème, restaurez depuis: {backup_path}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        print(f"💡 Restaurez depuis la sauvegarde: {backup_path}")
        return 1

if __name__ == "__main__":
    exit(main())
