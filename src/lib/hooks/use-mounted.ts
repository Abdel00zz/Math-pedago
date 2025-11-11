import { useEffect, useState } from 'react'

/**
 * Hook pour vérifier si le composant est monté (côté client)
 * Utile pour éviter les hydration mismatches
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
