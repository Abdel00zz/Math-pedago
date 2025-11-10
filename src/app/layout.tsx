import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'
import 'katex/dist/katex.min.css'

export const metadata: Metadata = {
  title: {
    default: 'Math-Pedago | Plateforme Éducative de Mathématiques',
    template: '%s | Math-Pedago',
  },
  description:
    'Plateforme éducative interactive pour l\'apprentissage des mathématiques - Leçons, Quiz, Exercices et Vidéos',
  keywords: [
    'mathématiques',
    'éducation',
    'apprentissage',
    'leçons',
    'quiz',
    'exercices',
    'vidéos',
    'Morocco',
    'Maroc',
  ],
  authors: [{ name: 'Math-Pedago Team' }],
  creator: 'Math-Pedago',
  publisher: 'Math-Pedago',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://math-pedago.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://math-pedago.com',
    title: 'Math-Pedago | Plateforme Éducative de Mathématiques',
    description:
      'Plateforme éducative interactive pour l\'apprentissage des mathématiques',
    siteName: 'Math-Pedago',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Math-Pedago | Plateforme Éducative de Mathématiques',
    description:
      'Plateforme éducative interactive pour l\'apprentissage des mathématiques',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
