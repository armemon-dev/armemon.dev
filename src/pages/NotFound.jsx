import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { routeSeo } from '../data/site'

export default function NotFound() {
  return (
    <main className="not-found" id="main-content">
      <SEO {...routeSeo['/404']} />
      <span>404</span>
      <h1>This page isn’t here.</h1>
      <Link to="/">Return to the portfolio</Link>
    </main>
  )
}
