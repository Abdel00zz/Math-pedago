@echo off
echo ========================================
echo   Application d'Administration
echo   Gestion des Chapitres
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installé ou pas dans le PATH
    echo Veuillez installer Python depuis https://python.org
    pause
    exit /b 1
)

echo Vérification des dépendances...
pip show PyQt6 >nul 2>&1
if errorlevel 1 (
    echo Installation des dépendances PyQt6...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERREUR: Impossible d'installer les dépendances
        pause
        exit /b 1
    )
)

echo Lancement de l'application...
echo.
python admin_app.py

if errorlevel 1 (
    echo.
    echo ERREUR: L'application s'est fermée avec une erreur
    pause
)