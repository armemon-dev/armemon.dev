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
              I build software on my own, web and mobile both, and I’ve been at it long enough now to know which parts I’m good at.
            </Reveal>
            <Reveal as="p" delay={70}>
              I started with C++ in 2019, mostly out of curiosity about what was going on underneath an interface before I ever tried to build one. I came back to development properly in 2023 and settled into JavaScript, React Native and Firebase.
            </Reveal>
            <Reveal as="p" delay={140}>
              The first thing anyone paid me for was an Android app for a snacks and confectionery distributor. It kept the invoices, the customers, the stock, the staff and their salaries, the cash and bank records, and enough analytics to see how the month was going. It had to work with no connection, and it had to move a year of records onto a new phone without losing anything, so that’s what I built.
            </Reveal>
            <Reveal as="p" delay={200}>
              <a className="inline-link" href="https://withinbench.com" target="_blank" rel="noreferrer">WithinBench</a> is where most of my time goes now. It’s free, it’s live, and there are 119 tools in it plus six document workflows that turn out proper professional files. The work happens in the browser instead of on my server, which was harder to build and better for the people using it. I do all of it. Product, interface, code, deploys, the privacy policy, everything.
            </Reveal>
            <Reveal as="p" delay={250}>
              I’m early in my career. I’m not new at it. Most of what I know I taught myself, which for me means staying on a problem until I understand the reasoning behind the fix and not just the fix. I ship things, I keep them running, and I can tell you why any decision in my code is the way it is. AI tooling is part of how I get through this much work alone, and it doesn’t change who answers for the result.
            </Reveal>
            <Reveal as="p" delay={300}>
              <a className="inline-link" href="https://titlania.com" target="_blank" rel="noreferrer">Titlania</a> is next.
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
