import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@gcds-core/components-react/gcds.css'
import './index.css'
import './i18n/index.ts'
import { LangProvider } from './LangContext'
import { AuthProvider } from './AuthContext'
import App from './App'

const queryClient = new QueryClient()

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LangProvider>
            <App />
          </LangProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
