@echo off
REM Script pour automatiser git add, commit et push

REM Afficher le répertoire actuel
echo Repertoire actuel: %CD%
echo.

REM Ajouter tous les fichiers modifiés
echo Ajout des fichiers...
git add .

REM Faire le commit avec le message "Travail fait"
echo Commit en cours...
git commit -m "Travail fait"

REM Pousser les changements
echo Push vers le depot distant...
git push

REM Vérifier si tout s'est bien passé
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Operation reussie !
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   Une erreur s'est produite
    echo ========================================
)

echo.
pause