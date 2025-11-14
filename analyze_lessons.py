#!/usr/bin/env python3
"""Analyse du contenu des lessons pour identifier les plus complètes"""

import json
import os
from pathlib import Path

lessons_dir = Path("public/chapters/1bsm/lessons")
chapters_dir = Path("public/chapters/1bsm")

# Lire tous les fichiers de lessons
lesson_files = sorted([f for f in lessons_dir.glob("*.json")])

print("=" * 80)
print("ANALYSE DU CONTENU DES LESSONS 1BSM")
print("=" * 80)
print()

lessons_info = []

for lesson_file in lesson_files:
    try:
        with open(lesson_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Analyser la structure
        title = data.get('header', {}).get('title', 'Unknown')
        sections = data.get('sections', [])

        # Compter les éléments
        total_elements = 0
        element_types = {}

        for section in sections:
            subsections = section.get('subsections', [])
            for subsection in subsections:
                elements = subsection.get('elements', [])
                total_elements += len(elements)

                for element in elements:
                    element_type = element.get('type', 'unknown')
                    element_types[element_type] = element_types.get(element_type, 0) + 1

        # Calculer un score de complétude basé sur le nombre d'éléments et la diversité
        completeness_score = total_elements * (1 + len(element_types) * 0.1)

        lessons_info.append({
            'file': lesson_file.name,
            'title': title,
            'sections': len(sections),
            'total_elements': total_elements,
            'element_types': element_types,
            'completeness_score': completeness_score,
            'file_size': lesson_file.stat().st_size
        })

    except json.JSONDecodeError as e:
        print(f"⚠️  ERREUR DE PARSING: {lesson_file.name}")
        print(f"    {e}")
        print()
    except Exception as e:
        print(f"⚠️  ERREUR: {lesson_file.name}")
        print(f"    {e}")
        print()

# Trier par score de complétude
lessons_info.sort(key=lambda x: x['completeness_score'], reverse=True)

print(f"Total: {len(lessons_info)} lessons analysées")
print()
print("=" * 80)
print("LESSONS CLASSÉES PAR COMPLÉTUDE")
print("=" * 80)
print()

for i, lesson in enumerate(lessons_info, 1):
    print(f"{i}. {lesson['file']}")
    print(f"   Titre: {lesson['title']}")
    print(f"   Sections: {lesson['sections']} | Éléments: {lesson['total_elements']} | Taille: {lesson['file_size']/1024:.1f} KB")
    print(f"   Score de complétude: {lesson['completeness_score']:.1f}")

    # Afficher les types d'éléments
    if lesson['element_types']:
        types_str = ", ".join([f"{k}: {v}" for k, v in sorted(lesson['element_types'].items())])
        print(f"   Types d'éléments: {types_str}")
    print()

print()
print("=" * 80)
print("TOP 5 LESSONS LES PLUS COMPLÈTES")
print("=" * 80)
print()

for i, lesson in enumerate(lessons_info[:5], 1):
    print(f"{i}. {lesson['file']} (score: {lesson['completeness_score']:.1f})")

print()
print("=" * 80)
print("LESSONS À ENRICHIR (score < 50)")
print("=" * 80)
print()

lessons_to_enrich = [l for l in lessons_info if l['completeness_score'] < 50]
for lesson in lessons_to_enrich:
    print(f"- {lesson['file']} (score: {lesson['completeness_score']:.1f}, éléments: {lesson['total_elements']})")

print()
print(f"Total: {len(lessons_to_enrich)} lessons à enrichir")
