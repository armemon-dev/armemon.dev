import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const root = document.getElementById('root')
const application = (
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
)

if (root.firstElementChild) {
  hydrateRoot(root, application)
} else {
  createRoot(root).render(application)
}
