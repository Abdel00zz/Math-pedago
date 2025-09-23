import sys
import json
import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field, asdict
from PyQt6.QtWidgets import *
from PyQt6.QtCore import *
from PyQt6.QtGui import *


@dataclass
class QuizQuestion:
    """Question de quiz"""
    question: str = ""
    options: List[str] = field(default_factory=list)
    correct_answer: int = 0
    explanation: str = ""
    
    @classmethod
    def from_dict(cls, data: dict):
        """
        Méthode intelligente qui charge les données depuis le nouveau format JSON.
        """
        question_text = data.get('question', '')
        explanation_text = ""
        
        options_data = data.get('options', [])
        parsed_options = []
        correct_answer_index = 0
        
        # On parcourt la liste de dictionnaires pour extraire les données
        for i, option_dict in enumerate(options_data):
            # On ajoute le texte de l'option à notre liste
            parsed_options.append(option_dict.get('text', ''))
            
            # Si cette option est la bonne réponse
            if option_dict.get('isCorrect', False):
                correct_answer_index = i
                # On récupère l'explication associée à la bonne réponse
                explanation_text = option_dict.get('explanation', '')

        return cls(
            question=question_text,
            options=parsed_options,
            correct_answer=correct_answer_index,
            explanation=explanation_text
        )
    
    def to_dict(self):
        # Cette méthode sauvegarde dans le format simple utilisé par l'éditeur
        return {
            'question': self.question,
            'options': self.options,
            'correctAnswer': self.correct_answer,
            'explanation': self.explanation
        }


@dataclass
class Exercise:
    """Exercice sans notion de difficulté ni de solution"""
    title: str = ""
    description: str = ""
    
    @classmethod
    def from_dict(cls, data: dict):
        """
        Méthode intelligente qui charge les données depuis le nouveau format JSON pour les exercices.
        """
        title = data.get('title', '')
        
        # On combine l'énoncé principal et les sous-questions en une seule description
        statement = data.get('statement', '')
        sub_questions = data.get('sub_questions', [])
        
        full_description = statement
        if sub_questions:
            # On ajoute un peu de mise en forme pour la lisibilité
            full_description += "\n\n"
            for i, sq in enumerate(sub_questions):
                full_description += f"{i+1}. {sq.get('text', '')}\n"

        return cls(
            title=title,
            description=full_description.strip(),
        )
    
    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description,
        }


