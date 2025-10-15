@echo off
echo ================================================
echo   NETTOYAGE DU CACHE SERVICE WORKER
echo ================================================
echo.
echo Ce script va forcer le rechargement du Service Worker
echo.

REM Ouvrir Chrome avec le cache désactivé
echo Ouverture de Chrome sans cache...
start chrome --disable-cache --hard-reset http://localhost:3000

echo.
echo ================================================
echo   Instructions:
echo ================================================
echo 1. Appuyez sur F12 pour ouvrir DevTools
echo 2. Allez dans l'onglet "Application"
echo 3. Section "Service Workers" à gauche
echo 4. Cliquez sur "Unregister"
echo 5. Rafraîchissez la page (Ctrl+Shift+R)
echo ================================================
echo.
pause
