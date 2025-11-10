'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Star } from 'lucide-react'

export default function ExercisesPage() {
  const exercises = [
    { id: '1', title: 'Exercices sur les fonctions', difficulty: 'easy' as const, questions: 5, completed: false },
    { id: '2', title: 'Problèmes de dérivation', difficulty: 'medium' as const, questions: 8, completed: false },
    { id: '3', title: 'Applications des intégrales', difficulty: 'hard' as const, questions: 12, completed: false },
  ]

  return (
    <div className="flex flex-col">
      <AppHeader title="Exercices" description="Pratiquez avec des exercices guidés" />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-primary/20 bg-gradient-to-br from-green-500/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Exercices pratiques
            </CardTitle>
            <CardDescription>
              Résolvez des exercices avec indices et feedback détaillé
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-5 w-5 text-green-600" />
                  <Badge variant={exercise.difficulty === 'easy' ? 'secondary' : exercise.difficulty === 'medium' ? 'default' : 'destructive'}>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{exercise.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  {exercise.questions} sous-questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant={exercise.completed ? 'outline' : 'default'}>
                  {exercise.completed ? 'Réviser' : 'Commencer'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
