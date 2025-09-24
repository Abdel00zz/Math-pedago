#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to read the existing manifest.json and create ALL missing chapter files.
This will create template JSON files for every chapter referenced in manifest.json
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

def generate_chapter_title(chapter_id: str) -> str:
    """Generate a readable chapter title from the ID."""
    # Replace dashes with spaces and capitalize words
    title = chapter_id.replace('-', ' ').title()
    # Some common replacements for better readability
    replacements = {
        'N Z Q D Et R': 'N, Z, Q, D et R',
        'Dans N': 'dans N',
        'Dans Z': 'dans Z', 
        'Dans R': 'dans R',
        'Dans Le': 'dans le',
        'Dans L': 'dans l\'',
        'Et ': 'et ',
        'De ': 'de ',
        'Du ': 'du ',
        'Des ': 'des ',
        'Les ': 'les ',
        'La ': 'la ',
        'Le ': 'le ',
        'L ': 'l\'',
        'Une ': 'une ',
        'Un ': 'un ',
        'Sur ': 'sur ',
        'Avec ': 'avec ',
        'Pour ': 'pour '
    }
    
    for old, new in replacements.items():
        title = title.replace(old, new)
    
    return title

def create_all_missing_files():
    """Create all missing chapter files based on manifest.json."""
    
    # Read the existing manifest.json
    manifest_path = Path("public/manifest.json")
    if not manifest_path.exists():
        print(f"❌ Manifest file not found: {manifest_path}")
        return
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to read manifest.json: {e}")
        return
    
    public_dir = Path("public")
    public_dir.mkdir(exist_ok=True)
    
    created_count = 0
    existing_count = 0
    
    # Process each class
    for class_type, chapters in manifest_data.items():
        print(f"\n📂 Processing class: {class_type}")
        
        for chapter_info in chapters:
            chapter_id = chapter_info.get('id', '')
            filename = chapter_info.get('file', '')
            
            if not filename:
                print(f"  ⚠️  Skipping chapter with no filename: {chapter_id}")
                continue
                
            file_path = public_dir / filename
            
            if file_path.exists():
                print(f"  ℹ️  Already exists: {filename}")
                existing_count += 1
            else:
                # Generate a title from the ID
                chapter_title = generate_chapter_title(chapter_id)
                
                # Create the template chapter
                chapter_data = create_chapter_template(
                    class_type,
                    chapter_id,
                    chapter_title
                )
                
                # Write the file
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(chapter_data, f, indent=2, ensure_ascii=False)
                    print(f"  ✅ Created: {filename}")
                    created_count += 1
                except Exception as e:
                    print(f"  ❌ Failed to create {filename}: {e}")
    
    # Summary
    total_files = created_count + existing_count
    print(f"\n🎉 Summary:")
    print(f"   Created: {created_count} files")
    print(f"   Already existed: {existing_count} files")
    print(f"   Total: {total_files} files")
    
    if created_count > 0:
        print(f"\n✨ Created {created_count} missing chapter files!")
        print("   All files contain empty templates that you can edit using the admin application.")
    else:
        print(f"\n✅ All chapter files already exist!")

if __name__ == "__main__":
    print("=== Creating ALL Missing Chapter Files ===")
    print("Reading manifest.json and creating missing files...\n")
    create_all_missing_files()
    print("\n=== Done ===")
    print("\nThe admin application should now run without file not found errors.")