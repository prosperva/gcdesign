import { useState, useRef, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  GcdsHeading,
  GcdsText,
  GcdsSelect,
  GcdsInput,
  GcdsButton,
  GcdsAlert,
  GcdsNotice,
  GcdsFileUploader,
  GcdsSideNav,
  GcdsNavLink,
} from '@gcds-core/components-react'
import { useLang } from './LangContext'
import { useAuth } from './AuthContext'
import { DOCUMENTS } from './data'
import {
  type SubComment, type RoleKey, type SectionComments, type Draft,
  ROLE_KEYS, initComments,
  Section, StepProgress,
} from './CommentShared'

export default function CommentPageAlt() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const roleRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doc = DOCUMENTS.find(d => d.id === id)
  const sections = doc?.sections ?? []

  const draftKey = `draft:${user.id}:${id}:v${doc?.version ?? ''}`

  const [initialDraft] = useState<Draft | null>(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const [role, setRole] = useState<RoleKey | ''>(initialDraft?.role ?? '')
  const [customRole, setCustomRole] = useState(initialDraft?.customRole ?? '')
  const [roleError, setRoleError] = useState('')
  const [uploaderKey, setUploaderKey] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [comments, setComments] = useState<SectionComments[]>(initialDraft?.comments ?? initComments(sections))
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(initialDraft?.savedAt ?? null)
  const [draftRestored, setDraftRestored] = useState(!!initialDraft)
  const [confirming, setConfirming] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  function saveDraft() {
    const now = new Date().toISOString()
    localStorage.setItem(draftKey, JSON.stringify({ role, customRole, comments, savedAt: now } satisfies Draft))
    setDraftSavedAt(now)
  }

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(saveDraft, 1500)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [role, customRole, comments])

  function discardDraft() {
    localStorage.removeItem(draftKey)
    setRole('')
    setCustomRole('')
    setComments(initComments(sections))
    setDraftSavedAt(null)
    setDraftRestored(false)
  }

  const effectiveRole = role === 'other' ? customRole.trim() : role

  const closingDate = new Date(doc?.closingDate ?? '')
  const isExpired = new Date() > closingDate
  const formattedClosingDate = closingDate.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const hasComment = comments.some(c => c.subComments.some(s => s.comment.replace(/<[^>]*>/g, '').trim()))
  const canSubmit = !isExpired && (hasComment || uploadedFiles.length > 0)

  function updateSection(sectionId: string, subComments: SubComment[]) {
    setComments(prev => prev.map(c => c.sectionId === sectionId ? { ...c, subComments } : c))
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!role) {
      setRoleError(t('comment.roleError'))
      setTimeout(() => roleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }
    if (role === 'other' && !customRole.trim()) {
      setRoleError(t('comment.roleOtherError'))
      setTimeout(() => roleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }
    setRoleError('')
    setConfirming(true)
  }

  function handleConfirm() {
    localStorage.removeItem(draftKey)
    setConfirming(false)
    setSubmitted(true)
  }

  function handleReset() {
    localStorage.removeItem(draftKey)
    setRole('')
    setCustomRole('')
    setUploadedFiles([])
    setComments(initComments(sections))
    setDraftSavedAt(null)
    setDraftRestored(false)
    setSubmitted(false)
  }

  const requestBody = {
    userId: user.id,
    role: effectiveRole,
    documentId: doc?.[lang] ?? '',
    version: doc?.version ?? '',
    submittedAt: new Date().toISOString(),
    attachments: uploadedFiles,
    sections: comments
      .filter(c => c.subComments.some(s => s.comment.trim()))
      .map(c => ({
        sectionId: c.sectionId,
        subComments: c.subComments.filter(s => s.comment.trim()).map(s => ({ comment: s.comment })),
      })),
  }

  if (!doc) {
    return (
      <>
        <GcdsHeading tag="h1">{t('comment.notFoundTitle')}</GcdsHeading>
        <GcdsText>{t('comment.notFoundBody')}</GcdsText>
        <GcdsButton type="button" onClick={() => navigate('/')}>{t('comment.notFoundBack')}</GcdsButton>
      </>
    )
  }

  if (confirming) {
    return (
      <>
        <StepProgress current={2} />
        <GcdsHeading tag="h1">{t('comment.confirmTitle')}</GcdsHeading>
        <GcdsNotice noticeRole="info" noticeTitleTag="h2" noticeTitle={t('comment.confirmNoticeTitle')}>
          {t('comment.confirmNoticeBody')}
        </GcdsNotice>

        <div style={{ marginTop: '1.5rem' }}>
          <GcdsText><strong>{t('comment.confirmRole')}:</strong>{' '}{effectiveRole || '—'}</GcdsText>
        </div>

        {sections.map(section => {
          const sc = comments.find(c => c.sectionId === section.id)!
          return (
            <div key={section.id} style={{ marginTop: '1.5rem' }}>
              <GcdsHeading tag="h3">{section[lang]}</GcdsHeading>
              {sc.subComments.map((sub, i) => (
                <div key={sub.id} style={{ marginBottom: '0.75rem' }}>
                  <GcdsText><strong>{sc.subComments.length > 1 ? t('comment.commentLegendConfirm', { number: i + 1 }) : ''}</strong></GcdsText>
                  <GcdsText>{sub.comment.trim() || <em>{t('comment.noComment')}</em>}</GcdsText>
                </div>
              ))}
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <GcdsButton type="button" onClick={handleConfirm}>{t('comment.confirmSubmit')}</GcdsButton>
          <GcdsButton type="button" buttonRole="secondary" onClick={() => setConfirming(false)}>{t('comment.goBack')}</GcdsButton>
        </div>
      </>
    )
  }

  if (submitted) {
    return (
      <>
        <StepProgress current={3} />
        <GcdsHeading tag="h1">{t('comment.successTitle')}</GcdsHeading>
        <GcdsNotice noticeRole="success" noticeTitleTag="h2" noticeTitle={t('comment.successNoticeTitle')}>
          <Trans i18nKey="comment.successNoticeBody" values={{ title: doc?.[lang] ?? '' }}>
            Your comments on <strong>{'{{title}}'}</strong> have been received.
          </Trans>
        </GcdsNotice>

        <GcdsHeading tag="h2" style={{ marginTop: '2rem' }}>Request body</GcdsHeading>
        <GcdsText>This is what will be sent to the API once the backend is connected.</GcdsText>
        <pre style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', padding: '1rem', overflowX: 'auto', fontSize: '0.875rem', lineHeight: '1.5' }}>
          {JSON.stringify(requestBody, null, 2)}
        </pre>

        <GcdsButton type="button" buttonRole="secondary" style={{ marginTop: '1.5rem' }} onClick={handleReset}>
          {t('comment.submitAnother')}
        </GcdsButton>
      </>
    )
  }

  const activeSection = sections[activeTab]
  const activeSectionComments = comments.find(c => c.sectionId === activeSection?.id)!

  return (
    <>
      <StepProgress current={1} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <GcdsHeading tag="h1">{t('comment.pageTitle')}</GcdsHeading>
        <Link to={`/documents/${id}`} style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          {t('comment.tryListLayout')}
        </Link>
      </div>
      <GcdsText>
        <strong>{doc?.[lang]}</strong> — {t('comment.version')} {doc?.version}
      </GcdsText>

      {isExpired ? (
        <GcdsAlert alertRole="danger" heading={t('comment.closedTitle')} hideCloseBtn lang={lang}>
          {t('comment.closedBody', { date: formattedClosingDate })}
        </GcdsAlert>
      ) : (
        <>
          <GcdsAlert alertRole="warning" heading={t('comment.closingTitle')} hideCloseBtn lang={lang} style={{ marginBottom: '1.5rem' }}>
            {t('comment.closingBody', { date: formattedClosingDate })}
          </GcdsAlert>
          <GcdsText>{t('comment.intro')}</GcdsText>
        </>
      )}

      {!isExpired && <form onSubmit={handleSubmit}>
        {draftRestored && (
          <GcdsNotice noticeRole="info" noticeTitleTag="h2" noticeTitle={t('draft.restoredTitle')} style={{ marginBottom: '1.5rem' }}>
            {t('draft.restoredBody')}
            {' '}
            <GcdsButton type="button" buttonRole="danger" size="small" onClick={discardDraft}>
              {t('draft.discard')}
            </GcdsButton>
          </GcdsNotice>
        )}

        <div ref={roleRef}>
          <GcdsSelect
            selectId="role"
            name="role"
            label={t('comment.roleLabel')}
            hint={t('comment.roleHint')}
            defaultValue={t('comment.rolePlaceholder')}
            errorMessage={roleError || undefined}
            onGcdsChange={(e: CustomEvent<string>) => { setRole(e.detail as RoleKey); setRoleError('') }}
          >
            {ROLE_KEYS.map(key => (
              <option key={key} value={key}>{t(`comment.roles.${key}`)}</option>
            ))}
          </GcdsSelect>
          {role === 'other' && (
            <GcdsInput
              inputId="custom-role"
              name="custom-role"
              label={t('comment.roleOtherLabel')}
              value={customRole}
              onGcdsChange={(e: CustomEvent<string>) => { setCustomRole(e.detail); setRoleError('') }}
              style={{ marginTop: '0.75rem' }}
            />
          )}
        </div>

        {/* ── Side nav + content ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '220px', flexShrink: 0 }}>
            <GcdsSideNav label={t('comment.sectionsLabel')} lang={lang}>
              {sections.map((section, i) => {
                const hasContent = comments.find(c => c.sectionId === section.id)
                  ?.subComments.some(s => s.comment.replace(/<[^>]*>/g, '').trim())
                return (
                  <GcdsNavLink
                    key={section.id}
                    href="#"
                    current={i === activeTab}
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); setActiveTab(i) }}
                  >
                    {section[lang]}{hasContent ? ' ✓' : ''}
                  </GcdsNavLink>
                )
              })}
            </GcdsSideNav>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {activeSection && (
              <Section
                section={activeSection}
                comments={activeSectionComments}
                onUpdate={updateSection}
                hideLegend
              />
            )}
          </div>
        </div>{/* end side-nav row */}

        <GcdsFileUploader
          key={uploaderKey}
          uploaderId="attachments"
          name="attachments"
          label={t('comment.uploadsLabel')}
          hint={t('comment.uploadsHint')}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          style={{ marginBottom: uploadedFiles.length > 0 ? '0.5rem' : '2rem' }}
          onGcdsChange={(e: CustomEvent<string[]>) => {
            setUploadedFiles(prev => [...new Set([...prev, ...e.detail])])
            setUploaderKey(k => k + 1)
          }}
        />

        {uploadedFiles.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
            {uploadedFiles.map(file => (
              <li key={file} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid #e0e0e0' }}>
                <GcdsText marginBottom="0">{file}</GcdsText>
                <GcdsButton type="button" buttonRole="danger" size="small" onClick={() => setUploadedFiles(prev => prev.filter(f => f !== file))}>
                  {t('comment.uploadsRemove')}
                </GcdsButton>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <GcdsButton type="submit" disabled={!canSubmit}>{t('comment.submit')}</GcdsButton>
          <GcdsButton type="button" buttonRole="secondary" onClick={saveDraft}>{t('draft.save')}</GcdsButton>
          {draftSavedAt && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#5c5c5c' }}>
              {t('draft.savedAt', {
                time: new Date(draftSavedAt).toLocaleTimeString(lang === 'fr' ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' }),
              })}
              {' · '}
              <button
                type="button"
                onClick={discardDraft}
                style={{ background: 'none', border: 'none', padding: 0, color: '#bc3331', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}
              >
                {t('draft.discard')}
              </button>
            </p>
          )}
        </div>
      </form>}
    </>
  )
}
