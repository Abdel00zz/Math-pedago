# -*- coding: utf-8 -*-
"""
Script pour réparer l'encodage UTF-8 de tous les fichiers JSON des chapitres.
Corrige les caractères mal encodés (Ã  → à, Ê → ê, etc.)
"""

import json
import os
from pathlib import Path
import shutil
from datetime import datetime

# Mapping des caractères mal encodés vers les bons caractères
ENCODING_FIXES = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã§': 'ç',
    'Ã ': 'à',
    'Ã¢': 'â',
    'Ã®': 'î',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã¹': 'ù',
    'Ã«': 'ë',
    'Ã¯': 'ï',
    'Ã¼': 'ü',
    'Ã§': 'ç',
    'Ã‰': 'É',
    'Ãˆ': 'È',
    'ÃŠ': 'Ê',
    'Ã€': 'À',
    'Ã‚': 'Â',
    'ÃŽ': 'Î',
    'Ã"': 'Ô',
    'Ã›': 'Û',
    'Ã‡': 'Ç',
    'Ê': 'ê',
    'Å"': 'œ',
    'Ã': 'à',  # Cas simple
}

def fix_encoding(text):
    """Corrige les problèmes d'encodage dans un texte."""
    if not isinstance(text, str):
        return text
    
    result = text
    for bad, good in ENCODING_FIXES.items():
        result = result.replace(bad, good)
    
    return result

def fix_dict_encoding(obj):
    """Corrige récursivement l'encodage dans un dictionnaire ou une liste."""
    if isinstance(obj, dict):
        return {key: fix_dict_encoding(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [fix_dict_encoding(item) for item in obj]
    elif isinstance(obj, str):
        return fix_encoding(obj)
    else:
        return obj

def fix_json_file(file_path):
    """Répare l'encodage d'un fichier JSON."""
    print(f"\n📄 Traitement de: {file_path.name}")
    
    try:
        # Lire le fichier avec différents encodages
        content = None
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                print(f"   ✓ Lecture réussie avec encodage: {encoding}")
                break
            except:
                continue
        
        if content is None:
            print(f"   ❌ Impossible de lire le fichier")
            return False
        
        # Créer une sauvegarde
        backup_path = file_path.with_suffix('.bak.json')
        shutil.copy2(file_path, backup_path)
        print(f"   💾 Sauvegarde créée: {backup_path.name}")
        
        # Charger le JSON
        data = json.loads(content)
        
        # Compter les problèmes d'encodage avant
        problems_before = sum(content.count(bad) for bad in ENCODING_FIXES.keys())
        print(f"   🔍 Problèmes d'encodage détectés: {problems_before}")
        
        if problems_before == 0:
            print(f"   ✓ Aucun problème d'encodage, fichier OK")
            backup_path.unlink()  # Supprimer la sauvegarde
            return True
        
        # Corriger l'encodage
        fixed_data = fix_dict_encoding(data)
        
        # Écrire le fichier corrigé en UTF-8
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, indent=2, ensure_ascii=False)
        
        # Vérifier les corrections
        with open(file_path, 'r', encoding='utf-8') as f:
            new_content = f.read()
        
        problems_after = sum(new_content.count(bad) for bad in ENCODING_FIXES.keys())
        fixed_count = problems_before - problems_after
        
        print(f"   ✅ Corrigé: {fixed_count} problèmes")
        print(f"   📝 Fichier sauvegardé en UTF-8")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        # Restaurer la sauvegarde en cas d'erreur
        if backup_path and backup_path.exists():
            shutil.copy2(backup_path, file_path)
            print(f"   ↩️  Sauvegarde restaurée")
        return False

def main():
    """Fonction principale."""
    print("=" * 70)
    print("🔧 RÉPARATION DE L'ENCODAGE UTF-8 DES FICHIERS JSON")
    print("=" * 70)
    
    # Chemin du dossier des chapitres
    base_dir = Path(__file__).parent
    chapters_dir = base_dir / "public" / "chapters"
    
    if not chapters_dir.exists():
        print(f"\n❌ Erreur: Le dossier {chapters_dir} n'existe pas")
        return
    
    print(f"\n📁 Dossier: {chapters_dir}")
    
    # Trouver tous les fichiers JSON
    json_files = list(chapters_dir.glob("*.json"))
    
    if not json_files:
        print("\n⚠️  Aucun fichier JSON trouvé")
        return
    
    print(f"\n📊 {len(json_files)} fichiers JSON trouvés")
    
    # Traiter chaque fichier
    success_count = 0
    error_count = 0
    
    for json_file in sorted(json_files):
        if fix_json_file(json_file):
            success_count += 1
        else:
            error_count += 1
    
    # Résumé
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ")
    print("=" * 70)
    print(f"✅ Fichiers traités avec succès: {success_count}")
    print(f"❌ Erreurs: {error_count}")
    print(f"📝 Total: {len(json_files)}")
    
    # Nettoyer les sauvegardes si tout s'est bien passé
    if error_count == 0:
        print("\n🧹 Nettoyage des fichiers de sauvegarde...")
        backup_files = list(chapters_dir.glob("*.bak.json"))
        for backup in backup_files:
            backup.unlink()
        print(f"   ✓ {len(backup_files)} sauvegardes supprimées")
    else:
        print("\n⚠️  Des erreurs sont survenues. Les sauvegardes (.bak.json) sont conservées.")
    
    print("\n✨ Terminé!")
    print("=" * 70)

if __name__ == "__main__":
    main()
