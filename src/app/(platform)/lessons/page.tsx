'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LEVELS, LEVEL_LABELS, LEVEL_COLORS } from '@/lib/constants/levels'
import { BookOpen, Search, Clock, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { Level } from '@/types'

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<Level>('TCS')

  // Placeholder data - will be replaced with real data
  const lessons = [
    { id: '1', title: 'Introduction aux fonctions', level: 'TCS' as Level, duration: 45, completed: true },
    { id: '2', title: 'Dérivées et applications', level: 'TCS' as Level, duration: 60, completed: false },
    { id: '3', title: 'Intégrales', level: '1BSM' as Level, duration: 75, completed: false },
  ]

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.level === selectedLevel &&
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <AppHeader title="Leçons" description="Explorez les cours de mathématiques" />

      <div className="flex-1 space-y-6 p-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une leçon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Level Tabs */}
        <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as Level)}>
          <TabsList className="grid w-full grid-cols-6">
            {LEVELS.map((level) => (
              <TabsTrigger key={level} value={level}>
                {level}
              </TabsTrigger>
            ))}
          </TabsList>

          {LEVELS.map((level) => (
            <TabsContent key={level} value={level} className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">{LEVEL_LABELS[level]}</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredLessons.length} leçon(s) disponible(s)
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {lesson.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {lesson.duration} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge className={LEVEL_COLORS[lesson.level]}>
                        {lesson.level}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredLessons.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">Aucune leçon trouvée</p>
                    <p className="text-sm text-muted-foreground">
                      Essayez de modifier votre recherche
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
