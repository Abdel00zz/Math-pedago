#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to create missing chapter files for the Smart Chapter Manager application.
This will create template JSON files for all the missing chapters referenced in manifest.json
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

def create_chapter_template(class_type: str, chapter_id: str, chapter_title: str) -> Dict[str, Any]:
    """Create a template chapter structure."""
    return {
        "class": class_type,
        "chapter": chapter_title,
        "version": "v1.0.0-initial",
        "sessionDates": [],
        "quiz": [],
        "exercises": []
    }

def create_missing_files():
    """Create all missing chapter files."""
    
    # List of missing files based on the error messages
    missing_files = [
        {
            "filename": "2bsm_equations_differentielles.json",
            "class": "2bsm",
            "id": "equations-differentielles",
            "title": "Équations Différentielles"
        },
        {
            "filename": "2bsm_arithmetique_dans_z.json", 
            "class": "2bsm",
            "id": "arithmetique-dans-z",
            "title": "Arithmétique dans Z"
        },
        {
            "filename": "2bsm_structures_algebriques.json",
            "class": "2bsm", 
            "id": "structures-algebriques",
            "title": "Structures Algébriques"
        },
        {
            "filename": "2bsm_espaces_vectoriels.json",
            "class": "2bsm",
            "id": "espaces-vectoriels", 
            "title": "Espaces Vectoriels"
        },
        {
            "filename": "2bsm_calcul_de_probabilites.json",
            "class": "2bsm",
            "id": "calcul-de-probabilites",
            "title": "Calcul de Probabilités"
        }
    ]
    
    # Create the public directory if it doesn't exist
    public_dir = Path("public")
    public_dir.mkdir(exist_ok=True)
    
    created_count = 0
    
    for file_info in missing_files:
        file_path = public_dir / file_info["filename"]
        
        if not file_path.exists():
            # Create the template chapter
            chapter_data = create_chapter_template(
                file_info["class"],
                file_info["id"], 
                file_info["title"]
            )
            
            # Write the file
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(chapter_data, f, indent=2, ensure_ascii=False)
                print(f"✅ Created: {file_info['filename']}")
                created_count += 1
            except Exception as e:
                print(f"❌ Failed to create {file_info['filename']}: {e}")
        else:
            print(f"ℹ️  Already exists: {file_info['filename']}")
    
    print(f"\n🎉 Created {created_count} missing chapter files!")
    
    # Also create a sample manifest.json if it doesn't exist
    manifest_path = public_dir / "manifest.json"
    if not manifest_path.exists():
        manifest_data = {
            "tcs": [],
            "1bse": [],
            "1bsm": [],
            "2bse": [],
            "2bsm": [
                {
                    "id": "equations-differentielles",
                    "file": "2bsm_equations_differentielles.json",
                    "isActive": True,
                    "version": "v1.0.0-initial"
                },
                {
                    "id": "arithmetique-dans-z", 
                    "file": "2bsm_arithmetique_dans_z.json",
                    "isActive": True,
                    "version": "v1.0.0-initial"
                },
                {
                    "id": "structures-algebriques",
                    "file": "2bsm_structures_algebriques.json", 
                    "isActive": True,
                    "version": "v1.0.0-initial"
                },
                {
                    "id": "espaces-vectoriels",
                    "file": "2bsm_espaces_vectoriels.json",
                    "isActive": True, 
                    "version": "v1.0.0-initial"
                },
                {
                    "id": "calcul-de-probabilites",
                    "file": "2bsm_calcul_de_probabilites.json",
                    "isActive": True,
                    "version": "v1.0.0-initial"
                }
            ]
        }
        
        try:
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Created: manifest.json")
        except Exception as e:
            print(f"❌ Failed to create manifest.json: {e}")

if __name__ == "__main__":
    print("=== Creating Missing Chapter Files ===\n")
    create_missing_files()
    print("\n=== Done ===")
    print("\nYou can now run the admin application without file not found errors.")
    print("The created files contain empty templates that you can fill with content using the application.")