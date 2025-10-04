# -*- coding: utf-8 -*-

import sys
import json
import re
import shutil
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field

# Importation des composants PyQt6 pour l'interface graphique
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QSplitter,
    QTabWidget, QTableWidget, QListWidget, QListWidgetItem, QTextEdit, QLineEdit, QRadioButton,
    QPushButton, QLabel, QCheckBox, QDialog, QFormLayout, QDialogButtonBox,
    QMessageBox, QInputDialog, QFileDialog, QHeaderView, QAbstractItemView,
    QDateTimeEdit, QTableWidgetItem, QProgressDialog, QStyle, QGroupBox, QComboBox,
    QSizePolicy, QScrollArea, QStatusBar, QToolBar
)
from PyQt6.QtCore import Qt, QDateTime, QTime, QSize
from PyQt6.QtGui import QAction


# =============================================================================
# SECTION 1: MODÈLES DE DONNÉES (DATA MODELS)
# Des structures claires pour représenter les données des fichiers JSON.
# =============================================================================

@dataclass
class QuizOption:
    """Représente une option de réponse dans un quiz."""
    text: str = ""
    is_correct: bool = False
    explanation: Optional[str] = None  # L'explication est attachée à l'option correcte

    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'option en dictionnaire pour la sauvegarde JSON."""
        data = {'text': self.text, 'isCorrect': self.is_correct}
        if self.is_correct and self.explanation:
            data['explanation'] = self.explanation
        return data

@dataclass
class QuizQuestion:
    """Représente une question de quiz complète."""
    id: str = ""
    question: str = ""
    type: str = "mcq"  # Par défaut de type MCQ (choix multiple)
    options: List[QuizOption] = field(default_factory=list)
    steps: List[str] = field(default_factory=list)  # Pour les questions de type "ordering"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'QuizQuestion':
        """Charge une question à partir d'un dictionnaire (format JSON)."""
        question_type = data.get('type', 'mcq')
        question = cls(
            id=data.get('id', ''),
            question=data.get('question', ''),
            type=question_type
        )
        
        main_explanation = data.get('explanation', '')
        
        if question_type == 'mcq':
            # Traitement des questions à choix multiples
            options = []
            for opt_data in data.get('options', []):
                is_correct = opt_data.get('isCorrect', False)
                option = QuizOption(text=opt_data.get('text', ''), is_correct=is_correct)
                if is_correct:
                    explanation_in_option = opt_data.get('explanation', '')
                    if explanation_in_option:
                        main_explanation = explanation_in_option
                options.append(option)
            
            # Attribue l'explication à la bonne option pour l'éditeur
            for opt in options:
                if opt.is_correct:
                    opt.explanation = main_explanation
                    break
                    
            question.options = options
            
        elif question_type == 'ordering':
            # Traitement des questions d'ordonnancement
            question.steps = data.get('steps', [])
            
            # Créer des options pour la compatibilité avec l'éditeur
            # Chaque étape devient une option, l'ordre est important
            steps = question.steps
            for i, step in enumerate(steps):
                option = QuizOption(
                    text=step,
                    is_correct=(i == 0),  # La première étape est marquée comme correcte pour stocker l'explication
                    explanation=main_explanation if i == 0 else None
                )
                question.options.append(option)
                
        return question

    def to_dict(self) -> Dict[str, Any]:
        """Convertit la question en dictionnaire pour la sauvegarde JSON."""
        result = {
            'id': self.id or f"q_{hashlib.md5(self.question.encode()).hexdigest()[:8]}",
            'type': self.type,
            'question': self.question
        }
        
        if self.type == 'mcq':
            result['options'] = [opt.to_dict() for opt in self.options]
        elif self.type == 'ordering':
            # Pour les questions d'ordonnancement, extraire les étapes dans l'ordre correct
            # et l'explication attachée à la première option
            result['steps'] = self.steps if self.steps else [opt.text for opt in self.options]
            
            # Récupérer l'explication de la première option marquée comme correcte
            for opt in self.options:
                if opt.is_correct and opt.explanation:
                    result['explanation'] = opt.explanation
                    break
                    
        return result

@dataclass
class SubQuestion:
    """Représente une sous-question d'un exercice."""
    text: str

    def to_dict(self) -> Dict[str, str]:
        return {'text': self.text}

