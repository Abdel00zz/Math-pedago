"""
Script pour réorganiser les chapitres par classe dans des sous-dossiers
et mettre à jour le manifest.json en conséquence.
"""

import json
import shutil
from pathlib import Path

def reorganize_chapters():
    """Réorganise les fichiers de chapitres dans des sous-dossiers par classe."""
    
    # Chemins
    base_dir = Path(__file__).parent
    public_dir = base_dir / "public"
    chapters_dir = public_dir / "chapters"
    manifest_path = public_dir / "manifest.json"
    
    # Backup du manifest
    backup_manifest = public_dir / "manifest.json.backup"
    shutil.copy2(manifest_path, backup_manifest)
    print(f"✅ Backup du manifest créé: {backup_manifest}")
    
    # Charger le manifest
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    # Classes disponibles
    classes = ['tcs', '1bse', '1bsm', '2bse', '2bsm']
    
    # Créer les sous-dossiers par classe
    for class_name in classes:
        class_dir = chapters_dir / class_name
        class_dir.mkdir(exist_ok=True)
        print(f"📁 Dossier créé: {class_dir}")
    
    # Statistiques
    moved_files = 0
    updated_entries = 0
    errors = []
    
    # Parcourir chaque classe dans le manifest
    for class_name in classes:
        if class_name not in manifest:
            print(f"⚠️  Classe '{class_name}' non trouvée dans le manifest")
            continue
        
        class_chapters = manifest[class_name]
        print(f"\n📚 Traitement de la classe: {class_name.upper()} ({len(class_chapters)} chapitres)")
        
        for chapter_entry in class_chapters:
            old_file = chapter_entry['file']
            chapter_id = chapter_entry['id']
            
            # Ancien chemin (racine de chapters/)
            old_path = chapters_dir / old_file
            
            # Nouveau chemin (chapters/classe/)
            new_file = f"{class_name}/{old_file}"
            new_path = chapters_dir / class_name / old_file
            
            # Vérifier si le fichier existe
            if not old_path.exists():
                # Peut-être déjà dans le bon dossier?
                if new_path.exists():
                    print(f"  ✓ Déjà dans le bon dossier: {new_file}")
                    chapter_entry['file'] = new_file
                    updated_entries += 1
                else:
                    error_msg = f"Fichier introuvable: {old_file}"
                    errors.append(error_msg)
                    print(f"  ❌ {error_msg}")
                continue
            
            # Déplacer le fichier
            try:
                shutil.move(str(old_path), str(new_path))
                chapter_entry['file'] = new_file
                moved_files += 1
                updated_entries += 1
                print(f"  ✓ Déplacé: {old_file} → {new_file}")
            except Exception as e:
                error_msg = f"Erreur lors du déplacement de {old_file}: {e}"
                errors.append(error_msg)
                print(f"  ❌ {error_msg}")
    
    # Sauvegarder le manifest mis à jour
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✅ Réorganisation terminée!")
    print(f"📊 Statistiques:")
    print(f"   - Fichiers déplacés: {moved_files}")
    print(f"   - Entrées du manifest mises à jour: {updated_entries}")
    print(f"   - Erreurs: {len(errors)}")
    
    if errors:
        print(f"\n⚠️  Erreurs rencontrées:")
        for error in errors[:10]:  # Limiter à 10 erreurs
            print(f"   - {error}")
        if len(errors) > 10:
            print(f"   ... et {len(errors) - 10} autres erreurs")
    
    print(f"\n💾 Manifest mis à jour: {manifest_path}")
    print(f"💾 Backup disponible: {backup_manifest}")

if __name__ == "__main__":
    print("🚀 Réorganisation des chapitres par classe...")
    print("="*60)
    reorganize_chapters()
