import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@gcds-core/components-react/gcds.css'
import './index.css'
import './i18n/index.ts'
import { LangProvider } from './LangContext'
import { AuthProvider } from './AuthContext'
import App from './App'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <App />
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
