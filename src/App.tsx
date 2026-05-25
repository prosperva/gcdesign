import React from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route, useParams, useNavigate, Outlet } from 'react-router-dom'
import {
  GcdsHeader,
  GcdsFooter,
  GcdsContainer,
  GcdsBreadcrumbs,
  GcdsBreadcrumbsItem,
  GcdsTopNav,
  GcdsNavLink,
  GcdsLangToggle,
  GcdsDateModified,
} from '@gcds-core/components-react'
import { useLang } from './LangContext'
import { DOCUMENTS } from './data'
import CommentPage from './CommentPage'
import CommentPageAlt from './CommentPageAlt'

function Breadcrumbs() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { id } = useParams<{ id?: string }>()
  const doc = id ? DOCUMENTS.find(d => d.id === id) : undefined

  return (
    <GcdsBreadcrumbs slot="breadcrumb" lang={lang}>
      <GcdsBreadcrumbsItem href="/">{t('nav.home')}</GcdsBreadcrumbsItem>
      {doc && (
        <GcdsBreadcrumbsItem href={`/documents/${doc.id}/alt`}>{doc[lang]}</GcdsBreadcrumbsItem>
      )}
    </GcdsBreadcrumbs>
  )
}

function AppLayout() {
  const { t } = useTranslation()
  const { lang, toggleLang } = useLang()
  const navigate = useNavigate()

  return (
    <>
      <GcdsHeader lang={lang} skipToHref="#main-content">
        <GcdsLangToggle
          slot="toggle"
          lang={lang}
          href="#"
          onGcdsClick={(e: Event) => { e.preventDefault(); toggleLang() }}
        />
        <GcdsTopNav slot="menu" label={t('nav.link')} alignment="start">
          <GcdsNavLink href="/" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/') }}>
            {t('nav.documents')}
          </GcdsNavLink>
        </GcdsTopNav>
        <Routes>
          <Route path="/*" element={<Breadcrumbs />} />
        </Routes>
      </GcdsHeader>

      <GcdsContainer layout="page" tag="main" id="main-content" padding="400">
        <Outlet />
        <GcdsDateModified lang={lang}>2026-05-23</GcdsDateModified>
      </GcdsContainer>

      <GcdsFooter lang={lang} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<CommentPage />} />
        <Route path="/documents/:id/alt" element={<CommentPageAlt />} />
      </Route>
    </Routes>
  )
}
