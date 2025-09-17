
import sys
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QFileDialog, QScrollArea, QFrame,
    QCheckBox, QGroupBox, QMessageBox, QTextEdit, QSplitter,
    QTabWidget, QTableWidget, QTableWidgetItem, QHeaderView,
    QProgressBar, QStatusBar, QToolBar, QMenuBar, QMenu,
    QDialog, QLineEdit, QComboBox, QFormLayout, QDialogButtonBox
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer, QSize
from PyQt6.QtGui import (
    QIcon, QFont, QPixmap, QPalette, QColor, QAction
)


class ChapterData:
    """Classe pour représenter les données d'un chapitre"""
    def __init__(self, id: str, file: str, is_active: bool, class_type: str, chapter: str = ""):
        self.id = id
        self.file = file
        self.is_active = is_active
        self.class_type = class_type
        self.chapter = chapter
        self.session_date = ""
        self.quiz_count = 0
        self.exercise_count = 0

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "file": self.file,
            "isActive": self.is_active
        }


class FileProcessor(QThread):
    """Thread pour traiter les fichiers en arrière-plan"""
    progress = pyqtSignal(int)
    finished = pyqtSignal(dict)
    error = pyqtSignal(str)

    def __init__(self, files: List[str]):
        super().__init__()
        self.files = files

    def run(self):
        try:
            chapters_data = {}
            total_files = len(self.files)
            
            for i, file_path in enumerate(self.files):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                if 'class' in content and 'chapter' in content:
                    chapter_id = self.get_chapter_id(content['chapter'])
                    file_name = os.path.basename(file_path)
                    
                    chapter = ChapterData(
                        id=chapter_id,
                        file=file_name,
                        is_active=False,
                        class_type=content['class'],
                        chapter=content['chapter']
                    )
                    
                    if 'sessionDate' in content:
                        chapter.session_date = content['sessionDate']
                    if 'quiz' in content:
                        chapter.quiz_count = len(content['quiz'])
                    if 'exercises' in content:
                        chapter.exercise_count = len(content['exercises'])
                    
                    chapters_data[chapter_id] = chapter
                
                progress_value = int((i + 1) / total_files * 100)
                self.progress.emit(progress_value)
            
            self.finished.emit(chapters_data)
        except Exception as e:
            self.error.emit(str(e))

    @staticmethod
    def get_chapter_id(name: str) -> str:
        """Génère un ID de chapitre à partir du nom"""
        import re
        return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


