import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'highlight.js/styles/github.min.css'
import './index.css'
import { getLocale } from './i18n/translations'
import { getTheme } from './hooks/useTheme'
import App from './App.tsx'

document.documentElement.lang = getLocale()
document.documentElement.setAttribute('data-theme', getTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
