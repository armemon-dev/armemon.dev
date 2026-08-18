import { PHOTO } from './photo.js'

export const ORIGIN = 'https://armemon.dev'

const personId = `${ORIGIN}/#ahmed-raza-memon`
const photoId = `${ORIGIN}/#photo`

/** Build stamp, so dateModified and the sitemap never drift apart. */
export const LAST_MODIFIED = new Date().toISOString().slice(0, 10)

/**
 * The portrait, declared as a full ImageObject and referenced by the Person.
 * This is what lets search engines attach a face to the entity, so the file,
 * its real pixel dimensions and the caption all have to stay in sync with
 * public/armemon.webp.
 */
const photo = {
  '@type': 'ImageObject',
  '@id': photoId,
  url: `${ORIGIN}${PHOTO.src}`,
  contentUrl: `${ORIGIN}${PHOTO.src}`,
  width: PHOTO.width,
  height: PHOTO.height,
  encodingFormat: 'image/webp',
  caption: PHOTO.caption,
  representativeOfPage: true,
}

const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'Ahmed Raza Memon',
  alternateName: ['armemon', 'Ahmed Memon', 'Ahmed Raza', 'armemon-dev'],
  identifier: 'armemon',
  url: `${ORIGIN}/`,
  email: 'mailto:contact@armemon.dev',
  jobTitle: 'Product Developer',
  description: 'Product developer who builds and ships web and mobile software end to end, including WithinBench and Titlania.',
  image: { '@id': photoId },
  mainEntityOfPage: { '@id': `${ORIGIN}/#profile` },
  sameAs: [
    'https://github.com/armemon-dev',
    'https://linkedin.com/in/armemon-dev',
    'https://withinbench.com/',
    'https://titlania.com/',
  ],
  knowsLanguage: ['en', 'ur'],
  knowsAbout: [
    'Product development',
    'End to end product ownership',
    'React Native',
    'Android application development',
    'React',
    'Next.js',
    'TypeScript',
    'Firebase',
    'Cloudflare Workers',
    'Local-first software',
    'AI-assisted software development',
  ],
}

const website = {
  '@type': 'WebSite',
  '@id': `${ORIGIN}/#website`,
  name: 'armemon.dev',
  alternateName: 'armemon',
  url: `${ORIGIN}/`,
  inLanguage: 'en',
  author: { '@id': personId },
}

const withinBench = {
  '@type': 'WebApplication',
  '@id': 'https://withinbench.com/#product',
  name: 'WithinBench',
  url: 'https://withinbench.com/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any modern web browser',
  isAccessibleForFree: true,
  creator: { '@id': personId },
  image: {
    '@type': 'ImageObject',
    url: `${ORIGIN}/withinbench-preview.webp`,
    width: 1440,
    height: 900,
    encodingFormat: 'image/webp',
    caption: 'WithinBench, a free browser workshop built by Ahmed Raza Memon.',
  },
  description: 'A free browser workshop with 119 browser-local utilities and six professional-document workflows. Supported files and drafts stay on the user’s device.',
  featureList: [
    '119 independently routed browser utilities',
    'Six professional-document workflows',
    'Browser-local file processing and document storage',
    'Backup and restore for saved work',
    'Offline support for previously visited public tools',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const profileSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    person,
    photo,
    website,
    {
      '@type': 'ProfilePage',
      '@id': `${ORIGIN}/#profile`,
      url: `${ORIGIN}/`,
      name: 'Ahmed Raza Memon (armemon) · Product Developer',
      dateModified: LAST_MODIFIED,
      mainEntity: { '@id': personId },
      primaryImageOfPage: { '@id': photoId },
      image: { '@id': photoId },
      hasPart: [
        { '@id': 'https://withinbench.com/#product' },
        {
          '@type': 'CreativeWork',
          name: 'Titlania',
          url: 'https://titlania.com/',
          creator: { '@id': personId },
          image: `${ORIGIN}/titlania-preview.webp`,
          description: 'An ongoing independent product. More information will be shared when the work is ready.',
        },
      ],
    },
    withinBench,
  ],
}

export const routeSeo = {
  '/': {
    title: 'Ahmed Raza Memon (armemon) · Product Developer',
    description: 'Ahmed Raza Memon, known as armemon, is a product developer who builds web and mobile software end to end.',
    path: '/',
    imageAlt: 'Ahmed Raza Memon, known as armemon, product developer',
    schema: profileSchema,
  },
  '/404': {
    title: 'Page Not Found · Ahmed Raza Memon',
    description: 'The requested page was not found on Ahmed Raza Memon’s portfolio.',
    path: '/404',
    imageAlt: 'Ahmed Raza Memon, known as armemon, product developer',
    schema: null,
    noIndex: true,
  },
}
