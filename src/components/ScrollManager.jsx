import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // getElementById, not querySelector: a hash like "#2024" is a valid id but
      // an invalid CSS selector, and querySelector throws on it.
      const raw = hash.slice(1)
      let id = raw
      try {
        id = decodeURIComponent(raw)
      } catch {
        id = raw
      }
      const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
      return () => cancelAnimationFrame(frame)
    }
    window.scrollTo(0, 0)
  }, [hash, pathname])

  return null
}
