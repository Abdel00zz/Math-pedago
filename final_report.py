#!/usr/bin/env python3
"""Rapport final de la restructuration du contenu 1BSM"""

import json
import sys
from pathlib import Path

chapters_dir = Path("public/chapters/1bsm")
lessons_dir = chapters_dir / "lessons"

print("=" * 80)
print("RAPPORT FINAL - RESTRUCTURATION DU CONTENU 1BSM")
print("=" * 80)
print()

# Test 1: Vérifier que tous les JSON sont valides
print("TEST 1: Validation des fichiers JSON")
print("-" * 80)

errors = []
warnings = []

# Valider les chapitres
chapter_files = sorted([f for f in chapters_dir.glob("*.json")])
print(f"Validation de {len(chapter_files)} fichiers de chapitres...")

for chapter_file in chapter_files:
    try:
        with open(chapter_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Vérifier les champs obligatoires
        required_fields = ['class', 'chapter', 'sessionDates', 'lessonFile', 'videos', 'quiz', 'exercises']
        missing = [field for field in required_fields if field not in data]

        if missing:
            warnings.append(f"{chapter_file.name}: Champs manquants: {', '.join(missing)}")

        # Vérifier que le lessonFile existe
        if 'lessonFile' in data:
            lesson_path = chapters_dir / data['lessonFile']
            if not lesson_path.exists():
                errors.append(f"{chapter_file.name}: Fichier lesson introuvable: {data['lessonFile']}")

    except json.JSONDecodeError as e:
        errors.append(f"{chapter_file.name}: Erreur JSON - {e}")
    except Exception as e:
        errors.append(f"{chapter_file.name}: Erreur - {e}")

# Valider les lessons
lesson_files = sorted([f for f in lessons_dir.glob("*.json")])
print(f"Validation de {len(lesson_files)} fichiers de lessons...")

for lesson_file in lesson_files:
    try:
        with open(lesson_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Vérifier la structure basique
        if 'header' not in data:
            warnings.append(f"{lesson_file.name}: Pas de champ 'header'")
        if 'sections' not in data:
            warnings.append(f"{lesson_file.name}: Pas de champ 'sections'")

    except json.JSONDecodeError as e:
        errors.append(f"{lesson_file.name}: Erreur JSON - {e}")
    except Exception as e:
        errors.append(f"{lesson_file.name}: Erreur - {e}")

if errors:
    print("❌ ERREURS:")
    for error in errors:
        print(f"  - {error}")
else:
    print("✓ Aucune erreur")

if warnings:
    print()
    print("⚠️  AVERTISSEMENTS:")
    for warning in warnings:
        print(f"  - {warning}")
else:
    print("✓ Aucun avertissement")

print()
print()

# Test 2: Vérifier le mapping complet
print("TEST 2: Mapping chapitres → lessons")
print("-" * 80)

mapping_ok = True
for chapter_file in chapter_files:
    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    chapter_name = data.get('chapter', 'Unknown')
    lesson_file = data.get('lessonFile', 'N/A')

    if lesson_file == 'N/A':
        print(f"❌ {chapter_name}: Pas de lessonFile")
        mapping_ok = False
    else:
        lesson_path = chapters_dir / lesson_file
        if lesson_path.exists():
            print(f"✓ {chapter_name:<45} → {lesson_file}")
        else:
            print(f"❌ {chapter_name:<45} → {lesson_file} (INTROUVABLE)")
            mapping_ok = False

print()
if mapping_ok:
    print("✓ Tous les chapitres ont un lessonFile valide")
else:
    print("❌ Certains chapitres ont des problèmes de lessonFile")

print()
print()

# Statistiques finales
print("STATISTIQUES FINALES")
print("-" * 80)
print(f"Chapitres: {len(chapter_files)}")
print(f"Lessons: {len(lesson_files)}")

# Analyser la richesse du contenu
total_quiz = 0
total_exercises = 0

for chapter_file in chapter_files:
    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    total_quiz += len(data.get('quiz', []))
    total_exercises += len(data.get('exercises', []))

print(f"Quiz total: {total_quiz}")
print(f"Exercices total: {total_exercises}")
print(f"Moyenne par chapitre: {total_quiz/len(chapter_files):.1f} quiz, {total_exercises/len(chapter_files):.1f} exercices")

print()
print("=" * 80)
print("RÉSUMÉ DES MODIFICATIONS")
print("=" * 80)
print()
print("✓ Ajout du champ 'lessonFile' à 2 chapitres (arithmétique, ensembles)")
print("✓ Remplacement de 3 lessons incomplètes par leurs versions complètes")
print("✓ Correction de la référence pour 'logique_mathematique'")
print("✓ Suppression de 3 fichiers doublons")
print("✓ Suppression de 3 fichiers de backup")
print(f"✓ Structure finale: {len(chapter_files)} chapitres, {len(lesson_files)} lessons")
print()

# Fichiers supplémentaires
extra_lessons = [
    "1bsm_fonctions_numeriques.json",
    "1bsm_trigonometrie.json"
]

existing_extra = [f for f in extra_lessons if (lessons_dir / f).exists()]

if existing_extra:
    print("⚠️  Fichiers de lessons supplémentaires sans chapitre correspondant:")
    for f in existing_extra:
        print(f"   - {f}")
    print("   Ces fichiers peuvent être conservés pour usage futur ou supprimés.")
    print()

# Vérifier s'il y a un fichier .txt
txt_files = list(lessons_dir.glob("*.txt"))
if txt_files:
    print("⚠️  Fichiers texte trouvés dans le dossier lessons:")
    for f in txt_files:
        print(f"   - {f.name}")
    print()

print("=" * 80)
print("VALIDATION FINALE")
print("=" * 80)
print()

if errors:
    print("❌ La validation a échoué. Veuillez corriger les erreurs ci-dessus.")
    sys.exit(1)
else:
    print("✅ TOUS LES TESTS SONT PASSÉS!")
    print("✅ La restructuration est terminée avec succès!")
    print()
    sys.exit(0)
