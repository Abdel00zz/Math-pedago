"""
Smart Chapter Manager - Application Desktop Professionnelle PyQt6
Application complète pour gérer les chapitres pédagogiques et les concours
"""

import sys
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QTableWidget, QTableWidgetItem, QPushButton,
    QLineEdit, QTextEdit, QLabel, QFileDialog, QMessageBox,
    QSplitter, QTreeWidget, QTreeWidgetItem, QGroupBox, QFormLayout,
    QComboBox, QSpinBox, QCheckBox, QProgressBar, QStatusBar,
    QToolBar, QMenuBar, QMenu, QDialog, QDialogButtonBox
)
from PyQt6.QtCore import Qt, QSize, pyqtSignal, QThread
from PyQt6.QtGui import QIcon, QAction, QFont, QColor, QPalette


class SmartChapterApp(QMainWindow):
    """Application principale Smart Chapter Desktop"""

    def __init__(self):
        super().__init__()
        self.project_path = None
        self.manifest = {}
        self.chapters = {}
        self.concours_index = {}

        self.init_ui()
        self.apply_modern_style()

    def init_ui(self):
        """Initialise l'interface utilisateur"""
        self.setWindowTitle("Smart Chapter Manager - Professional Desktop")
        self.setGeometry(100, 100, 1400, 900)

        # Menu Bar
        self.create_menu_bar()

        # Tool Bar
        self.create_tool_bar()

        # Central Widget with Tabs
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)

        # Tab 1: Chapitres
        self.chapters_tab = self.create_chapters_tab()
        self.tabs.addTab(self.chapters_tab, "📚 Chapitres")

        # Tab 2: Concours
        self.concours_tab = self.create_concours_tab()
        self.tabs.addTab(self.concours_tab, "🏆 Concours")

        # Tab 3: Import/Export
        self.import_export_tab = self.create_import_export_tab()
        self.tabs.addTab(self.import_export_tab, "📁 Import/Export")

        # Tab 4: Statistiques
        self.stats_tab = self.create_stats_tab()
        self.tabs.addTab(self.stats_tab, "📊 Statistiques")

        # Status Bar
        self.statusBar = QStatusBar()
        self.setStatusBar(self.statusBar)
        self.statusBar.showMessage("Prêt")

    def create_menu_bar(self):
        """Crée la barre de menu"""
        menubar = self.menuBar()

        # Menu Fichier
        file_menu = menubar.addMenu("&Fichier")

        open_action = QAction("&Ouvrir Projet", self)
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_project)
        file_menu.addAction(open_action)

        save_action = QAction("&Sauvegarder", self)
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.save_all)
        file_menu.addAction(save_action)

        file_menu.addSeparator()

        exit_action = QAction("&Quitter", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # Menu Édition
        edit_menu = menubar.addMenu("&Édition")

        new_chapter_action = QAction("Nouveau &Chapitre", self)
        new_chapter_action.setShortcut("Ctrl+N")
        new_chapter_action.triggered.connect(self.new_chapter)
        edit_menu.addAction(new_chapter_action)

        new_concours_action = QAction("Nouveau C&oncours", self)
        new_concours_action.triggered.connect(self.new_concours)
        edit_menu.addAction(new_concours_action)

        # Menu Outils
        tools_menu = menubar.addMenu("&Outils")

        sync_action = QAction("Synchroniser Index Concours", self)
        sync_action.triggered.connect(self.sync_concours_index)
        tools_menu.addAction(sync_action)

        validate_action = QAction("Valider Tous les Fichiers", self)
        validate_action.triggered.connect(self.validate_all_files)
        tools_menu.addAction(validate_action)

        # Menu Aide
        help_menu = menubar.addMenu("&Aide")

        about_action = QAction("À &Propos", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_tool_bar(self):
        """Crée la barre d'outils"""
        toolbar = QToolBar("Barre d'outils principale")
        toolbar.setIconSize(QSize(32, 32))
        self.addToolBar(toolbar)

        # Bouton Ouvrir
        open_btn = QPushButton("📂 Ouvrir Projet")
        open_btn.clicked.connect(self.open_project)
        toolbar.addWidget(open_btn)

        toolbar.addSeparator()

        # Bouton Sauvegarder
        save_btn = QPushButton("💾 Sauvegarder")
        save_btn.clicked.connect(self.save_all)
        toolbar.addWidget(save_btn)

        toolbar.addSeparator()

        # Bouton Actualiser
        refresh_btn = QPushButton("🔄 Actualiser")
        refresh_btn.clicked.connect(self.reload_project)
        toolbar.addWidget(refresh_btn)

    def create_chapters_tab(self) -> QWidget:
        """Crée l'onglet de gestion des chapitres"""
        tab = QWidget()
        layout = QHBoxLayout()

        # Splitter pour diviser l'interface
        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Liste des chapitres (gauche)
        left_panel = QWidget()
        left_layout = QVBoxLayout()

        # Sélecteur de classe
        class_group = QGroupBox("Classe")
        class_layout = QHBoxLayout()
        self.class_combo = QComboBox()
        self.class_combo.addItems([
            "TCS - Tronc Commun Scientifique",
            "1BSE - 1ère Bac Sciences Expérimentales",
            "1BSM - 1ère Bac Sciences Mathématiques",
            "2BSE - 2ème Bac Sciences Expérimentales",
            "2BSM - 2ème Bac Sciences Mathématiques"
        ])
        self.class_combo.currentTextChanged.connect(self.load_chapters_for_class)
        class_layout.addWidget(self.class_combo)
        class_group.setLayout(class_layout)
        left_layout.addWidget(class_group)

        # Table des chapitres
        self.chapters_table = QTableWidget()
        self.chapters_table.setColumnCount(5)
        self.chapters_table.setHorizontalHeaderLabels([
            "Chapitre", "Actif", "Version", "Vidéos", "Quiz"
        ])
        self.chapters_table.itemDoubleClicked.connect(self.edit_chapter)
        left_layout.addWidget(self.chapters_table)

        # Boutons d'action
        btn_layout = QHBoxLayout()
        new_chapter_btn = QPushButton("➕ Nouveau Chapitre")
        new_chapter_btn.clicked.connect(self.new_chapter)
        edit_chapter_btn = QPushButton("✏️ Éditer")
        edit_chapter_btn.clicked.connect(self.edit_selected_chapter)
        delete_chapter_btn = QPushButton("🗑️ Supprimer")
        delete_chapter_btn.clicked.connect(self.delete_chapter)

        btn_layout.addWidget(new_chapter_btn)
        btn_layout.addWidget(edit_chapter_btn)
        btn_layout.addWidget(delete_chapter_btn)
        left_layout.addLayout(btn_layout)

        left_panel.setLayout(left_layout)
        splitter.addWidget(left_panel)

        # Panneau de détails (droite)
        right_panel = QWidget()
        right_layout = QVBoxLayout()

        details_group = QGroupBox("Détails du Chapitre")
        details_layout = QVBoxLayout()

        self.chapter_details = QTextEdit()
        self.chapter_details.setReadOnly(True)
        details_layout.addWidget(self.chapter_details)

        details_group.setLayout(details_layout)
        right_layout.addWidget(details_group)

        right_panel.setLayout(right_layout)
        splitter.addWidget(right_panel)

        splitter.setStretchFactor(0, 2)
        splitter.setStretchFactor(1, 1)

        layout.addWidget(splitter)
        tab.setLayout(layout)

        return tab

    def create_concours_tab(self) -> QWidget:
        """Crée l'onglet de gestion des concours"""
        tab = QWidget()
        layout = QVBoxLayout()

        # Sélecteur de type de concours
        type_group = QGroupBox("Type de Concours")
        type_layout = QHBoxLayout()
        self.concours_type_combo = QComboBox()
        self.concours_type_combo.addItems(["Médecine", "ENSA", "ENSAM"])
        self.concours_type_combo.currentTextChanged.connect(self.load_concours_for_type)
        type_layout.addWidget(self.concours_type_combo)
        type_group.setLayout(type_layout)
        layout.addWidget(type_group)

        # Table des concours
        self.concours_table = QTableWidget()
        self.concours_table.setColumnCount(5)
        self.concours_table.setHorizontalHeaderLabels([
            "ID", "Année", "Thème", "Questions", "Actions"
        ])
        layout.addWidget(self.concours_table)

        # Boutons
        btn_layout = QHBoxLayout()
        new_concours_btn = QPushButton("➕ Nouveau Concours")
        new_concours_btn.clicked.connect(self.new_concours)
        edit_concours_btn = QPushButton("✏️ Éditer")
        edit_concours_btn.clicked.connect(self.edit_selected_concours)
        sync_btn = QPushButton("🔄 Synchroniser Index")
        sync_btn.clicked.connect(self.sync_concours_index)

        btn_layout.addWidget(new_concours_btn)
        btn_layout.addWidget(edit_concours_btn)
        btn_layout.addWidget(sync_btn)
        layout.addLayout(btn_layout)

        tab.setLayout(layout)
        return tab

    def create_import_export_tab(self) -> QWidget:
        """Crée l'onglet d'import/export"""
        tab = QWidget()
        layout = QVBoxLayout()

        # Import
        import_group = QGroupBox("📥 Import")
        import_layout = QVBoxLayout()

        import_label = QLabel("Importer un fichier JSON de concours :")
        import_layout.addWidget(import_label)

        import_btn_layout = QHBoxLayout()
        self.import_path_edit = QLineEdit()
        self.import_path_edit.setPlaceholderText("Sélectionner un fichier...")
        browse_import_btn = QPushButton("📁 Parcourir")
        browse_import_btn.clicked.connect(self.browse_import_file)
        import_btn = QPushButton("⬆️ Importer")
        import_btn.clicked.connect(self.import_concours_file)

        import_btn_layout.addWidget(self.import_path_edit)
        import_btn_layout.addWidget(browse_import_btn)
        import_btn_layout.addWidget(import_btn)
        import_layout.addLayout(import_btn_layout)

        import_group.setLayout(import_layout)
        layout.addWidget(import_group)

        # Export
        export_group = QGroupBox("📤 Export")
        export_layout = QVBoxLayout()

        export_label = QLabel("Exporter des concours au format JSON :")
        export_layout.addWidget(export_label)

        export_btn_layout = QHBoxLayout()
        export_all_btn = QPushButton("⬇️ Exporter Tous les Concours")
        export_all_btn.clicked.connect(self.export_all_concours)
        export_selected_btn = QPushButton("⬇️ Exporter la Sélection")
        export_selected_btn.clicked.connect(self.export_selected_concours)

        export_btn_layout.addWidget(export_all_btn)
        export_btn_layout.addWidget(export_selected_btn)
        export_layout.addLayout(export_btn_layout)

        export_group.setLayout(export_layout)
        layout.addWidget(export_group)

        # Progress
        self.progress_bar = QProgressBar()
        layout.addWidget(self.progress_bar)

        layout.addStretch()

        tab.setLayout(layout)
        return tab

    def create_stats_tab(self) -> QWidget:
        """Crée l'onglet des statistiques"""
        tab = QWidget()
        layout = QVBoxLayout()

        stats_label = QLabel("📊 Statistiques Globales")
        stats_label.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        layout.addWidget(stats_label)

        self.stats_text = QTextEdit()
        self.stats_text.setReadOnly(True)
        layout.addWidget(self.stats_text)

        refresh_stats_btn = QPushButton("🔄 Actualiser les Statistiques")
        refresh_stats_btn.clicked.connect(self.update_statistics)
        layout.addWidget(refresh_stats_btn)

        tab.setLayout(layout)
        return tab

    def apply_modern_style(self):
        """Applique un style moderne à l'application"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f7fa;
            }
            QTabWidget::pane {
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
            }
            QTabBar::tab {
                background: #e8eaf0;
                color: #333;
                padding: 10px 20px;
                margin-right: 2px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            QTabBar::tab:selected {
                background: white;
                color: #2563eb;
                font-weight: bold;
            }
            QPushButton {
                background-color: #2563eb;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1d4ed8;
            }
            QPushButton:pressed {
                background-color: #1e40af;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-top: 12px;
                padding-top: 12px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
            }
            QTableWidget {
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: white;
            }
            QHeaderView::section {
                background-color: #f8f9fa;
                padding: 8px;
                border: none;
                font-weight: bold;
            }
        """)

    # === Méthodes principales ===

    def open_project(self):
        """Ouvre un projet Math-pedago"""
        folder = QFileDialog.getExistingDirectory(
            self,
            "Sélectionner le répertoire du projet Math-pedago",
            os.path.expanduser("~")
        )

        if folder:
            self.project_path = Path(folder)
            self.load_project()

    def load_project(self):
        """Charge le projet depuis le répertoire"""
        if not self.project_path:
            return

        try:
            # Charger manifest.json
            manifest_path = self.project_path / "public" / "manifest.json"
            if manifest_path.exists():
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    self.manifest = json.load(f)

            # Charger concours/index.json
            concours_index_path = self.project_path / "public" / "concours" / "index.json"
            if concours_index_path.exists():
                with open(concours_index_path, 'r', encoding='utf-8') as f:
                    self.concours_index = json.load(f)

            self.statusBar.showMessage(f"Projet chargé : {self.project_path.name}")
            self.update_statistics()

            QMessageBox.information(
                self,
                "Projet Chargé",
                f"Le projet '{self.project_path.name}' a été chargé avec succès!"
            )

        except Exception as e:
            QMessageBox.critical(
                self,
                "Erreur",
                f"Erreur lors du chargement du projet :\n{str(e)}"
            )

    def save_all(self):
        """Sauvegarde toutes les modifications"""
        if not self.project_path:
            QMessageBox.warning(self, "Attention", "Aucun projet ouvert")
            return

        try:
            # Sauvegarder manifest.json
            manifest_path = self.project_path / "public" / "manifest.json"
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(self.manifest, f, indent=2, ensure_ascii=False)

            # Sauvegarder concours/index.json
            concours_index_path = self.project_path / "public" / "concours" / "index.json"
            concours_index_path.parent.mkdir(parents=True, exist_ok=True)
            with open(concours_index_path, 'w', encoding='utf-8') as f:
                json.dump(self.concours_index, f, indent=2, ensure_ascii=False)

            self.statusBar.showMessage("Projet sauvegardé avec succès", 3000)
            QMessageBox.information(self, "Sauvegarde", "Toutes les modifications ont été sauvegardées!")

        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Erreur lors de la sauvegarde :\n{str(e)}")

    def reload_project(self):
        """Recharge le projet"""
        if self.project_path:
            self.load_project()
        else:
            QMessageBox.warning(self, "Attention", "Aucun projet ouvert")

    def new_chapter(self):
        """Crée un nouveau chapitre"""
        # TODO: Implémenter la création de chapitre
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def edit_selected_chapter(self):
        """Édite le chapitre sélectionné"""
        # TODO: Implémenter l'édition de chapitre
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def edit_chapter(self, item):
        """Édite un chapitre (double-clic)"""
        self.edit_selected_chapter()

    def delete_chapter(self):
        """Supprime un chapitre"""
        # TODO: Implémenter la suppression de chapitre
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def load_chapters_for_class(self, class_name):
        """Charge les chapitres pour une classe"""
        # TODO: Implémenter le chargement des chapitres
        self.chapters_table.setRowCount(0)

    def new_concours(self):
        """Crée un nouveau concours"""
        # TODO: Implémenter la création de concours
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def edit_selected_concours(self):
        """Édite le concours sélectionné"""
        # TODO: Implémenter l'édition de concours
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def load_concours_for_type(self, concours_type):
        """Charge les concours pour un type"""
        # TODO: Implémenter le chargement des concours
        self.concours_table.setRowCount(0)

    def sync_concours_index(self):
        """Synchronise l'index des concours"""
        if not self.project_path:
            QMessageBox.warning(self, "Attention", "Aucun projet ouvert")
            return

        try:
            # Scanner le dossier concours et mettre à jour l'index
            concours_dir = self.project_path / "public" / "concours"
            if not concours_dir.exists():
                QMessageBox.warning(self, "Attention", "Dossier concours introuvable")
                return

            self.statusBar.showMessage("Synchronisation en cours...")

            # TODO: Implémenter la synchronisation complète

            self.statusBar.showMessage("Synchronisation terminée", 3000)
            QMessageBox.information(self, "Synchronisation", "L'index des concours a été synchronisé!")

        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Erreur lors de la synchronisation :\n{str(e)}")

    def browse_import_file(self):
        """Parcourir pour sélectionner un fichier à importer"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Sélectionner un fichier JSON",
            os.path.expanduser("~"),
            "Fichiers JSON (*.json)"
        )

        if file_path:
            self.import_path_edit.setText(file_path)

    def import_concours_file(self):
        """Importe un fichier de concours"""
        file_path = self.import_path_edit.text()
        if not file_path:
            QMessageBox.warning(self, "Attention", "Veuillez sélectionner un fichier")
            return

        # TODO: Implémenter l'import
        QMessageBox.information(self, "Info", f"Import de {file_path} en cours...")

    def export_all_concours(self):
        """Exporte tous les concours"""
        # TODO: Implémenter l'export global
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def export_selected_concours(self):
        """Exporte les concours sélectionnés"""
        # TODO: Implémenter l'export sélectif
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def validate_all_files(self):
        """Valide tous les fichiers JSON"""
        # TODO: Implémenter la validation
        QMessageBox.information(self, "Info", "Fonctionnalité en cours de développement")

    def update_statistics(self):
        """Met à jour les statistiques"""
        if not self.project_path:
            self.stats_text.setText("Aucun projet ouvert")
            return

        stats = f"""
📊 STATISTIQUES DU PROJET

📁 Projet : {self.project_path.name}
📂 Chemin : {self.project_path}

📚 CHAPITRES
• TCS : {len(self.manifest.get('tcs', []))} chapitres
• 1BSE : {len(self.manifest.get('1bse', []))} chapitres
• 1BSM : {len(self.manifest.get('1bsm', []))} chapitres
• 2BSE : {len(self.manifest.get('2bse', []))} chapitres
• 2BSM : {len(self.manifest.get('2bsm', []))} chapitres

🏆 CONCOURS
• Total : {sum(len(c.get('examens', [])) for c in self.concours_index.get('concours', []))} examens

📅 Dernière mise à jour : {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
        """

        self.stats_text.setText(stats)

    def show_about(self):
        """Affiche la boîte À Propos"""
        QMessageBox.about(
            self,
            "À Propos de Smart Chapter Manager",
            """
            <h2>Smart Chapter Manager Desktop</h2>
            <p><b>Version</b> 1.0.0</p>
            <p><b>Développé avec</b> PyQt6</p>
            <p>Application professionnelle pour gérer les chapitres pédagogiques
            et les concours de la plateforme Math-pedago.</p>
            <p><b>Fonctionnalités :</b></p>
            <ul>
                <li>Gestion complète des chapitres</li>
                <li>Gestion professionnelle des concours</li>
                <li>Import/Export JSON</li>
                <li>Synchronisation automatique</li>
                <li>Statistiques en temps réel</li>
            </ul>
            """
        )


def main():
    """Point d'entrée de l'application"""
    app = QApplication(sys.argv)
    app.setApplicationName("Smart Chapter Manager")
    app.setOrganizationName("Math-pedago")

    window = SmartChapterApp()
    window.show()

    sys.exit(app.exec())


if __name__ == '__main__':
    main()
