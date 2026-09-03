import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import SideIntro from '../components/SideIntro'
import TagList from '../components/TagList'
import { experience, projects } from '../data/content'
import { sectionIds } from '../data/sections'
import { routeSeo } from '../data/site'

/** Mirrors the breakpoint in styles.css that hides .section-nav. */
const NAV_QUERY = '(min-width: 1001px)'

/** Fraction of the viewport height used as the "you are here" line. */
const ANCHOR = .25

/** Milliseconds a nav click keeps the highlight before the spy takes over again. */
const CLICK_LOCK = 1000

/**
 * Scroll spy for the sidebar nav. Reads live rects against a fixed anchor line
 * rather than comparing IntersectionObserver ratios: an observer callback only
 * carries the entries that crossed a threshold, and a ratio is relative to each
 * section's own height, so a tall section always loses to a short one. Idle
 * while the nav is hidden, and a nav click owns the highlight until the smooth
 * scroll lands so intermediate sections never flash.
 */
function useActiveSection() {
  const [active, setActive] = useState(sectionIds[0])
  const claim = useRef({ id: null, until: 0 })

  useEffect(() => {
    const media = window.matchMedia(NAV_QUERY)
    let frame = 0

    const resolve = () => {
      const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
      if (!sections.length) return null
      const root = document.documentElement
      // The last section can sit entirely below the anchor line at full scroll.
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 2) return sections[sections.length - 1].id
      const line = window.innerHeight * ANCHOR
      let current = sections[0].id
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section.id
      })
      return current
    }

    const sync = () => {
      const id = resolve()
      if (!id) return
      const held = claim.current
      if (held.id) {
        if (id !== held.id && Date.now() <= held.until) return
        claim.current = { id: null, until: 0 }
      }
      setActive(id)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        sync()
      })
    }

    const attach = () => {
      if (!media.matches) return
      sync()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    }

    const detach = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    const onMediaChange = () => {
      detach()
      attach()
    }

    attach()
    media.addEventListener('change', onMediaChange)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      detach()
      media.removeEventListener('change', onMediaChange)
    }
  }, [])

  const claimSection = useCallback((id) => {
    claim.current = { id, until: Date.now() + CLICK_LOCK }
    setActive(id)
  }, [])

  return [active, claimSection]
}

/**
 * One heading per section. It is a visible sticky label on narrow screens and
 * screen-reader-only on wide ones, so assistive tech never hears the section
 * announced twice.
 */
function SectionHeading({ id, children }) {
  return <h2 className="section-heading" id={`${id}-heading`}>{children}</h2>
}

export default function Home() {
  const [activeSection, claimSection] = useActiveSection()

  return (
    <>
      <SEO {...routeSeo['/']} />
      <div className="portfolio-layout">
        <SideIntro activeSection={activeSection} onNavigate={claimSection} />

        <main id="main-content" className="content-column">
          <section className="content-section about-copy" id="about" aria-labelledby="about-heading">
            <SectionHeading id="about">About</SectionHeading>
            <Reveal as="p">
              I build reliable web and mobile applications that help businesses work more efficiently and turn ideas into practical digital products.
            </Reveal>
            <Reveal as="p" delay={70}>
              I can help with business-management apps, internal tools, dashboards, document workflows, and custom web or mobile experiences. I handle the complete process, including product planning, interface design, development, deployment, and ongoing maintenance.
            </Reveal>
            <Reveal as="p" delay={140}>
              I have delivered a paid Android business application and built and maintain live independent products used in the browser. My main tools include JavaScript, TypeScript, React, React Native, Next.js, Firebase, and Cloudflare Workers.
            </Reveal>
            <Reveal as="p" delay={200}>
              My focus is understanding the real problem, building a clear solution, and delivering software that is reliable, easy to use, and ready to grow.
            </Reveal>
          </section>

          <section className="content-section" id="experience" aria-labelledby="experience-heading">
            <SectionHeading id="experience">Experience</SectionHeading>
            <ol className="entry-list" role="list">
              {experience.map((item, i) => (
                <Reveal as="li" className="entry-card" delay={i * 90} key={`${item.period}-${item.title}`}>
                  <div className="entry-period">{item.period}</div>
                  <div className="entry-body">
                    <h3>{item.title} <span>· {item.company}</span></h3>
                    <p>{item.description}</p>
                    <TagList tags={item.tags} />
                  </div>
                </Reveal>
              ))}
            </ol>
            {/* Hidden until public/resume.pdf exists. Restore this block after
                dropping the PDF into public/ and redeploying. */}
            {/* <a className="arrow-link" href="/resume.pdf" target="_blank" rel="noreferrer">
              View my resume <Icon name="arrow" size={17} />
            </a> */}
          </section>

          <section className="content-section" id="projects" aria-labelledby="projects-heading">
            <SectionHeading id="projects">Projects</SectionHeading>
            <div className="project-list">
              {projects.map((project, i) => (
                <Reveal as="a" className="project-card" href={project.href} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`} delay={i * 90} key={project.slug}>
                  <div className="project-image-link">
                    <img src={project.image} alt={project.imageAlt} width="1440" height="900" loading="lazy" decoding="async" />
                  </div>
                  <div className="project-body">
                    <div className="project-heading-row">
                      <h3>{project.name} <Icon name="external" size={16} /></h3>
                      <span>{project.status}</span>
                    </div>
                    <p>{project.description}</p>
                    <TagList tags={project.tags} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <footer className="site-note">
            Built by Ahmed Raza Memon (armemon).
          </footer>
        </main>
      </div>
    </>
  )
}
