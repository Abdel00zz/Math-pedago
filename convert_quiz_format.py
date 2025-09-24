#!/usr/bin/env python3
"""
Script pour convertir le format de quiz de l'ancien format (correctAnswer: index) 
vers le nouveau format (isCorrect: boolean dans chaque option)
"""
import json
import hashlib
from pathlib import Path

def convert_quiz_question(old_question):
    """Convertit une question de l'ancien format vers le nouveau format"""
    # Générer un ID si manquant
    question_text = old_question.get('question', '')
    question_id = f"q_{hashlib.md5(question_text.encode()).hexdigest()[:8]}"
    
    # Récupérer l'index de la bonne réponse
    correct_answer_index = old_question.get('correctAnswer', 0)
    explanation = old_question.get('explanation', '')
    
    # Convertir les options
    new_options = []
    old_options = old_question.get('options', [])
    
    for i, option_text in enumerate(old_options):
        is_correct = (i == correct_answer_index)
        new_option = {
            'text': option_text,
            'isCorrect': is_correct
        }
        # Ajouter l'explication à la bonne réponse
        if is_correct and explanation:
            new_option['explanation'] = explanation
        new_options.append(new_option)
    
    return {
        'id': question_id,
        'question': question_text,
        'options': new_options
    }

def convert_exercise_format(old_exercise):
    """Convertit un exercice vers le nouveau format"""
    exercise_id = f"exo_{hashlib.md5(old_exercise.get('title', '').encode()).hexdigest()[:8]}"
    
    return {
        'id': exercise_id,
        'title': old_exercise.get('title', ''),
        'statement': old_exercise.get('description', ''),
        'sub_questions': []  # Les sous-questions peuvent être ajoutées manuellement si nécessaire
    }

def convert_chapter_file(file_path):
    """Convertit un fichier de chapitre complet"""
    print(f"Conversion de {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convertir les métadonnées de base
    new_data = {
        'class': data.get('class', ''),
        'chapter': data.get('chapter', ''),
        'sessionDates': data.get('sessionDates', []),  # Nouveau format
        'version': 'v1.1.0-auto'  # Version automatique
    }
    
    # Si l'ancien format sessionDate existe, le convertir
    if 'sessionDate' in data and data['sessionDate'] != "À définir":
        new_data['sessionDates'] = [data['sessionDate']]
    
    # Convertir le quiz
    old_quiz = data.get('quiz', [])
    new_quiz = []
    for question in old_quiz:
        if 'correctAnswer' in question:  # Ancien format
            new_quiz.append(convert_quiz_question(question))
        else:  # Nouveau format déjà
            new_quiz.append(question)
    new_data['quiz'] = new_quiz
    
    # Convertir les exercices
    old_exercises = data.get('exercises', [])
    new_exercises = []
    for exercise in old_exercises:
        if 'description' in exercise:  # Ancien format
            new_exercises.append(convert_exercise_format(exercise))
        else:  # Nouveau format déjà
            new_exercises.append(exercise)
    new_data['exercises'] = new_exercises
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {file_path} converti avec succès")

if __name__ == "__main__":
    # Convertir le fichier courant
    target_file = Path("public/chapters/2bse_limites_et_continuite.json")
    if target_file.exists():
        convert_chapter_file(target_file)
    else:
        print(f"❌ Fichier non trouvé: {target_file}")