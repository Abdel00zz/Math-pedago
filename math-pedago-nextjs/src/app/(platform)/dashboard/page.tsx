'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useProgressStore } from '@/store/use-progress-store'
import { BookOpen, Brain, FileText, Video, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { DashboardSkeleton } from '@/components/shared/skeletons'
import { useMounted } from '@/lib/hooks/use-mounted'

// Variants d'animation pour les cartes
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
}

function DashboardContent() {
  const mounted = useMounted()
  const { progress } = useProgressStore()

  const stats = [
    {
      title: 'Leçons complétées',
      value: progress.lessonsCompleted.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      href: ROUTES.LESSONS,
      tooltip: 'Voir toutes les leçons disponibles',
    },
    {
      title: 'Quiz terminés',
      value: progress.quizzesAttempted.length,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      href: ROUTES.QUIZ,
      tooltip: 'Testez vos connaissances',
    },
    {
      title: 'Exercices réalisés',
      value: progress.exercisesCompleted.length,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      href: ROUTES.EXERCISES,
      tooltip: 'Pratiquez avec des exercices',
    },
    {
      title: 'Vidéos visionnées',
      value: progress.videosWatched.length,
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      href: ROUTES.VIDEOS,
      tooltip: 'Regardez des capsules vidéo',
    },
  ]

  const totalProgress = (
    (progress.lessonsCompleted.length +
      progress.quizzesAttempted.length +
      progress.exercisesCompleted.length +
      progress.videosWatched.length) /
    4
  ).toFixed(1)

  // Afficher le skeleton jusqu'à ce que le composant soit monté
  if (!mounted) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Tableau de bord" description="Vue d'ensemble de votre progression" />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Card avec animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)]" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-2xl">
                Bienvenue sur Math-Pedago!
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </CardTitle>
              <CardDescription className="text-base">
                Continuez votre apprentissage des mathématiques avec nos ressources interactives
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progression globale</span>
                  <span className="text-muted-foreground font-semibold">{totalProgress}%</span>
                </div>
                <Progress value={Number(totalProgress)} className="h-3" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {progress.level}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {progress.totalPoints} points
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {progress.achievements.length} récompenses
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid avec animations */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={stat.href} className="block h-full">
                    <Card className="group h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor} transition-transform group-hover:scale-110`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          Cliquez pour explorer
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stat.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions avec animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Continuer une leçon
                </CardTitle>
                <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:shadow-md transition-shadow">
                  <Link href={ROUTES.LESSONS}>
                    Voir les leçons
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Passer un quiz
                </CardTitle>
                <CardDescription>Testez vos connaissances</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:shadow-md transition-shadow">
                  <Link href={ROUTES.QUIZ}>
                    Commencer un quiz
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Voir ma progression
                </CardTitle>
                <CardDescription>Analytics et statistiques détaillées</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href={ROUTES.PROGRESS}>
                    Analytics
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Recent Achievements avec animation */}
        {progress.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Récompenses récentes
                </CardTitle>
                <CardDescription>Vos dernières réalisations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {progress.achievements.slice(0, 5).map((achievement, i) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <span>{achievement.icon}</span>
                        {achievement.title}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  )
}
