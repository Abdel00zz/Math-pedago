import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpen,
  Brain,
  FileText,
  Video,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Nouvelle plateforme ultra-moderne
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Apprenez les mathématiques
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {' '}
                de manière interactive
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Une plateforme complète pour maîtriser les mathématiques avec des leçons,
              quiz, exercices et vidéos adaptés au curriculum marocain.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">En savoir plus</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 transform">
            <div className="h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground">
              Une plateforme complète pour votre réussite en mathématiques
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={BookOpen}
              title="Leçons interactives"
              description="Des leçons détaillées avec rendu mathématique LaTeX, table des matières interactive et suivi de progression."
              href="/lessons"
            />
            <FeatureCard
              icon={Brain}
              title="Quiz intelligents"
              description="Questions à choix multiples et exercices d'ordonnancement avec feedback instantané et système de scoring."
              href="/quiz"
            />
            <FeatureCard
              icon={FileText}
              title="Exercices pratiques"
              description="Exercices hiérarchiques avec sous-questions, indices contextuels et feedback à plusieurs niveaux."
              href="/exercises"
            />
            <FeatureCard
              icon={Video}
              title="Capsules vidéo"
              description="Intégration YouTube avec suivi de progression et système de favoris pour revoir les concepts clés."
              href="/videos"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Suivi de progression"
              description="Analytics détaillés, graphiques de progression et système de récompenses pour rester motivé."
              href="/progress"
            />
            <FeatureCard
              icon={Sparkles}
              title="Mode sombre"
              description="Interface moderne avec support du mode sombre, animations fluides et design responsive."
              href="/settings"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Prêt à commencer ?</CardTitle>
              <CardDescription className="text-lg">
                Rejoignez des milliers d'étudiants qui progressent en mathématiques
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Accéder au tableau de bord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construit avec Next.js 15, shadcn/ui et les meilleures technologies modernes.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Math-Pedago. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
}

function FeatureCard({ icon: Icon, title, description, href }: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
