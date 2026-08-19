import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const outputDir = resolve(projectRoot, 'dist')

const ORIGIN = 'https://armemon.dev'

const failures = []

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok    ${label}`)
    return
  }
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  failures.push(label)
}

async function read(file) {
  return readFile(resolve(outputDir, file), 'utf8')
}

async function exists(file) {
  try {
    await access(resolve(outputDir, file))
    return true
  } catch {
    return false
  }
}

/**
 * The prerender is the part most likely to fail silently: a hydration or SSR
 * error still emits an index.html, just an empty one, so assert on real copy
 * rather than on the file being present.
 */
async function checkPrerender() {
  const html = await read('index.html')
  check('index.html carries prerendered copy', html.includes('Ahmed Raza Memon'))
  check('index.html is not an empty shell', html.length > 5000, `${html.length} bytes`)
  check(
    'canonical points at the apex',
    html.includes(`<link rel="canonical" href="${ORIGIN}/"`),
  )
  check('404.html was rendered', await exists('404.html'))
  return html
}

/**
 * dateModified must stay a full ISO 8601 datetime. Schema.org types it as
 * DateTime, and Google rejects a date-only value — see the note on
 * LAST_MODIFIED in src/data/site.js before shortening it.
 */
function checkSchema(html) {
  const match = html.match(/<script id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)
  check('page-schema block is present', Boolean(match))
  if (!match) return

  let graph
  try {
    graph = JSON.parse(match[1])
  } catch (error) {
    check('page-schema parses as JSON', false, error.message)
    return
  }
  check('page-schema parses as JSON', true)

  const nodes = graph['@graph'] ?? []
  const profile = nodes.find((node) => node['@type'] === 'ProfilePage')
  check('graph contains a ProfilePage', Boolean(profile))
  check('graph contains a Person', nodes.some((node) => node['@type'] === 'Person'))

  if (profile) {
    check(
      'dateModified is a full ISO 8601 datetime',
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(profile.dateModified ?? ''),
      `got ${JSON.stringify(profile.dateModified)}`,
    )
  }
}

/**
 * The security headers live in public/_headers rather than in Cloudflare, so a
 * build that drops the file silently removes CSP and HSTS from the live site.
 */
async function checkHeaders() {
  check('_headers survived the build', await exists('_headers'))
  if (!(await exists('_headers'))) return

  const headers = await read('_headers')
  check('_headers keeps Content-Security-Policy', headers.includes('Content-Security-Policy'))
  check('_headers keeps Strict-Transport-Security', headers.includes('Strict-Transport-Security'))
  check('_headers keeps X-Frame-Options', headers.includes('X-Frame-Options'))
  check('preview deploys stay noindex', headers.includes('X-Robots-Tag: noindex'))
}

async function checkCrawlerFiles() {
  check('sitemap.xml was generated', await exists('sitemap.xml'))
  if (await exists('sitemap.xml')) {
    const sitemap = await read('sitemap.xml')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    check('sitemap declares at least one URL', locs.length > 0)
    check(
      'every sitemap URL is on the canonical origin',
      locs.every((loc) => loc.startsWith(ORIGIN)),
      locs.filter((loc) => !loc.startsWith(ORIGIN)).join(', '),
    )
    check(
      'sitemap lastmod is a full ISO 8601 datetime',
      /<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})<\/lastmod>/.test(sitemap),
    )
  }

  check('robots.txt was copied', await exists('robots.txt'))
  if (await exists('robots.txt')) {
    const robots = await read('robots.txt')
    check('robots.txt advertises the sitemap', robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`))
  }

  check('llms.txt was copied', await exists('llms.txt'))
  check('the portrait was copied', await exists('armemon.webp'))
}

console.log('verifying dist/\n')
const html = await checkPrerender()
checkSchema(html)
await checkHeaders()
await checkCrawlerFiles()

if (failures.length > 0) {
  console.log(`\n${failures.length} check(s) failed`)
  process.exit(1)
}
console.log('\nall checks passed')
