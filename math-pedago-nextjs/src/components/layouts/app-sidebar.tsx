'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import {
  BookOpen,
  Brain,
  FileText,
  Video,
  TrendingUp,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Tableau de bord', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Leçons', href: ROUTES.LESSONS, icon: BookOpen },
  { name: 'Quiz', href: ROUTES.QUIZ, icon: Brain },
  { name: 'Exercices', href: ROUTES.EXERCISES, icon: FileText },
  { name: 'Vidéos', href: ROUTES.VIDEOS, icon: Video },
  { name: 'Progression', href: ROUTES.PROGRESS, icon: TrendingUp },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Brain className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold">Math-Pedago</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary font-medium'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}

        <Separator className="my-4" />

        <Link href={ROUTES.SETTINGS}>
          <Button
            variant={pathname === ROUTES.SETTINGS ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Settings className="mr-3 h-5 w-5" />
            Paramètres
          </Button>
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">v2.0.0</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
