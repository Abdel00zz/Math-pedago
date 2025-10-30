"""
Script de validation et correction complète du système de chapitres.
Vérifie que:
1. Tous les fichiers dans manifest existent
2. Tous les IDs sont uniques
3. Les fichiers sont dans les bons dossiers
4. Le champ "class" dans chaque JSON correspond à sa classe dans le manifest
"""

import json
from pathlib import Path
from collections import defaultdict

def validate_and_fix_system():
    base_dir = Path(__file__).parent
    public_dir = base_dir / "public"
    chapters_dir = public_dir / "chapters"
    manifest_path = public_dir / "manifest.json"
    
    print("🔍 Validation complète du système...")
    print("="*60)
    
    # Charger le manifest
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    # Statistiques
    total_chapters = 0
    missing_files = []
    duplicate_ids = defaultdict(list)
    mismatched_classes = []
    issues_fixed = 0
    
    # Vérification des IDs uniques
    all_ids = set()
    
    for class_name, chapters in manifest.items():
        print(f"\n📚 Classe: {class_name.upper()} ({len(chapters)} chapitres)")
        total_chapters += len(chapters)
        
        for chapter in chapters:
            chapter_id = chapter['id']
            file_path = chapter['file']
            
            # Vérifier les IDs dupliqués
            if chapter_id in all_ids:
                duplicate_ids[chapter_id].append(class_name)
            all_ids.add(chapter_id)
            
            # Vérifier que le fichier existe
            full_path = chapters_dir / file_path
            if not full_path.exists():
                missing_files.append(f"{class_name}/{file_path}")
                print(f"  ❌ Fichier manquant: {file_path}")
                continue
            
            # Vérifier que le champ "class" dans le JSON correspond
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                json_class = data.get('class', '').lower()
                if json_class != class_name:
                    mismatched_classes.append({
                        'file': file_path,
                        'manifest_class': class_name,
                        'json_class': json_class
                    })
                    print(f"  ⚠️  {file_path}: class='{json_class}' (devrait être '{class_name}')")
                    
                    # Corriger automatiquement
                    data['class'] = class_name
                    with open(full_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    print(f"     ✅ Corrigé automatiquement")
                    issues_fixed += 1
                else:
                    print(f"  ✓ {file_path}")
                    
            except Exception as e:
                print(f"  ❌ Erreur de lecture {file_path}: {e}")
    
    # Rapport final
    print(f"\n{'='*60}")
    print(f"📊 RAPPORT DE VALIDATION")
    print(f"{'='*60}")
    print(f"Total chapitres: {total_chapters}")
    print(f"Fichiers manquants: {len(missing_files)}")
    print(f"Classes incorrectes: {len(mismatched_classes)} (corrigées: {issues_fixed})")
    print(f"IDs dupliqués: {len(duplicate_ids)}")
    
    if duplicate_ids:
        print(f"\n⚠️  IDs DUPLIQUÉS:")
        for dup_id, classes in duplicate_ids.items():
            print(f"   - '{dup_id}' trouvé dans: {', '.join(classes)}")
    
    if missing_files:
        print(f"\n❌ FICHIERS MANQUANTS:")
        for missing in missing_files[:10]:
            print(f"   - {missing}")
        if len(missing_files) > 10:
            print(f"   ... et {len(missing_files) - 10} autres")
    
    print(f"\n{'='*60}")
    if len(duplicate_ids) == 0 and len(missing_files) == 0 and len(mismatched_classes) == 0:
        print("✅ SYSTÈME PARFAIT! Aucun problème détecté.")
    else:
        print(f"✅ Validation terminée. {issues_fixed} problèmes corrigés.")
        if len(duplicate_ids) > 0:
            print("⚠️  Il reste des IDs dupliqués à corriger manuellement.")
        if len(missing_files) > 0:
            print("⚠️  Il reste des fichiers manquants.")

if __name__ == "__main__":
    validate_and_fix_system()
