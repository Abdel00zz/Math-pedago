#!/usr/bin/env python3
"""Analyse des fichiers de chapitres 1bsm pour vérifier les lessonFile"""

import json
import os
from pathlib import Path

chapters_dir = Path("public/chapters/1bsm")
lessons_dir = chapters_dir / "lessons"

# Lire tous les fichiers de chapitres (pas dans le dossier lessons)
chapter_files = sorted([f for f in chapters_dir.glob("*.json")])
lesson_files = sorted([f for f in lessons_dir.glob("*.json") if f.suffix == ".json"])

print("=" * 80)
print("ANALYSE DES CHAPITRES 1BSM")
print("=" * 80)
print()

chapters_with_lesson = []
chapters_without_lesson = []

for chapter_file in chapter_files:
    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    chapter_name = data.get('chapter', 'Unknown')
    has_lesson_file = 'lessonFile' in data
    lesson_file_path = data.get('lessonFile', '')

    if has_lesson_file:
        # Vérifier si le fichier existe
        full_path = chapters_dir / lesson_file_path
        exists = full_path.exists() if lesson_file_path else False
        chapters_with_lesson.append({
            'file': chapter_file.name,
            'chapter': chapter_name,
            'lessonFile': lesson_file_path,
            'exists': exists
        })
    else:
        chapters_without_lesson.append({
            'file': chapter_file.name,
            'chapter': chapter_name
        })

print(f"CHAPITRES AVEC lessonFile: {len(chapters_with_lesson)}/{len(chapter_files)}")
print("-" * 80)
for ch in chapters_with_lesson:
    status = "✓ EXISTS" if ch['exists'] else "✗ MISSING"
    print(f"  {status} | {ch['file']}")
    print(f"         | Chapter: {ch['chapter']}")
    print(f"         | Lesson: {ch['lessonFile']}")
    print()

print()
print(f"CHAPITRES SANS lessonFile: {len(chapters_without_lesson)}/{len(chapter_files)}")
print("-" * 80)
for ch in chapters_without_lesson:
    print(f"  ✗ {ch['file']}")
    print(f"    Chapter: {ch['chapter']}")

    # Essayer de trouver un fichier de lesson correspondant
    base_name = ch['file'].replace('.json', '')
    potential_lesson = lessons_dir / f"{base_name}.json"
    if potential_lesson.exists():
        print(f"    → LESSON DISPONIBLE: lessons/{base_name}.json")
    else:
        print(f"    → Aucune lesson trouvée")
    print()

print()
print("=" * 80)
print("FICHIERS DE LESSONS DISPONIBLES")
print("=" * 80)
print(f"Total: {len(lesson_files)} fichiers")
print()
for lesson_file in lesson_files:
    print(f"  - {lesson_file.name}")

print()
print("=" * 80)
print("RECOMMANDATIONS")
print("=" * 80)
print()
for ch in chapters_without_lesson:
    base_name = ch['file'].replace('.json', '')
    potential_lesson = lessons_dir / f"{base_name}.json"
    if potential_lesson.exists():
        print(f"Ajouter lessonFile à {ch['file']}:")
        print(f'  "lessonFile": "lessons/{base_name}.json"')
        print()