@dataclass
class Exercise:
    """Représente un exercice, en préservant la structure originale."""
    id: str = ""
    title: str = ""
    statement: str = ""
    sub_questions: List[SubQuestion] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Exercise':
        """Charge un exercice depuis un dictionnaire JSON."""
        sub_questions_data = data.get('sub_questions', [])
        return cls(
            id=data.get('id', ''),
            title=data.get('title', ''),
            statement=data.get('statement', ''),
            sub_questions=[SubQuestion(sq.get('text', '')) for sq in sub_questions_data]
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'exercice en dictionnaire pour la sauvegarde JSON."""
        return {
            'id': self.id or f"exo_{hashlib.md5(self.title.encode()).hexdigest()[:8]}",
            'title': self.title,
            'statement': self.statement,
            'sub_questions': [sq.to_dict() for sq in self.sub_questions]
        }

class ChapterData:
    """Modèle de données complet pour un chapitre, gérant le chargement, la sauvegarde et le versioning."""
    def __init__(self):
        self.file_path: Optional[Path] = None
        self.id: str = ""
        self.file_name: str = ""
        self.is_active: bool = False
        self.version: str = "non-versionné"
        self.class_type: str = ""
        self.chapter_name: str = ""
        self.session_dates: List[str] = []
        self.quiz_questions: List[QuizQuestion] = []
        self.exercises: List[Exercise] = []

    def load_from_manifest(self, data: Dict[str, Any], class_type: str):
        """Charge les métadonnées depuis le fichier manifest.json."""
        self.id = data.get('id', '')
        self.file_name = data.get('file', '')
        self.is_active = data.get('isActive', False)
        # Utiliser la version du manifest comme version par défaut
        self.version = data.get('version', 'non-versionné')
        self.class_type = class_type

    def load_from_file(self, file_path: Path) -> bool:
        """Charge le contenu complet du chapitre depuis son fichier JSON.
        Gère les erreurs de format JSON et tente une récupération automatique si possible."""
        self.file_path = file_path
        
        # Vérifier si le fichier existe
        if not file_path.exists():
            print(f"Erreur: Le fichier {file_path} n'existe pas.")
            return False
        
        try:
            # Essayer de charger le fichier JSON normalement
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Charger les données de base
            self.chapter_name = data.get('chapter', self.id.replace('-', ' ').title())
            self.class_type = data.get('class', self.class_type)
            self.session_dates = sorted(data.get('sessionDates', []))
            
            # Charger les quiz avec gestion d'erreurs
            self.quiz_questions = []
            for i, q_data in enumerate(data.get('quiz', [])):
                try:
                    quiz = QuizQuestion.from_dict(q_data)
                    self.quiz_questions.append(quiz)
                except Exception as e:
                    print(f"Avertissement: Quiz #{i+1} dans {file_path} ignoré en raison d'une erreur: {e}")
                    
            # Charger les exercices avec gestion d'erreurs
            self.exercises = []
            for i, e_data in enumerate(data.get('exercises', [])):
                try:
                    exercise = Exercise.from_dict(e_data)
                    self.exercises.append(exercise)
                except Exception as e:
                    print(f"Avertissement: Exercice #{i+1} dans {file_path} ignoré en raison d'une erreur: {e}")
                    
            # Utiliser la version du fichier si elle existe, sinon garder celle du manifest
            file_version = data.get('version', '')
            if file_version:
                self.version = file_version
            return True
            
        except json.JSONDecodeError as e:
            # Erreur de syntaxe JSON - tenter une récupération
            print(f"Erreur de syntaxe JSON dans {file_path}: {e}")
            try:
                # Tenter de lire le fichier comme texte et corriger certains problèmes courants
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Ne plus créer de sauvegarde du fichier corrompu
                
                # Tenter des corrections automatiques sur les erreurs JSON courantes
                # (virgules en trop, guillemets manquants, etc.)
                fixed_content = self._attempt_json_fix(content)
                
                if fixed_content:
                    # Si une correction est possible, charger les données corrigées
                    data = json.loads(fixed_content)
                    
                    # Sauvegarder le fichier corrigé
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                        
                    print(f"Le fichier JSON {file_path} a été automatiquement corrigé.")
                    
                    # Charger depuis le fichier corrigé
                    return self.load_from_file(file_path)
                else:
                    print(f"Impossible de réparer automatiquement le fichier JSON {file_path}")
                    return False
                    
            except Exception as repair_error:
                print(f"Échec de la tentative de réparation pour {file_path}: {repair_error}")
                return False
                
        except FileNotFoundError:
            print(f"Erreur: Le fichier {file_path} n'existe pas.")
            return False
        except Exception as e:
            print(f"Erreur inattendue lors du chargement de {file_path}: {e}")
            return False
            
    def _attempt_json_fix(self, content: str) -> Optional[str]:
        """Tente de corriger les erreurs courantes dans un fichier JSON."""
        try:
            # Correction 1: Virgules en trop à la fin des objets ou tableaux
            content = re.sub(r',\s*}', '}', content)
            content = re.sub(r',\s*]', ']', content)
            
            # Correction 2: Guillemets simples au lieu de doubles
            content = re.sub(r"'([^']*)':", r'"\1":', content)
            
            # Correction 3: Booléens JavaScript (true/false) vs Python (True/False)
            content = re.sub(r':\s*true', ': true', content)
            content = re.sub(r':\s*false', ': false', content)
            content = content.replace(': true', ': "true"').replace(': false', ': "false"')
            
            # Vérifier si les corrections ont fonctionné
            json.loads(content)
            return content
        except:
            return None

    def save_to_file(self) -> bool:
        """Sauvegarde le contenu du chapitre dans son fichier JSON, en calculant et en inscrivant sa nouvelle version."""
        if not self.file_path: return False

        # Ne plus créer de sauvegarde avant modification
        backup_path = None

        data_to_save = {
            'class': self.class_type,
            'chapter': self.chapter_name,
            'sessionDates': sorted(self.session_dates),
            # Préserver l'ordre actuel des quiz et des exercices tel quel
            'quiz': [q.to_dict() for q in self.quiz_questions],
            'exercises': [e.to_dict() for e in self.exercises]
        }
        
        # Vérifier si le contenu a réellement changé avant de modifier la version
        new_content_version = self._calculate_content_version(data_to_save)
        if new_content_version != self.version:
            # Le contenu a changé, mettre à jour la version
            self.version = new_content_version
            print(f"Mise à jour de la version pour {self.chapter_name}: {self.version}")
        else:
            # Le contenu n'a pas changé, conserver la version actuelle
            print(f"Contenu inchangé pour {self.chapter_name}, version conservée: {self.version}")
            
        # Ajouter la version au dictionnaire de sauvegarde
        data_to_save['version'] = self.version
        
        try:
            # Créer le répertoire parent si nécessaire
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Utiliser un fichier temporaire pour une écriture sécurisée
            temp_path = self.file_path.with_suffix('.tmp.json')
            
            # Écrire dans le fichier temporaire
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            
            # Vérifier que le JSON écrit est valide
            try:
                with open(temp_path, 'r', encoding='utf-8') as f:
                    json.load(f)  # Test de parsing
                print(f"Vérification JSON réussie pour {temp_path}")
            except json.JSONDecodeError as e:
                print(f"ERREUR: JSON invalide généré: {e}")
                # Ne plus restaurer depuis une sauvegarde
                temp_path.unlink(missing_ok=True)
                return False
            
            # Si tout est bon, remplacer l'ancien fichier
            if self.file_path.exists():
                self.file_path.unlink()
            temp_path.rename(self.file_path)
            
            print(f"✓ Sauvegarde réussie: {self.file_path}")
            return True
        except Exception as e:
            print(f"ERREUR de sauvegarde pour {self.file_path}: {e}")
            # Tenter de restaurer la sauvegarde en cas d'erreur
            if backup_path and backup_path.exists():
                try:
                    shutil.copy2(backup_path, self.file_path)
                    print(f"Restauration de la sauvegarde après erreur")
                except Exception as e2:
                    print(f"ERREUR lors de la restauration de la sauvegarde: {e2}")
            return False

    def _calculate_content_version(self, data_to_hash: Dict[str, Any]) -> str:
        """Calcule un hash MD5 unique basé sur une sérialisation canonique du contenu."""
        content_string = json.dumps(data_to_hash, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
        return f"v1.1.0-{hashlib.md5(content_string.encode('utf-8')).hexdigest()[:6]}"
    
    def has_changed(self) -> bool:
        """Vérifie si le contenu du chapitre a changé depuis son chargement."""
        # Si le fichier n'existe pas, on considère qu'il y a un changement
        if not self.file_path or not self.file_path.exists():
            print(f"Le chapitre {self.chapter_name} est nouveau ou a été supprimé.")
            return True
            
        try:
            # Charger le contenu actuel du fichier
            with open(self.file_path, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
            
            # Préparer les données actuelles du chapitre
            current_data = {
                'class': self.class_type,
                'chapter': self.chapter_name,
                'sessionDates': sorted(self.session_dates),
                'quiz': [q.to_dict() for q in self.quiz_questions],
                'exercises': [e.to_dict() for e in self.exercises]
            }
            
            # Comparer chaque section individuellement pour une détection plus précise
            if file_data.get('class') != current_data['class']:
                print(f"La classe du chapitre {self.chapter_name} a été modifiée.")
                return True
                
            if file_data.get('chapter') != current_data['chapter']:
                print(f"Le nom du chapitre a été modifié: {file_data.get('chapter')} -> {current_data['chapter']}")
                return True
                
            if sorted(file_data.get('sessionDates', [])) != current_data['sessionDates']:
                print(f"Les dates de séance du chapitre {self.chapter_name} ont été modifiées.")
                return True
            
            # Pour les quiz et exercices, comparons leur représentation JSON canonique
            file_quiz_json = json.dumps(file_data.get('quiz', []), sort_keys=True)
            current_quiz_json = json.dumps(current_data['quiz'], sort_keys=True)
            if file_quiz_json != current_quiz_json:
                print(f"Les quiz du chapitre {self.chapter_name} ont été modifiés.")
                return True
                
            file_exercises_json = json.dumps(file_data.get('exercises', []), sort_keys=True)
            current_exercises_json = json.dumps(current_data['exercises'], sort_keys=True)
            if file_exercises_json != current_exercises_json:
                print(f"Les exercices du chapitre {self.chapter_name} ont été modifiés.")
                return True
                
            # Si aucune différence n'est trouvée, le chapitre n'a pas changé
            return False
            
        except Exception as e:
            print(f"Erreur lors de la vérification des modifications du chapitre {self.chapter_name}: {e}")
            # En cas d'erreur, considérer qu'il y a un changement par précaution
            return True

    def to_manifest_dict(self) -> Dict[str, Any]:
        """Génère la représentation du chapitre pour le fichier manifest.json."""
        return {'id': self.id, 'file': self.file_name, 'isActive': self.is_active, 'version': self.version}


# =============================================================================
# SECTION 2: COMPOSANTS D'ÉDITION (UI WIDGETS)
# Widgets spécialisés pour éditer les quiz et les exercices.
# =============================================================================

# NOTE: Les éditeurs (`QuizEditor`, `ExerciseEditor`, `ChapterContentEditor`) sont
# des composants complexes mais très bien écrits dans le script original.
# Leur code sera repris ici avec des adaptations mineures pour les nouveaux modèles de données.

class QuizEditor(QWidget):
    """Éditeur de questions de quiz."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.questions: List[QuizQuestion] = []
        self.current_index = -1
        self.init_ui()

    def init_ui(self):
        # Interface pour l'éditeur de quiz
        layout = QVBoxLayout(self)
        toolbar = QHBoxLayout()
        toolbar.addWidget(QLabel("Questions de Quiz"))
        toolbar.addStretch()
        self.count_label = QLabel("0 question(s)")
        toolbar.addWidget(self.count_label)
        
        # Navigation rapide par numéro de question - style natif
        nav_layout = QHBoxLayout()
        nav_label = QLabel("Aller à #")
        nav_layout.addWidget(nav_label)
        self.goto_question_input = QLineEdit()
        self.goto_question_input.setFixedWidth(50)
        self.goto_question_input.setPlaceholderText("N°")
        self.goto_question_input.setAlignment(Qt.AlignmentFlag.AlignCenter)
        nav_layout.addWidget(self.goto_question_input)
        goto_btn = QPushButton("→")
        goto_btn.setFixedWidth(30)
        goto_btn.setToolTip("Aller à cette question")
        goto_btn.clicked.connect(self.goto_question)
        nav_layout.addWidget(goto_btn)
        toolbar.addLayout(nav_layout)
        
        # Menu pour ajouter différents types de questions avec style natif
        add_mcq_btn = QPushButton("+ MCQ")
        add_mcq_btn.setToolTip("Ajouter une question à choix multiples")
        add_mcq_btn.clicked.connect(lambda: self.add_question("mcq"))
        add_mcq_btn.setFixedHeight(25)
        toolbar.addWidget(add_mcq_btn)
        
        add_ordering_btn = QPushButton("+ Ordonnancement")
        add_ordering_btn.setToolTip("Ajouter une question d'ordonnancement")
        add_ordering_btn.clicked.connect(lambda: self.add_question("ordering"))
        add_ordering_btn.setFixedHeight(25)
        toolbar.addWidget(add_ordering_btn)
        
        # Boutons pour réordonner les questions
        move_up_btn = QPushButton("↑")
        move_up_btn.setToolTip("Déplacer la question vers le haut")
        move_up_btn.clicked.connect(self.move_question_up)
        move_up_btn.setFixedSize(25, 25)
        toolbar.addWidget(move_up_btn)
        
        move_down_btn = QPushButton("↓")
        move_down_btn.setToolTip("Déplacer la question vers le bas")
        move_down_btn.clicked.connect(self.move_question_down)
        move_down_btn.setFixedSize(25, 25)
        toolbar.addWidget(move_down_btn)
        
        delete_btn = QPushButton("Suppr.")
        delete_btn.setToolTip("Supprimer la question")
        delete_btn.clicked.connect(self.delete_current)
        delete_btn.setFixedSize(50, 25)
        toolbar.addWidget(delete_btn)
        layout.addLayout(toolbar)
        
        splitter = QSplitter(Qt.Orientation.Horizontal)
        self.question_list = QListWidget()
        self.question_list.setMaximumWidth(300)
        self.question_list.currentRowChanged.connect(self.on_selection_changed)
        splitter.addWidget(self.question_list)
        
        # Conteneur principal de l'éditeur
        self.editor_container = QWidget()
        editor_main_layout = QVBoxLayout(self.editor_container)
        
        # Section commune pour toutes les questions
        question_label = QLabel("Question :")
        question_label.setObjectName("sectionLabel")
        editor_main_layout.addWidget(question_label)
        self.question_edit = QTextEdit()
        self.question_edit.setMaximumHeight(100)
        self.question_edit.textChanged.connect(self.save_current)
        editor_main_layout.addWidget(self.question_edit)
        
        # Type de question (affichage uniquement)
        type_layout = QHBoxLayout()
        type_layout.addWidget(QLabel("Type de question :"))
        self.type_label = QLabel("MCQ")
        self.type_label.setStyleSheet("font-weight: bold;")
        type_layout.addWidget(self.type_label)
        type_layout.addStretch()
        editor_main_layout.addLayout(type_layout)
        
        # Conteneur pour les widgets spécifiques au type de question
        self.type_specific_container = QWidget()
        self.type_specific_layout = QVBoxLayout(self.type_specific_container)
        editor_main_layout.addWidget(self.type_specific_container)
        
        # 1. Widget pour les questions MCQ
        self.mcq_widget = QWidget()
        mcq_layout = QVBoxLayout(self.mcq_widget)
        
        options_label = QLabel("Options de réponse :")
        options_label.setObjectName("sectionLabel")
        mcq_layout.addWidget(options_label)
        help_label = QLabel("Cochez la case pour marquer la bonne réponse")
        help_label.setObjectName("helpLabel")
        mcq_layout.addWidget(help_label)
        
        self.options_container = QWidget()
        self.options_layout = QVBoxLayout(self.options_container)
        self.option_widgets: List[tuple[QRadioButton, QLineEdit]] = []
        for i in range(4):
            opt_layout = QHBoxLayout()
            radio = QRadioButton()
            radio.toggled.connect(self.save_current)
            opt_layout.addWidget(radio)
            option_edit = QLineEdit(placeholderText=f"Option {i+1}")
            option_edit.textChanged.connect(self.save_current)
            opt_layout.addWidget(option_edit)
            self.options_layout.addLayout(opt_layout)
            self.option_widgets.append((radio, option_edit))
        mcq_layout.addWidget(self.options_container)
        
        # 2. Widget pour les questions d'ordonnancement
        self.ordering_widget = QWidget()
        ordering_layout = QVBoxLayout(self.ordering_widget)
        
        steps_header = QHBoxLayout()
        steps_label = QLabel("Étapes à ordonner :")
        steps_label.setObjectName("sectionLabel")
        steps_header.addWidget(steps_label)
        steps_header.addStretch()
        
        add_step_btn = QPushButton("Ajouter une étape")
        add_step_btn.setObjectName("smallButton")
        add_step_btn.clicked.connect(self.add_step)
        steps_header.addWidget(add_step_btn)
        ordering_layout.addLayout(steps_header)
        
        # Liste des étapes
        self.steps_list = QListWidget()
        self.steps_list.setDragDropMode(QAbstractItemView.DragDropMode.InternalMove)
        self.steps_list.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.steps_list.model().rowsMoved.connect(self.save_current)  # Sauvegarder quand les étapes sont réarrangées
        ordering_layout.addWidget(self.steps_list)
        
        # Boutons pour réorganiser
        reorder_layout = QHBoxLayout()
        move_up_btn = QPushButton("↑")
        move_up_btn.setObjectName("smallButton")
        move_up_btn.clicked.connect(self.move_step_up)
        reorder_layout.addWidget(move_up_btn)
        
        move_down_btn = QPushButton("↓")
        move_down_btn.setObjectName("smallButton")
        move_down_btn.clicked.connect(self.move_step_down)
        reorder_layout.addWidget(move_down_btn)
        
        remove_step_btn = QPushButton("Supprimer l'étape")
        remove_step_btn.setObjectName("dangerButton")
        remove_step_btn.clicked.connect(self.remove_selected_step)
        reorder_layout.addWidget(remove_step_btn)
        
        reorder_layout.addStretch()
        ordering_layout.addLayout(reorder_layout)
        
        # Section commune : explication
        explanation_label = QLabel("Explication :")
        explanation_label.setObjectName("sectionLabel")
        editor_main_layout.addWidget(explanation_label)
        self.explanation_edit = QTextEdit()
        self.explanation_edit.setMaximumHeight(80)
        self.explanation_edit.textChanged.connect(self.save_current)
        editor_main_layout.addWidget(self.explanation_edit)
        
        editor_main_layout.addStretch()
        splitter.addWidget(self.editor_container)
        splitter.setSizes([300, 700])
        layout.addWidget(splitter)
        
        # Initialiser l'éditeur désactivé
        self.editor_container.setEnabled(False)

    def set_questions(self, questions: List[QuizQuestion]):
        self.questions = [QuizQuestion.from_dict(q.to_dict()) for q in questions] # Deep copy
        self.refresh_list()
        if self.questions: self.question_list.setCurrentRow(0)

    def get_questions(self) -> List[QuizQuestion]:
        return self.questions

    def refresh_list(self):
        self.question_list.clear()
        for i, q in enumerate(self.questions):
            # Préfixer avec le numéro et le type de question pour une meilleure visibilité
            prefix = f"#{i+1} - [MCQ] " if q.type == "mcq" else f"#{i+1} - [ORD] "
            text = q.question.strip().split('\n')[0] or f"Question {i+1} (vide)"
            self.question_list.addItem(prefix + (text[:60] + "..." if len(text) > 60 else text))
        self.count_label.setText(f"{len(self.questions)} question(s)")

    def on_selection_changed(self, index: int):
        self.current_index = index
        if 0 <= index < len(self.questions):
            self.load_question(self.questions[index])
            self.editor_container.setEnabled(True)
        else:
            self.clear_editor()
            self.editor_container.setEnabled(False)

    def load_question(self, question: QuizQuestion):
        """Charge une question dans l'éditeur."""
        self.block_all_signals(True)
        self.question_edit.setText(question.question)
        
        # Afficher le numéro et le type de question
        question_number = self.current_index + 1
        self.type_label.setText(f"Question #{question_number} - {'MCQ (Choix Multiple)' if question.type == 'mcq' else 'Ordonnancement'}")
        
        # Nettoyer le conteneur spécifique au type
        self.type_specific_layout.removeWidget(self.mcq_widget)
        self.type_specific_layout.removeWidget(self.ordering_widget)
        self.mcq_widget.hide()
        self.ordering_widget.hide()
        
        # Récupérer l'explication, peu importe le type
        explanation = ""
        for opt in question.options:
            if opt.is_correct and opt.explanation:
                explanation = opt.explanation
                break
        self.explanation_edit.setText(explanation)
        
        # Charger les widgets spécifiques au type
        if question.type == "mcq":
            self.load_mcq_question(question)
            self.type_specific_layout.addWidget(self.mcq_widget)
            self.mcq_widget.show()
        elif question.type == "ordering":
            self.load_ordering_question(question)
            self.type_specific_layout.addWidget(self.ordering_widget)
            self.ordering_widget.show()
            
        self.block_all_signals(False)
        
    def load_mcq_question(self, question: QuizQuestion):
        """Charge une question à choix multiples."""
        # Trouver l'option correcte et son explication
        correct_index = -1
        for i, opt in enumerate(question.options):
            if opt.is_correct:
                correct_index = i
                break
        
        # Charger les options
        for i, (radio, edit) in enumerate(self.option_widgets):
            if i < len(question.options):
                edit.setText(question.options[i].text)
                radio.setChecked(i == correct_index)
            else:
                edit.clear()
                radio.setChecked(False)
                
    def load_ordering_question(self, question: QuizQuestion):
        """Charge une question d'ordonnancement."""
        # Vider la liste des étapes
        self.steps_list.clear()
        
        # Charger les étapes
        if question.steps:
            # Si la question a déjà des étapes définies
            for step in question.steps:
                self.steps_list.addItem(step)
        else:
            # Sinon, utiliser les options comme étapes
            for opt in question.options:
                self.steps_list.addItem(opt.text)
    
    def save_current(self):
        """Sauvegarde la question actuellement éditée."""
        if not (0 <= self.current_index < len(self.questions)): 
            return
        
        q = self.questions[self.current_index]
        q.question = self.question_edit.toPlainText()
        explanation = self.explanation_edit.toPlainText()
        
        if q.type == "mcq":
            self.save_mcq_question(q, explanation)
        elif q.type == "ordering":
            self.save_ordering_question(q, explanation)
        
        # Mettre à jour le titre dans la liste
        item = self.question_list.item(self.current_index)
        if item:
            prefix = f"#{self.current_index + 1} - [MCQ] " if q.type == "mcq" else f"#{self.current_index + 1} - [ORD] "
            text = q.question.strip().split('\n')[0] or f"Question {self.current_index + 1} (vide)"
            item.setText(prefix + (text[:60] + "..." if len(text) > 60 else text))
            
    def save_mcq_question(self, question: QuizQuestion, explanation: str):
        """Sauvegarde une question à choix multiples."""
        new_options: List[QuizOption] = []
        correct_answer_set = False

        for i, (radio, edit) in enumerate(self.option_widgets):
            text = edit.text().strip()
            if not text: continue
            
            is_correct = radio.isChecked()
            opt = QuizOption(text=text, is_correct=is_correct)
            if is_correct:
                opt.explanation = explanation
                correct_answer_set = True
            new_options.append(opt)
        
        # S'il n'y a pas de bonne réponse cochée, on met la première par défaut
        if not correct_answer_set and new_options:
            new_options[0].is_correct = True
            new_options[0].explanation = explanation
            self.option_widgets[0][0].blockSignals(True)
            self.option_widgets[0][0].setChecked(True)
            self.option_widgets[0][0].blockSignals(False)

        question.options = new_options
        
    def save_ordering_question(self, question: QuizQuestion, explanation: str):
        """Sauvegarde une question d'ordonnancement."""
        # Récupérer les étapes dans l'ordre actuel
        steps = []
        for i in range(self.steps_list.count()):
            steps.append(self.steps_list.item(i).text())
        question.steps = steps
        
        # Mettre à jour les options pour compatibilité
        new_options: List[QuizOption] = []
        for i, step in enumerate(steps):
            opt = QuizOption(
                text=step,
                is_correct=(i == 0),  # La première étape est marquée comme correcte pour stocker l'explication
                explanation=explanation if i == 0 else None
            )
            new_options.append(opt)
        question.options = new_options

    def add_question(self, question_type="mcq"):
        """Ajoute une nouvelle question du type spécifié."""
        if question_type == "mcq":
            new_q = QuizQuestion(
                question="Nouvelle question à choix multiples",
                type="mcq",
                options=[
                    QuizOption("Option 1", True, "Ceci est la bonne réponse."),
                    QuizOption("Option 2", False),
                ]
            )
        elif question_type == "ordering":
            new_q = QuizQuestion(
                question="Nouvelle question d'ordonnancement",
                type="ordering",
                steps=["Première étape", "Deuxième étape", "Troisième étape"]
            )
            # Créer des options pour la compatibilité
            new_q.options = [
                QuizOption("Première étape", True, "L'ordre correct est important."),
                QuizOption("Deuxième étape", False),
                QuizOption("Troisième étape", False)
            ]
            
        self.questions.append(new_q)
        self.refresh_list()
        self.question_list.setCurrentRow(len(self.questions) - 1)

    def delete_current(self):
        if 0 <= self.current_index < len(self.questions):
            if QMessageBox.question(self, "Confirmer", "Supprimer cette question ?") == QMessageBox.StandardButton.Yes:
                del self.questions[self.current_index]
                self.refresh_list()
                if self.current_index >= len(self.questions):
                    self.current_index = len(self.questions) - 1
                if self.questions:
                    self.question_list.setCurrentRow(self.current_index)
                else:
                    self.clear_editor()
                    self.editor_container.setEnabled(False)
    
    def clear_editor(self):
        self.block_all_signals(True)
        self.question_edit.clear()
        self.explanation_edit.clear()
        
        # Nettoyer les widgets MCQ
        for radio, edit in self.option_widgets:
            radio.setChecked(False)
            edit.clear()
            
        # Nettoyer la liste des étapes
        self.steps_list.clear()
        
        self.block_all_signals(False)

    def block_all_signals(self, block: bool):
        self.question_edit.blockSignals(block)
        self.explanation_edit.blockSignals(block)
        self.steps_list.blockSignals(block)
        for radio, edit in self.option_widgets:
            radio.blockSignals(block)
            edit.blockSignals(block)
            
    # Méthodes pour gérer l'ordre des questions
    def move_question_up(self):
        """Déplace la question sélectionnée vers le haut dans la liste."""
        if self.current_index > 0:
            # Échanger la question actuelle avec celle d'au-dessus
            self.questions[self.current_index], self.questions[self.current_index-1] = \
                self.questions[self.current_index-1], self.questions[self.current_index]
            
            # Actualiser la liste et sélectionner la question à sa nouvelle position
            self.refresh_list()
            self.question_list.setCurrentRow(self.current_index - 1)
            
            # Signaler que le chapitre a été modifié (l'ordre a changé)
            print("Quiz modifié: réorganisation des questions")
            self.setProperty("modified", True)
    
    def move_question_down(self):
        """Déplace la question sélectionnée vers le bas dans la liste."""
        if 0 <= self.current_index < len(self.questions) - 1:
            # Échanger la question actuelle avec celle d'en-dessous
            self.questions[self.current_index], self.questions[self.current_index+1] = \
                self.questions[self.current_index+1], self.questions[self.current_index]
            
            # Actualiser la liste et sélectionner la question à sa nouvelle position
            self.refresh_list()
            self.question_list.setCurrentRow(self.current_index + 1)
            
            # Signaler que le chapitre a été modifié (l'ordre a changé)
            print("Quiz modifié: réorganisation des questions")
            self.setProperty("modified", True)

    # Méthodes pour gérer les questions d'ordonnancement
    def add_step(self):
        """Ajoute une nouvelle étape à la question d'ordonnancement."""
        item = QListWidgetItem("Nouvelle étape")
        self.steps_list.addItem(item)
        self.steps_list.editItem(item)  # Permettre l'édition immédiate
        self.save_current()
        
    def move_step_up(self):
        """Déplace l'étape sélectionnée vers le haut."""
        current_row = self.steps_list.currentRow()
        if current_row > 0:
            item = self.steps_list.takeItem(current_row)
            self.steps_list.insertItem(current_row - 1, item)
            self.steps_list.setCurrentRow(current_row - 1)
            self.save_current()
    
    def move_step_down(self):
        """Déplace l'étape sélectionnée vers le bas."""
        current_row = self.steps_list.currentRow()
        if current_row < self.steps_list.count() - 1 and current_row >= 0:
            item = self.steps_list.takeItem(current_row)
            self.steps_list.insertItem(current_row + 1, item)
            self.steps_list.setCurrentRow(current_row + 1)
            self.save_current()
    
    def remove_selected_step(self):
        """Supprime l'étape sélectionnée."""
        current_row = self.steps_list.currentRow()
        if current_row >= 0:
            self.steps_list.takeItem(current_row)
            self.save_current()
            
    def goto_question(self):
        """Permet d'accéder directement à une question par son numéro."""
        try:
            question_num = int(self.goto_question_input.text())
            if 1 <= question_num <= len(self.questions):
                self.question_list.setCurrentRow(question_num - 1)
                self.goto_question_input.clear()
            else:
                QMessageBox.information(self, "Information", 
                                       f"Le numéro de question doit être entre 1 et {len(self.questions)}")
        except ValueError:
            QMessageBox.information(self, "Information", 
                                   "Veuillez saisir un numéro de question valide")

# ... De même, les autres classes d'UI (`ExerciseEditor`, `ChapterContentEditor`)
# seraient ici, adaptées pour utiliser les modèles de données robustes.
# Pour la concision, je vais simplifier l'éditeur d'exercices.

class ExerciseEditor(QWidget):
    """Éditeur d'exercices amélioré avec plus de fonctionnalités."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.exercises: List[Exercise] = []
        self.current_index = -1
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        # Toolbar simplifiée
        toolbar = QHBoxLayout()
        toolbar.addWidget(QLabel("Exercices"))
        toolbar.addStretch()
        self.count_label = QLabel("0 exercice(s)")
        toolbar.addWidget(self.count_label)
        
        # Navigation rapide par numéro d'exercice - style natif
        nav_layout = QHBoxLayout()
        nav_label = QLabel("Aller à #")
        nav_layout.addWidget(nav_label)
        self.goto_exercise_input = QLineEdit()
        self.goto_exercise_input.setFixedWidth(50)
        self.goto_exercise_input.setPlaceholderText("N°")
        self.goto_exercise_input.setAlignment(Qt.AlignmentFlag.AlignCenter)
        nav_layout.addWidget(self.goto_exercise_input)
        goto_btn = QPushButton("→")
        goto_btn.setFixedWidth(30)
        goto_btn.setToolTip("Aller à cet exercice")
        goto_btn.clicked.connect(self.goto_exercise)
        nav_layout.addWidget(goto_btn)
        toolbar.addLayout(nav_layout)
        
        add_btn = QPushButton("+ Exercice")
        add_btn.setToolTip("Ajouter un nouvel exercice")
        add_btn.clicked.connect(self.add_exercise)
        add_btn.setFixedHeight(25)
        toolbar.addWidget(add_btn)
        
        duplicate_btn = QPushButton("Dupliquer")
        duplicate_btn.setToolTip("Dupliquer l'exercice")
        duplicate_btn.clicked.connect(self.duplicate_current)
        duplicate_btn.setFixedHeight(25)
        toolbar.addWidget(duplicate_btn)
        
        # Boutons pour réordonner les exercices
        move_up_btn = QPushButton("↑")
        move_up_btn.setToolTip("Déplacer l'exercice vers le haut")
        move_up_btn.clicked.connect(self.move_exercise_up)
        move_up_btn.setFixedSize(25, 25)
        toolbar.addWidget(move_up_btn)
        
        move_down_btn = QPushButton("↓")
        move_down_btn.setToolTip("Déplacer l'exercice vers le bas")
        move_down_btn.clicked.connect(self.move_exercise_down)
        move_down_btn.setFixedSize(25, 25)
        toolbar.addWidget(move_down_btn)
        
        delete_btn = QPushButton("Suppr.")
        delete_btn.setToolTip("Supprimer l'exercice")
        delete_btn.clicked.connect(self.delete_current)
        delete_btn.setFixedSize(50, 25)
        toolbar.addWidget(delete_btn)
        layout.addLayout(toolbar)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Liste des exercices avec recherche
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        # Barre de recherche
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Rechercher un exercice...")
        self.search_edit.textChanged.connect(self.filter_exercises)
        left_layout.addWidget(self.search_edit)
        
        self.exercise_list = QListWidget()
        self.exercise_list.setMaximumWidth(300)
        self.exercise_list.currentRowChanged.connect(self.on_selection_changed)
        left_layout.addWidget(self.exercise_list)
        
        splitter.addWidget(left_panel)

        # Éditeur principal amélioré
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        
        # Titre avec compteur de caractères et numéro d'exercice
        title_section = QVBoxLayout()
        title_header = QHBoxLayout()
        self.exercise_number_label = QLabel("")
        self.exercise_number_label.setObjectName("exerciseNumberLabel")
        self.exercise_number_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #3b82f6;")
        title_header.addWidget(self.exercise_number_label)
        title_label = QLabel("Titre de l'exercice :")
        title_label.setObjectName("sectionLabel")
        title_header.addWidget(title_label)
        title_section.addLayout(title_header)
        
        self.title_edit = QLineEdit()
        self.title_edit.textChanged.connect(self.save_current)
        self.title_edit.textChanged.connect(self.update_char_count)
        title_section.addWidget(self.title_edit)
        
        self.title_char_count = QLabel("0 caractères")
        self.title_char_count.setObjectName("charCount")
        title_section.addWidget(self.title_char_count)
        
        editor_layout.addLayout(title_section)

        # Énoncé avec compteur
        statement_section = QVBoxLayout()
        statement_label = QLabel("Énoncé principal :")
        statement_label.setObjectName("sectionLabel")
        statement_section.addWidget(statement_label)
        
        self.statement_edit = QTextEdit()
        self.statement_edit.textChanged.connect(self.save_current)
        self.statement_edit.textChanged.connect(self.update_char_count)
        self.statement_edit.setMinimumHeight(120)
        statement_section.addWidget(self.statement_edit)
        
        self.statement_char_count = QLabel("0 caractères")
        self.statement_char_count.setObjectName("charCount")
        statement_section.addWidget(self.statement_char_count)
        
        editor_layout.addLayout(statement_section)

        # Section sous-questions améliorée
        subq_section = QVBoxLayout()
        subq_header = QHBoxLayout()
        subq_label = QLabel("Sous-questions :")
        subq_label.setObjectName("sectionLabel")
        subq_header.addWidget(subq_label)
        subq_header.addStretch()
        
        add_subq_btn = QPushButton("Ajouter")
        add_subq_btn.setObjectName("smallButton")
        add_subq_btn.clicked.connect(self.add_sub_question)
        subq_header.addWidget(add_subq_btn)
        
        subq_section.addLayout(subq_header)
        
        # Container pour les sous-questions
        self.sub_questions_container = QWidget()
        self.sub_questions_layout = QVBoxLayout(self.sub_questions_container)
        self.sub_question_widgets = []
        
        # Scroll area pour les sous-questions
        scroll_area = QWidget()
        scroll_layout = QVBoxLayout(scroll_area)
        scroll_layout.addWidget(self.sub_questions_container)
        scroll_layout.addStretch()
        
        subq_section.addWidget(scroll_area)
        editor_layout.addLayout(subq_section)

        splitter.addWidget(editor_widget)
        splitter.setSizes([300, 800])
        layout.addWidget(splitter)
        self.editor_widget = editor_widget
        self.editor_widget.setEnabled(False)

    def create_sub_question_widget(self, text=""):
        """Crée un widget pour une sous-question."""
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 5, 0, 5)
        
        # Numéro de la sous-question
        num_label = QLabel(f"{len(self.sub_question_widgets) + 1}.")
        num_label.setMinimumWidth(20)
        layout.addWidget(num_label)
        
        # Champ de texte
        text_edit = QLineEdit(text)
        text_edit.textChanged.connect(self.save_current)
        layout.addWidget(text_edit)
        
        # Bouton supprimer
        remove_btn = QPushButton("×")
        remove_btn.setObjectName("removeButton")
        remove_btn.setMaximumWidth(25)
        remove_btn.clicked.connect(lambda: self.remove_sub_question(widget))
        layout.addWidget(remove_btn)
        
        return widget, text_edit

    def add_sub_question(self):
        """Ajoute une nouvelle sous-question."""
        widget, text_edit = self.create_sub_question_widget()
        self.sub_question_widgets.append((widget, text_edit))
        self.sub_questions_layout.addWidget(widget)
        self.update_sub_question_numbers()
        text_edit.setFocus()

    def remove_sub_question(self, widget_to_remove):
        """Supprime une sous-question."""
        for i, (widget, text_edit) in enumerate(self.sub_question_widgets):
            if widget == widget_to_remove:
                self.sub_questions_layout.removeWidget(widget)
                widget.deleteLater()
                self.sub_question_widgets.pop(i)
                break
        self.update_sub_question_numbers()
        self.save_current()

    def update_sub_question_numbers(self):
        """Met à jour la numérotation des sous-questions."""
        for i, (widget, text_edit) in enumerate(self.sub_question_widgets):
            num_label = widget.layout().itemAt(0).widget()
            num_label.setText(f"{i + 1}.")

    def update_char_count(self):
        """Met à jour les compteurs de caractères."""
        if hasattr(self, 'title_edit'):
            title_count = len(self.title_edit.text())
            self.title_char_count.setText(f"{title_count} caractères")
        
        if hasattr(self, 'statement_edit'):
            statement_count = len(self.statement_edit.toPlainText())
            self.statement_char_count.setText(f"{statement_count} caractères")

    def filter_exercises(self):
        """Filtre les exercices selon le texte de recherche."""
        search_text = self.search_edit.text().lower()
        for i in range(self.exercise_list.count()):
            item = self.exercise_list.item(i)
            if i < len(self.exercises):
                exercise = self.exercises[i]
                visible = (search_text in exercise.title.lower() or 
                          search_text in exercise.statement.lower())
                item.setHidden(not visible)

    def duplicate_current(self):
        """Duplique l'exercice courant."""
        if 0 <= self.current_index < len(self.exercises):
            original = self.exercises[self.current_index]
            new_exercise = Exercise(
                title=f"{original.title} (Copie)",
                statement=original.statement,
                sub_questions=[SubQuestion(sq.text) for sq in original.sub_questions]
            )
            self.exercises.insert(self.current_index + 1, new_exercise)
            self.refresh_list()
            self.exercise_list.setCurrentRow(self.current_index + 1)

    def set_exercises(self, exercises: List[Exercise]):
        self.exercises = [Exercise.from_dict(e.to_dict()) for e in exercises]
        self.refresh_list()
        if self.exercises: self.exercise_list.setCurrentRow(0)

    def get_exercises(self) -> List[Exercise]:
        return self.exercises

    def refresh_list(self):
        self.exercise_list.clear()
        for i, ex in enumerate(self.exercises):
            text = ex.title or f"Exercice {i+1} (sans titre)"
            # Ajouter le numéro au début pour une meilleure identification
            self.exercise_list.addItem(f"#{i+1} - {text}")
        self.count_label.setText(f"{len(self.exercises)} exercice(s)")

    def on_selection_changed(self, index: int):
        if index < 0 or index >= len(self.exercises):
            return
        self.current_index = index
        self.load_exercise(self.exercises[index])
        self.editor_widget.setEnabled(True)

    def load_exercise(self, exercise: Exercise):
        """Charge un exercice dans l'éditeur."""
        # Bloquer les signaux pour éviter les sauvegardes automatiques
        self.title_edit.blockSignals(True)
        self.statement_edit.blockSignals(True)
        
        # Afficher le numéro d'exercice
        self.exercise_number_label.setText(f"Exercice #{self.current_index + 1}")
        
        # Charger les données de base
        self.title_edit.setText(exercise.title)
        self.statement_edit.setText(exercise.statement)
        
        # Nettoyer les sous-questions existantes
        for widget, _ in self.sub_question_widgets:
            self.sub_questions_layout.removeWidget(widget)
            widget.deleteLater()
        self.sub_question_widgets.clear()
        
        # Charger les sous-questions
        for sub_question in exercise.sub_questions:
            widget, text_edit = self.create_sub_question_widget(sub_question.text)
            self.sub_question_widgets.append((widget, text_edit))
            self.sub_questions_layout.addWidget(widget)
        
        # Réactiver les signaux
        self.title_edit.blockSignals(False)
        self.statement_edit.blockSignals(False)
        
        # Mettre à jour les compteurs
        self.update_char_count()

    def save_current(self):
        """Sauvegarde l'exercice actuellement édité."""
        if not (0 <= self.current_index < len(self.exercises)):
            return
        
        ex = self.exercises[self.current_index]
        ex.title = self.title_edit.text().strip()
        ex.statement = self.statement_edit.toPlainText().strip()
        
        # Sauvegarder les sous-questions
        ex.sub_questions = []
        for widget, text_edit in self.sub_question_widgets:
            text = text_edit.text().strip()
            if text:
                ex.sub_questions.append(SubQuestion(text))
        
        # Mettre à jour la liste
        item = self.exercise_list.item(self.current_index)
        if item:
            title = ex.title or f"Exercice {self.current_index + 1} (sans titre)"
            item.setText(f"#{self.current_index + 1} - {title}")

    def add_exercise(self):
        new_ex = Exercise(
            title=f"Nouvel Exercice {len(self.exercises) + 1}",
            statement="Énoncé de l'exercice..."
        )
        self.exercises.append(new_ex)
        self.refresh_list()
        self.exercise_list.setCurrentRow(len(self.exercises) - 1)

    def move_exercise_up(self):
        """Déplace l'exercice sélectionné vers le haut dans la liste."""
        if self.current_index > 0:
            # Échanger l'exercice actuel avec celui d'au-dessus
            self.exercises[self.current_index], self.exercises[self.current_index-1] = \
                self.exercises[self.current_index-1], self.exercises[self.current_index]
            
            # Actualiser la liste et sélectionner l'exercice à sa nouvelle position
            self.refresh_list()
            self.exercise_list.setCurrentRow(self.current_index - 1)
            
            # Signaler que le chapitre a été modifié (l'ordre a changé)
            print("Exercices modifiés: réorganisation des exercices")
            self.setProperty("modified", True)
    
    def move_exercise_down(self):
        """Déplace l'exercice sélectionné vers le bas dans la liste."""
        if 0 <= self.current_index < len(self.exercises) - 1:
            # Échanger l'exercice actuel avec celui d'en-dessous
            self.exercises[self.current_index], self.exercises[self.current_index+1] = \
                self.exercises[self.current_index+1], self.exercises[self.current_index]
            
            # Actualiser la liste et sélectionner l'exercice à sa nouvelle position
            self.refresh_list()
            self.exercise_list.setCurrentRow(self.current_index + 1)
            
            # Signaler que le chapitre a été modifié (l'ordre a changé)
            print("Exercices modifiés: réorganisation des exercices")
            self.setProperty("modified", True)
    
    def delete_current(self):
        if 0 <= self.current_index < len(self.exercises):
            exercise_title = self.exercises[self.current_index].title or f"Exercice {self.current_index + 1}"
            reply = QMessageBox.question(
                self, "Confirmer la suppression",
                f"Voulez-vous vraiment supprimer l'exercice '{exercise_title}' ?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.Yes:
                del self.exercises[self.current_index]
                self.refresh_list()
                
                # Mettre à jour la sélection après la suppression
                if self.current_index >= len(self.exercises):
                    self.current_index = len(self.exercises) - 1
                if self.exercises:
                    self.exercise_list.setCurrentRow(self.current_index)
                else:
                    self.editor_widget.setEnabled(False)
                    
    def goto_exercise(self):
        """Permet d'accéder directement à un exercice par son numéro."""
        try:
            exercise_num = int(self.goto_exercise_input.text())
            if 1 <= exercise_num <= len(self.exercises):
                self.exercise_list.setCurrentRow(exercise_num - 1)
                self.goto_exercise_input.clear()
            else:
                QMessageBox.information(self, "Information", 
                                       f"Le numéro d'exercice doit être entre 1 et {len(self.exercises)}")
        except ValueError:
            QMessageBox.information(self, "Information", 
                                   "Veuillez saisir un numéro d'exercice valide")

class ChapterContentEditor(QDialog):
    """Éditeur complet du contenu d'un chapitre."""
    def __init__(self, chapter: ChapterData, parent=None):
        super().__init__(parent)
        self.chapter = chapter
        self.setWindowTitle(f"Édition: {chapter.chapter_name}")
        self.setModal(True)
        # Fenêtre plus large et moins haute
        self.resize(1300, 700)
        # Ajout des boutons de fenêtre (maximiser/minimiser)
        self.setWindowFlags(self.windowFlags() | Qt.WindowType.WindowMaximizeButtonHint | Qt.WindowType.WindowMinimizeButtonHint)
        self.init_ui()
        self.load_chapter_data()

    def init_ui(self):
        layout = QVBoxLayout(self)
        
        self.tabs = QTabWidget()
        
        info_widget = self.create_info_tab()
        self.quiz_editor = QuizEditor()
        self.exercise_editor = ExerciseEditor()
        
        # Onglets simplifiés
        self.tabs.addTab(info_widget, "Informations")
        self.tabs.addTab(self.quiz_editor, "Quiz")
        self.tabs.addTab(self.exercise_editor, "Exercices")
        layout.addWidget(self.tabs)
        
        # Boutons natifs
        buttons = QDialogButtonBox()
        save_btn = QPushButton("Sauvegarder")
        cancel_btn = QPushButton("Annuler")
        
        buttons.addButton(save_btn, QDialogButtonBox.ButtonRole.AcceptRole)
        buttons.addButton(cancel_btn, QDialogButtonBox.ButtonRole.RejectRole)
        buttons.accepted.connect(self.save_and_close)
        buttons.rejected.connect(self.reject)
        
        layout.addWidget(buttons)
        
    def create_info_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        form = QFormLayout()
        self.name_edit = QLineEdit(self.chapter.chapter_name)
        form.addRow("Nom du chapitre:", self.name_edit)
        self.class_edit = QLineEdit(self.chapter.class_type)
        self.class_edit.setReadOnly(True)
        form.addRow("Classe:", self.class_edit)
        self.file_edit = QLineEdit(self.chapter.file_name)
        self.file_edit.setReadOnly(True)
        form.addRow("Fichier:", self.file_edit)
        layout.addLayout(form)
        
        # Gestion améliorée des dates de séances
        dates_group = QGroupBox("Gestion des dates de séance")
        dates_layout = QVBoxLayout(dates_group)
        
        # Liste des dates avec affichage amélioré
        self.dates_list = QListWidget()
        self.dates_list.setAlternatingRowColors(True)
        self.dates_list.setSelectionMode(QListWidget.SelectionMode.ExtendedSelection)  # Permettre la sélection multiple
        self.dates_list.itemDoubleClicked.connect(self.edit_selected_date)
        self.dates_list.setMinimumHeight(120)
        self.populate_dates_list()  # Méthode séparée pour remplir la liste
        dates_layout.addWidget(self.dates_list)
        
        # Contrôles pour les dates
        date_controls = QHBoxLayout()
        
        # Sélecteur de date avec format plus lisible
        self.date_edit = QDateTimeEdit(QDateTime.currentDateTime())
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDisplayFormat("dd/MM/yyyy HH:mm")  # Format plus lisible
        date_controls.addWidget(self.date_edit, 1)
        
        # Bouton pour ajouter une date
        add_date_btn = QPushButton("Ajouter")
        add_date_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_DialogOkButton))
        add_date_btn.clicked.connect(self.add_date)
        date_controls.addWidget(add_date_btn)
        
        # Bouton pour éditer une date
        edit_date_btn = QPushButton("Modifier")
        edit_date_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogDetailedView))
        edit_date_btn.clicked.connect(lambda: self.edit_selected_date(self.dates_list.currentItem()))
        date_controls.addWidget(edit_date_btn)
        
        # Bouton pour supprimer des dates
        remove_date_btn = QPushButton("Supprimer")
        remove_date_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_DialogCancelButton))
        remove_date_btn.clicked.connect(self.remove_date)
        date_controls.addWidget(remove_date_btn)
        
        dates_layout.addLayout(date_controls)
        
        # Raccourcis pour dates prédéfinies (cette semaine)
        quick_dates = QHBoxLayout()
        quick_dates.addWidget(QLabel("Ajout rapide:"))
        
        # Ajouter 3 boutons pour les dates prédéfinies: Aujourd'hui, Demain, Prochain cours
        today_btn = QPushButton("Aujourd'hui (14h)")
        today_btn.setFixedHeight(25)
        today_btn.clicked.connect(self.add_today_date)
        quick_dates.addWidget(today_btn)
        
        tomorrow_btn = QPushButton("Demain (14h)")
        tomorrow_btn.setFixedHeight(25)
        tomorrow_btn.clicked.connect(self.add_tomorrow_date)
        quick_dates.addWidget(tomorrow_btn)
        
        next_week_btn = QPushButton("Semaine prochaine")
        next_week_btn.setFixedHeight(25)
        next_week_btn.clicked.connect(self.add_next_week_date)
        quick_dates.addWidget(next_week_btn)
        
        dates_layout.addLayout(quick_dates)
        
        # Ajouter le groupe à la mise en page principale
        layout.addWidget(dates_group)
        layout.addStretch()
        return widget

    def load_chapter_data(self):
        self.quiz_editor.set_questions(self.chapter.quiz_questions)
        self.exercise_editor.set_exercises(self.chapter.exercises)
        
        # Réinitialiser les indicateurs de modification
        self.quiz_editor.setProperty("modified", False)
        self.exercise_editor.setProperty("modified", False)

    def populate_dates_list(self):
        """Remplit la liste des dates avec un affichage amélioré."""
        self.dates_list.clear()
        # Trier les dates avant de les afficher
        sorted_dates = sorted(self.chapter.session_dates)
        for date_str in sorted_dates:
            try:
                # Convertir la chaîne ISO en QDateTime
                date_time = QDateTime.fromString(date_str, "yyyy-MM-ddTHH:mm:ssZ")
                if date_time.isValid():
                    # Créer un affichage plus convivial
                    display_format = date_time.toString("dddd dd/MM/yyyy à HH:mm")
                    item = QListWidgetItem(f"{display_format}")
                    item.setToolTip(date_str)  # Format ISO en infobulle
                    item.setData(Qt.ItemDataRole.UserRole, date_str)  # Stocker le format ISO en données utilisateur
                    self.dates_list.addItem(item)
                else:
                    # Afficher le format brut si la conversion échoue
                    item = QListWidgetItem(date_str)
                    item.setData(Qt.ItemDataRole.UserRole, date_str)
                    self.dates_list.addItem(item)
            except Exception as e:
                print(f"Erreur lors de l'affichage de la date {date_str}: {e}")
                # Ajouter quand même la date brute
                item = QListWidgetItem(date_str)
                item.setData(Qt.ItemDataRole.UserRole, date_str)
                self.dates_list.addItem(item)
    
    def add_date(self):
        """Ajoute une nouvelle date à la liste."""
        # Récupérer la date en format ISO
        date_time = self.date_edit.dateTime()
        date_str = date_time.toString("yyyy-MM-ddTHH:mm:ssZ")
        
        # Vérifier si cette date existe déjà
        for i in range(self.dates_list.count()):
            if self.dates_list.item(i).data(Qt.ItemDataRole.UserRole) == date_str:
                QMessageBox.warning(self, "Date existante", "Cette date est déjà dans la liste!")
                return
        
        # Ajouter à la liste du chapitre
        self.chapter.session_dates.append(date_str)
        
        # Mettre à jour l'affichage
        self.populate_dates_list()
        
        # Message de confirmation
        self.statusBar = QStatusBar()
        self.statusBar.showMessage(f"Date ajoutée: {date_time.toString('dd/MM/yyyy HH:mm')}", 3000)
    
    def add_today_date(self):
        """Ajoute rapidement la date d'aujourd'hui à 14h00."""
        today = QDateTime.currentDateTime()
        today.setTime(QTime(14, 0))  # Définir l'heure à 14:00
        self.date_edit.setDateTime(today)
        self.add_date()
    
    def add_tomorrow_date(self):
        """Ajoute rapidement la date de demain à 14h00."""
        tomorrow = QDateTime.currentDateTime().addDays(1)
        tomorrow.setTime(QTime(14, 0))  # Définir l'heure à 14:00
        self.date_edit.setDateTime(tomorrow)
        self.add_date()
    
    def add_next_week_date(self):
        """Ajoute rapidement une date la semaine prochaine, même jour à 14h00."""
        next_week = QDateTime.currentDateTime().addDays(7)
        next_week.setTime(QTime(14, 0))  # Définir l'heure à 14:00
        self.date_edit.setDateTime(next_week)
        self.add_date()
    
    def edit_selected_date(self, item):
        """Permet d'éditer une date existante."""
        if not item:
            return
        
        # Récupérer la date existante
        original_date_str = item.data(Qt.ItemDataRole.UserRole)
        original_date = QDateTime.fromString(original_date_str, "yyyy-MM-ddTHH:mm:ssZ")
        
        # Configurer l'éditeur de date pour afficher la date sélectionnée
        self.date_edit.setDateTime(original_date)
        
        # Demander à l'utilisateur s'il souhaite modifier cette date
        reply = QMessageBox.question(
            self,
            "Modifier la date",
            f"Souhaitez-vous modifier la date: {original_date.toString('dddd dd/MM/yyyy à HH:mm')} ?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Supprimer l'ancienne date
            self.chapter.session_dates.remove(original_date_str)
            
            # Ajouter la nouvelle date configurée
            self.add_date()
    
    def remove_date(self):
        """Supprime les dates sélectionnées après confirmation."""
        selected_items = self.dates_list.selectedItems()
        if not selected_items:
            QMessageBox.information(self, "Information", "Veuillez sélectionner au moins une date à supprimer.")
            return
        
        # Demander confirmation
        plural = "s" if len(selected_items) > 1 else ""
        reply = QMessageBox.question(
            self,
            "Confirmer la suppression",
            f"Êtes-vous sûr de vouloir supprimer {len(selected_items)} date{plural} ?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Supprimer les dates sélectionnées
            for item in selected_items:
                date_str = item.data(Qt.ItemDataRole.UserRole)
                if date_str in self.chapter.session_dates:
                    self.chapter.session_dates.remove(date_str)
            
            # Mettre à jour l'affichage
            self.populate_dates_list()
            
    def save_and_close(self):
        """Récupère les données des éditeurs, vérifie si des modifications ont été apportées et sauvegarde si nécessaire."""
        # Enregistrer l'état initial
        original_name = self.chapter.chapter_name
        original_dates_count = len(self.chapter.session_dates)
        original_quiz_count = len(self.chapter.quiz_questions)
        original_exercises_count = len(self.chapter.exercises)
        
        # Récupérer les nouvelles données
        new_name = self.name_edit.text().strip()
        # Pour les dates, on utilise les données déjà mises à jour dans self.chapter.session_dates
        new_quiz_questions = self.quiz_editor.get_questions()
        new_exercises = self.exercise_editor.get_exercises()
        new_quiz_questions = self.quiz_editor.get_questions()
        new_exercises = self.exercise_editor.get_exercises()
        
        # Appliquer les modifications à l'objet chapitre
        self.chapter.chapter_name = new_name
        # self.chapter.session_dates est déjà mis à jour par les méthodes add_date, edit_selected_date et remove_date
        self.chapter.quiz_questions = new_quiz_questions
        self.chapter.exercises = new_exercises
        
        # Vérifier si des modifications ont été apportées
        modified = False
        
        if original_name != new_name:
            modified = True
            print(f"Nom du chapitre modifié: {original_name} -> {new_name}")
            
        if original_dates_count != len(self.chapter.session_dates):
            modified = True
            print(f"Dates modifiées: {original_dates_count} -> {len(self.chapter.session_dates)}")
            
        if original_quiz_count != len(new_quiz_questions):
            modified = True
            print(f"Nombre de quiz modifié: {original_quiz_count} -> {len(new_quiz_questions)}")
            
        if original_exercises_count != len(new_exercises):
            modified = True
            print(f"Nombre d'exercices modifié: {original_exercises_count} -> {len(new_exercises)}")
        
        # Vérifier si l'ordre a été modifié via les propriétés
        if self.quiz_editor.property("modified") or self.exercise_editor.property("modified"):
            modified = True
            print("L'ordre des questions ou exercices a été modifié")
            
        # Si des modifications sont détectées, forcer une sauvegarde immédiate
        if modified:
            print("Modifications détectées - Sauvegarde immédiate du chapitre")
            # La sauvegarde effective se fera dans edit_chapter
        
        self.accept()

# =============================================================================
# SECTION 3: APPLICATION PRINCIPALE
# La fenêtre principale qui orchestre l'ensemble de l'application.
# =============================================================================

class SmartChapterManager(QMainWindow):
    """Application principale de gestion de contenu pédagogique."""
    
    CLASSES_DATA = [
        {'value': 'tcs', 'label': 'Tronc Commun Scientifique'},
        {'value': '1bse', 'label': '1ère Bac Sciences Expérimentales'},
        {'value': '1bsm', 'label': '1ère Bac Sciences Mathématiques'},
        {'value': '2bse', 'label': '2ème Bac Sciences Expérimentales'},
        {'value': '2bsm', 'label': '2ème Bac Sciences Mathématiques'},
    ]
    CLASSES = [item['value'] for item in CLASSES_DATA]
    CLASS_LABELS = {item['value']: item['label'] for item in CLASSES_DATA}

    def __init__(self):
        super().__init__()
        self.manifest_path: Optional[Path] = None
        self.chapters_dir: Optional[Path] = None
        self.chapters_by_class: Dict[str, List[ChapterData]] = {cls: [] for cls in self.CLASSES}
        self.all_chapters: Dict[str, ChapterData] = {}
        self.init_ui()
        self.auto_load()

    def init_ui(self):
        self.setWindowTitle("📚 Gestionnaire de Contenus Pédagogiques - v2.5")
        # Fenêtre optimale avec icône
        self.setMinimumSize(1400, 750)
        self.setWindowIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogDetailedView))
        
        self.create_menus()
        self.create_toolbar()
        
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(8, 8, 8, 8)
        
        # En-tête avec informations
        self.header = self.create_header()
        layout.addWidget(self.header)
        
        self.tabs = QTabWidget()
        self.tabs.setDocumentMode(True)  # Style natif
        self.tabs.setTabPosition(QTabWidget.TabPosition.North)
        
        for class_id in self.CLASSES:
            tab = self.create_class_tab(class_id)
            icon = self.style().standardIcon(QStyle.StandardPixmap.SP_FileIcon)
            self.tabs.addTab(tab, icon, self.CLASS_LABELS[class_id])
        layout.addWidget(self.tabs)
        
        self.status_bar = self.statusBar()
        self.update_status("Prêt. Ouvrez un fichier manifest.json pour commencer.")
        
        # Appliquer le style natif moderne
        self.apply_native_style()

    def create_header(self):
        """Crée l'en-tête avec informations sur le projet."""
        header = QWidget()
        layout = QHBoxLayout(header)
        layout.setContentsMargins(12, 8, 12, 8)
        
        # Icône et titre
        icon_label = QLabel()
        icon_label.setPixmap(self.style().standardIcon(
            QStyle.StandardPixmap.SP_DriveHDIcon).pixmap(32, 32))
        layout.addWidget(icon_label)
        
        # Informations du projet
        info_layout = QVBoxLayout()
        self.project_label = QLabel("Aucun projet chargé")
        self.project_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        info_layout.addWidget(self.project_label)
        
        self.stats_label = QLabel("0 chapitres | 0 quiz | 0 exercices")
        self.stats_label.setStyleSheet("color: #666; font-size: 11px;")
        info_layout.addWidget(self.stats_label)
        
        layout.addLayout(info_layout)
        layout.addStretch()
        
        # Bouton d'actualisation
        refresh_btn = QPushButton()
        refresh_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_BrowserReload))
        refresh_btn.setToolTip("Recharger le manifest")
        refresh_btn.clicked.connect(self.reload_manifest)
        refresh_btn.setFixedSize(32, 32)
        layout.addWidget(refresh_btn)
        
        header.setStyleSheet("""
            QWidget {
                background-color: #f5f5f5;
                border-bottom: 1px solid #ddd;
                border-radius: 4px;
            }
        """)
        
        return header
    
    def create_toolbar(self):
        """Crée une barre d'outils native avec icônes système."""
        toolbar = self.addToolBar("Barre d'outils principale")
        toolbar.setMovable(False)
        toolbar.setIconSize(QSize(24, 24))
        
        # Ouvrir
        open_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_DirOpenIcon),
            "Ouvrir manifest", self
        )
        open_action.setShortcut("Ctrl+O")
        open_action.setToolTip("Ouvrir un fichier manifest.json (Ctrl+O)")
        open_action.triggered.connect(self.open_manifest)
        toolbar.addAction(open_action)
        
        # Sauvegarder
        save_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_DialogSaveButton),
            "Sauvegarder", self
        )
        save_action.setShortcut("Ctrl+S")
        save_action.setToolTip("Sauvegarder tous les changements (Ctrl+S)")
        save_action.triggered.connect(self.save_all)
        toolbar.addAction(save_action)
        
        toolbar.addSeparator()
        
        # Actualiser
        refresh_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_BrowserReload),
            "Actualiser", self
        )
        refresh_action.setShortcut("F5")
        refresh_action.setToolTip("Recharger le manifest (F5)")
        refresh_action.triggered.connect(self.reload_manifest)
        toolbar.addAction(refresh_action)
        
        toolbar.addSeparator()
        
        # Vérifier l'intégrité
        check_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxInformation),
            "Vérifier", self
        )
        check_action.setToolTip("Vérifier l'intégrité des fichiers")
        check_action.triggered.connect(self.check_integrity)
        toolbar.addAction(check_action)
        
        toolbar.addSeparator()
        
        # Aide
        help_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxQuestion),
            "Aide", self
        )
        help_action.setToolTip("Afficher l'aide")
        help_action.triggered.connect(self.show_help)
        toolbar.addAction(help_action)
    
    def create_menus(self):
        menubar = self.menuBar()
        
        # Menu Fichier
        file_menu = menubar.addMenu("&Fichier")
        
        open_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_DirOpenIcon),
            "Ouvrir manifest...", self
        )
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_manifest)
        file_menu.addAction(open_action)
        
        save_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_DialogSaveButton),
            "Sauvegarder Tout", self
        )
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.save_all)
        file_menu.addAction(save_action)
        
        file_menu.addSeparator()
        
        export_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogContentsView),
            "Exporter les statistiques...", self
        )
        export_action.triggered.connect(self.export_statistics)
        file_menu.addAction(export_action)
        
        file_menu.addSeparator()
        
        quit_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_DialogCloseButton),
            "Quitter", self
        )
        quit_action.setShortcut("Ctrl+Q")
        quit_action.triggered.connect(self.close)
        file_menu.addAction(quit_action)
        
        # Menu Édition
        edit_menu = menubar.addMenu("&Édition")
        
        undo_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_ArrowBack),
            "Annuler", self
        )
        undo_action.setShortcut("Ctrl+Z")
        undo_action.setEnabled(False)  # Pour future implémentation
        edit_menu.addAction(undo_action)
        
        # Menu Outils
        tools_menu = menubar.addMenu("&Outils")
        
        integrity_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxInformation),
            "Vérifier l'intégrité...", self
        )
        integrity_action.triggered.connect(self.check_integrity)
        tools_menu.addAction(integrity_action)
        
        changes_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogDetailedView),
            "Détecter les changements...", self
        )
        changes_action.triggered.connect(self.detect_content_changes)
        tools_menu.addAction(changes_action)
        
        recalc_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_BrowserReload),
            "Recalculer toutes les versions...", self
        )
        recalc_action.triggered.connect(self.recalculate_all_versions)
        tools_menu.addAction(recalc_action)
        
        # Menu Aide
        help_menu = menubar.addMenu("&Aide")
        
        help_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxQuestion),
            "Documentation", self
        )
        help_action.setShortcut("F1")
        help_action.triggered.connect(self.show_help)
        help_menu.addAction(help_action)
        
        about_action = QAction(
            self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxInformation),
            "À propos", self
        )
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_class_tab(self, class_id: str) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(12)
        
        # Toolbar pour chaque classe
        toolbar = QHBoxLayout()
        
        # Titre avec icône
        title_layout = QHBoxLayout()
        icon_label = QLabel()
        icon_label.setPixmap(self.style().standardIcon(
            QStyle.StandardPixmap.SP_FileIcon).pixmap(20, 20))
        title_layout.addWidget(icon_label)
        
        title_label = QLabel(f"Chapitres - {self.CLASS_LABELS[class_id]}")
        title_label.setStyleSheet("font-weight: 600; font-size: 13px; color: #333;")
        title_layout.addWidget(title_label)
        toolbar.addLayout(title_layout)
        
        toolbar.addStretch()
        
        # Bouton d'ajout avec icône native
        add_btn = QPushButton(" Nouveau chapitre")
        add_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogNewFolder))
        add_btn.clicked.connect(lambda: self.add_chapter_to_class(class_id))
        add_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        add_btn.setStyleSheet("""
            QPushButton {
                background-color: #0078d4;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-weight: 500;
            }
            QPushButton:hover {
                background-color: #106ebe;
            }
            QPushButton:pressed {
                background-color: #005a9e;
            }
        """)
        toolbar.addWidget(add_btn)
        
        layout.addLayout(toolbar)
        
        # Table native et professionnelle
        table = QTableWidget()
        table.setObjectName(f"table_{class_id}")
        table.setColumnCount(7)  # Ajout d'une colonne pour l'icône de statut
        table.setHorizontalHeaderLabels([
            "", "Actif", "Chapitre", "Version", "Quiz", "Exercices", "Actions"
        ])
        
        header = table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.Fixed)
        header.setSectionResizeMode(6, QHeaderView.ResizeMode.Fixed)
        
        table.setColumnWidth(0, 30)  # Icône
        table.setColumnWidth(1, 60)  # Actif
        table.setColumnWidth(3, 120)  # Version
        table.setColumnWidth(4, 60)   # Quiz
        table.setColumnWidth(5, 80)   # Exercices
        table.setColumnWidth(6, 160)  # Actions
        
        table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        table.setAlternatingRowColors(True)
        table.setShowGrid(True)
        table.setGridStyle(Qt.PenStyle.SolidLine)
        
        # Style natif pour la table
        table.setStyleSheet("""
            QTableWidget {
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                background-color: white;
                gridline-color: #e8e8e8;
            }
            QTableWidget::item {
                padding: 8px;
                border-bottom: 1px solid #f0f0f0;
            }
            QTableWidget::item:selected {
                background-color: #e5f3ff;
                color: black;
            }
            QHeaderView::section {
                background-color: #f8f8f8;
                padding: 8px;
                border: none;
                border-bottom: 2px solid #d0d0d0;
                border-right: 1px solid #e0e0e0;
                font-weight: 600;
                color: #333;
            }
            QTableWidget::item:alternate {
                background-color: #fafafa;
            }
        """)
        
        # Hauteur des lignes
        table.verticalHeader().setDefaultSectionSize(48)
        table.verticalHeader().setVisible(False)
        
        table.doubleClicked.connect(self.on_table_double_click)
        layout.addWidget(table)
        
        return widget
    
    def apply_native_style(self):
        """Applique un style natif et professionnel à l'application."""
        self.setStyleSheet("""
            /* Style général - Natif et moderne */
            QMainWindow, QDialog, QWidget {
                background-color: #ffffff;
                font-family: 'Segoe UI', 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
                font-size: 12px;
                color: #333;
            }
            
            /* Onglets natifs */
            QTabWidget::pane {
                border: 1px solid #d0d0d0;
                background-color: white;
                border-radius: 4px;
            }
            
            QTabBar::tab {
                background-color: #f0f0f0;
                color: #555;
                padding: 10px 20px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                border: 1px solid #d0d0d0;
                border-bottom: none;
            }
            
            QTabBar::tab:selected {
                background-color: white;
                color: #0078d4;
                font-weight: 600;
                border-bottom: 2px solid #0078d4;
            }
            
            QTabBar::tab:hover:!selected {
                background-color: #e8e8e8;
            }
            
            /* Champs de saisie natifs */
            QLineEdit, QTextEdit {
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                padding: 6px 10px;
                background-color: white;
                selection-background-color: #0078d4;
            }
            
            QLineEdit:focus, QTextEdit:focus {
                border: 2px solid #0078d4;
                padding: 5px 9px;
            }
            
            /* Listes natives */
            QListWidget {
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                background-color: white;
                outline: none;
            }
            
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            QListWidget::item:hover {
                background-color: #f5f5f5;
            }
            
            QListWidget::item:selected {
                background-color: #e5f3ff;
                color: black;
                border-left: 3px solid #0078d4;
            }
            
            /* Cases à cocher natives */
            QCheckBox {
                spacing: 8px;
            }
            
            QCheckBox::indicator {
                width: 18px;
                height: 18px;
                border: 1px solid #8a8a8a;
                border-radius: 3px;
                background-color: white;
            }
            
            QCheckBox::indicator:hover {
                border-color: #0078d4;
            }
            
            QCheckBox::indicator:checked {
                background-color: #0078d4;
                border-color: #0078d4;
                image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgM0w0LjUgOC41TDIgNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=);
            }
            
            /* Radio buttons natifs */
            QRadioButton::indicator {
                width: 18px;
                height: 18px;
                border: 1px solid #8a8a8a;
                border-radius: 9px;
                background-color: white;
            }
            
            QRadioButton::indicator:hover {
                border-color: #0078d4;
            }
            
            QRadioButton::indicator:checked {
                background-color: white;
                border: 2px solid #0078d4;
            }
            
            QRadioButton::indicator:checked::after {
                width: 10px;
                height: 10px;
                border-radius: 5px;
                background-color: #0078d4;
            }
            
            /* Boutons natifs */
            QPushButton {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #d0d0d0;
                padding: 6px 16px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            QPushButton:hover {
                background-color: #e8e8e8;
                border-color: #b8b8b8;
            }
            
            QPushButton:pressed {
                background-color: #d8d8d8;
            }
            
            QPushButton:disabled {
                background-color: #f8f8f8;
                color: #a0a0a0;
                border-color: #e0e0e0;
            }
            
            /* Barres de défilement natives */
            QScrollBar:vertical {
                border: none;
                background-color: #f5f5f5;
                width: 12px;
                margin: 0;
            }
            
            QScrollBar::handle:vertical {
                background-color: #c0c0c0;
                min-height: 30px;
                border-radius: 6px;
            }
            
            QScrollBar::handle:vertical:hover {
                background-color: #a0a0a0;
            }
            
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
            
            /* Barre de statut */
            QStatusBar {
                background-color: #f8f8f8;
                border-top: 1px solid #d0d0d0;
                color: #555;
                padding: 4px;
            }
            
            /* Tooltips natifs */
            QToolTip {
                background-color: #333;
                color: white;
                border: none;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 11px;
            }
            
            /* Menus natifs */
            QMenuBar {
                background-color: #f8f8f8;
                border-bottom: 1px solid #d0d0d0;
            }
            
            QMenuBar::item {
                background-color: transparent;
                padding: 6px 12px;
            }
            
            QMenuBar::item:selected {
                background-color: #e8e8e8;
            }
            
            QMenu {
                background-color: white;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                padding: 4px;
            }
            
            QMenu::item {
                padding: 6px 30px 6px 10px;
                border-radius: 3px;
            }
            
            QMenu::item:selected {
                background-color: #e5f3ff;
                color: #0078d4;
            }
            
            QMenu::separator {
                height: 1px;
                background-color: #e0e0e0;
                margin: 4px 8px;
            }
            
            /* Barre d'outils */
            QToolBar {
                background-color: #f8f8f8;
                border-bottom: 1px solid #d0d0d0;
                spacing: 4px;
                padding: 4px;
            }
            
            QToolBar::separator {
                background-color: #d0d0d0;
                width: 1px;
                margin: 4px 8px;
            }
        """)
    
    def reload_manifest(self):
        """Recharge le manifest actuel."""
        if self.manifest_path and self.manifest_path.exists():
            self.load_manifest(self.manifest_path)
        else:
            QMessageBox.information(
                self,
                "Information",
                "Aucun manifest chargé. Utilisez 'Fichier > Ouvrir manifest...' pour en charger un."
            )
    
    def show_help(self):
        """Affiche la fenêtre d'aide."""
        help_text = """
        <h2>📚 Gestionnaire de Contenus Pédagogiques</h2>
        
        <h3>🎯 Utilisation</h3>
        <p><b>Ctrl+O</b> : Ouvrir un fichier manifest.json</p>
        <p><b>Ctrl+S</b> : Sauvegarder tous les changements</p>
        <p><b>F5</b> : Actualiser le manifest</p>
        <p><b>Double-clic</b> : Éditer un chapitre</p>
        
        <h3>📝 Édition de Chapitres</h3>
        <ul>
            <li><b>Onglet Informations</b> : Nom, classe, dates de séances</li>
            <li><b>Onglet Quiz</b> : Questions MCQ et questions d'ordonnancement</li>
            <li><b>Onglet Exercices</b> : Exercices avec sous-questions</li>
        </ul>
        
        <h3>🔄 Système de Versioning</h3>
        <p>Chaque modification du contenu génère une nouvelle version basée sur un hash MD5 du contenu.
        L'application web détecte automatiquement les mises à jour et notifie les élèves.</p>
        
        <h3>💾 Sauvegarde Automatique</h3>
        <p>Les modifications sont automatiquement détectées et le manifest.json est mis à jour
        après chaque sauvegarde de chapitre.</p>
        """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("Aide - Gestionnaire de Contenus")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(help_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()
    
    def show_about(self):
        """Affiche la fenêtre À propos."""
        about_text = """
        <h2>📚 Gestionnaire de Contenus Pédagogiques</h2>
        <p><b>Version 2.5</b></p>
        <p>Application de gestion de contenu pour plateforme d'apprentissage en mathématiques.</p>
        
        <h3>Fonctionnalités</h3>
        <ul>
            <li>✅ Gestion multi-classes (TCS, 1BSE, 1BSM, 2BSE, 2BSM)</li>
            <li>✅ Éditeur de quiz (MCQ et ordonnancement)</li>
            <li>✅ Éditeur d'exercices avec sous-questions</li>
            <li>✅ Système de versioning automatique</li>
            <li>✅ Gestion des dates de séances</li>
            <li>✅ Validation et vérification d'intégrité</li>
        </ul>
        
        <p style="margin-top: 20px; color: #666; font-size: 10px;">
        © 2025 - Math Pedagogy Platform
        </p>
        """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("À propos")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(about_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()
    
    def export_statistics(self):
        """Exporte les statistiques du projet."""
        if not self.all_chapters:
            QMessageBox.warning(self, "Attention", "Aucun chapitre chargé.")
            return
        
        # Calculer les statistiques
        stats = {
            'total_chapters': len(self.all_chapters),
            'active_chapters': sum(1 for ch in self.all_chapters.values() if ch.is_active),
            'total_quiz': sum(len(ch.quiz_questions) for ch in self.all_chapters.values()),
            'total_exercises': sum(len(ch.exercises) for ch in self.all_chapters.values()),
            'by_class': {}
        }
        
        for class_id in self.CLASSES:
            chapters = self.chapters_by_class[class_id]
            stats['by_class'][class_id] = {
                'chapters': len(chapters),
                'quiz': sum(len(ch.quiz_questions) for ch in chapters),
                'exercises': sum(len(ch.exercises) for ch in chapters)
            }
        
        # Afficher les statistiques
        stats_text = f"""
        <h2>📊 Statistiques du Projet</h2>
        
        <h3>Vue d'ensemble</h3>
        <p><b>Chapitres totaux :</b> {stats['total_chapters']}</p>
        <p><b>Chapitres actifs :</b> {stats['active_chapters']}</p>
        <p><b>Questions de quiz :</b> {stats['total_quiz']}</p>
        <p><b>Exercices :</b> {stats['total_exercises']}</p>
        
        <h3>Par classe</h3>
        """
        
        for class_id in self.CLASSES:
            class_stats = stats['by_class'][class_id]
            if class_stats['chapters'] > 0:
                stats_text += f"""
                <p><b>{self.CLASS_LABELS[class_id]}</b><br>
                &nbsp;&nbsp;Chapitres: {class_stats['chapters']} | 
                Quiz: {class_stats['quiz']} | 
                Exercices: {class_stats['exercises']}</p>
                """
        
        msg = QMessageBox(self)
        msg.setWindowTitle("Statistiques")
        msg.setTextFormat(Qt.TextFormat.RichText)
        msg.setText(stats_text)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()
    
    def update_header_info(self):
        """Met à jour les informations dans l'en-tête."""
        if self.manifest_path:
            self.project_label.setText(f"📁 {self.manifest_path.parent.name} / {self.manifest_path.name}")
        else:
            self.project_label.setText("Aucun projet chargé")
        
        total_chapters = len(self.all_chapters)
        total_quiz = sum(len(ch.quiz_questions) for ch in self.all_chapters.values())
        total_exercises = sum(len(ch.exercises) for ch in self.all_chapters.values())
        
        self.stats_label.setText(
            f"{total_chapters} chapitres | {total_quiz} questions | {total_exercises} exercices"
        )
    
    def apply_style(self):
        """Ancien nom de la fonction - redirige vers apply_native_style."""
        self.apply_native_style()
        self.setStyleSheet("""
            /* Style minimaliste et moderne */
            QMainWindow, QDialog, QWidget { 
                background-color: #ffffff; 
                font-family: 'Segoe UI', 'Arial', sans-serif;
                font-size: 13px;
            }
            
            /* Tables */
            QTableWidget { 
                border: none;
                border-radius: 8px;
                gridline-color: #f1f5f9;
                background-color: white;
                alternate-background-color: #f8fafc;
                selection-background-color: #e0f2fe;
                padding: 2px;
            }
            
            QTableWidget::item {
                padding: 8px;
                min-height: 36px;  /* Hauteur minimale pour les cellules */
            }
            
            QHeaderView::section { 
                background-color: #f8fafc;
                color: #334155;
                padding: 12px;
                border: none;
                font-weight: 600;
                font-size: 13px;
                letter-spacing: 0.3px;
            }
            
            /* Boutons principaux - style minimaliste moderne */
            QPushButton[objectName="modernButton"] {
                background-color: #0ea5e9;
                color: white;
                border: none;
                padding: 6px 12px;  /* Padding réduit pour éviter les coupures */
                margin: 2px;        /* Marge pour éviter les coupures aux bords */
                border-radius: 4px;  /* Rayon réduit pour meilleure visibilité */
                font-weight: 500;
                min-width: 80px;    /* Largeur minimale réduite */
                min-height: 28px;   /* Hauteur minimale définie */
                font-size: 12px;    /* Taille de police légèrement réduite */
            }
            
            /* Style spécifique pour les boutons dans les cellules de tableau */
            QTableWidget QPushButton[objectName="modernButton"] {
                padding: 4px 8px;  /* Padding encore plus compact pour les tableaux */
                margin: 1px;
                min-height: 26px;
                font-size: 11px;
                border-radius: 3px;
            }
            
            QPushButton[objectName="modernButton"]:hover {
                background-color: #0284c7;
            }
            
            QPushButton[objectName="modernButton"]:pressed {
                background-color: #0369a1;
            }
            
            /* Boutons de suppression */
            QPushButton[objectName="dangerButton"] {
                background-color: #f43f5e;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                font-weight: 500;
                min-height: 28px;
                margin: 2px;
                font-size: 12px;
            }
            
            QPushButton[objectName="dangerButton"]:hover {
                background-color: #e11d48;
            }
            
            /* Style spécifique pour les boutons dangereux dans les tableaux */
            QTableWidget QPushButton[objectName="dangerButton"] {
                padding: 4px 8px;
                margin: 1px;
                min-height: 26px;
                font-size: 11px;
                border-radius: 3px;
            }
            
            /* Petits boutons */
            QPushButton[objectName="smallButton"] {
                background-color: #10b981;
                color: white;
                border: none;
                padding: 4px 10px;
                border-radius: 4px;
                font-weight: 500;
                font-size: 12px;
                min-height: 28px;
                margin: 2px;
            }
            
            QPushButton[objectName="smallButton"]:hover {
                background-color: #059669;
            }
            
            /* Style spécifique pour les petits boutons dans les tableaux */
            QTableWidget QPushButton[objectName="smallButton"] {
                padding: 3px 6px;
                margin: 1px;
                min-height: 26px;
                font-size: 11px;
                border-radius: 3px;
            }
            
            QPushButton[objectName="removeButton"] {
                background-color: #f43f5e;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                width: 22px;
                height: 22px;
            }
            
            QPushButton[objectName="removeButton"]:hover {
                background-color: #e11d48;
            }
            
            /* Boutons par défaut */
            QPushButton {
                background-color: #64748b;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-weight: 500;
                letter-spacing: 0.3px;
            }
            
            QPushButton:hover {
                background-color: #475569;
            }
            
            /* Labels */
            QLabel[objectName="sectionLabel"] {
                font-weight: 600;
                font-size: 14px;
                color: #0f172a;
                margin-top: 15px;
                margin-bottom: 8px;
                letter-spacing: 0.3px;
            }
            
            QLabel[objectName="helpLabel"] {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 10px;
            }
            
            QLabel[objectName="charCount"] {
                font-size: 11px;
                color: #94a3b8;
                margin-bottom: 5px;
            }
            
            /* Champs de saisie */
            QLineEdit, QTextEdit {
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px;
                background-color: white;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            
            QLineEdit:focus, QTextEdit:focus {
                border-color: #0ea5e9;
                border-width: 1px;
                background-color: #f8fafc;
            }
            
            /* Listes */
            QListWidget {
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background-color: white;
                selection-background-color: #0ea5e9;
                selection-color: white;
                outline: none;
                padding: 5px;
            }
            
            QListWidget::item {
                padding: 10px;
                border-bottom: 1px solid #f1f5f9;
                border-radius: 4px;
                margin: 2px 0;
            }
            
            QListWidget::item:hover {
                background-color: #f1f5f9;
            }
            
            QListWidget::item:selected {
                background-color: #0ea5e9;
                color: white;
                border-bottom: 1px solid #0ea5e9;
            }
            
            /* Onglets */
            QTabWidget::pane {
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background-color: white;
                top: -1px;
            }
            
            QTabBar::tab {
                background-color: #f8fafc;
                color: #334155;
                padding: 10px 20px;
                margin-right: 2px;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                font-weight: 500;
                border: 1px solid #e2e8f0;
                border-bottom: none;
            }
            
            QTabBar::tab:selected {
                background-color: #0ea5e9;
                color: white;
                border: 1px solid #0ea5e9;
                border-bottom: none;
            }
            
            QTabBar::tab:hover:!selected {
                background-color: #e0f2fe;
            }
            
            /* Cases à cocher */
            QCheckBox::indicator {
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 2px solid #cbd5e1;
                background-color: white;
            }
            
            QCheckBox::indicator:checked {
                background-color: #0ea5e9;
                border-color: #0ea5e9;
            }
            
            /* Radio buttons */
            QRadioButton::indicator {
                width: 18px;
                height: 18px;
                border-radius: 10px;
                border: 2px solid #cbd5e1;
                background-color: white;
            }
            
            QRadioButton::indicator:checked {
                background-color: white;
                border: 5px solid #0ea5e9;
            }
            
            /* Barre de statut */
            QStatusBar {
                background-color: #f8fafc;
                border-top: 1px solid #e2e8f0;
                color: #334155;
                padding: 8px;
                font-weight: 500;
            }
            
            /* Barres de menus */
            QMenuBar {
                background-color: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                padding: 2px;
                font-weight: 500;
            }
            
            QMenuBar::item {
                background-color: transparent;
                color: #334155;
                padding: 8px 12px;
                margin: 2px;
                border-radius: 4px;
            }
            
            QMenuBar::item:selected {
                background-color: #0ea5e9;
                color: white;
            }
            
            QMenu {
                background-color: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 5px;
            }
            
            QMenu::item {
                padding: 8px 20px;
                color: #334155;
                border-radius: 4px;
                margin: 2px 5px;
            }
            
            QMenu::item:selected {
                background-color: #e0f2fe;
                color: #0ea5e9;
            }
            
            /* Splitters */
            QSplitter::handle {
                background-color: #e2e8f0;
            }
            
            QSplitter::handle:horizontal {
                width: 1px;
            }
            
            QSplitter::handle:vertical {
                height: 1px;
            }
            
            QSplitter::handle:hover {
                background-color: #0ea5e9;
            }
        """)

    def auto_load(self):
        default_path = Path("public/manifest.json").resolve()
        if default_path.exists():
            self.load_manifest(default_path)

    def open_manifest(self):
        path_str, _ = QFileDialog.getOpenFileName(self, "Ouvrir manifest.json", "", "JSON Files (*.json)")
        if path_str: self.load_manifest(Path(path_str))
            
    def load_manifest(self, path: Path):
        """Charge le fichier manifest.json et tous les chapitres associés.
        Gère les erreurs et fournit des informations détaillées sur les problèmes rencontrés."""
        self.manifest_path = path
        self.chapters_dir = path.parent / "chapters"  # Chercher dans le sous-dossier chapters
        self.update_status(f"Chargement de {path.name}...")
        
        # Vérifier l'existence du fichier
        if not path.exists():
            QMessageBox.critical(self, "Erreur", f"Le fichier {path} n'existe pas.")
            return
            
        # Vérifier l'existence du répertoire des chapitres
        if not self.chapters_dir.exists():
            reply = QMessageBox.question(
                self,
                "Dossier manquant",
                f"Le dossier 'chapters' n'existe pas. Voulez-vous le créer?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.Yes:
                self.chapters_dir.mkdir(parents=True, exist_ok=True)
            else:
                return
        
        # Charger le fichier manifest
        try:
            with open(path, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)
        except json.JSONDecodeError as e:
            # Afficher des informations détaillées sur l'erreur de syntaxe JSON
            line_info = f", ligne {e.lineno}, colonne {e.colno}" if hasattr(e, 'lineno') else ""
            error_message = f"Erreur de syntaxe JSON{line_info}: {e.msg}\n\n"
            error_message += f"Le fichier manifest {path} est corrompu ou mal formaté."
            
            # Offrir des options de récupération
            reply = QMessageBox.critical(
                self, 
                "Erreur de lecture du manifest", 
                error_message + "\n\nVoulez-vous tenter une récupération automatique?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            
            if reply == QMessageBox.StandardButton.Yes:
                if self._attempt_manifest_recovery(path):
                    return self.load_manifest(path)  # Réessayer après récupération
            return
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de lire le manifest: {e}")
            return
        
        # Réinitialisation
        self.all_chapters.clear()
        for cls in self.CLASSES: self.chapters_by_class[cls] = []

        # Statistiques pour un rapport détaillé
        loaded_count = 0
        skipped_count = 0
        error_count = 0
        error_details = []
        
        # Charger tous les chapitres
        for class_id, chapters_list in manifest_data.items():
            if class_id not in self.chapters_by_class:
                continue
                
            for chapter_info in chapters_list:
                try:
                    chapter = ChapterData()
                    chapter.load_from_manifest(chapter_info, class_id)
                    chapter_file = self.chapters_dir / chapter.file_name
                    
                    if not chapter_file.exists():
                        error_details.append(f"Fichier manquant: {chapter.file_name}")
                        error_count += 1
                        continue
                    
                    if chapter.load_from_file(chapter_file):
                        self.all_chapters[chapter.id] = chapter
                        self.chapters_by_class[class_id].append(chapter)
                        loaded_count += 1
                    else:
                        error_details.append(f"Erreur de chargement: {chapter.file_name}")
                        error_count += 1
                except Exception as e:
                    error_details.append(f"Erreur inattendue: {e}")
                    error_count += 1
        
        self.refresh_all_tabs()
        
        # Mettre à jour l'en-tête avec les informations du projet
        self.update_header_info()
        
        # Afficher un rapport détaillé
        status_message = f"{loaded_count} chapitres chargés avec succès."
        if error_count > 0:
            status_message += f" {error_count} chapitres n'ont pas pu être chargés."
            
            # Afficher un rapport détaillé des erreurs
            error_report = "\n".join(error_details[:10])  # Limiter à 10 erreurs pour éviter un message trop long
            if len(error_details) > 10:
                error_report += f"\n... et {len(error_details) - 10} autres erreurs."
                
            QMessageBox.warning(
                self,
                "Avertissement",
                f"Certains chapitres n'ont pas pu être chargés. Détails:\n\n{error_report}"
            )
            
        self.update_status(status_message)
        
    def _attempt_manifest_recovery(self, path: Path) -> bool:
        """Tente de récupérer un fichier manifest corrompu."""
        try:
            # Créer une sauvegarde du fichier corrompu
            backup_path = path.with_suffix('.corrupted.json')
            shutil.copy2(path, backup_path)
            
            # Lire le contenu actuel
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Tenter les corrections courantes
            content = re.sub(r',\s*}', '}', content)
            content = re.sub(r',\s*]', ']', content)
            content = re.sub(r"'([^']*)':", r'"\1":', content)
            
            # Tenter de parser le JSON corrigé
            try:
                data = json.loads(content)
                
                # Réécrire le fichier avec un format correct
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    
                QMessageBox.information(
                    self,
                    "Récupération réussie",
                    f"Le fichier manifest a été réparé. Une sauvegarde du fichier original a été créée: {backup_path}"
                )
                return True
                
            except json.JSONDecodeError:
                # Si la correction simple ne fonctionne pas, créer un nouveau manifest minimal
                reply = QMessageBox.question(
                    self,
                    "Récupération avancée",
                    "La réparation automatique a échoué. Voulez-vous créer un nouveau manifest vide?",
                    QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
                )
                
                if reply == QMessageBox.StandardButton.Yes:
                    # Créer un manifest minimal avec des listes vides pour chaque classe
                    minimal_manifest = {cls: [] for cls in self.CLASSES}
                    with open(path, 'w', encoding='utf-8') as f:
                        json.dump(minimal_manifest, f, indent=2, ensure_ascii=False)
                    return True
                    
            return False
                
        except Exception as e:
            QMessageBox.critical(self, "Erreur de récupération", f"Impossible de récupérer le fichier: {e}")
            return False

    def refresh_all_tabs(self):
        for class_id in self.CLASSES:
            self.refresh_class_tab(class_id)
            
    def refresh_class_tab(self, class_id: str):
        idx = self.CLASSES.index(class_id)
        table: QTableWidget = self.tabs.widget(idx).findChild(QTableWidget, f"table_{class_id}")
        if not table: return

        # Conserver l'ordre original du manifest (ne pas trier)
        chapters = self.chapters_by_class[class_id]
        table.setRowCount(0)
        table.setRowCount(len(chapters))

        for row, chapter in enumerate(chapters):
            # Colonne 0 : Icône de statut
            status_label = QLabel()
            if chapter.is_active:
                status_icon = self.style().standardIcon(QStyle.StandardPixmap.SP_DialogYesButton)
                status_label.setPixmap(status_icon.pixmap(16, 16))
                status_label.setToolTip("Chapitre actif")
            else:
                status_icon = self.style().standardIcon(QStyle.StandardPixmap.SP_DialogNoButton)
                status_label.setPixmap(status_icon.pixmap(16, 16))
                status_label.setToolTip("Chapitre inactif")
            
            status_widget = QWidget()
            status_layout = QHBoxLayout(status_widget)
            status_layout.addWidget(status_label)
            status_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
            status_layout.setContentsMargins(0, 0, 0, 0)
            table.setCellWidget(row, 0, status_widget)
            
            # Colonne 1 : Actif (Checkbox)
            check = QCheckBox()
            check.setChecked(chapter.is_active)
            check.toggled.connect(lambda state, ch=chapter: self.set_chapter_active(ch, state))
            cell_widget = QWidget()
            layout = QHBoxLayout(cell_widget)
            layout.addWidget(check)
            layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.setContentsMargins(0, 0, 0, 0)
            table.setCellWidget(row, 1, cell_widget)
            
            # Colonne 2 : Nom du chapitre
            name_item = QTableWidgetItem(chapter.chapter_name)
            name_item.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileIcon))
            table.setItem(row, 2, name_item)
            
            # Colonne 3 : Version avec badge
            version_widget = QWidget()
            version_layout = QHBoxLayout(version_widget)
            version_layout.setContentsMargins(4, 0, 4, 0)
            
            version_label = QLabel(chapter.version)
            version_label.setStyleSheet("""
                QLabel {
                    background-color: #e8f4f8;
                    color: #0078d4;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    font-weight: 600;
                }
            """)
            version_layout.addWidget(version_label)
            version_layout.addStretch()
            table.setCellWidget(row, 3, version_widget)
            
            # Colonne 4 : Quiz avec icône
            quiz_item = QTableWidgetItem(f"  {len(chapter.quiz_questions)}")
            quiz_item.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxQuestion))
            quiz_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            table.setItem(row, 4, quiz_item)
            
            # Colonne 5 : Exercices avec icône
            ex_item = QTableWidgetItem(f"  {len(chapter.exercises)}")
            ex_item.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogDetailedView))
            ex_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            table.setItem(row, 5, ex_item)

            # Colonne 6 : Actions avec boutons natifs
            actions_widget = QWidget()
            actions_layout = QHBoxLayout(actions_widget)
            actions_layout.setContentsMargins(4, 4, 4, 4)
            actions_layout.setSpacing(4)
            
            # Bouton Éditer
            edit_btn = QPushButton(" Éditer")
            edit_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_FileDialogContentsView))
            edit_btn.setFixedSize(70, 30)
            edit_btn.setCursor(Qt.CursorShape.PointingHandCursor)
            edit_btn.setStyleSheet("""
                QPushButton {
                    background-color: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    font-weight: 500;
                    font-size: 11px;
                }
                QPushButton:hover {
                    background-color: #106ebe;
                }
                QPushButton:pressed {
                    background-color: #005a9e;
                }
            """)
            edit_btn.clicked.connect(lambda _, ch=chapter: self.edit_chapter(ch))
            actions_layout.addWidget(edit_btn)
            
            # Bouton Supprimer
            del_btn = QPushButton(" Suppr.")
            del_btn.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_TrashIcon))
            del_btn.setFixedSize(70, 30)
            del_btn.setCursor(Qt.CursorShape.PointingHandCursor)
            del_btn.setStyleSheet("""
                QPushButton {
                    background-color: #d13438;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    font-weight: 500;
                    font-size: 11px;
                }
                QPushButton:hover {
                    background-color: #a72d2f;
                }
                QPushButton:pressed {
                    background-color: #8b2426;
                }
            """)
            del_btn.clicked.connect(lambda _, ch=chapter: self.delete_chapter(ch))
            actions_layout.addWidget(del_btn)
            
            actions_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
            table.setCellWidget(row, 6, actions_widget)
            
            # Hauteur de ligne
            table.setRowHeight(row, 50)
        
        # Mise à jour de l'en-tête
        self.update_header_info()

    def set_chapter_active(self, chapter: ChapterData, state: bool):
        """
        Active ou désactive un chapitre et met à jour le manifest immédiatement.
        """
        old_state = chapter.is_active
        chapter.is_active = state
        
        # Mettre à jour le manifest si l'état a changé
        if old_state != state:
            if self.update_manifest_entry(chapter):
                status = "activé" if state else "désactivé"
                self.update_status(f"✅ Chapitre '{chapter.chapter_name}' {status}")
                self.refresh_class_tab(chapter.class_type)
            else:
                # Revenir à l'ancien état en cas d'échec
                chapter.is_active = old_state
                QMessageBox.warning(
                    self,
                    "Erreur",
                    f"Impossible de mettre à jour le statut du chapitre dans le manifest."
                )

    def add_chapter_to_class(self, class_id: str):
        name, ok = QInputDialog.getText(self, "Nouveau Chapitre", "Nom du chapitre:")
        if ok and name:
            chapter_id = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            if chapter_id in self.all_chapters:
                QMessageBox.warning(self, "Erreur", "Un chapitre avec un ID similaire existe déjà."); return

            new_chapter = ChapterData()
            new_chapter.id = chapter_id
            new_chapter.chapter_name = name
            new_chapter.class_type = class_id
            new_chapter.is_active = True
            new_chapter.file_name = f"{class_id}_{chapter_id.replace('-', '_')}.json"
            if self.chapters_dir:
                # S'assurer que le dossier chapters existe
                self.chapters_dir.mkdir(parents=True, exist_ok=True)
                new_chapter.file_path = self.chapters_dir / new_chapter.file_name
                
            self.all_chapters[new_chapter.id] = new_chapter
            self.chapters_by_class[class_id].append(new_chapter)
            self.edit_chapter(new_chapter) # Ouvrir l'éditeur pour finaliser
            self.refresh_class_tab(class_id)

    def on_table_double_click(self, model_index):
        row = model_index.row()
        current_tab_index = self.tabs.currentIndex()
        class_id = self.CLASSES[current_tab_index]
        chapters = self.chapters_by_class[class_id]  # Utiliser l'ordre original
        if 0 <= row < len(chapters):
            self.edit_chapter(chapters[row])

    def edit_chapter(self, chapter: ChapterData):
        """Édite un chapitre et le sauvegarde immédiatement après modification."""
        # Enregistrer les informations d'avant édition
        original_version = chapter.version
        original_is_active = chapter.is_active
        
        # Créer et configurer l'éditeur
        editor = ChapterContentEditor(chapter, self)
        
        # Marquer les éditeurs comme non modifiés au départ
        if hasattr(editor, 'quiz_editor'):
            editor.quiz_editor.setProperty("modified", False)
        if hasattr(editor, 'exercise_editor'):
            editor.exercise_editor.setProperty("modified", False)
        
        # Exécuter l'éditeur
        if editor.exec() == QDialog.DialogCode.Accepted:
            # Vérifier si des modifications ont été apportées
            content_modified = (
                chapter.has_changed() or 
                editor.quiz_editor.property("modified") or 
                editor.exercise_editor.property("modified")
            )
            
            if content_modified or original_is_active != chapter.is_active:
                # Sauvegarder uniquement ce chapitre spécifique
                print(f"Sauvegarde du chapitre modifié: {chapter.chapter_name}")
                
                # Force la sauvegarde immédiate du fichier
                if chapter.save_to_file():
                    # ✅ CORRECTION CRITIQUE : Mise à jour du manifest APRÈS sauvegarde
                    success = self.update_manifest_entry(chapter)
                    
                    if success:
                        self.update_status(f"✅ Chapitre '{chapter.chapter_name}' sauvegardé (version: {chapter.version})")
                    else:
                        QMessageBox.warning(
                            self, 
                            "Attention", 
                            f"Le chapitre a été sauvegardé mais le manifest n'a pas pu être mis à jour.\nVeuillez sauvegarder manuellement (Ctrl+S)."
                        )
                else:
                    QMessageBox.warning(
                        self, 
                        "Problème de sauvegarde", 
                        f"Impossible de sauvegarder le chapitre '{chapter.chapter_name}'."
                    )
            else:
                self.update_status(f"ℹ️ Aucune modification dans '{chapter.chapter_name}'")
            
            # Rafraîchir l'interface
            self.refresh_class_tab(chapter.class_type)
    
    def update_manifest_entry(self, chapter: ChapterData) -> bool:
        """
        Met à jour l'entrée d'un chapitre dans le manifest.json.
        Retourne True si la mise à jour a réussi, False sinon.
        """
        if not self.manifest_path or not self.manifest_path.exists():
            print("⚠️ Aucun fichier manifest chargé")
            return False
        
        try:
            # Charger le manifest actuel
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)
            
            # Trouver et mettre à jour l'entrée du chapitre
            updated = False
            for class_id, chapters_list in manifest_data.items():
                for ch_data in chapters_list:
                    if ch_data.get('id') == chapter.id:
                        # Mettre à jour toutes les informations
                        ch_data['version'] = chapter.version
                        ch_data['isActive'] = chapter.is_active
                        ch_data['file'] = chapter.file_name
                        updated = True
                        print(f"✅ Manifest mis à jour pour '{chapter.id}' -> version: {chapter.version}, actif: {chapter.is_active}")
                        break
                if updated:
                    break
            
            if not updated:
                print(f"⚠️ Chapitre '{chapter.id}' non trouvé dans le manifest")
                return False
            
            # Sauvegarder le manifest avec fichier temporaire pour sécurité
            temp_manifest = self.manifest_path.with_suffix('.tmp.json')
            
            with open(temp_manifest, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2, ensure_ascii=False)
            
            # Valider le JSON
            with open(temp_manifest, 'r', encoding='utf-8') as f:
                json.load(f)  # Lève une exception si invalide
            
            # Remplacer l'ancien manifest
            if self.manifest_path.exists():
                self.manifest_path.unlink()
            temp_manifest.rename(self.manifest_path)
            
            print(f"✅ Fichier manifest.json mis à jour avec succès")
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ Erreur JSON lors de la mise à jour du manifest: {e}")
            return False
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du manifest: {e}")
            return False

    def delete_chapter(self, chapter: ChapterData):
        if QMessageBox.question(self, "Confirmer", f"Supprimer '{chapter.chapter_name}' et son fichier ?\nL'action est irréversible.") == QMessageBox.StandardButton.Yes:
            if chapter.file_path and chapter.file_path.exists():
                try: chapter.file_path.unlink()
                except Exception as e: QMessageBox.critical(self, "Erreur", f"Impossible de supprimer le fichier: {e}")
            
            self.chapters_by_class[chapter.class_type].remove(chapter)
            del self.all_chapters[chapter.id]
            self.refresh_class_tab(chapter.class_type)
            self.update_status(f"'{chapter.chapter_name}' supprimé.")

    def save_all(self, specific_chapter_id=None):
        """Sauvegarde intelligente des chapitres et du manifest.
        Si specific_chapter_id est fourni, seul ce chapitre sera sauvegardé."""
        if not self.manifest_path:
            QMessageBox.warning(self, "Erreur", "Aucun fichier manifest n'est chargé."); return False

        # Déterminer les chapitres à sauvegarder
        chapters_to_save = []
        
        if specific_chapter_id:
            # Mode sauvegarde spécifique
            if specific_chapter_id in self.all_chapters:
                chapter = self.all_chapters[specific_chapter_id]
                chapters_to_save = [chapter]
                print(f"Mode sauvegarde spécifique pour '{chapter.chapter_name}' (ID: {specific_chapter_id})")
                self.update_status(f"Sauvegarde du chapitre '{chapter.chapter_name}'...")
            else:
                QMessageBox.warning(self, "Erreur", f"Chapitre {specific_chapter_id} non trouvé."); return False
        else:
            # Mode sauvegarde de tous les chapitres
            print(f"Mode sauvegarde globale - Vérification des {len(self.all_chapters)} chapitres")
            
            # Filtrer pour ne sauvegarder que les chapitres modifiés
            for chapter_id, chapter in self.all_chapters.items():
                try:
                    if chapter.has_changed():
                        chapters_to_save.append(chapter)
                        print(f"Chapitre modifié détecté: {chapter.chapter_name} (ID: {chapter_id})")
                except Exception as e:
                    print(f"Erreur lors de la vérification des modifications pour {chapter_id}: {e}")
                    # Par sécurité, inclure le chapitre en cas d'erreur
                    chapters_to_save.append(chapter)
            
            if chapters_to_save:
                self.update_status(f"Sauvegarde de {len(chapters_to_save)}/{len(self.all_chapters)} chapitre(s) modifié(s)...")
            else:
                self.update_status("Aucun chapitre modifié - Aucune sauvegarde nécessaire")
                return True
                
        # Ne plus créer de sauvegarde du manifest
        
        progress = QProgressDialog("Sauvegarde des chapitres...", "Annuler", 0, len(chapters_to_save), self)
        progress.setWindowModality(Qt.WindowModality.WindowModal)

        # 1. Sauvegarder chaque fichier de chapitre
        failed_chapters = []
        
        for i, chapter in enumerate(chapters_to_save):
            progress.setValue(i)
            if progress.wasCanceled(): break
            
            # Afficher le chapitre en cours
            progress.setLabelText(f"Sauvegarde de {chapter.chapter_name}...")
            
            try:
                if not chapter.save_to_file():
                    failed_chapters.append(chapter.chapter_name)
            except Exception as e:
                QMessageBox.critical(
                    self, 
                    "Erreur",
                    f"Échec de la sauvegarde de {chapter.file_name}: {str(e)}"
                )
                failed_chapters.append(chapter.chapter_name)
                
        progress.setValue(len(chapters_to_save))
        
        if failed_chapters:
            QMessageBox.critical(
                self, 
                "Erreur de sauvegarde", 
                f"Échec de la sauvegarde pour {len(failed_chapters)} chapitre(s):\n\n" + 
                "\n".join(f"- {name}" for name in failed_chapters)
            )
            return False

        # 2. Construire et sauvegarder le nouveau manifest
        manifest_data = {cid: [ch.to_manifest_dict() for ch in clist] for cid, clist in self.chapters_by_class.items()}
        try:
            # Écriture sécurisée avec fichier temporaire
            temp_path = self.manifest_path.with_suffix('.tmp.json')
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2, ensure_ascii=False)
            
            # Vérifier que le JSON est valide
            try:
                with open(temp_path, 'r', encoding='utf-8') as f:
                    json.load(f)
                print("Validation du manifest réussie")
            except json.JSONDecodeError:
                temp_path.unlink(missing_ok=True)
                QMessageBox.critical(
                    self, 
                    "Erreur", 
                    "Le manifest généré est corrompu. Aucun changement n'a été effectué."
                )
                return False
                
            # Remplacer le fichier original
            if self.manifest_path.exists():
                self.manifest_path.unlink()
            temp_path.rename(self.manifest_path)
            
            # Message de succès
            if specific_chapter_id:
                self.update_status(f"✅ Chapitre '{self.all_chapters[specific_chapter_id].chapter_name}' sauvegardé avec succès.")
            else:
                self.update_status(f"✅ {len(chapters_to_save)} chapitres sauvegardés avec succès.")
            
            self.refresh_all_tabs()
            return True
            
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder le manifest: {e}")
            return False

    # --- Outils ---
    def check_integrity(self):
        if not self.chapters_dir: return
        missing = [ch.file_name for ch in self.all_chapters.values() if not (self.chapters_dir / ch.file_name).exists()]
        if not missing: QMessageBox.information(self, "Intégrité", "✅ Tous les fichiers des chapitres sont présents.")
        else: QMessageBox.warning(self, "Intégrité", "Fichiers manquants:\n\n" + "\n".join(missing))

    def detect_content_changes(self):
        changed = []
        for chapter in self.all_chapters.values():
            data_to_hash = {
                'class': chapter.class_type, 'chapter': chapter.chapter_name,
                'sessionDates': sorted(chapter.session_dates),
                'quiz': [q.to_dict() for q in chapter.quiz_questions],
                'exercises': [e.to_dict() for e in chapter.exercises]
            }
            recalculated_version = chapter._calculate_content_version(data_to_hash)
            if chapter.version != recalculated_version:
                changed.append(f"'{chapter.chapter_name}' (Version: {chapter.version} -> {recalculated_version})")
        
        if not changed:
            QMessageBox.information(self, "Détection", "✅ Toutes les versions sont à jour.")
        else:
            QMessageBox.information(self, "Changements détectés", "Les chapitres suivants ont été modifiés:\n\n" + "\n".join(changed))

    def recalculate_all_versions(self):
        if QMessageBox.question(self, "Confirmation", "Recalculer et sauvegarder TOUTES les versions ?") == QMessageBox.StandardButton.Yes:
            self.save_all()

    def update_status(self, message: str):
        self.status_bar.showMessage(message, 5000)

    def has_unsaved_changes(self) -> bool:
        """Vérifie s'il y a des modifications non sauvegardées dans les chapitres."""
        for chapter in self.all_chapters.values():
            if chapter.has_changed():
                return True
        return False

    def closeEvent(self, event):
        """Gère la fermeture de l'application avec une vérification intelligente des modifications."""
        # Ne demander de sauvegarder que s'il y a des modifications non sauvegardées
        if self.has_unsaved_changes():
            # Récupérer la liste des chapitres modifiés
            modified_chapters = [ch.chapter_name for ch in self.all_chapters.values() if ch.has_changed()]
            modified_names = ", ".join(modified_chapters[:3])
            
            if len(modified_chapters) > 3:
                modified_names += f" et {len(modified_chapters) - 3} autres"
            
            reply = QMessageBox.question(
                self, 
                "Modifications non sauvegardées", 
                f"Des modifications ont été apportées à {len(modified_chapters)} chapitre(s) ({modified_names}).\n\n"
                "Souhaitez-vous sauvegarder avant de quitter ?",
                QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel
            )
            
            if reply == QMessageBox.StandardButton.Save:
                if self.save_all():
                    event.accept()
                else:
                    # En cas d'échec de sauvegarde, demander confirmation
                    confirm = QMessageBox.question(
                        self, 
                        "Problème de sauvegarde", 
                        "Des erreurs sont survenues lors de la sauvegarde. Voulez-vous quitter quand même ?",
                        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
                    )
                    if confirm == QMessageBox.StandardButton.Yes:
                        event.accept()
                    else:
                        event.ignore()
            elif reply == QMessageBox.StandardButton.Discard:
                event.accept()
            else:
                event.ignore()
        else:
            # Pas de modifications, fermer directement
            event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SmartChapterManager()
    window.show()
    sys.exit(app.exec())