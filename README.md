# armemon.dev

Portfolio of Ahmed Raza Memon (armemon). React + Vite, prerendered to static HTML, deployed on Cloudflare Pages.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # client build, then SSR prerender to dist/
npm run preview  # serve the built dist/
```

`npm run build` runs `scripts/build.mjs`, which does more than a plain Vite build:

1. Builds the client bundle.
2. Builds `src/entry-server.jsx` and renders every route in `pages` to static HTML.
3. Rewrites per-page `<title>`, description, robots, canonical, Open Graph, Twitter and JSON-LD from `routeSeo` in `src/data/site.js`.
4. Injects a `<link rel="preload">` for the content-hashed Inter woff2, which the browser cannot discover until the CSS parses.
5. Generates `dist/sitemap.xml`, including image entries for the portrait and project previews.

## Where content lives

| File | Holds |
| --- | --- |
| `src/pages/Home.jsx` | The About prose, inline in JSX |
| `src/data/content.js` | Experience entries and project cards |
| `src/data/site.js` | Per-route SEO, the schema.org graph, `LAST_MODIFIED` |
| `public/llms.txt` | The AI-readable summary crawlers and LLMs quote |
| `public/_headers` | CSP and security headers, asset caching, preview-deploy noindex |

Editing the copy in one place and not the others is the main way this site goes
out of sync: `src/data/site.js` and `public/llms.txt` both describe the same
person as the About section does, and all three should agree.

## Conventions worth knowing

- **Prerender safety.** Anything rendered on the server must produce identical
  markup on the first client render, or hydration breaks. `Reveal` and the
  sidebar scroll spy both start in their server state and only change after
  mount for this reason.
- **The layer scale.** Every `z-index` comes from the custom properties in
  `:root` (`--z-decoration` through `--z-overlay`). Do not add bare numbers.
  The photo overlay is portalled to `<body>` because the sidebar is
  `position: sticky`, which creates a stacking context that would otherwise
  trap it.
- **The sidebar must fit the viewport.** It is `position: sticky` at
  `height: 100svh`, so it is pinned for the entire scroll and any overflow can
  never be scrolled into view. A `max-height` media query compacts it on short
  laptop screens; check that the contact row is still reachable before changing
  its spacing.
- **No em dashes in prose.** A deliberate voice decision. Date ranges are the
  exception.

## Deployment

Cloudflare Pages. Build command `npm run build`, output directory `dist`.
`public/_headers` sets `X-Robots-Tag: noindex` on `*.pages.dev` so preview
deployments never compete with the production domain in search results.