class ChapterEditDialog(QDialog):
    """Dialogue d'édition d'un chapitre"""
    
    def __init__(self, chapter: ChapterData, chapters_dir: str, parent=None):
        super().__init__(parent)
        self.chapter = chapter
        self.chapters_dir = chapters_dir
        self.original_data = None
        self.setup_ui()
        self.load_chapter_data()
    
    def setup_ui(self):
        self.setWindowTitle(f"Éditer le chapitre: {self.chapter.chapter}")
        self.setModal(True)
        self.resize(500, 400)
        
        layout = QVBoxLayout(self)
        
        # Formulaire d'édition
        form_layout = QFormLayout()
        
        # Nom du chapitre
        self.chapter_name_edit = QLineEdit()
        self.chapter_name_edit.setPlaceholderText("Nom du chapitre")
        form_layout.addRow("Nom du chapitre:", self.chapter_name_edit)
        
        # Classe
        self.class_combo = QComboBox()
        self.class_combo.addItems(["tcs", "1bse", "1bsm", "2bse", "2bsm", "2beco"])
        self.class_combo.setCurrentText(self.chapter.class_type)
        form_layout.addRow("Classe:", self.class_combo)
        
        # Date de session
        self.session_date_edit = QLineEdit()
        self.session_date_edit.setPlaceholderText("Date de session (ex: 15 Dec 2024)")
        form_layout.addRow("Date de session:", self.session_date_edit)
        
        # ID (lecture seule)
        self.id_label = QLabel(self.chapter.id)
        self.id_label.setStyleSheet("color: #6c757d; font-family: monospace;")
        form_layout.addRow("ID (auto):", self.id_label)
        
        # Nom du fichier (lecture seule)
        self.file_label = QLabel(self.chapter.file)
        self.file_label.setStyleSheet("color: #6c757d; font-family: monospace;")
        form_layout.addRow("Fichier:", self.file_label)
        
        layout.addLayout(form_layout)
        
        # Zone d'informations
        info_label = QLabel("ℹ️ Les modifications seront sauvegardées directement dans le fichier JSON du chapitre.")
        info_label.setWordWrap(True)
        info_label.setStyleSheet("background-color: #e3f2fd; padding: 10px; border-radius: 5px; color: #1565c0;")
        layout.addWidget(info_label)
        
        # Boutons
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Save | 
            QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self.save_changes)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)
    
    def load_chapter_data(self):
        """Charge les données actuelles du chapitre"""
        chapter_file_path = os.path.join(self.chapters_dir, self.chapter.file)
        if os.path.exists(chapter_file_path):
            try:
                with open(chapter_file_path, 'r', encoding='utf-8') as f:
                    self.original_data = json.load(f)
                
                # Remplir les champs
                self.chapter_name_edit.setText(self.original_data.get('chapter', ''))
                self.class_combo.setCurrentText(self.original_data.get('class', self.chapter.class_type))
                self.session_date_edit.setText(self.original_data.get('sessionDate', ''))
                
            except Exception as e:
                QMessageBox.warning(self, "Erreur", f"Impossible de charger les données du chapitre:\n{str(e)}")
        else:
            QMessageBox.warning(self, "Fichier non trouvé", f"Le fichier {self.chapter.file} n'existe pas.")
    
    def save_changes(self):
        """Sauvegarde les modifications"""
        if not self.original_data:
            QMessageBox.warning(self, "Erreur", "Aucune donnée originale disponible.")
            return
        
        try:
            # Mettre à jour les données
            new_chapter_name = self.chapter_name_edit.text().strip()
            new_class = self.class_combo.currentText()
            new_session_date = self.session_date_edit.text().strip()
            
            if not new_chapter_name:
                QMessageBox.warning(self, "Erreur", "Le nom du chapitre ne peut pas être vide.")
                return
            
            # Mettre à jour les données JSON
            self.original_data['chapter'] = new_chapter_name
            self.original_data['class'] = new_class
            if new_session_date:
                self.original_data['sessionDate'] = new_session_date
            elif 'sessionDate' in self.original_data:
                del self.original_data['sessionDate']
            
            # Sauvegarder le fichier
            chapter_file_path = os.path.join(self.chapters_dir, self.chapter.file)
            with open(chapter_file_path, 'w', encoding='utf-8') as f:
                json.dump(self.original_data, f, indent=2, ensure_ascii=False)
            
            # Mettre à jour l'objet chapitre
            self.chapter.chapter = new_chapter_name
            self.chapter.class_type = new_class
            self.chapter.session_date = new_session_date
            
            QMessageBox.information(self, "Succès", "Les modifications ont été sauvegardées avec succès.")
            self.accept()
            
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder les modifications:\n{str(e)}")


