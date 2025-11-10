'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/use-settings-store'
import { useProgressStore } from '@/store/use-progress-store'
import { Settings as SettingsIcon, Download } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { settings } = useSettingsStore()
  const { progress, reset: resetProgress } = useProgressStore()

  const handleExportData = () => {
    const data = {
      progress,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `math-pedago-data-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Paramètres" description="Gérez vos préférences" />

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Préférences
            </CardTitle>
            <CardDescription>
              Personnalisez votre expérience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Thème</Label>
                <p className="text-sm text-muted-foreground">
                  Actuel: {settings.theme}
                </p>
              </div>

              <Separator />

              <div>
                <Label>Langue</Label>
                <p className="text-sm text-muted-foreground">
                  Actuel: {settings.language}
                </p>
              </div>

              <Separator />

              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.notifications ? 'Activées' : 'Désactivées'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données</CardTitle>
            <CardDescription>
              Gérez vos données de progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exporter les données</p>
                <p className="text-sm text-muted-foreground">
                  Téléchargez vos données au format JSON
                </p>
              </div>
              <Button onClick={handleExportData} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Réinitialiser la progression</p>
                <p className="text-sm text-muted-foreground">
                  Supprimer toutes vos données de progression
                </p>
              </div>
              <Button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression?')) {
                    resetProgress()
                  }
                }}
                variant="destructive"
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Version:</strong> 2.0.0
            </p>
            <p className="text-sm">
              <strong>Plateforme:</strong> Next.js 15 + React 19
            </p>
            <p className="text-sm">
              <strong>UI:</strong> shadcn/ui + Radix UI
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
