/**
 * The page sections, in document order. Drives the sidebar nav, the scroll spy
 * and the section landmarks, so adding a section here is the only edit needed.
 */
export const sections = [
  { id: 'about', label: 'About', heading: 'About Ahmed' },
  { id: 'experience', label: 'Experience', heading: 'Professional experience' },
  { id: 'projects', label: 'Projects', heading: 'Selected projects' },
]

export const sectionIds = sections.map((section) => section.id)
