import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

/**
 * Hook pour détecter quand un élément entre dans le viewport
 * Utile pour lazy loading et animations
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const elementRef = useRef<T>(null)
  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    const element = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, root, rootMargin, frozen])

  return { ref: elementRef, entry, isIntersecting: entry?.isIntersecting ?? false }
}