class ChapterWidget(QFrame):
    """Widget personnalisé pour afficher un chapitre"""
    toggled = pyqtSignal(str, bool)
    edit_requested = pyqtSignal(object)  # Signal pour demander l'édition
    delete_requested = pyqtSignal(object)  # Signal pour demander la suppression

    def __init__(self, chapter: ChapterData):
        super().__init__()
        self.chapter = chapter
        self.setup_ui()

    def setup_ui(self):
        self.setFrameStyle(QFrame.Shape.Box)
        self.setStyleSheet("""
            ChapterWidget {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin: 2px;
                padding: 8px;
            }
            ChapterWidget:hover {
                background-color: #e9ecef;
                border-color: #0056d2;
            }
        """)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 8, 12, 8)

        # Indicateur d'état
        status_indicator = QLabel("●")
        status_indicator.setStyleSheet(
            f"color: {'#28a745' if self.chapter.is_active else '#6c757d'}; font-size: 16px;"
        )
        layout.addWidget(status_indicator)

        # Informations du chapitre
        info_layout = QVBoxLayout()
        
        title_label = QLabel(self.chapter.chapter)
        title_label.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #212529;")
        info_layout.addWidget(title_label)

        details_text = f"Fichier: {self.chapter.file}"
        if self.chapter.session_date:
            details_text += f" | Date: {self.chapter.session_date}"
        if self.chapter.quiz_count > 0:
            details_text += f" | Quiz: {self.chapter.quiz_count}"
        if self.chapter.exercise_count > 0:
            details_text += f" | Exercices: {self.chapter.exercise_count}"
        
        details_label = QLabel(details_text)
        details_label.setStyleSheet("color: #6c757d; font-size: 10px;")
        info_layout.addWidget(details_label)

        layout.addLayout(info_layout, 1)

        # Boutons d'action
        actions_layout = QHBoxLayout()
        
        # Bouton d'édition
        self.edit_btn = QPushButton("✏️")
        self.edit_btn.setToolTip("Éditer ce chapitre")
        self.edit_btn.setMaximumSize(30, 30)
        self.edit_btn.clicked.connect(self.on_edit_clicked)
        self.edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #ffc107;
                border: none;
                border-radius: 15px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #e0a800;
            }
        """)
        actions_layout.addWidget(self.edit_btn)
        
        # Bouton de suppression
        self.delete_btn = QPushButton("🗑️")
        self.delete_btn.setToolTip("Supprimer ce chapitre")
        self.delete_btn.setMaximumSize(30, 30)
        self.delete_btn.clicked.connect(self.on_delete_clicked)
        self.delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 15px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #c82333;
            }
        """)
        actions_layout.addWidget(self.delete_btn)
        
        # Checkbox d'activation
        self.checkbox = QCheckBox()
        self.checkbox.setChecked(self.chapter.is_active)
        self.checkbox.toggled.connect(self.on_toggled)
        self.checkbox.setStyleSheet("""
            QCheckBox::indicator {
                width: 20px;
                height: 20px;
            }
            QCheckBox::indicator:unchecked {
                border: 2px solid #6c757d;
                border-radius: 3px;
                background-color: white;
            }
            QCheckBox::indicator:checked {
                border: 2px solid #0056d2;
                border-radius: 3px;
                background-color: #0056d2;
                image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K);
            }
        """)
        actions_layout.addWidget(self.checkbox)
        
        layout.addLayout(actions_layout)

    def on_toggled(self, checked: bool):
        self.chapter.is_active = checked
        self.toggled.emit(self.chapter.id, checked)
        # Mettre à jour l'indicateur d'état
        status_indicator = self.layout().itemAt(0).widget()
        status_indicator.setStyleSheet(
            f"color: {'#28a745' if checked else '#6c757d'}; font-size: 16px;"
        )
    
    def on_edit_clicked(self):
        """Émet le signal pour demander l'édition du chapitre"""
        self.edit_requested.emit(self.chapter)
    
    def on_delete_clicked(self):
        """Émet le signal pour demander la suppression du chapitre"""
        self.delete_requested.emit(self.chapter)
    
    def update_display(self):
        """Met à jour l'affichage après modification"""
        # Mettre à jour le titre
        title_label = self.layout().itemAt(1).layout().itemAt(0).widget()
        title_label.setText(self.chapter.chapter)
        
        # Mettre à jour les détails
        details_text = f"Fichier: {self.chapter.file}"
        if self.chapter.session_date:
            details_text += f" | Date: {self.chapter.session_date}"
        if self.chapter.quiz_count > 0:
            details_text += f" | Quiz: {self.chapter.quiz_count}"
        if self.chapter.exercise_count > 0:
            details_text += f" | Exercices: {self.chapter.exercise_count}"
        
        details_label = self.layout().itemAt(1).layout().itemAt(1).widget()
        details_label.setText(details_text)


