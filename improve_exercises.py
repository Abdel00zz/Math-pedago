#!/usr/bin/env python3
"""
Script pour améliorer la structure des exercices en extrayant les sous-questions
depuis l'énoncé et les structurer proprement
"""
import json
import re
from pathlib import Path

def extract_sub_questions(statement):
    """Extrait les sous-questions numérotées depuis l'énoncé"""
    sub_questions = []
    
    # Pattern pour capturer les questions numérotées (1., 2., 3., etc.)
    pattern = r'(\d+\.)\s*([^0-9]+?)(?=\d+\.|$)'
    matches = re.findall(pattern, statement, re.DOTALL)
    
    for match in matches:
        question_text = match[1].strip()
        if question_text:
            sub_questions.append({
                "text": question_text
            })
    
    return sub_questions

def improve_exercises_structure(file_path):
    """Améliore la structure des exercices dans le fichier JSON"""
    print(f"Amélioration des exercices dans {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Améliorer les exercices
    improved_exercises = []
    for exercise in data.get('exercises', []):
        improved_exercise = exercise.copy()
        
        # Extraire les sous-questions depuis l'énoncé
        statement = exercise.get('statement', '')
        sub_questions = extract_sub_questions(statement)
        
        if sub_questions:
            # Nettoyer l'énoncé en supprimant les sous-questions pour ne garder que le contexte
            main_statement = re.split(r'\n\s*1\.', statement, 1)[0].strip()
            improved_exercise['statement'] = main_statement
            improved_exercise['sub_questions'] = sub_questions
        else:
            # Si aucune sous-question trouvée, garder tel quel
            improved_exercise['sub_questions'] = []
        
        improved_exercises.append(improved_exercise)
    
    data['exercises'] = improved_exercises
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {len(improved_exercises)} exercices améliorés dans {file_path}")

if __name__ == "__main__":
    # Améliorer le fichier courant
    target_file = Path("public/chapters/2bse_limites_et_continuite.json")
    if target_file.exists():
        improve_exercises_structure(target_file)
    else:
        print(f"❌ Fichier non trouvé: {target_file}")