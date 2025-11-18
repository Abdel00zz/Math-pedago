#!/usr/bin/env python3
"""
Script pour nettoyer le formatage LaTeX dans les fichiers JSON
Supprime les espaces excessifs autour des formules mathématiques
"""

import json
import re
from pathlib import Path

def clean_latex_text(text):
    """
    Nettoie le texte en supprimant les espaces excessifs autour des formules LaTeX
    """
    if not isinstance(text, str):
        return text
    
    # Supprimer les espaces avant/après les $ inline
    # Pattern: espaces + $ + espaces + contenu + espaces + $ + espaces
    text = re.sub(r'\s+\$\s+', ' $', text)
    text = re.sub(r'\s+\$', '$', text)
    text = re.sub(r'\$\s+', '$', text)
    
    # Nettoyer les patterns spécifiques comme "         $f$      \n"
    text = re.sub(r'\s{2,}\$([^$]+)\$\s{2,}\n?', r' $\1$', text)
    
    # Nettoyer les sauts de ligne excessifs
    text = re.sub(r'\n\s+', ' ', text)
    
    # Nettoyer les espaces multiples
    text = re.sub(r' {2,}', ' ', text)
    
    # Nettoyer les espaces avant la ponctuation
    text = re.sub(r'\s+([.,;:!?])', r'\1', text)
    
    return text.strip()

def clean_json_recursive(obj):
    """
    Parcourt récursivement un objet JSON et nettoie tous les textes
    """
    if isinstance(obj, dict):
        return {key: clean_json_recursive(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_json_recursive(item) for item in obj]
    elif isinstance(obj, str):
        return clean_latex_text(obj)
    else:
        return obj

def fix_json_file(file_path):
    """
    Corrige le formatage LaTeX dans un fichier JSON
    """
    print(f"📖 Lecture de {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🧹 Nettoyage du formatage LaTeX...")
    cleaned_data = clean_json_recursive(data)
    
    print(f"💾 Sauvegarde dans {file_path}...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print("✅ Fichier corrigé avec succès!")

if __name__ == "__main__":
    file_path = Path(__file__).parent / "public" / "chapters" / "2bse" / "2bse_derivation_et_etude_des_fonctions.json"
    fix_json_file(file_path)
    print("\n🎓 Le formatage LaTeX a été nettoyé.")
    print("🔄 Rechargez la page dans votre navigateur pour voir les changements.")
