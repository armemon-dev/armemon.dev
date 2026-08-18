import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { LAST_MODIFIED, routeSeo } from '../src/data/site.js'

const projectRoot = resolve(import.meta.dirname, '..')
const outputDir = resolve(projectRoot, 'dist')
const prerenderDir = resolve(projectRoot, '.prerender')

const pages = [
  { url: '/', file: 'index.html', seo: routeSeo['/'] },
  { url: '/404', file: '404.html', seo: routeSeo['/404'] },
]

const ORIGIN = 'https://armemon.dev'

/**
 * Sitemap entries. Images are declared with the image extension so the portrait
 * and the project previews are offered for image indexing explicitly, rather
 * than relying on a crawler noticing them in the markup.
 */
const sitemapUrls = [
  {
    loc: `${ORIGIN}/`,
    images: [
      { loc: `${ORIGIN}/armemon.webp`, title: 'Ahmed Raza Memon (armemon)', caption: 'Ahmed Raza Memon, product developer, known online as armemon.' },
      { loc: `${ORIGIN}/withinbench-preview.webp`, title: 'WithinBench', caption: 'WithinBench, a free browser workshop built by Ahmed Raza Memon.' },
      { loc: `${ORIGIN}/titlania-preview.webp`, title: 'Titlania', caption: 'Titlania, an independent product in development by Ahmed Raza Memon.' },
    ],
  },
]

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function renderSitemap() {
  const body = sitemapUrls
    .map((entry) => {
      const images = (entry.images ?? [])
        .map((image) => [
          '    <image:image>',
          `      <image:loc>${escapeXml(image.loc)}</image:loc>`,
          `      <image:title>${escapeXml(image.title)}</image:title>`,
          `      <image:caption>${escapeXml(image.caption)}</image:caption>`,
          '    </image:image>',
        ].join('\n'))
        .join('\n')
      return [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${LAST_MODIFIED}</lastmod>`,
        images,
        '  </url>',
      ].filter(Boolean).join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    body,
    '</urlset>',
    '',
  ].join('\n')
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function replaceMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escapedKey}"\\s+content=")[^"]*("\\s*/?>)`)
  return html.replace(pattern, `$1${escapeAttribute(value)}$2`)
}

/**
 * The font filename is content-hashed at build time, so the preload hint can
 * only be written once the asset exists.
 */
function addFontPreload(html, fontPath) {
  if (!fontPath || html.includes('rel="preload"')) return html
  const tag = `    <link rel="preload" href="${fontPath}" as="font" type="font/woff2" crossorigin="anonymous" />\n`
  return html.replace('    <link rel="canonical"', `${tag}    <link rel="canonical"`)
}

function applySeo(template, seo, body) {
  const canonical = new URL(seo.path, 'https://armemon.dev').toString()
  const robots = seo.noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(seo.title)}</title>`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${canonical}$2`)
    .replace('<!--app-html-->', body)

  html = replaceMeta(html, 'name', 'description', seo.description)
  html = replaceMeta(html, 'name', 'robots', robots)
  html = replaceMeta(html, 'property', 'og:title', seo.title)
  html = replaceMeta(html, 'property', 'og:description', seo.description)
  html = replaceMeta(html, 'property', 'og:url', canonical)
  html = replaceMeta(html, 'property', 'og:image:alt', seo.imageAlt)
  html = replaceMeta(html, 'name', 'twitter:title', seo.title)
  html = replaceMeta(html, 'name', 'twitter:description', seo.description)
  html = replaceMeta(html, 'name', 'twitter:image:alt', seo.imageAlt)

  const schema = seo.schema
    ? JSON.stringify(seo.schema).replaceAll('<', '\\u003c')
    : ''
  return html.replace(
    /<script id="page-schema" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="page-schema" type="application/ld+json">${schema}</script>`,
  )
}

try {
  await build({ root: projectRoot })
  await build({
    root: projectRoot,
    build: {
      ssr: resolve(projectRoot, 'src/entry-server.jsx'),
      outDir: prerenderDir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        output: { entryFileNames: 'entry-server.mjs' },
      },
    },
  })

  const serverEntry = pathToFileURL(resolve(prerenderDir, 'entry-server.mjs')).href
  const { render } = await import(`${serverEntry}?t=${Date.now()}`)
  const rawTemplate = await readFile(resolve(outputDir, 'index.html'), 'utf8')

  const assets = await readdir(resolve(outputDir, 'assets'))
  const fontFile = assets.find((file) => file.endsWith('.woff2'))
  const template = addFontPreload(rawTemplate, fontFile ? `/assets/${fontFile}` : null)

  for (const page of pages) {
    const destination = resolve(outputDir, page.file)
    await mkdir(resolve(destination, '..'), { recursive: true })
    await writeFile(destination, applySeo(template, page.seo, render(page.url)))
  }

  await writeFile(resolve(outputDir, 'sitemap.xml'), renderSitemap())
} finally {
  await rm(prerenderDir, { recursive: true, force: true })
}
