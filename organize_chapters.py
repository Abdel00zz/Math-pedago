#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour déplacer tous les fichiers de chapitres vers le dossier chapters
et s'assurer que l'application les trouve au bon endroit.
"""

import json
import shutil
from pathlib import Path

def organize_chapter_files():
    """Déplace tous les fichiers de chapitres vers le dossier chapters."""
    
    public_dir = Path("public")
    chapters_dir = public_dir / "chapters"
    
    # Créer le dossier chapters s'il n'existe pas
    chapters_dir.mkdir(exist_ok=True)
    
    # Lire le manifest pour connaître tous les fichiers de chapitres
    manifest_path = public_dir / "manifest.json"
    if not manifest_path.exists():
        print("❌ manifest.json introuvable")
        return
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)
    except Exception as e:
        print(f"❌ Erreur lors de la lecture du manifest: {e}")
        return
    
    moved_count = 0
    existing_count = 0
    
    print("🔄 Organisation des fichiers de chapitres...")
    
    # Parcourir toutes les classes et chapitres
    for class_type, chapters in manifest_data.items():
        print(f"\n📂 Traitement de la classe: {class_type}")
        
        for chapter_info in chapters:
            filename = chapter_info.get('file', '')
            if not filename:
                continue
            
            source_path = public_dir / filename
            target_path = chapters_dir / filename
            
            # Si le fichier est dans public mais pas dans chapters, le déplacer
            if source_path.exists() and not target_path.exists():
                try:
                    shutil.move(str(source_path), str(target_path))
                    print(f"  ✅ Déplacé: {filename}")
                    moved_count += 1
                except Exception as e:
                    print(f"  ❌ Erreur lors du déplacement de {filename}: {e}")
            elif target_path.exists():
                print(f"  ℹ️  Déjà dans chapters: {filename}")
                existing_count += 1
                # Si le fichier existe dans les deux endroits, supprimer celui de public
                if source_path.exists():
                    try:
                        source_path.unlink()
                        print(f"  🗑️  Supprimé le doublon: {filename}")
                    except Exception as e:
                        print(f"  ⚠️  Erreur lors de la suppression du doublon {filename}: {e}")
            else:
                print(f"  ❌ Fichier manquant: {filename}")
    
    print(f"\n🎉 Organisation terminée:")
    print(f"   Fichiers déplacés: {moved_count}")
    print(f"   Fichiers déjà en place: {existing_count}")

if __name__ == "__main__":
    print("=== Organisation des Fichiers de Chapitres ===")
    organize_chapter_files()
    print("\n=== Terminé ===")
    print("L'application admin devrait maintenant trouver tous les fichiers dans public/chapters/.")