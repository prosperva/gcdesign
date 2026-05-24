import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import i18n from './i18n/index.ts'

type Lang = 'en' | 'fr'

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(next)
    setLang(next)
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