class AdminApp(QMainWindow):
    """Application principale d'administration"""
    
    CLASS_LABELS = {
        'tcs': 'Tronc Commun Scientifique',
        '1bse': '1ère Bac Sciences Expérimentales',
        '1bsm': '1ère Bac Sciences Mathématiques',
        '2bse': '2ème Bac Sciences Expérimentales',
        '2bsm': '2ème Bac Sciences Mathématiques',
        '2beco': '2ème Bac Économie',
    }

    def __init__(self):
        super().__init__()
        self.chapters_data: Dict[str, ChapterData] = {}
        self.manifest_path = ""
        self.chapters_dir = ""
        self.is_dirty = False
        self.setup_ui()
        self.setup_style()
        self.load_initial_manifest()

    def setup_ui(self):
        self.setWindowTitle("🦉 Gestion des Chapitres - Administration")
        self.setMinimumSize(1000, 700)
        self.resize(1200, 800)

        # Menu bar
        self.create_menu_bar()
        
        # Toolbar
        self.create_toolbar()

        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Layout principal
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(15, 15, 15, 15)

        # En-tête
        header_layout = QHBoxLayout()
        
        title_label = QLabel("🦉 Gestion des Chapitres")
        title_label.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #0056d2; margin-bottom: 5px;")
        header_layout.addWidget(title_label)
        
        header_layout.addStretch()
        
        # Boutons d'action principaux
        self.load_manifest_btn = QPushButton("📁 Charger Manifest")
        self.load_manifest_btn.clicked.connect(self.load_manifest)
        self.load_manifest_btn.setMinimumHeight(35)
        header_layout.addWidget(self.load_manifest_btn)
        
        self.import_chapters_btn = QPushButton("📚 Importer Chapitres")
        self.import_chapters_btn.clicked.connect(self.import_chapters)
        self.import_chapters_btn.setMinimumHeight(35)
        header_layout.addWidget(self.import_chapters_btn)
        
        main_layout.addLayout(header_layout)

        # Splitter pour diviser l'interface
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Zone de gestion des chapitres (gauche)
        chapters_widget = self.create_chapters_widget()
        splitter.addWidget(chapters_widget)
        
        # Zone d'informations (droite)
        info_widget = self.create_info_widget()
        splitter.addWidget(info_widget)
        
        splitter.setSizes([700, 300])
        main_layout.addWidget(splitter)

        # Barre de progression
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Prêt - Chargez un manifest ou importez des chapitres")

    def create_menu_bar(self):
        menubar = self.menuBar()
        
        # Menu Fichier
        file_menu = menubar.addMenu('Fichier')
        
        load_action = QAction('Charger Manifest', self)
        load_action.setShortcut('Ctrl+O')
        load_action.triggered.connect(self.load_manifest)
        file_menu.addAction(load_action)
        
        import_action = QAction('Importer Chapitres', self)
        import_action.setShortcut('Ctrl+I')
        import_action.triggered.connect(self.import_chapters)
        file_menu.addAction(import_action)
        
        file_menu.addSeparator()
        
        save_action = QAction('Sauvegarder Manifest', self)
        save_action.setShortcut('Ctrl+S')
        save_action.triggered.connect(self.save_manifest)
        file_menu.addAction(save_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction('Quitter', self)
        exit_action.setShortcut('Ctrl+Q')
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # Menu Aide
        help_menu = menubar.addMenu('Aide')
        about_action = QAction('À propos', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_toolbar(self):
        toolbar = QToolBar()
        self.addToolBar(toolbar)
        
        # Actions de la toolbar
        load_action = QAction('📁 Charger', self)
        load_action.triggered.connect(self.load_manifest)
        toolbar.addAction(load_action)
        
        import_action = QAction('📚 Importer', self)
        import_action.triggered.connect(self.import_chapters)
        toolbar.addAction(import_action)
        
        toolbar.addSeparator()
        
        save_action = QAction('💾 Sauvegarder', self)
        save_action.triggered.connect(self.save_manifest)
        toolbar.addAction(save_action)
        
        toolbar.addSeparator()
        
        refresh_action = QAction('🔄 Actualiser', self)
        refresh_action.triggered.connect(self.refresh_display)
        toolbar.addAction(refresh_action)

    def create_chapters_widget(self) -> QWidget:
        """Crée le widget de gestion des chapitres"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Titre
        title = QLabel("Chapitres Disponibles")
        title.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        title.setStyleSheet("color: #0056d2; margin-bottom: 10px;")
        layout.addWidget(title)
        
        # Zone de défilement pour les chapitres
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        self.chapters_container = QWidget()
        self.chapters_layout = QVBoxLayout(self.chapters_container)
        self.chapters_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        
        self.scroll_area.setWidget(self.chapters_container)
        layout.addWidget(self.scroll_area)
        
        return widget

    def create_info_widget(self) -> QWidget:
        """Crée le widget d'informations"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Onglets d'information
        self.info_tabs = QTabWidget()
        
        # Onglet Statistiques
        stats_widget = QWidget()
        stats_layout = QVBoxLayout(stats_widget)
        
        self.stats_label = QLabel("Aucune donnée")
        self.stats_label.setWordWrap(True)
        self.stats_label.setStyleSheet("padding: 10px; background-color: #f8f9fa; border-radius: 5px;")
        stats_layout.addWidget(self.stats_label)
        
        stats_layout.addStretch()
        self.info_tabs.addTab(stats_widget, "📊 Statistiques")
        
        # Onglet Actions
        actions_widget = QWidget()
        actions_layout = QVBoxLayout(actions_widget)
        
        # Boutons d'action
        self.select_all_btn = QPushButton("✅ Tout Sélectionner")
        self.select_all_btn.clicked.connect(self.select_all_chapters)
        actions_layout.addWidget(self.select_all_btn)
        
        self.deselect_all_btn = QPushButton("❌ Tout Désélectionner")
        self.deselect_all_btn.clicked.connect(self.deselect_all_chapters)
        actions_layout.addWidget(self.deselect_all_btn)
        
        actions_layout.addWidget(QLabel(""))  # Espaceur
        
        self.save_btn = QPushButton("💾 Sauvegarder Manifest")
        self.save_btn.clicked.connect(self.save_manifest)
        self.save_btn.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 5px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #218838;
            }
            QPushButton:pressed {
                background-color: #1e7e34;
            }
        """)
        actions_layout.addWidget(self.save_btn)
        
        actions_layout.addStretch()
        self.info_tabs.addTab(actions_widget, "⚡ Actions")
        
        layout.addWidget(self.info_tabs)
        
        return widget

    def setup_style(self):
        """Configure le style de l'application"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #ffffff;
            }
            QPushButton {
                background-color: #0056d2;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                font-weight: bold;
                min-width: 100px;
            }
            QPushButton:hover {
                background-color: #004494;
            }
            QPushButton:pressed {
                background-color: #003d82;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
                color: #0056d2;
            }
            QScrollArea {
                border: 1px solid #dee2e6;
                border-radius: 5px;
                background-color: #ffffff;
            }
            QTabWidget::pane {
                border: 1px solid #dee2e6;
                border-radius: 5px;
            }
            QTabBar::tab {
                background-color: #f8f9fa;
                padding: 8px 12px;
                margin-right: 2px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
            }
            QTabBar::tab:selected {
                background-color: #0056d2;
                color: white;
            }
        """)

    def load_initial_manifest(self):
        """Charge automatiquement le manifest.json s'il existe"""
        manifest_path = Path("public/manifest.json")
        if manifest_path.exists():
            self.manifest_path = str(manifest_path.absolute())
            self.load_manifest_file(self.manifest_path)

    def load_manifest(self):
        """Charge un fichier manifest.json"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Charger manifest.json", "", "JSON Files (*.json)"
        )
        if file_path:
            self.manifest_path = file_path
            self.load_manifest_file(file_path)

    def load_manifest_file(self, file_path: str):
        """Charge le contenu d'un fichier manifest"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            self.chapters_data.clear()
            
            # Déterminer le dossier des chapitres
            manifest_dir = os.path.dirname(file_path)
            self.chapters_dir = os.path.join(manifest_dir, 'chapters')
            
            for class_id, chapters in manifest.items():
                for item in chapters:
                    chapter_title = "(Titre à charger)"
                    
                    # Essayer de charger le titre depuis le fichier de chapitre
                    chapter_file_path = os.path.join(self.chapters_dir, item['file'])
                    if os.path.exists(chapter_file_path):
                        try:
                            with open(chapter_file_path, 'r', encoding='utf-8') as chapter_file:
                                chapter_content = json.load(chapter_file)
                                if 'chapter' in chapter_content:
                                    chapter_title = chapter_content['chapter']
                        except Exception as e:
                            print(f"Erreur lors du chargement du titre pour {item['file']}: {e}")
                    
                    chapter = ChapterData(
                        id=item['id'],
                        file=item['file'],
                        is_active=item.get('isActive', False),
                        class_type=class_id,
                        chapter=chapter_title
                    )
                    
                    # Charger les informations supplémentaires si disponibles
                    if os.path.exists(chapter_file_path):
                        try:
                            with open(chapter_file_path, 'r', encoding='utf-8') as chapter_file:
                                chapter_content = json.load(chapter_file)
                                if 'sessionDate' in chapter_content:
                                    chapter.session_date = chapter_content['sessionDate']
                                if 'quiz' in chapter_content:
                                    chapter.quiz_count = len(chapter_content['quiz'])
                                if 'exercises' in chapter_content:
                                    chapter.exercise_count = len(chapter_content['exercises'])
                        except Exception as e:
                            print(f"Erreur lors du chargement des détails pour {item['file']}: {e}")
                    
                    self.chapters_data[item['id']] = chapter
            
            self.is_dirty = False
            self.refresh_display()
            self.status_bar.showMessage(f"Manifest chargé: {len(self.chapters_data)} chapitres trouvés avec titres")
            
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de charger le manifest:\n{str(e)}")

    def import_chapters(self):
        """Importe des fichiers de chapitres"""
        files, _ = QFileDialog.getOpenFileNames(
            self, "Importer des chapitres", "", "JSON Files (*.json)"
        )
        if files:
            self.progress_bar.setVisible(True)
            self.progress_bar.setValue(0)
            
            self.file_processor = FileProcessor(files)
            self.file_processor.progress.connect(self.progress_bar.setValue)
            self.file_processor.finished.connect(self.on_chapters_imported)
            self.file_processor.error.connect(self.on_import_error)
            self.file_processor.start()

    def on_chapters_imported(self, new_chapters: Dict[str, ChapterData]):
        """Callback quand l'import des chapitres est terminé"""
        imported_count = 0
        for chapter_id, chapter_data in new_chapters.items():
            if chapter_id in self.chapters_data:
                # Mettre à jour les données existantes
                existing = self.chapters_data[chapter_id]
                existing.chapter = chapter_data.chapter
                existing.session_date = chapter_data.session_date
                existing.quiz_count = chapter_data.quiz_count
                existing.exercise_count = chapter_data.exercise_count
            else:
                # Ajouter nouveau chapitre
                self.chapters_data[chapter_id] = chapter_data
            imported_count += 1
        
        self.is_dirty = True
        self.progress_bar.setVisible(False)
        self.refresh_display()
        self.status_bar.showMessage(f"{imported_count} chapitre(s) importé(s) avec succès")

    def on_import_error(self, error_message: str):
        """Callback en cas d'erreur d'import"""
        self.progress_bar.setVisible(False)
        QMessageBox.critical(self, "Erreur d'import", f"Erreur lors de l'import:\n{error_message}")

    def refresh_display(self):
        """Actualise l'affichage des chapitres"""
        # Vider le conteneur
        for i in reversed(range(self.chapters_layout.count())):
            child = self.chapters_layout.itemAt(i).widget()
            if child:
                child.setParent(None)
        
        if not self.chapters_data:
            no_data_label = QLabel("Aucun chapitre disponible.\nChargez un manifest ou importez des chapitres.")
            no_data_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            no_data_label.setStyleSheet("color: #6c757d; padding: 20px; font-style: italic;")
            self.chapters_layout.addWidget(no_data_label)
            self.update_stats()
            return
        
        # Grouper par classe
        chapters_by_class = {}
        for chapter in self.chapters_data.values():
            if chapter.class_type not in chapters_by_class:
                chapters_by_class[chapter.class_type] = []
            chapters_by_class[chapter.class_type].append(chapter)
        
        # Afficher par classe
        for class_id in sorted(chapters_by_class.keys()):
            class_label = self.CLASS_LABELS.get(class_id, f"Classe: {class_id.upper()}")
            
            group_box = QGroupBox(class_label)
            group_layout = QVBoxLayout(group_box)
            
            # Trier les chapitres par nom
            chapters = sorted(chapters_by_class[class_id], key=lambda x: x.chapter)
            
            for chapter in chapters:
                chapter_widget = ChapterWidget(chapter)
                chapter_widget.toggled.connect(self.on_chapter_toggled)
                chapter_widget.edit_requested.connect(self.on_chapter_edit_requested)
                chapter_widget.delete_requested.connect(self.on_chapter_delete_requested)
                group_layout.addWidget(chapter_widget)
            
            self.chapters_layout.addWidget(group_box)
        
        self.update_stats()

    def update_stats(self):
        """Met à jour les statistiques affichées"""
        total_chapters = len(self.chapters_data)
        active_chapters = sum(1 for ch in self.chapters_data.values() if ch.is_active)
        
        stats_by_class = {}
        for chapter in self.chapters_data.values():
            if chapter.class_type not in stats_by_class:
                stats_by_class[chapter.class_type] = {'total': 0, 'active': 0}
            stats_by_class[chapter.class_type]['total'] += 1
            if chapter.is_active:
                stats_by_class[chapter.class_type]['active'] += 1
        
        stats_text = f"""<h3>📊 Statistiques Générales</h3>
        <p><strong>Total des chapitres:</strong> {total_chapters}</p>
        <p><strong>Chapitres actifs:</strong> {active_chapters}</p>
        <p><strong>Chapitres inactifs:</strong> {total_chapters - active_chapters}</p>
        
        <h4>Par classe:</h4>
        <ul>
        """
        
        for class_id, stats in stats_by_class.items():
            class_label = self.CLASS_LABELS.get(class_id, class_id.upper())
            stats_text += f"<li><strong>{class_label}:</strong> {stats['active']}/{stats['total']} actifs</li>"
        
        stats_text += "</ul>"
        
        if self.is_dirty:
            stats_text += "<p style='color: #dc3545;'><strong>⚠️ Modifications non sauvegardées</strong></p>"
        
        self.stats_label.setText(stats_text)

    def on_chapter_toggled(self, chapter_id: str, is_active: bool):
        """Callback quand un chapitre est activé/désactivé"""
        if chapter_id in self.chapters_data:
            self.chapters_data[chapter_id].is_active = is_active
            self.is_dirty = True
            self.update_stats()
    
    def on_chapter_edit_requested(self, chapter: ChapterData):
        """Ouvre le dialogue d'édition pour un chapitre"""
        if not self.chapters_dir or not os.path.exists(self.chapters_dir):
            QMessageBox.warning(self, "Erreur", "Le dossier des chapitres n'est pas accessible.")
            return
        
        dialog = ChapterEditDialog(chapter, self.chapters_dir, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            # Mettre à jour l'affichage
            self.is_dirty = True
            self.refresh_display()
            self.status_bar.showMessage(f"Chapitre '{chapter.chapter}' modifié avec succès")

    def on_chapter_delete_requested(self, chapter: ChapterData):
        """Supprime un chapitre après confirmation (avec option de supprimer le fichier)"""
        msg = QMessageBox(self)
        msg.setWindowTitle("Confirmer la suppression")
        msg.setIcon(QMessageBox.Icon.Warning)
        msg.setText(f"Voulez-vous supprimer le chapitre '{chapter.chapter}' ?")
        msg.setInformativeText("Cette action retirera le chapitre du manifest. Vous pouvez aussi supprimer le fichier source.")
        msg.setStandardButtons(QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        msg.setDefaultButton(QMessageBox.StandardButton.No)
        delete_file_checkbox = QCheckBox("Supprimer aussi le fichier du chapitre (.json)")
        msg.setCheckBox(delete_file_checkbox)
        result = msg.exec()

        if result == QMessageBox.StandardButton.Yes:
            file_deleted = False
            file_error = None
            if delete_file_checkbox.isChecked() and self.chapters_dir:
                chapter_path = os.path.join(self.chapters_dir, chapter.file)
                try:
                    if os.path.exists(chapter_path):
                        os.remove(chapter_path)
                        file_deleted = True
                except Exception as e:
                    file_error = str(e)
            
            # Retirer du manifest en mémoire
            if chapter.id in self.chapters_data:
                del self.chapters_data[chapter.id]
            
            self.is_dirty = True
            self.refresh_display()
            status = "Chapitre supprimé du manifest."
            if delete_file_checkbox.isChecked():
                if file_deleted:
                    status += " Fichier supprimé."
                else:
                    status += " Le fichier n'a pas pu être supprimé."
                    if file_error:
                        status += f" ({file_error})"
            self.status_bar.showMessage(status)

    def select_all_chapters(self):
        """Sélectionne tous les chapitres"""
        for chapter in self.chapters_data.values():
            chapter.is_active = True
        self.is_dirty = True
        self.refresh_display()

    def deselect_all_chapters(self):
        """Désélectionne tous les chapitres"""
        for chapter in self.chapters_data.values():
            chapter.is_active = False
        self.is_dirty = True
        self.refresh_display()

    def save_manifest(self):
        """Sauvegarde le manifest.json"""
        if not self.chapters_data:
            QMessageBox.warning(self, "Attention", "Aucun chapitre à sauvegarder.")
            return
        
        # Utiliser le chemin existant ou demander un nouveau
        if self.manifest_path and os.path.exists(os.path.dirname(self.manifest_path)):
            file_path = self.manifest_path
        else:
            file_path, _ = QFileDialog.getSaveFileName(
                self, "Sauvegarder manifest.json", "manifest.json", "JSON Files (*.json)"
            )
        
        if file_path:
            try:
                # Construire le manifest
                manifest = {}
                for chapter in self.chapters_data.values():
                    if chapter.class_type not in manifest:
                        manifest[chapter.class_type] = []
                    manifest[chapter.class_type].append(chapter.to_dict())
                
                # Trier pour la cohérence
                for class_id in manifest:
                    manifest[class_id].sort(key=lambda x: x['id'])
                
                # Sauvegarder
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(manifest, f, indent=2, ensure_ascii=False)
                
                self.is_dirty = False
                self.manifest_path = file_path
                self.update_stats()
                self.status_bar.showMessage(f"Manifest sauvegardé: {file_path}")
                
                QMessageBox.information(self, "Succès", f"Manifest sauvegardé avec succès:\n{file_path}")
                
            except Exception as e:
                QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder:\n{str(e)}")

    def show_about(self):
        """Affiche la boîte de dialogue À propos"""
        QMessageBox.about(self, "À propos", 
            "Application d'Administration - Gestion des Chapitres\n\n"
            "Version 1.0\n"
            "Remplace admin.html avec une interface PyQt6 professionnelle\n\n"
            "Fonctionnalités:\n"
            "• Chargement et modification du manifest.json\n"
            "• Import de chapitres en lot\n"
            "• Interface moderne et intuitive\n"
            "• Sauvegarde automatique des modifications")

    def closeEvent(self, event):
        """Gère la fermeture de l'application"""
        if self.is_dirty:
            reply = QMessageBox.question(
                self, "Modifications non sauvegardées",
                "Vous avez des modifications non sauvegardées.\nVoulez-vous sauvegarder avant de quitter?",
                QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel
            )
            
            if reply == QMessageBox.StandardButton.Save:
                self.save_manifest()
                event.accept()
            elif reply == QMessageBox.StandardButton.Discard:
                event.accept()
            else:
                event.ignore()
        else:
            event.accept()


def main():
    """Point d'entrée principal"""
    app = QApplication(sys.argv)
    app.setApplicationName("Gestion des Chapitres")
    app.setApplicationVersion("1.0")
    app.setOrganizationName("Plateforme Pédagogique")
    
    # Style moderne
    app.setStyle('Fusion')
    
    window = AdminApp()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()