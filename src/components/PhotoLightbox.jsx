import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PHOTO } from '../data/photo'

/**
 * Full-screen photo overlay.
 *
 * Rendered through a portal into <body> rather than in place: the sidebar is
 * position: sticky, which creates a stacking context, so an in-place overlay's
 * z-index would only apply inside the sidebar and page chrome such as the skip
 * link (z-index 100, a child of <body>) would paint on top of it.
 */
export default function PhotoLightbox({ open, onClose }) {
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(false)
  const closeRef = useRef(null)
  const returnFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)

  // Held in a ref so the open/close effect below does not depend on the
  // identity of the callback. The parent re-renders while the overlay is open
  // (the scroll spy feeds it props), and re-running that effect would recapture
  // the focus-return target as the close button and lose the real one.
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Drive enter/exit: mount immediately on open, keep mounted through the exit
  // transition on close so the animation can play both ways.
  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => setActive(true))
      return () => cancelAnimationFrame(id)
    }
    setActive(false)
    const timer = setTimeout(() => setMounted(false), 340)
    return () => clearTimeout(timer)
  }, [open])

  // While open: lock body scroll, close on Escape, hold focus inside the dialog,
  // make the rest of the page inert, and hand focus back to the trigger on exit.
  useEffect(() => {
    if (!mounted) return

    const root = document.getElementById('root')
    returnFocusRef.current = document.activeElement

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      // The dialog holds a single control, so Tab has nowhere else to go.
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (root) root.inert = true
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      // Clear inert before restoring focus, or the trigger cannot take it.
      if (root) root.inert = false
      const target = returnFocusRef.current
      returnFocusRef.current = null
      if (target instanceof HTMLElement && target.isConnected) target.focus()
    }
  }, [mounted])

  if (!mounted) return null

  return createPortal(
    <div
      className={`lightbox${active ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={PHOTO.alt}
      onClick={onClose}
    >
      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <img
        className="lightbox-img"
        src={PHOTO.src}
        alt={PHOTO.alt}
        width={PHOTO.width}
        height={PHOTO.height}
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  )
}
