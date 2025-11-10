#!/usr/bin/env python3
"""
Script pour transformer la structure JSON du fichier 2bse_derivation_et_etude_des_fonctions.json
en supprimant le niveau 'subsubsections'
"""

import json
import sys

def transform_section(section):
    """Transforme une section en supprimant les subsubsections"""
    new_section = {
        "title": section["title"]
    }

    # Si la section a un intro, on le garde
    if "intro" in section:
        new_section["intro"] = section["intro"]

    # Créer la nouvelle liste de subsections
    new_subsections = []

    for subsection in section.get("subsections", []):
        # Si la subsection a des subsubsections, on les remonte au niveau subsection
        if "subsubsections" in subsection:
            for subsubsection in subsection["subsubsections"]:
                # Chaque subsubsection devient une subsection
                new_subsection = {
                    "title": subsubsection["title"],
                    "elements": subsubsection.get("elements", [])
                }
                new_subsections.append(new_subsection)
        # Si la subsection a directement des elements (pas de subsubsections)
        elif "elements" in subsection:
            new_subsections.append(subsection)
        # Si la subsection n'a ni subsubsections ni elements, on la garde telle quelle
        else:
            new_subsections.append(subsection)

    new_section["subsections"] = new_subsections
    return new_section

def transform_json(input_file, output_file):
    """Transforme le fichier JSON complet"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Transformer chaque section
    if "sections" in data:
        data["sections"] = [transform_section(section) for section in data["sections"]]

    # Écrire le résultat
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✓ Transformation terminée : {output_file}")
    print(f"✓ Structure corrigée : subsubsections supprimées")

if __name__ == "__main__":
    input_file = "/home/user/Math-pedago/public/chapters/2bse/lessons/2bse_derivation_et_etude_des_fonctions.json"
    output_file = "/home/user/Math-pedago/public/chapters/2bse/lessons/2bse_derivation_et_etude_des_fonctions.json.new"

    transform_json(input_file, output_file)
