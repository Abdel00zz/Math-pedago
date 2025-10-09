## Script PowerShell pour mettre à jour le dépôt Git
## Usage: ./update_commit.ps1 "Message de commit"

# Vérifier si un message de commit a été fourni
param (
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Amélioration de l'interface quiz: clignotement rouge pour les questions sans réponse"
)

# Afficher les fichiers modifiés
Write-Host "Fichiers modifiés:" -ForegroundColor Yellow
git status --short

# Ajouter tous les fichiers modifiés
Write-Host "`nAjout des fichiers au commit..." -ForegroundColor Cyan
git add .

# Créer le commit avec le message fourni
Write-Host "`nCréation du commit avec le message: $CommitMessage" -ForegroundColor Cyan
git commit -m "$CommitMessage"

# Pousser les changements vers le dépôt distant
Write-Host "`nPousser les changements vers le dépôt distant..." -ForegroundColor Cyan
git push origin main

Write-Host "`nMise à jour terminée!" -ForegroundColor Green