import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  name: string
}

interface AuthContextValue {
  user: User
}

// TODO: replace with real auth (e.g. Azure AD, Keycloak)
const MOCK_USER: User = {
  id: 'usr-00042',
  name: 'Prosper N.',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: MOCK_USER }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