class ChapterData:
    """Modèle complet d'un chapitre"""
    def __init__(self, file_path: str = None):
        self.file_path = file_path
        self.id = ""
        self.file_name = ""
        self.is_active = False
        self.class_type = ""
        self.chapter_name = ""
        self.session_dates = []
        self.quiz_questions = []
        self.exercises = []
        self.raw_data = {}
        
    def load_from_manifest(self, data: dict, class_type: str):
        """Charge depuis le manifest"""
        self.id = data.get('id', '')
        self.file_name = data.get('file', '')
        self.is_active = data.get('isActive', False)
        self.class_type = class_type
        
    def load_from_file(self, file_path: str):
        """Charge le contenu complet depuis le fichier"""
        self.file_path = file_path
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                self.raw_data = json.load(f)
                
            self.chapter_name = self.raw_data.get('chapter', '')
            self.class_type = self.raw_data.get('class', self.class_type)
            
            # Dates
            if 'sessionDates' in self.raw_data:
                self.session_dates = self.raw_data['sessionDates']
            elif 'sessionDate' in self.raw_data:
                self.session_dates = [self.raw_data['sessionDate']]
            else:
                self.session_dates = []
                
            # Quiz
            self.quiz_questions = []
            for q_data in self.raw_data.get('quiz', []):
                self.quiz_questions.append(QuizQuestion.from_dict(q_data))
                
            # Exercices
            self.exercises = []
            for e_data in self.raw_data.get('exercises', []):
                self.exercises.append(Exercise.from_dict(e_data))
                
            return True
        except Exception as e:
            print(f"Erreur chargement {file_path}: {e}")
            return False
    
    def save_to_file(self):
        """Sauvegarde dans le fichier"""
        if not self.file_path:
            return False
            
        try:
            # Mettre à jour les données
            self.raw_data['chapter'] = self.chapter_name
            self.raw_data['class'] = self.class_type
            
            # Dates
            if len(self.session_dates) > 1:
                self.raw_data['sessionDates'] = self.session_dates
                self.raw_data.pop('sessionDate', None)
            elif self.session_dates:
                self.raw_data['sessionDate'] = self.session_dates[0]
                self.raw_data.pop('sessionDates', None)
            else:
                self.raw_data.pop('sessionDate', None)
                self.raw_data.pop('sessionDates', None)

            # Quiz
            self.raw_data['quiz'] = [q.to_dict() for q in self.quiz_questions]
            
            # Exercices
            self.raw_data['exercises'] = [e.to_dict() for e in self.exercises]
            
            # Sauvegarder
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(self.raw_data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Erreur sauvegarde: {e}")
            return False
    
    def to_manifest_dict(self):
        """Pour le manifest.json"""
        return {
            'id': self.id,
            'file': self.file_name,
            'isActive': self.is_active
        }


class QuizEditor(QWidget):
    """Éditeur de questions de quiz"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.questions = []
        self.current_index = -1
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout(self)
        
        # Toolbar
        toolbar = QHBoxLayout()
        
        toolbar.addWidget(QLabel("Questions de Quiz"))
        toolbar.addStretch()
        
        self.count_label = QLabel("0 question(s)")
        toolbar.addWidget(self.count_label)
        
        add_btn = QPushButton("➕ Nouvelle")
        add_btn.clicked.connect(self.add_question)
        toolbar.addWidget(add_btn)
        
        delete_btn = QPushButton("🗑️ Supprimer")
        delete_btn.clicked.connect(self.delete_current)
        toolbar.addWidget(delete_btn)
        
        layout.addLayout(toolbar)
        
        # Splitter principal
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Liste des questions
        self.question_list = QListWidget()
        self.question_list.setMaximumWidth(250)
        self.question_list.currentRowChanged.connect(self.on_selection_changed)
        splitter.addWidget(self.question_list)
        
        # Éditeur de question
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        
        # Question
        editor_layout.addWidget(QLabel("Question:"))
        self.question_edit = QTextEdit()
        self.question_edit.setMaximumHeight(80)
        self.question_edit.textChanged.connect(self.save_current)
        editor_layout.addWidget(self.question_edit)
        
        # Options
        editor_layout.addWidget(QLabel("Options de réponse:"))
        
        self.options_container = QWidget()
        self.options_layout = QVBoxLayout(self.options_container)
        
        self.option_widgets = []
        for i in range(4):
            opt_layout = QHBoxLayout()
            
            radio = QRadioButton()
            radio.toggled.connect(self.save_current)
            opt_layout.addWidget(radio)
            
            option_edit = QLineEdit()
            option_edit.setPlaceholderText(f"Option {i+1}")
            option_edit.textChanged.connect(self.save_current)
            opt_layout.addWidget(option_edit)
            
            self.options_layout.addLayout(opt_layout)
            self.option_widgets.append((radio, option_edit))
            
        editor_layout.addWidget(self.options_container)
        
        # Explication
        editor_layout.addWidget(QLabel("Explication (optionnelle):"))
        self.explanation_edit = QTextEdit()
        self.explanation_edit.setMaximumHeight(60)
        self.explanation_edit.textChanged.connect(self.save_current)
        editor_layout.addWidget(self.explanation_edit)
        
        editor_layout.addStretch()
        splitter.addWidget(editor_widget)
        
        splitter.setSizes([250, 500])
        layout.addWidget(splitter)
        
        self.editor_widget = editor_widget
        self.editor_widget.setEnabled(False)
        
    def set_questions(self, questions: List[QuizQuestion]):
        """Charge les questions"""
        self.questions = questions.copy()
        self.refresh_list()
        if self.questions:
            self.question_list.setCurrentRow(0)
            
    def get_questions(self) -> List[QuizQuestion]:
        """Retourne les questions"""
        return self.questions.copy()
        
    def refresh_list(self):
        """Actualise la liste"""
        self.question_list.clear()
        for i, q in enumerate(self.questions):
            text = q.question.strip().split('\n')[0]
            text = text[:50] + "..." if len(text) > 50 else text
            if not text:
                text = f"Question {i+1} (vide)"
            self.question_list.addItem(text)
        self.count_label.setText(f"{len(self.questions)} question(s)")
        
    def on_selection_changed(self, index: int):
        """Changement de sélection"""
        self.current_index = index
        if 0 <= index < len(self.questions):
            self.load_question(self.questions[index])
            self.editor_widget.setEnabled(True)
        else:
            self.clear_editor()
            self.editor_widget.setEnabled(False)
            
    def load_question(self, question: QuizQuestion):
        """Charge une question dans l'éditeur"""
        self.question_edit.blockSignals(True)
        self.explanation_edit.blockSignals(True)
        
        self.question_edit.setText(question.question)
        
        for i, (radio, edit) in enumerate(self.option_widgets):
            radio.blockSignals(True)
            edit.blockSignals(True)
            
            if i < len(question.options):
                edit.setText(question.options[i])
                radio.setChecked(i == question.correct_answer)
            else:
                edit.clear()
                radio.setChecked(False)
                
            radio.blockSignals(False)
            edit.blockSignals(False)
            
        self.explanation_edit.setText(question.explanation)
        
        self.question_edit.blockSignals(False)
        self.explanation_edit.blockSignals(False)
        
    def clear_editor(self):
        """Vide l'éditeur"""
        self.question_edit.clear()
        self.explanation_edit.clear()
        for radio, edit in self.option_widgets:
            radio.setChecked(False)
            edit.clear()
            
    def save_current(self):
        """Sauvegarde la question courante"""
        if 0 <= self.current_index < len(self.questions):
            q = self.questions[self.current_index]
            q.question = self.question_edit.toPlainText()
            q.explanation = self.explanation_edit.toPlainText()
            
            q.options = []
            correct_found = False
            for i, (radio, edit) in enumerate(self.option_widgets):
                if edit.text().strip():
                    q.options.append(edit.text())
                    if radio.isChecked():
                        q.correct_answer = len(q.options) - 1
                        correct_found = True
            
            if not correct_found and q.options:
                q.correct_answer = 0
                self.option_widgets[0][0].setChecked(True)
                        
            item = self.question_list.item(self.current_index)
            if item:
                text = q.question.strip().split('\n')[0]
                text = text[:50] + "..." if len(text) > 50 else text
                if not text:
                    text = f"Question {self.current_index+1} (vide)"
                item.setText(text)
                
    def add_question(self):
        """Ajoute une nouvelle question"""
        new_question = QuizQuestion(
            question="Nouvelle question",
            options=["Option 1", "Option 2", "Option 3", "Option 4"],
            correct_answer=0
        )
        self.questions.append(new_question)
        self.refresh_list()
        self.question_list.setCurrentRow(len(self.questions) - 1)
        
    def delete_current(self):
        """Supprime la question courante"""
        if 0 <= self.current_index < len(self.questions):
            reply = QMessageBox.question(
                self, "Confirmer",
                "Supprimer cette question ?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.Yes:
                del self.questions[self.current_index]
                self.refresh_list()


class ExerciseEditor(QWidget):
    """Éditeur d'exercices (sans difficulté ni solution)"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.exercises = []
        self.current_index = -1
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout(self)
        
        toolbar = QHBoxLayout()
        toolbar.addWidget(QLabel("Exercices"))
        toolbar.addStretch()
        self.count_label = QLabel("0 exercice(s)")
        toolbar.addWidget(self.count_label)
        add_btn = QPushButton("➕ Nouveau")
        add_btn.clicked.connect(self.add_exercise)
        toolbar.addWidget(add_btn)
        delete_btn = QPushButton("🗑️ Supprimer")
        delete_btn.clicked.connect(self.delete_current)
        toolbar.addWidget(delete_btn)
        layout.addLayout(toolbar)
        
        splitter = QSplitter(Qt.Orientation.Horizontal)
        self.exercise_list = QListWidget()
        self.exercise_list.setMaximumWidth(250)
        self.exercise_list.currentRowChanged.connect(self.on_selection_changed)
        splitter.addWidget(self.exercise_list)
        
        editor_widget = QWidget()
        editor_layout = QVBoxLayout(editor_widget)
        
        form = QFormLayout()
        self.title_edit = QLineEdit()
        self.title_edit.textChanged.connect(self.save_current)
        form.addRow("Titre:", self.title_edit)
        editor_layout.addLayout(form)
        
        editor_layout.addWidget(QLabel("Énoncé:"))
        self.description_edit = QTextEdit()
        self.description_edit.textChanged.connect(self.save_current)
        editor_layout.addWidget(self.description_edit)
        
        editor_layout.addStretch()
        
        splitter.addWidget(editor_widget)
        splitter.setSizes([250, 500])
        layout.addWidget(splitter)
        
        self.editor_widget = editor_widget
        self.editor_widget.setEnabled(False)
        
    def set_exercises(self, exercises: List[Exercise]):
        self.exercises = exercises.copy()
        self.refresh_list()
        if self.exercises:
            self.exercise_list.setCurrentRow(0)
            
    def get_exercises(self) -> List[Exercise]:
        return self.exercises.copy()
        
    def refresh_list(self):
        self.exercise_list.clear()
        for i, ex in enumerate(self.exercises):
            text = ex.title if ex.title else f"Exercice {i+1}"
            self.exercise_list.addItem(text)
        self.count_label.setText(f"{len(self.exercises)} exercice(s)")
        
    def on_selection_changed(self, index: int):
        self.current_index = index
        if 0 <= index < len(self.exercises):
            self.load_exercise(self.exercises[index])
            self.editor_widget.setEnabled(True)
        else:
            self.clear_editor()
            self.editor_widget.setEnabled(False)
            
    def load_exercise(self, exercise: Exercise):
        self.title_edit.blockSignals(True)
        self.description_edit.blockSignals(True)
        
        self.title_edit.setText(exercise.title)
        self.description_edit.setText(exercise.description)
        
        self.title_edit.blockSignals(False)
        self.description_edit.blockSignals(False)
        
    def clear_editor(self):
        self.title_edit.clear()
        self.description_edit.clear()
        
    def save_current(self):
        if 0 <= self.current_index < len(self.exercises):
            ex = self.exercises[self.current_index]
            ex.title = self.title_edit.text()
            ex.description = self.description_edit.toPlainText()
            
            item = self.exercise_list.item(self.current_index)
            if item:
                text = ex.title if ex.title else f"Exercice {self.current_index+1}"
                item.setText(text)
                
    def add_exercise(self):
        new_exercise = Exercise(
            title=f"Exercice {len(self.exercises)+1}",
            description=""
        )
        self.exercises.append(new_exercise)
        self.refresh_list()
        self.exercise_list.setCurrentRow(len(self.exercises) - 1)
        
    def delete_current(self):
        if 0 <= self.current_index < len(self.exercises):
            reply = QMessageBox.question(
                self, "Confirmer",
                "Supprimer cet exercice ?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.Yes:
                del self.exercises[self.current_index]
                self.refresh_list()

class ChapterContentEditor(QDialog):
    """Éditeur complet du contenu d'un chapitre"""
    
    def __init__(self, chapter: ChapterData, parent=None):
        super().__init__(parent)
        self.chapter = chapter
        self.setWindowTitle(f"Édition complète: {chapter.chapter_name}")
        self.setModal(True)
        self.resize(1000, 700)
        self.init_ui()
        self.load_chapter_data()
        
    def init_ui(self):
        layout = QVBoxLayout(self)
        
        self.quiz_editor = QuizEditor()
        self.exercise_editor = ExerciseEditor()

        header = QHBoxLayout()
        title = QLabel(f"📚 {self.chapter.chapter_name}")
        title.setStyleSheet("font-size: 16px; font-weight: bold;")
        header.addWidget(title)
        header.addStretch()
        self.stats_label = QLabel()
        header.addWidget(self.stats_label)
        layout.addLayout(header)
        
        self.tabs = QTabWidget()
        info_widget = self.create_info_tab()
        self.tabs.addTab(info_widget, "📋 Informations")
        self.tabs.addTab(self.quiz_editor, "❓ Quiz")
        self.tabs.addTab(self.exercise_editor, "📝 Exercices")
        layout.addWidget(self.tabs)
        
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Save |
            QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.save_and_close)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
        self.quiz_editor.question_list.model().rowsInserted.connect(self.update_stats)
        self.quiz_editor.question_list.model().rowsRemoved.connect(self.update_stats)
        self.exercise_editor.exercise_list.model().rowsInserted.connect(self.update_stats)
        self.exercise_editor.exercise_list.model().rowsRemoved.connect(self.update_stats)
        
    def create_info_tab(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        form = QFormLayout()
        
        self.name_edit = QLineEdit(self.chapter.chapter_name)
        form.addRow("Nom du chapitre:", self.name_edit)
        
        self.class_edit = QLineEdit(self.chapter.class_type)
        self.class_edit.setEnabled(False)
        form.addRow("Classe:", self.class_edit)
        
        self.file_edit = QLineEdit(self.chapter.file_name)
        self.file_edit.setEnabled(False)
        self.file_edit.setStyleSheet("color: gray;")
        form.addRow("Fichier:", self.file_edit)
        
        self.active_check = QCheckBox("Chapitre actif")
        self.active_check.setChecked(self.chapter.is_active)
        form.addRow("", self.active_check)
        layout.addLayout(form)
        
        layout.addWidget(QLabel("\nDates de séance:"))
        self.dates_list = QListWidget()
        self.dates_list.setMaximumHeight(100)
        self.dates_list.addItems(sorted(self.chapter.session_dates))
        layout.addWidget(self.dates_list)
        
        date_controls = QHBoxLayout()
        self.date_edit = QDateTimeEdit()
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDateTime(QDateTime.currentDateTime())
        self.date_edit.setDisplayFormat("yyyy-MM-dd HH:mm")
        date_controls.addWidget(self.date_edit)
        
        add_date_btn = QPushButton("Ajouter date")
        add_date_btn.clicked.connect(self.add_date)
        date_controls.addWidget(add_date_btn)
        
        remove_date_btn = QPushButton("Supprimer date")
        remove_date_btn.clicked.connect(self.remove_date)
        date_controls.addWidget(remove_date_btn)
        
        date_controls.addStretch()
        layout.addLayout(date_controls)
        layout.addStretch()
        return widget
        
    def update_stats(self, *args):
        quiz_count = len(self.quiz_editor.questions)
        ex_count = len(self.exercise_editor.exercises)
        self.stats_label.setText(f"📊 {quiz_count} questions | {ex_count} exercices")
        
    def load_chapter_data(self):
        self.quiz_editor.set_questions(self.chapter.quiz_questions)
        self.exercise_editor.set_exercises(self.chapter.exercises)
        self.update_stats()
        
    def add_date(self):
        date_str = self.date_edit.dateTime().toString("yyyy-MM-dd HH:mm")
        if not self.dates_list.findItems(date_str, Qt.MatchFlag.MatchExactly):
            self.dates_list.addItem(date_str)
            self.dates_list.sortItems()
                
    def remove_date(self):
        current_item = self.dates_list.currentItem()
        if current_item:
            self.dates_list.takeItem(self.dates_list.row(current_item))
                
    def save_and_close(self):
        self.chapter.chapter_name = self.name_edit.text().strip()
        self.chapter.is_active = self.active_check.isChecked()
        self.chapter.session_dates = [self.dates_list.item(i).text() for i in range(self.dates_list.count())]
        self.chapter.quiz_questions = self.quiz_editor.get_questions()
        self.chapter.exercises = self.exercise_editor.get_exercises()
        
        if self.chapter.save_to_file():
            QMessageBox.information(self, "Succès", "Chapitre sauvegardé avec succès!")
            self.accept()
        else:
            QMessageBox.critical(self, "Erreur", "Erreur lors de la sauvegarde du fichier!")


class SmartChapterManager(QMainWindow):
    """Application principale intelligente et robuste"""
    
    # NOUVELLE LISTE DE CLASSES
    CLASSES_DATA = [
        { 'value': 'tcs', 'label': 'Tronc Commun Scientifique' },
        { 'value': '1bse', 'label': '1ère Bac Sciences Expérimentales' },
        { 'value': '1bsm', 'label': '1ère Bac Sciences Mathématiques' },
        { 'value': '2bse', 'label': '2ème Bac Sciences Expérimentales' },
        { 'value': '2bsm', 'label': '2ème Bac Sciences Mathématiques' },
        { 'value': '2beco', 'label': '2ème Bac Économie' },
    ]
    
    CLASSES = [item['value'] for item in CLASSES_DATA]
    CLASS_LABELS = {item['value']: item['label'] for item in CLASSES_DATA}

    def __init__(self):
        super().__init__()
        self.manifest_path = None
        self.chapters_dir = None
        self.chapters_by_class = {cls: [] for cls in self.CLASSES}
        self.all_chapters = {}
        self.init_ui()
        self.auto_load()
        
    def init_ui(self):
        self.setWindowTitle("📚 Gestionnaire de Contenus Éducatifs")
        self.setMinimumSize(1200, 800)
        self.create_menu()
        self.create_toolbar()
        
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.addWidget(self.create_header())
        
        self.tabs = QTabWidget()
        for class_id in self.CLASSES:
            self.tabs.addTab(self.create_class_tab(class_id), self.CLASS_LABELS[class_id])
        layout.addWidget(self.tabs)
        
        self.status_bar = self.statusBar()
        self.update_status("Prêt")
        self.apply_style()
        
    def create_menu(self):
        menubar = self.menuBar()
        file_menu = menubar.addMenu("Fichier")
        file_menu.addAction("📁 Ouvrir manifest", self.open_manifest)
        file_menu.addAction("💾 Sauvegarder", self.save_all)
        file_menu.addSeparator()
        file_menu.addAction("🔍 Vérifier intégrité", self.check_integrity)
        file_menu.addAction("📥 Importer chapitres", self.import_chapters)
        file_menu.addAction("📤 Exporter sélection", self.export_selection)
        file_menu.addSeparator()
        file_menu.addAction("Quitter", self.close)
        
        edit_menu = menubar.addMenu("Édition")
        edit_menu.addAction("🔍 Rechercher", lambda: self.search_edit.setFocus())
        edit_menu.addAction("✓ Activer tous", self.activate_all)
        edit_menu.addAction("✗ Désactiver tous", self.deactivate_all)
        
        tools_menu = menubar.addMenu("Outils")
        tools_menu.addAction("📊 Statistiques", self.show_statistics)
        tools_menu.addAction("🔧 Réparer fichiers", self.repair_files)
        
    def create_toolbar(self):
        toolbar = self.addToolBar("Principal")
        toolbar.setMovable(False)
        toolbar.addAction("📁 Ouvrir", self.open_manifest)
        toolbar.addAction("💾 Sauvegarder", self.save_all)
        toolbar.addSeparator()
        toolbar.addAction("➕ Nouveau", self.add_chapter)
        toolbar.addAction("🔄 Actualiser", self.refresh_all)
        toolbar.addSeparator()
        toolbar.addAction("📊 Stats", self.show_statistics)
        
    def create_header(self) -> QWidget:
        widget = QWidget()
        layout = QHBoxLayout(widget)
        title = QLabel("Gestion Complète des Contenus")
        title.setStyleSheet("font-size: 18px; font-weight: 300; color: #333;")
        layout.addWidget(title)
        layout.addStretch()
        layout.addWidget(QLabel("🔍"))
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Rechercher un chapitre...")
        self.search_edit.setMinimumWidth(250)
        self.search_edit.textChanged.connect(self.on_search)
        layout.addWidget(self.search_edit)
        self.integrity_indicator = QLabel("✅")
        self.integrity_indicator.setToolTip("État des fichiers")
        layout.addWidget(self.integrity_indicator)
        return widget
        
    def create_class_tab(self, class_id: str) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        toolbar = QHBoxLayout()
        label = QLabel(f"Classe {self.CLASS_LABELS[class_id]}")
        label.setStyleSheet("font-weight: bold; font-size: 14px;")
        toolbar.addWidget(label)
        toolbar.addStretch()
        stats_label = QLabel("0 chapitres")
        stats_label.setObjectName(f"stats_{class_id}")
        toolbar.addWidget(stats_label)
        add_btn = QPushButton("➕ Nouveau chapitre")
        add_btn.clicked.connect(lambda: self.add_chapter_to_class(class_id))
        toolbar.addWidget(add_btn)
        layout.addLayout(toolbar)
        
        table = QTableWidget()
        table.setObjectName(f"table_{class_id}")
        table.setColumnCount(6)
        table.setHorizontalHeaderLabels(["Actif", "Chapitre", "Quiz", "Exercices", "Dates", "Actions"])
        header = table.horizontalHeader()
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        table.setAlternatingRowColors(True)
        table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        table.setColumnWidth(0, 50); table.setColumnWidth(2, 60); table.setColumnWidth(3, 80)
        table.setColumnWidth(4, 100); table.setColumnWidth(5, 150)
        table.setShowGrid(False)
        table.verticalHeader().setVisible(False)
        layout.addWidget(table)
        return widget
        
    def apply_style(self):
        self.setStyleSheet("""
            QMainWindow, QDialog { 
                background-color: #f5f5f5; 
                color: #333;
                font-family: Segoe UI, sans-serif;
            }
            QTabWidget::pane { 
                border-top: 1px solid #e0e0e0; 
                background: white; 
            }
            QTabBar::tab { 
                padding: 10px 20px; 
                background: transparent; 
                border: none;
                color: #555;
                font-size: 13px;
            }
            QTabBar::tab:selected { 
                background: white;
                color: #005a9e;
                border-bottom: 2px solid #005a9e;
            }
            QPushButton { 
                padding: 8px 14px; 
                background-color: #0078d4; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                font-weight: bold;
                font-size: 12px;
            }
            QPushButton:hover { background-color: #005a9e; }
            QPushButton:disabled { background-color: #cdd1d4; }
            QTableWidget { 
                border: 1px solid #e0e0e0; 
                gridline-color: #f0f0f0; 
                background-color: white;
            }
            QHeaderView::section { 
                background-color: #f5f5f5; 
                padding: 6px; 
                border: none;
                border-bottom: 1px solid #e0e0e0;
                font-weight: bold; 
                font-size: 12px;
            }
            QLineEdit, QTextEdit { 
                padding: 6px; 
                border: 1px solid #ccc; 
                border-radius: 4px; 
                background-color: white;
            }
            QLineEdit:focus, QTextEdit:focus {
                border: 1px solid #0078d4;
            }
            QListWidget {
                border-radius: 4px;
                border: 1px solid #ccc;
            }
            QSplitter::handle {
                background-color: #e0e0e0;
            }
            QSplitter::handle:horizontal {
                width: 1px;
            }
            QSplitter::handle:vertical {
                height: 1px;
            }
        """)
        
    def auto_load(self):
        default_path = Path("public/manifest.json")
        if default_path.exists():
            self.load_manifest(str(default_path))
            
    def open_manifest(self):
        path, _ = QFileDialog.getOpenFileName(self, "Ouvrir manifest.json", "", "JSON Files (*.json)")
        if path:
            self.load_manifest(path)
            
    def load_manifest(self, path: str):
        try:
            self.manifest_path = path
            self.chapters_dir = Path(path).parent / "chapters"
            self.chapters_dir.mkdir(exist_ok=True)
            
            with open(path, 'r', encoding='utf-8') as f: manifest = json.load(f)
                
            self.all_chapters.clear()
            for cls in self.CLASSES: self.chapters_by_class[cls] = []
                
            total_loaded, total_errors = 0, 0
            for class_id, chapters_list in manifest.items():
                if class_id not in self.CLASSES: continue
                for chapter_info in chapters_list:
                    chapter = ChapterData()
                    chapter.load_from_manifest(chapter_info, class_id)
                    file_path = self.chapters_dir / chapter.file_name
                    
                    if not file_path.exists():
                        self.create_default_file(chapter, file_path)
                    
                    if chapter.load_from_file(str(file_path)):
                        total_loaded += 1
                    else:
                        total_errors += 1
                        
                    self.chapters_by_class[class_id].append(chapter)
                    self.all_chapters[chapter.id] = chapter
                    
            self.refresh_all()
            
            if total_errors > 0:
                self.integrity_indicator.setText("⚠️"); self.integrity_indicator.setToolTip(f"{total_errors} erreurs de chargement")
            else:
                self.integrity_indicator.setText("✅"); self.integrity_indicator.setToolTip("Fichiers valides")
                
            self.update_status(f"Chargé: {total_loaded} chapitres depuis {Path(path).name}")
            
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Erreur de chargement du manifest:\n{str(e)}")
            
    def create_default_file(self, chapter: ChapterData, file_path: Path):
        default_data = {
            'chapter': re.sub(r'[-_]', ' ', chapter.id).title(),
            'class': chapter.class_type, 'sessionDate': datetime.now().strftime("%Y-%m-%d %H:%M"),
            'quiz': [], 'exercises': []
        }
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erreur création fichier {file_path}: {e}")
            
    def refresh_all(self):
        for class_id in self.CLASSES: self.refresh_class_tab(class_id)
        self.on_search(self.search_edit.text())
            
    def refresh_class_tab(self, class_id: str):
        tab_widget = self.tabs.widget(self.CLASSES.index(class_id))
        table = tab_widget.findChild(QTableWidget, f"table_{class_id}")
        stats_label = tab_widget.findChild(QLabel, f"stats_{class_id}")
        if not table: return
            
        chapters = self.chapters_by_class[class_id]
        table.setRowCount(0); table.setRowCount(len(chapters))
        
        stats_label.setText(f"{len(chapters)} chapitres | {sum(len(c.quiz_questions) for c in chapters)} quiz | {sum(len(c.exercises) for c in chapters)} exercices")
        
        for row, chapter in enumerate(chapters):
            check = QCheckBox(); check.setChecked(chapter.is_active)
            check.stateChanged.connect(lambda state, ch=chapter: setattr(ch, 'is_active', state == Qt.CheckState.Checked.value))
            cell_widget = QWidget(); layout = QHBoxLayout(cell_widget)
            layout.addWidget(check); layout.setAlignment(Qt.AlignmentFlag.AlignCenter); layout.setContentsMargins(0,0,0,0)
            table.setCellWidget(row, 0, cell_widget)
            table.setItem(row, 1, QTableWidgetItem(chapter.chapter_name))
            quiz_item = QTableWidgetItem(str(len(chapter.quiz_questions))); quiz_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            table.setItem(row, 2, quiz_item)
            ex_item = QTableWidgetItem(str(len(chapter.exercises))); ex_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            table.setItem(row, 3, ex_item)
            table.setItem(row, 4, QTableWidgetItem(f"{len(chapter.session_dates)} date(s)"))
            
            actions_widget = QWidget(); actions_layout = QHBoxLayout(actions_widget)
            actions_layout.setContentsMargins(5, 2, 5, 2)
            edit_btn = QPushButton("✏️ Éditer"); edit_btn.clicked.connect(lambda _, ch=chapter: self.edit_chapter(ch))
            actions_layout.addWidget(edit_btn)
            delete_btn = QPushButton("🗑️"); delete_btn.clicked.connect(lambda _, ch=chapter: self.delete_chapter(ch))
            actions_layout.addWidget(delete_btn)
            table.setCellWidget(row, 5, actions_widget)
            
    def add_chapter(self):
        if 0 <= self.tabs.currentIndex() < len(self.CLASSES):
            self.add_chapter_to_class(self.CLASSES[self.tabs.currentIndex()])
            
    def add_chapter_to_class(self, class_id: str):
        name, ok = QInputDialog.getText(self, "Nouveau chapitre", "Nom du chapitre:", QLineEdit.EchoMode.Normal, "")
        if ok and name:
            chapter_id = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            if chapter_id in self.all_chapters:
                QMessageBox.warning(self, "Erreur", "Un chapitre avec un ID similaire existe déjà."); return

            chapter = ChapterData(); chapter.id = chapter_id
            chapter.file_name = f"{class_id}_{chapter.id.replace('-', '_')}.json"; chapter.class_type = class_id
            chapter.chapter_name = name; chapter.is_active = True
            chapter.session_dates = [datetime.now().strftime("%Y-%m-%d %H:%M")]
            chapter.file_path = str(self.chapters_dir / chapter.file_name)
            
            if not chapter.save_to_file():
                 QMessageBox.critical(self, "Erreur", f"Impossible de créer le fichier {chapter.file_name}"); return

            self.chapters_by_class[class_id].append(chapter)
            self.all_chapters[chapter.id] = chapter
            self.refresh_class_tab(class_id); self.update_status(f"Nouveau chapitre créé: {name}")
            
    def edit_chapter(self, chapter: ChapterData):
        editor = ChapterContentEditor(chapter, self)
        if editor.exec() == QDialog.DialogCode.Accepted:
            self.refresh_all(); self.update_status(f"Chapitre modifié: {chapter.chapter_name}")
            
    def delete_chapter(self, chapter: ChapterData):
        reply = QMessageBox.question(self, "Confirmer la suppression",
            f"Supprimer le chapitre '{chapter.chapter_name}' et son fichier associé ?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No, QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            if chapter.file_path and Path(chapter.file_path).exists():
                try: Path(chapter.file_path).unlink()
                except Exception as e: QMessageBox.warning(self, "Erreur", f"Impossible de supprimer le fichier:\n{e}")
            self.chapters_by_class[chapter.class_type].remove(chapter)
            del self.all_chapters[chapter.id]
            self.refresh_all(); self.update_status(f"Chapitre supprimé: {chapter.chapter_name}")
            
    def save_all(self):
        if not self.manifest_path:
            path, _ = QFileDialog.getSaveFileName(self, "Sauvegarder manifest", "public/manifest.json", "JSON Files (*.json)")
            if not path: return
            self.manifest_path = path
            self.chapters_dir = Path(path).parent / "chapters"; self.chapters_dir.mkdir(exist_ok=True)
            
        manifest = {cid: [c.to_manifest_dict() for c in clist] for cid, clist in self.chapters_by_class.items() if clist}
        try:
            with open(self.manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            self.update_status("✅ Manifest et chapitres sauvegardés avec succès")
        except Exception as e:
            QMessageBox.critical(self, "Erreur de sauvegarde", f"Erreur du manifest:\n{str(e)}")
            
    def check_integrity(self):
        errors, fixed = [], 0
        for chapter in self.all_chapters.values():
            file_path = self.chapters_dir / chapter.file_name
            if not file_path.exists():
                self.create_default_file(chapter, file_path); fixed += 1
            else:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f: json.load(f)
                except json.JSONDecodeError: errors.append(chapter.file_name)
        msg = f"Vérification terminée:\n\n✅ {len(self.all_chapters) - len(errors)} fichiers valides.\n"
        if fixed: msg += f"🔧 {fixed} fichiers manquants recréés.\n"
        if errors: msg += f"❌ {len(errors)} fichiers corrompus: {', '.join(errors)}.\nUtilisez 'Réparer fichiers'."
        QMessageBox.information(self, "Rapport d'intégrité", msg)
        if fixed: self.refresh_all()
            
    def repair_files(self):
        repaired = 0
        for chapter in self.all_chapters.values():
            file_path = self.chapters_dir / chapter.file_name
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f: json.load(f)
                except json.JSONDecodeError: self.create_default_file(chapter, file_path); repaired += 1
        if repaired:
            QMessageBox.information(self, "Réparation", f"✅ {repaired} fichier(s) corrompu(s) ont été réinitialisés.")
            self.load_manifest(self.manifest_path)
        else: QMessageBox.information(self, "Réparation", "Aucun fichier corrompu détecté.")
            
    def show_statistics(self):
        total_chapters = len(self.all_chapters)
        if not total_chapters: QMessageBox.information(self, "Statistiques", "Aucun chapitre chargé."); return
        total_active = sum(1 for c in self.all_chapters.values() if c.is_active)
        msg = f"📊 **STATISTIQUES GLOBALES**\n\n**Total**: {total_chapters} chapitres\n**Actifs**: {total_active} ({100*total_active/total_chapters:.1f}%)\n"
        msg += f"**Quiz**: {sum(len(c.quiz_questions) for c in self.all_chapters.values())}\n**Exercices**: {sum(len(c.exercises) for c in self.all_chapters.values())}\n"
        QMessageBox.information(self, "Statistiques", msg)
        
    def import_chapters(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Importer des chapitres", "", "JSON Files (*.json)")
        if not files: return
        imported = 0
        for file in files:
            try:
                dest = self.chapters_dir / Path(file).name
                if dest.exists() and QMessageBox.question(self, "Fichier existant", f"{dest.name} existe. Écraser ?", QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No) == QMessageBox.StandardButton.No: continue
                shutil.copy2(file, dest); imported += 1
            except Exception as e: print(f"Erreur import {file}: {e}")
        if imported:
            self.load_manifest(self.manifest_path)
            QMessageBox.information(self, "Importation", f"✅ {imported} chapitre(s) importé(s).")
                
    def export_selection(self):
        active = [c for c in self.all_chapters.values() if c.is_active]
        if not active: QMessageBox.warning(self, "Exportation", "Aucun chapitre actif à exporter."); return
        dir_path = QFileDialog.getExistingDirectory(self, "Choisir un dossier d'exportation")
        if not dir_path: return
        exported = 0
        for chapter in active:
            if chapter.file_path and Path(chapter.file_path).exists():
                try: shutil.copy2(chapter.file_path, Path(dir_path) / chapter.file_name); exported += 1
                except Exception as e: print(f"Erreur export {chapter.file_name}: {e}")
        QMessageBox.information(self, "Exportation", f"✅ {exported} chapitre(s) exporté(s).")
            
    def activate_all(self):
        class_id = self.CLASSES[self.tabs.currentIndex()]
        for chapter in self.chapters_by_class[class_id]: chapter.is_active = True
        self.refresh_class_tab(class_id)
        
    def deactivate_all(self):
        class_id = self.CLASSES[self.tabs.currentIndex()]
        for chapter in self.chapters_by_class[class_id]: chapter.is_active = False
        self.refresh_class_tab(class_id)
        
    def on_search(self, text: str):
        text = text.lower().strip()
        for class_id in self.CLASSES:
            table = self.tabs.widget(self.CLASSES.index(class_id)).findChild(QTableWidget, f"table_{class_id}")
            if table:
                for row in range(table.rowCount()):
                    table.setRowHidden(row, text not in table.item(row, 1).text().lower())
        
    def update_status(self, message: str):
        self.status_bar.showMessage(message, 5000)
        
    def closeEvent(self, event):
        reply = QMessageBox.question(self, "Quitter", "Sauvegarder le manifest avant de quitter ?",
            QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel)
        if reply == QMessageBox.StandardButton.Save: self.save_all(); event.accept()
        elif reply == QMessageBox.StandardButton.Discard: event.accept()
        else: event.ignore()

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Gestionnaire de Contenus Éducatifs")
    window = SmartChapterManager()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()