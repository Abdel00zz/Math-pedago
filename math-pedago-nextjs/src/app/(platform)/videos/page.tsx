'use client'

import { AppHeader } from '@/components/layouts/app-header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Clock, Heart } from 'lucide-react'

export default function VideosPage() {
  const videos = [
    { id: '1', title: 'Introduction aux fonctions', duration: 420, views: 1250, favorite: false },
    { id: '2', title: 'Dérivées expliquées', duration: 600, views: 890, favorite: true },
    { id: '3', title: 'Intégrales pas à pas', duration: 720, views: 2100, favorite: false },
  ]

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Vidéos" description="Capsules vidéo explicatives" />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-primary/20 bg-gradient-to-br from-red-500/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-6 w-6 text-red-600" />
              Capsules vidéo
            </CardTitle>
            <CardDescription>
              Regardez des explications visuelles des concepts mathématiques
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                  {video.favorite && (
                    <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                  )}
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration)}
                  </span>
                  <span>{video.views} vues</span>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
