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
    QTabWidget, QTableWidget, QListWidget, QTextEdit, QLineEdit, QRadioButton,
    QPushButton, QLabel, QCheckBox, QDialog, QFormLayout, QDialogButtonBox,
    QMessageBox, QInputDialog, QFileDialog, QHeaderView, QAbstractItemView,
    QDateTimeEdit, QTableWidgetItem, QProgressDialog
)
from PyQt6.QtCore import Qt, QDateTime
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
    options: List[QuizOption] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'QuizQuestion':
        """Charge une question à partir d'un dictionnaire (format JSON)."""
        options = []
        main_explanation = ""
        for opt_data in data.get('options', []):
            is_correct = opt_data.get('isCorrect', False)
            option = QuizOption(text=opt_data.get('text', ''), is_correct=is_correct)
            if is_correct:
                main_explanation = opt_data.get('explanation', '')
            options.append(option)
        
        # Attribue l'explication à la bonne option pour l'éditeur
        for opt in options:
            if opt.is_correct:
                opt.explanation = main_explanation
                break
                
        return cls(id=data.get('id', ''), question=data.get('question', ''), options=options)

    def to_dict(self) -> Dict[str, Any]:
        """Convertit la question en dictionnaire pour la sauvegarde JSON."""
        return {
            'id': self.id or f"q_{hashlib.md5(self.question.encode()).hexdigest()[:8]}",
            'question': self.question,
            'options': [opt.to_dict() for opt in self.options]
        }

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
        """Charge le contenu complet du chapitre depuis son fichier JSON."""
        self.file_path = file_path
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.chapter_name = data.get('chapter', self.id.replace('-', ' ').title())
            self.class_type = data.get('class', self.class_type)
            self.session_dates = sorted(data.get('sessionDates', []))
            self.quiz_questions = [QuizQuestion.from_dict(q) for q in data.get('quiz', [])]
            self.exercises = [Exercise.from_dict(e) for e in data.get('exercises', [])]
            # Utiliser la version du fichier si elle existe, sinon garder celle du manifest
            file_version = data.get('version', '')
            if file_version:
                self.version = file_version
            return True
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Erreur de chargement pour {file_path}: {e}")
            return False

    def save_to_file(self) -> bool:
        """Sauvegarde le contenu du chapitre dans son fichier JSON, en calculant et en inscrivant sa nouvelle version."""
        if not self.file_path: return False

        data_to_save = {
            'class': self.class_type,
            'chapter': self.chapter_name,
            'sessionDates': sorted(self.session_dates),
            'quiz': [q.to_dict() for q in self.quiz_questions],
            'exercises': [e.to_dict() for e in self.exercises]
        }
        
        self.version = self._calculate_content_version(data_to_save)
        data_to_save['version'] = self.version
        
        try:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Erreur de sauvegarde pour {self.file_path}: {e}")
            return False

    def _calculate_content_version(self, data_to_hash: Dict[str, Any]) -> str:
        """Calcule un hash MD5 unique basé sur une sérialisation canonique du contenu."""
        content_string = json.dumps(data_to_hash, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
        return f"v1.1.0-{hashlib.md5(content_string.encode('utf-8')).hexdigest()[:6]}"

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
        # Interface simplifiée pour l'éditeur de quiz
        layout = QVBoxLayout(self)
        toolbar = QHBoxLayout()
        toolbar.addWidget(QLabel("Questions de Quiz"))
        toolbar.addStretch()
        self.count_label = QLabel("0 question(s)")
        toolbar.addWidget(self.count_label)
        
        add_btn = QPushButton("Nouvelle question")
        add_btn.setObjectName("modernButton")
        add_btn.clicked.connect(self.add_question)
        toolbar.addWidget(add_btn)
        
        delete_btn = QPushButton("Supprimer")
        delete_btn.setObjectName("dangerButton")
        delete_btn.clicked.connect(self.delete_current)
        toolbar.addWidget(delete_btn)
        layout.addLayout(toolbar)
        
        splitter = QSplitter(Qt.Orientation.Horizontal)
        self.question_list = QListWidget()
        self.question_list.setMaximumWidth(300)
        self.question_list.currentRowChanged.connect(self.on_selection_changed)
        splitter.addWidget(self.question_list)
        
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        
        question_label = QLabel("Question :")
        question_label.setObjectName("sectionLabel")
        editor_layout.addWidget(question_label)
        self.question_edit = QTextEdit()
        self.question_edit.setMaximumHeight(100)
        self.question_edit.textChanged.connect(self.save_current)
        editor_layout.addWidget(self.question_edit)
        
        options_label = QLabel("Options de réponse :")
        options_label.setObjectName("sectionLabel")
        editor_layout.addWidget(options_label)
        help_label = QLabel("Cochez la case pour marquer la bonne réponse")
        help_label.setObjectName("helpLabel")
        editor_layout.addWidget(help_label)
        
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
        editor_layout.addWidget(self.options_container)
        
        explanation_label = QLabel("Explication de la bonne réponse :")
        explanation_label.setObjectName("sectionLabel")
        editor_layout.addWidget(explanation_label)
        self.explanation_edit = QTextEdit()
        self.explanation_edit.setMaximumHeight(80)
        self.explanation_edit.textChanged.connect(self.save_current)
        editor_layout.addWidget(self.explanation_edit)
        
        editor_layout.addStretch()
        splitter.addWidget(editor_widget)
        splitter.setSizes([300, 700])
        layout.addWidget(splitter)
        self.editor_widget = editor_widget
        self.editor_widget.setEnabled(False)

    def set_questions(self, questions: List[QuizQuestion]):
        self.questions = [QuizQuestion.from_dict(q.to_dict()) for q in questions] # Deep copy
        self.refresh_list()
        if self.questions: self.question_list.setCurrentRow(0)

    def get_questions(self) -> List[QuizQuestion]:
        return self.questions

    def refresh_list(self):
        self.question_list.clear()
        for i, q in enumerate(self.questions):
            text = q.question.strip().split('\n')[0] or f"Question {i+1} (vide)"
            self.question_list.addItem(text[:60] + "..." if len(text) > 60 else text)
        self.count_label.setText(f"{len(self.questions)} question(s)")

    def on_selection_changed(self, index: int):
        self.current_index = index
        if 0 <= index < len(self.questions):
            self.load_question(self.questions[index])
            self.editor_widget.setEnabled(True)
        else:
            self.clear_editor()
            self.editor_widget.setEnabled(False)

    def load_question(self, question: QuizQuestion):
        """Charge une question dans l'éditeur."""
        self.block_all_signals(True)
        self.question_edit.setText(question.question)
        
        correct_index = -1
        explanation = ""
        for i, opt in enumerate(question.options):
            if opt.is_correct:
                correct_index = i
                explanation = opt.explanation or ""

        self.explanation_edit.setText(explanation)

        for i, (radio, edit) in enumerate(self.option_widgets):
            if i < len(question.options):
                edit.setText(question.options[i].text)
                radio.setChecked(i == correct_index)
            else:
                edit.clear()
                radio.setChecked(False)
        self.block_all_signals(False)
    
    def save_current(self):
        """Sauvegarde la question actuellement éditée."""
        if not (0 <= self.current_index < len(self.questions)): return
        
        q = self.questions[self.current_index]
        q.question = self.question_edit.toPlainText()
        
        explanation = self.explanation_edit.toPlainText()
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

        q.options = new_options
        
        # Mettre à jour le titre dans la liste
        item = self.question_list.item(self.current_index)
        if item:
            text = q.question.strip().split('\n')[0] or f"Question {self.current_index + 1} (vide)"
            item.setText(text[:60] + "..." if len(text) > 60 else text)

    def add_question(self):
        new_q = QuizQuestion(
            question="Nouvelle question",
            options=[
                QuizOption("Option 1", True, "Ceci est la bonne réponse."),
                QuizOption("Option 2", False),
            ]
        )
        self.questions.append(new_q)
        self.refresh_list()
        self.question_list.setCurrentRow(len(self.questions) - 1)

    def delete_current(self):
        if 0 <= self.current_index < len(self.questions):
            if QMessageBox.question(self, "Confirmer", "Supprimer cette question ?") == QMessageBox.StandardButton.Yes:
                del self.questions[self.current_index]
                self.refresh_list()
    
    def clear_editor(self):
        self.block_all_signals(True)
        self.question_edit.clear()
        self.explanation_edit.clear()
        for radio, edit in self.option_widgets:
            radio.setChecked(False)
            edit.clear()
        self.block_all_signals(False)

    def block_all_signals(self, block: bool):
        self.question_edit.blockSignals(block)
        self.explanation_edit.blockSignals(block)
        for radio, edit in self.option_widgets:
            radio.blockSignals(block)
            edit.blockSignals(block)

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
        
        add_btn = QPushButton("Nouveau")
        add_btn.setObjectName("modernButton")
        add_btn.clicked.connect(self.add_exercise)
        toolbar.addWidget(add_btn)
        
        duplicate_btn = QPushButton("Dupliquer")
        duplicate_btn.setObjectName("smallButton")
        duplicate_btn.clicked.connect(self.duplicate_current)
        toolbar.addWidget(duplicate_btn)
        
        delete_btn = QPushButton("Supprimer")
        delete_btn.setObjectName("dangerButton")
        delete_btn.clicked.connect(self.delete_current)
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
        
        # Titre avec compteur de caractères
        title_section = QVBoxLayout()
        title_label = QLabel("Titre de l'exercice :")
        title_label.setObjectName("sectionLabel")
        title_section.addWidget(title_label)
        
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
            self.exercise_list.addItem(text)
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
            item.setText(title)

    def add_exercise(self):
        new_ex = Exercise(
            title=f"Nouvel Exercice {len(self.exercises) + 1}",
            statement="Énoncé de l'exercice..."
        )
        self.exercises.append(new_ex)
        self.refresh_list()
        self.exercise_list.setCurrentRow(len(self.exercises) - 1)

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
                self.editor_widget.setEnabled(len(self.exercises) > 0)

class ChapterContentEditor(QDialog):
    """Éditeur complet du contenu d'un chapitre."""
    def __init__(self, chapter: ChapterData, parent=None):
        super().__init__(parent)
        self.chapter = chapter
        self.setWindowTitle(f"Édition: {chapter.chapter_name}")
        self.setModal(True)
        self.resize(1100, 800)
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
        
        # Boutons simplifiés
        buttons = QDialogButtonBox()
        save_btn = QPushButton("Sauvegarder")
        save_btn.setObjectName("modernButton")
        cancel_btn = QPushButton("Annuler")
        cancel_btn.setObjectName("dangerButton")
        
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
        
        layout.addWidget(QLabel("\nDates de séance:"))
        self.dates_list = QListWidget()
        self.dates_list.addItems(self.chapter.session_dates)
        layout.addWidget(self.dates_list)
        
        date_controls = QHBoxLayout()
        self.date_edit = QDateTimeEdit(QDateTime.currentDateTime())
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDisplayFormat("yyyy-MM-ddTHH:mm:ssZ")
        date_controls.addWidget(self.date_edit)
        
        add_date_btn = QPushButton("Ajouter")
        add_date_btn.setObjectName("modernButton")
        add_date_btn.clicked.connect(self.add_date)
        date_controls.addWidget(add_date_btn)
        
        remove_date_btn = QPushButton("Supprimer")
        remove_date_btn.setObjectName("dangerButton")
        remove_date_btn.clicked.connect(self.remove_date)
        date_controls.addWidget(remove_date_btn)
        
        layout.addLayout(date_controls)
        layout.addStretch()
        return widget

    def load_chapter_data(self):
        self.quiz_editor.set_questions(self.chapter.quiz_questions)
        self.exercise_editor.set_exercises(self.chapter.exercises)

    def add_date(self):
        date_str = self.date_edit.dateTime().toString("yyyy-MM-ddTHH:mm:ssZ")
        if not self.dates_list.findItems(date_str, Qt.MatchFlag.MatchExactly):
            self.dates_list.addItem(date_str)
            self.dates_list.sortItems()

    def remove_date(self):
        for item in self.dates_list.selectedItems():
            self.dates_list.takeItem(self.dates_list.row(item))
            
    def save_and_close(self):
        # Récupérer les données depuis les éditeurs
        self.chapter.chapter_name = self.name_edit.text().strip()
        self.chapter.session_dates = [self.dates_list.item(i).text() for i in range(self.dates_list.count())]
        self.chapter.quiz_questions = self.quiz_editor.get_questions()
        self.chapter.exercises = self.exercise_editor.get_exercises()
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
        self.setWindowTitle("📚 Gestionnaire de Contenus Pédagogiques v2.0")
        self.setMinimumSize(1200, 800)
        self.create_menus()
        
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        
        self.tabs = QTabWidget()
        for class_id in self.CLASSES:
            self.tabs.addTab(self.create_class_tab(class_id), self.CLASS_LABELS[class_id])
        layout.addWidget(self.tabs)
        
        self.status_bar = self.statusBar()
        self.update_status("Prêt. Ouvrez un fichier manifest.json pour commencer.")
        self.apply_style()

    def create_menus(self):
        menubar = self.menuBar()
        # Menu Fichier
        file_menu = menubar.addMenu("&Fichier")
        
        open_action = QAction("Ouvrir manifest...", self)
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_manifest)
        file_menu.addAction(open_action)
        
        save_action = QAction("Sauvegarder Tout", self)
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.save_all)
        file_menu.addAction(save_action)
        
        file_menu.addSeparator()
        
        quit_action = QAction("Quitter", self)
        quit_action.triggered.connect(self.close)
        file_menu.addAction(quit_action)
        
        # Menu Outils
        tools_menu = menubar.addMenu("&Outils")
        
        integrity_action = QAction("Vérifier l'intégrité...", self)
        integrity_action.triggered.connect(self.check_integrity)
        tools_menu.addAction(integrity_action)
        
        changes_action = QAction("Détecter les changements...", self)
        changes_action.triggered.connect(self.detect_content_changes)
        tools_menu.addAction(changes_action)
        
        recalc_action = QAction("Recalculer et sauvegarder toutes les versions...", self)
        recalc_action.triggered.connect(self.recalculate_all_versions)
        tools_menu.addAction(recalc_action)

    def create_class_tab(self, class_id: str) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        toolbar = QHBoxLayout()
        
        # Titre simplifié
        title_label = QLabel(f"Chapitres - {self.CLASS_LABELS[class_id]}")
        title_label.setObjectName("sectionLabel")
        toolbar.addWidget(title_label)
        toolbar.addStretch()
        
        # Bouton pour ajouter un chapitre
        add_btn = QPushButton("Nouveau chapitre")
        add_btn.setObjectName("modernButton")
        add_btn.clicked.connect(lambda: self.add_chapter_to_class(class_id))
        toolbar.addWidget(add_btn)
        layout.addLayout(toolbar)
        
        # Table avec en-têtes simples
        table = QTableWidget()
        table.setObjectName(f"table_{class_id}")
        table.setColumnCount(6)
        table.setHorizontalHeaderLabels(["Actif", "Chapitre", "Version", "Quiz", "Exercices", "Actions"])
        header = table.horizontalHeader()
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        table.setAlternatingRowColors(True)
        table.doubleClicked.connect(self.on_table_double_click)
        layout.addWidget(table)
        return widget
    
    def apply_style(self):
        self.setStyleSheet("""
            /* Style professionnel et épuré */
            QMainWindow { 
                background-color: #ffffff; 
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 13px;
            }
            
            /* Tables */
            QTableWidget { 
                border: 1px solid #d1d5db;
                gridline-color: #f3f4f6;
                background-color: white;
                alternate-background-color: #f9fafb;
                selection-background-color: #dbeafe;
            }
            
            QHeaderView::section { 
                background-color: #f3f4f6;
                color: #374151;
                padding: 12px;
                border: 1px solid #d1d5db;
                font-weight: 600;
                font-size: 12px;
            }
            
            /* Boutons principaux */
            QPushButton[objectName="modernButton"] {
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: 500;
                min-width: 100px;
            }
            
            QPushButton[objectName="modernButton"]:hover {
                background-color: #2563eb;
            }
            
            QPushButton[objectName="modernButton"]:pressed {
                background-color: #1d4ed8;
            }
            
            /* Boutons de suppression */
            QPushButton[objectName="dangerButton"] {
                background-color: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            QPushButton[objectName="dangerButton"]:hover {
                background-color: #dc2626;
            }
            
            /* Petits boutons */
            QPushButton[objectName="smallButton"] {
                background-color: #10b981;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                font-weight: 500;
                font-size: 12px;
            }
            
            QPushButton[objectName="smallButton"]:hover {
                background-color: #059669;
            }
            
            QPushButton[objectName="removeButton"] {
                background-color: #ef4444;
                color: white;
                border: none;
                border-radius: 3px;
                font-weight: bold;
                font-size: 12px;
                width: 22px;
                height: 22px;
            }
            
            QPushButton[objectName="removeButton"]:hover {
                background-color: #dc2626;
            }
            
            /* Boutons par défaut */
            QPushButton {
                background-color: #6b7280;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            QPushButton:hover {
                background-color: #4b5563;
            }
            
            /* Labels */
            QLabel[objectName="sectionLabel"] {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin-top: 15px;
                margin-bottom: 8px;
            }
            
            QLabel[objectName="helpLabel"] {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 10px;
            }
            
            QLabel[objectName="charCount"] {
                font-size: 11px;
                color: #9ca3af;
                margin-bottom: 5px;
            }
            
            /* Champs de saisie */
            QLineEdit, QTextEdit {
                border: 1px solid #d1d5db;
                border-radius: 4px;
                padding: 8px;
                background-color: white;
            }
            
            QLineEdit:focus, QTextEdit:focus {
                border-color: #3b82f6;
                outline: none;
            }
            
            /* Listes */
            QListWidget {
                border: 1px solid #d1d5db;
                background-color: white;
                selection-background-color: #3b82f6;
                selection-color: white;
                outline: none;
            }
            
            QListWidget::item {
                padding: 10px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            QListWidget::item:hover {
                background-color: #f3f4f6;
            }
            
            QListWidget::item:selected {
                background-color: #3b82f6;
                color: white;
            }
            
            /* Onglets */
            QTabWidget::pane {
                border: 1px solid #d1d5db;
                background-color: white;
            }
            
            QTabBar::tab {
                background-color: #f9fafb;
                color: #374151;
                padding: 12px 20px;
                margin-right: 1px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                font-weight: 500;
            }
            
            QTabBar::tab:selected {
                background-color: #3b82f6;
                color: white;
            }
            
            QTabBar::tab:hover:!selected {
                background-color: #f3f4f6;
            }
            
            /* Cases à cocher */
            QCheckBox::indicator {
                width: 16px;
                height: 16px;
                border-radius: 2px;
                border: 1px solid #d1d5db;
                background-color: white;
            }
            
            QCheckBox::indicator:checked {
                background-color: #3b82f6;
                border-color: #3b82f6;
            }
            
            /* Radio buttons */
            QRadioButton::indicator {
                width: 16px;
                height: 16px;
                border-radius: 8px;
                border: 1px solid #d1d5db;
                background-color: white;
            }
            
            QRadioButton::indicator:checked {
                background-color: #3b82f6;
                border-color: #3b82f6;
            }
            
            /* Barre de statut */
            QStatusBar {
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                color: #374151;
                padding: 8px;
            }
            
            /* Barres de menus */
            QMenuBar {
                background-color: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                padding: 2px;
            }
            
            QMenuBar::item {
                background-color: transparent;
                color: #374151;
                padding: 8px 12px;
                margin: 2px;
                border-radius: 4px;
            }
            
            QMenuBar::item:selected {
                background-color: #3b82f6;
                color: white;
            }
            
            QMenu {
                background-color: white;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                padding: 4px 0;
            }
            
            QMenu::item {
                padding: 8px 16px;
                color: #374151;
            }
            
            QMenu::item:selected {
                background-color: #3b82f6;
                color: white;
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
        self.manifest_path = path
        self.chapters_dir = path.parent / "chapters"  # Chercher dans le sous-dossier chapters
        self.update_status(f"Chargement de {path.name}...")
        
        try:
            with open(path, 'r', encoding='utf-8') as f: manifest_data = json.load(f)
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de lire le manifest: {e}"); return
        
        # Réinitialisation
        self.all_chapters.clear()
        for cls in self.CLASSES: self.chapters_by_class[cls] = []

        count = 0
        for class_id, chapters_list in manifest_data.items():
            if class_id not in self.chapters_by_class: continue
            for chapter_info in chapters_list:
                chapter = ChapterData()
                chapter.load_from_manifest(chapter_info, class_id)
                if chapter.load_from_file(self.chapters_dir / chapter.file_name):
                    self.all_chapters[chapter.id] = chapter
                    self.chapters_by_class[class_id].append(chapter)
                    count += 1
        
        self.refresh_all_tabs()
        self.update_status(f"{count} chapitres chargés avec succès.")

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
            # Colonne Actif (Checkbox)
            check = QCheckBox()
            check.setChecked(chapter.is_active)
            check.toggled.connect(lambda state, ch=chapter: self.set_chapter_active(ch, state))
            cell_widget = QWidget()
            layout = QHBoxLayout(cell_widget)
            layout.addWidget(check)
            layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.setContentsMargins(0,0,0,0)
            table.setCellWidget(row, 0, cell_widget)
            
            table.setItem(row, 1, QTableWidgetItem(chapter.chapter_name))
            table.setItem(row, 2, QTableWidgetItem(chapter.version))
            table.setItem(row, 3, QTableWidgetItem(str(len(chapter.quiz_questions))))
            table.setItem(row, 4, QTableWidgetItem(str(len(chapter.exercises))))

            # Colonne Actions avec boutons simples
            edit_btn = QPushButton("Éditer")
            edit_btn.setObjectName("modernButton")
            edit_btn.clicked.connect(lambda _, ch=chapter: self.edit_chapter(ch))
            
            del_btn = QPushButton("Supprimer")
            del_btn.setObjectName("dangerButton")
            del_btn.clicked.connect(lambda _, ch=chapter: self.delete_chapter(ch))
            
            actions_widget = QWidget()
            actions_layout = QHBoxLayout(actions_widget)
            actions_layout.addWidget(edit_btn)
            actions_layout.addWidget(del_btn)
            actions_layout.setContentsMargins(4, 2, 4, 2)
            actions_layout.setSpacing(5)
            table.setCellWidget(row, 5, actions_widget)
            
        table.resizeColumnsToContents()
        table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)

    def set_chapter_active(self, chapter: ChapterData, state: bool):
        chapter.is_active = state

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
        editor = ChapterContentEditor(chapter, self)
        if editor.exec() == QDialog.DialogCode.Accepted:
            self.update_status(f"'{chapter.chapter_name}' modifié.")
            self.refresh_class_tab(chapter.class_type)

    def delete_chapter(self, chapter: ChapterData):
        if QMessageBox.question(self, "Confirmer", f"Supprimer '{chapter.chapter_name}' et son fichier ?\nL'action est irréversible.") == QMessageBox.StandardButton.Yes:
            if chapter.file_path and chapter.file_path.exists():
                try: chapter.file_path.unlink()
                except Exception as e: QMessageBox.critical(self, "Erreur", f"Impossible de supprimer le fichier: {e}")
            
            self.chapters_by_class[chapter.class_type].remove(chapter)
            del self.all_chapters[chapter.id]
            self.refresh_class_tab(chapter.class_type)
            self.update_status(f"'{chapter.chapter_name}' supprimé.")

    def save_all(self):
        if not self.manifest_path:
            QMessageBox.warning(self, "Erreur", "Aucun fichier manifest n'est chargé."); return

        self.update_status("Sauvegarde en cours...")
        progress = QProgressDialog("Sauvegarde des chapitres...", "Annuler", 0, len(self.all_chapters), self)
        progress.setWindowModality(Qt.WindowModality.WindowModal)

        # 1. Sauvegarder chaque fichier de chapitre (ce qui met à jour sa version interne)
        for i, chapter in enumerate(self.all_chapters.values()):
            progress.setValue(i)
            if progress.wasCanceled(): break
            if not chapter.save_to_file():
                QMessageBox.critical(self, "Erreur", f"Échec de la sauvegarde de {chapter.file_name}"); return
        progress.setValue(len(self.all_chapters))

        # 2. Construire et sauvegarder le nouveau manifest
        manifest_data = {cid: [ch.to_manifest_dict() for ch in clist] for cid, clist in self.chapters_by_class.items()}
        try:
            with open(self.manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2, ensure_ascii=False)
            self.update_status("✅ Sauvegarde terminée avec succès.")
            self.refresh_all_tabs()
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder le manifest: {e}")

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

    def closeEvent(self, event):
        reply = QMessageBox.question(self, "Quitter", "Sauvegarder les changements avant de quitter ?",
                                     QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel)
        if reply == QMessageBox.StandardButton.Save:
            self.save_all()
            event.accept()
        elif reply == QMessageBox.StandardButton.Discard:
            event.accept()
        else:
            event.ignore()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SmartChapterManager()
    window.show()
    sys.exit(app.exec())