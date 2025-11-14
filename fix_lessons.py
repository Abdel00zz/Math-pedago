#!/usr/bin/env python3
"""Script pour corriger les doublons de lessons et mettre à jour les références"""

import json
import shutil
from pathlib import Path

lessons_dir = Path("public/chapters/1bsm/lessons")
chapters_dir = Path("public/chapters/1bsm")

# Mapping des doublons : ancien fichier -> fichier complet à utiliser
REPLACEMENTS = {
    "1bsm_denombrement.json": "denombrement.json",
    "1bsm_arithmetique_dans_z.json": "arithmetique_dans_Z.json",
    "1bsm_logique_mathematique.json": "logique_mathematique.json"
}

print("=" * 80)
print("REMPLACEMENT DES LESSONS INCOMPLÈTES PAR LES VERSIONS COMPLÈTES")
print("=" * 80)
print()

for old_file, complete_file in REPLACEMENTS.items():
    old_path = lessons_dir / old_file
    complete_path = lessons_dir / complete_file

    if complete_path.exists():
        print(f"✓ Remplacement: {old_file}")
        print(f"  Par: {complete_file}")

        # Faire une backup
        backup_path = lessons_dir / f"{old_file}.backup"
        if old_path.exists():
            shutil.copy2(old_path, backup_path)
            print(f"  Backup créé: {backup_path.name}")

        # Copier le fichier complet par-dessus l'ancien
        shutil.copy2(complete_path, old_path)
        print(f"  ✓ Copié avec succès")
        print()
    else:
        print(f"⚠️  Fichier source manquant: {complete_file}")
        print()

print()
print("=" * 80)
print("ANALYSE DES CHAPITRES ET LEURS QUIZ/EXERCICES")
print("=" * 80)
print()

chapter_files = sorted([f for f in chapters_dir.glob("*.json")])

chapters_stats = []

for chapter_file in chapter_files:
    with open(chapter_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    chapter_name = data.get('chapter', 'Unknown')
    quiz_count = len(data.get('quiz', []))
    exercises_count = len(data.get('exercises', []))
    lesson_file = data.get('lessonFile', 'N/A')

    chapters_stats.append({
        'file': chapter_file.name,
        'chapter': chapter_name,
        'quiz': quiz_count,
        'exercises': exercises_count,
        'total': quiz_count + exercises_count,
        'lesson_file': lesson_file
    })

# Trier par total
chapters_stats.sort(key=lambda x: x['total'], reverse=True)

print(f"{'Chapitre':<45} {'Quiz':<6} {'Exos':<6} {'Total':<6}")
print("-" * 80)

for ch in chapters_stats:
    status = "🔥" if ch['total'] >= 30 else "⚠️ " if ch['total'] < 15 else "  "
    print(f"{status} {ch['chapter'][:43]:<43} {ch['quiz']:<6} {ch['exercises']:<6} {ch['total']:<6}")

print()
print("Légende:")
print("  🔥 = Bien fourni (≥30 quiz/exercices)")
print("  ⚠️  = À enrichir (<15 quiz/exercices)")
print()

# Chapitres à enrichir
to_enrich = [ch for ch in chapters_stats if ch['total'] < 15]
print(f"Chapitres à enrichir: {len(to_enrich)}")
for ch in to_enrich:
    print(f"  - {ch['chapter']} (Quiz: {ch['quiz']}, Exos: {ch['exercises']})")
