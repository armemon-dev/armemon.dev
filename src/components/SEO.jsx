import { useEffect } from 'react'
import { ORIGIN } from '../data/site'

function updateMeta(selector, key, value) {
  const node = document.head.querySelector(selector)
  node?.setAttribute(key, value)
}

export default function SEO({ title, description, path = '/', imageAlt, schema, noIndex = false }) {
  useEffect(() => {
    const url = new URL(path, ORIGIN).toString()
    document.title = title
    updateMeta('meta[name="description"]', 'content', description)
    updateMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMeta('meta[property="og:title"]', 'content', title)
    updateMeta('meta[property="og:description"]', 'content', description)
    updateMeta('meta[property="og:url"]', 'content', url)
    updateMeta('meta[property="og:image:alt"]', 'content', imageAlt)
    updateMeta('meta[name="twitter:title"]', 'content', title)
    updateMeta('meta[name="twitter:description"]', 'content', description)
    updateMeta('meta[name="twitter:image:alt"]', 'content', imageAlt)
    updateMeta('link[rel="canonical"]', 'href', url)

    const schemaNode = document.head.querySelector('#page-schema')
    if (schemaNode) schemaNode.textContent = schema ? JSON.stringify(schema) : ''
  }, [description, imageAlt, noIndex, path, schema, title])

  return null
}
