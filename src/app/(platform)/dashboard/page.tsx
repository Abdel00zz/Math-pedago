'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProgressStore } from '@/store/use-progress-store'
import { BookOpen, Brain, FileText, Video, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function DashboardPage() {
  const { progress } = useProgressStore()

  const stats = [
    {
      title: 'Leçons complétées',
      value: progress.lessonsCompleted.length,
      icon: BookOpen,
      color: 'text-blue-600',
      href: ROUTES.LESSONS,
    },
    {
      title: 'Quiz terminés',
      value: progress.quizzesAttempted.length,
      icon: Brain,
      color: 'text-purple-600',
      href: ROUTES.QUIZ,
    },
    {
      title: 'Exercices réalisés',
      value: progress.exercisesCompleted.length,
      icon: FileText,
      color: 'text-green-600',
      href: ROUTES.EXERCISES,
    },
    {
      title: 'Vidéos visionnées',
      value: progress.videosWatched.length,
      icon: Video,
      color: 'text-red-600',
      href: ROUTES.VIDEOS,
    },
  ]

  const totalProgress = (
    (progress.lessonsCompleted.length +
      progress.quizzesAttempted.length +
      progress.exercisesCompleted.length +
      progress.videosWatched.length) /
    4
  ).toFixed(1)

  return (
    <div className="flex flex-col">
      <AppHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre progression"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenue sur Math-Pedago! 👋</CardTitle>
            <CardDescription>
              Continuez votre apprentissage des mathématiques avec nos ressources interactives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progression globale</span>
                <span className="text-muted-foreground">{totalProgress}%</span>
              </div>
              <Progress value={Number(totalProgress)} className="h-2" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">{progress.level}</Badge>
              <Badge variant="outline">{progress.totalPoints} points</Badge>
              <Badge variant="outline">{progress.achievements.length} récompenses</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    Cliquez pour voir plus
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Continuer une leçon
              </CardTitle>
              <CardDescription>
                Reprenez où vous vous êtes arrêté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={ROUTES.LESSONS}>
                  Voir les leçons
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Passer un quiz
              </CardTitle>
              <CardDescription>
                Testez vos connaissances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={ROUTES.QUIZ}>
                  Commencer un quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Voir ma progression
              </CardTitle>
              <CardDescription>
                Analytics et statistiques détaillées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href={ROUTES.PROGRESS}>
                  Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {progress.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Récompenses récentes</CardTitle>
              <CardDescription>
                Vos dernières réalisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {progress.achievements.slice(0, 5).map((achievement) => (
                  <Badge key={achievement.id} variant="secondary" className="gap-1">
                    <span>{achievement.icon}</span>
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
