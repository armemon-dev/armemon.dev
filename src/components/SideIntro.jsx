import { useState } from 'react'
import { PHOTO } from '../data/photo'
import { sections } from '../data/sections'
import Icon from './Icon'
import PhotoLightbox from './PhotoLightbox'

export default function SideIntro({ activeSection = 'about', onNavigate }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <header className="side-intro">
      <div className="side-intro-top">
        <figure className="ph-ring">
          <button
            type="button"
            className="ph-ring-photo"
            onClick={() => setLightboxOpen(true)}
            aria-label="View photo full screen"
            title="View full screen"
          >
            <img src={PHOTO.src} alt={PHOTO.alt} width={PHOTO.width} height={PHOTO.height} fetchpriority="high" decoding="async" />
            <span className="ph-ring-zoom" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </span>
          </button>
          <figcaption className="ph-ring-handle">ARMEMON</figcaption>
        </figure>
        <a className="identity" href="#about" onClick={() => onNavigate?.('about')}>
          <h1>Ahmed Raza Memon</h1>
          <h2>Product Developer</h2>
        </a>

        <nav className="section-nav" aria-label="Page sections">
          {sections.map(({ id, label }) => (
            <a
              className={activeSection === id ? 'active' : ''}
              href={`#${id}`}
              key={id}
              aria-current={activeSection === id ? 'true' : undefined}
              onClick={() => onNavigate?.(id)}
            >
              <span />{label}
            </a>
          ))}
        </nav>
      </div>

      <ul className="social-list" role="list" aria-label="Social links">
        <li><a href="https://github.com/armemon-dev" target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github" size={23} /></a></li>
        <li><a href="https://linkedin.com/in/armemon-dev" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" size={23} /></a></li>
        <li><a href="mailto:contact@armemon.dev" aria-label="Email Ahmed"><Icon name="mail" size={23} /></a></li>
      </ul>

      <PhotoLightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </header>
  )
}
