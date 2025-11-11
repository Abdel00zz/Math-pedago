'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'
import { cn } from '@/lib/utils'

interface MathRendererProps {
  math: string
  displayMode?: boolean
  className?: string
}

/**
 * Composant optimisé pour le rendu de formules mathématiques avec KaTeX
 * Utilise useRef pour éviter les re-renders inutiles
 */
export function MathRenderer({ math, displayMode = false, className }: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      katex.render(math, containerRef.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#dc2626',
        strict: false,
      })
    } catch (error) {
      console.error('KaTeX rendering error:', error)
      if (containerRef.current) {
        containerRef.current.textContent = math
      }
    }
  }, [math, displayMode])

  return <span ref={containerRef} className={cn('katex-wrapper', className)} />
}

/**
 * Composant pour le rendu de texte contenant des formules LaTeX inline
 * Détecte automatiquement les formules entre $ ou $$
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g)

  return (
    <span className={cn('math-text', className)}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <MathRenderer
              key={index}
              math={part.slice(2, -2)}
              displayMode={true}
              className="my-2 block"
            />
          )
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <MathRenderer key={index} math={part.slice(1, -1)} displayMode={false} />
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
