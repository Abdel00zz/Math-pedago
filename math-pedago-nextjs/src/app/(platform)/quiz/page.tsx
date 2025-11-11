'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Clock, Award } from 'lucide-react'
import type { Level } from '@/types'

export default function QuizPage() {
  // Placeholder data
  const quizzes = [
    { id: '1', title: 'Quiz Fonctions', level: 'TCS' as Level, questions: 10, duration: 15, difficulty: 'easy' as const },
    { id: '2', title: 'Quiz Dérivées', level: '1BSM' as Level, questions: 15, duration: 20, difficulty: 'medium' as const },
    { id: '3', title: 'Quiz Intégrales', level: '2BSM' as Level, questions: 20, duration: 30, difficulty: 'hard' as const },
  ]

  return (
    <div className="flex flex-col">
      <AppHeader title="Quiz" description="Testez vos connaissances" />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-primary/20 bg-gradient-to-br from-purple-500/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              Testez vos connaissances
            </CardTitle>
            <CardDescription>
              Choisissez un quiz pour évaluer votre compréhension des concepts mathématiques
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <Badge variant={quiz.difficulty === 'easy' ? 'secondary' : quiz.difficulty === 'medium' ? 'default' : 'destructive'}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    {quiz.questions} questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {quiz.duration} minutes
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Commencer</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
