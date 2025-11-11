'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useProgressStore } from '@/store/use-progress-store'
import { TrendingUp, Award, BookOpen, Brain, FileText, Video } from 'lucide-react'

export default function ProgressPage() {
  const { progress } = useProgressStore()

  const stats = [
    { label: 'Leçons', value: progress.lessonsCompleted.length, total: 50, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Quiz', value: progress.quizzesAttempted.length, total: 30, icon: Brain, color: 'text-purple-600' },
    { label: 'Exercices', value: progress.exercisesCompleted.length, total: 40, icon: FileText, color: 'text-green-600' },
    { label: 'Vidéos', value: progress.videosWatched.length, total: 25, icon: Video, color: 'text-red-600' },
  ]

  return (
    <div className="flex flex-col">
      <AppHeader title="Progression" description="Suivez vos progrès et statistiques" />

      <div className="flex-1 space-y-6 p-6">
        {/* Summary Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Vue d'ensemble
            </CardTitle>
            <CardDescription>
              Vos statistiques globales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{progress.totalPoints} points</span>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {progress.level}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                <Award className="mr-1 h-3 w-3" />
                {progress.achievements.length} récompenses
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress by Category */}
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                </div>
                <Progress value={(stat.value / stat.total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round((stat.value / stat.total) * 100)}% complété
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Récompenses débloquées
            </CardTitle>
            <CardDescription>
              Vos accomplissements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progress.achievements.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Continuez à apprendre pour débloquer des récompenses!
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {progress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
