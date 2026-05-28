import { useState, useRef, useEffect, useMemo, type CSSProperties } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  GcdsHeading,
  GcdsText,
  GcdsButton,
  GcdsNotice,
  GcdsFileUploader,
} from '@gcds-core/components-react'
import { useLang } from './LangContext'
import { useAuth } from './AuthContext'
import { DOCUMENTS } from './data'
import {
  type SubComment, type RoleKey, type SectionComments, type Draft,
  type SupportStatus,
  SUPPORT_STATUSES, isCommentEnabled,
  initComments, Section, StepProgress, RoleCombobox, SectionMultiSelect,
} from './CommentShared'
import RichTextEditor from './components/richtext/RichTextEditor'

// Shared inline styles for native selects and field labels
const selectStyle: CSSProperties = {
  appearance: 'none',
  width: '100%',
  padding: '0.5rem 2.5rem 0.5rem 0.75rem',
  border: '2px solid #284162',
  borderRadius: '4px',
  background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23284162' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 0.75rem center`,
  color: '#333',
  fontSize: '1rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none',
  cursor: 'pointer',
}

const labelStyle: CSSProperties = {
  fontWeight: 700,
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '1rem',
  fontFamily: 'inherit',
}

const hintStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: '#5c5c5c',
  margin: '0 0 0.375rem',
  fontFamily: 'inherit',
}

export default function CommentPage() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { user } = useAuth()
  const roleRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openDocs = useMemo(
    () => DOCUMENTS.filter(d => new Date() <= new Date(d.closingDate)),
    [],
  )

  const [docId, setDocId] = useState<string>('')
  const doc = DOCUMENTS.find(d => d.id === docId)
  const sections = doc?.sections ?? []
  const draftKey = doc ? `draft:${user.id}:${docId}:v${doc.version}` : ''

  const [role, setRole] = useState<RoleKey | ''>('')
  const [roleError, setRoleError] = useState('')
  const [supportStatus, setSupportStatus] = useState<SupportStatus | ''>('')
  const [generalComment, setGeneralComment] = useState('')
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([])
  const [comments, setComments] = useState<SectionComments[]>([])
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const [uploaderKey, setUploaderKey] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load draft whenever the selected document changes
  useEffect(() => {
    if (!docId || !doc) return
    setSupportStatus('')
    setGeneralComment('')
    setSelectedSectionIds([])
    try {
      const raw = localStorage.getItem(`draft:${user.id}:${docId}:v${doc.version}`)
      const draft: Draft | null = raw ? JSON.parse(raw) : null
      if (draft) {
        if (draft.role) setRole(draft.role)
        if (draft.supportStatus) setSupportStatus(draft.supportStatus)
        setGeneralComment(draft.generalComment ?? '')
        setSelectedSectionIds(draft.selectedSectionIds ?? [])
        setComments(draft.comments)
        setDraftSavedAt(draft.savedAt)
        setDraftRestored(true)
      } else {
        setComments(initComments(doc.sections))
        setDraftSavedAt(null)
        setDraftRestored(false)
      }
    } catch {
      setComments(initComments(doc.sections))
    }
  }, [docId])

  useEffect(() => {
    if (!draftKey) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(saveDraft, 1500)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [role, supportStatus, generalComment, selectedSectionIds, comments, draftKey])

  function saveDraft() {
    if (!draftKey) return
    const now = new Date().toISOString()
    localStorage.setItem(draftKey, JSON.stringify({
      role, supportStatus, generalComment, selectedSectionIds, comments, savedAt: now,
    } satisfies Draft))
    setDraftSavedAt(now)
  }

  function discardDraft() {
    if (draftKey) localStorage.removeItem(draftKey)
    setSupportStatus('')
    setGeneralComment('')
    setSelectedSectionIds([])
    setComments(initComments(sections))
    setDraftSavedAt(null)
    setDraftRestored(false)
  }

  function updateSection(sectionId: string, subComments: SubComment[]) {
    setComments(prev => prev.map(c => c.sectionId === sectionId ? { ...c, subComments } : c))
  }

  const commentEnabled = isCommentEnabled(supportStatus)
  const hasContent =
    generalComment.replace(/<[^>]*>/g, '').trim().length > 0 ||
    comments.some(c =>
      selectedSectionIds.includes(c.sectionId) &&
      c.subComments.some(s => s.comment.replace(/<[^>]*>/g, '').trim())
    ) ||
    uploadedFiles.length > 0

  const canSubmit = !!docId && !!role && !!supportStatus && (!commentEnabled || hasContent)

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!role) {
      setRoleError(t('comment.roleError'))
      setTimeout(() => roleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }
    setRoleError('')
    setConfirming(true)
  }

  function handleConfirm() {
    if (draftKey) localStorage.removeItem(draftKey)
    setConfirming(false)
    setSubmitted(true)
  }

  function handleReset() {
    if (draftKey) localStorage.removeItem(draftKey)
    setDocId('')
    setRole('')
    setRoleError('')
    setSupportStatus('')
    setGeneralComment('')
    setSelectedSectionIds([])
    setUploadedFiles([])
    setUploaderKey(k => k + 1)
    setComments([])
    setDraftSavedAt(null)
    setDraftRestored(false)
    setSubmitted(false)
  }

  const requestBody = {
    userId: user.id,
    role,
    supportStatus,
    documentId: docId,
    version: doc?.version ?? '',
    submittedAt: new Date().toISOString(),
    attachments: uploadedFiles,
    generalComment: commentEnabled ? generalComment : '',
    sections: commentEnabled
      ? comments
          .filter(c => selectedSectionIds.includes(c.sectionId) && c.subComments.some(s => s.comment.trim()))
          .map(c => ({
            sectionId: c.sectionId,
            subComments: c.subComments.filter(s => s.comment.trim()).map(s => ({ comment: s.comment })),
          }))
      : [],
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
          <GcdsText><strong>{t('comment.confirmDocument')}:</strong>{' '}{doc?.[lang] ?? ''}</GcdsText>
          <GcdsText><strong>{t('comment.confirmRole')}:</strong>{' '}{role ? t(`comment.roles.${role}`) : '—'}</GcdsText>
          <GcdsText><strong>{t('comment.confirmStatus')}:</strong>{' '}{supportStatus ? t(`comment.statuses.${supportStatus}`) : '—'}</GcdsText>
        </div>

        {commentEnabled && generalComment.replace(/<[^>]*>/g, '').trim() && (
          <div style={{ marginTop: '1.5rem' }}>
            <GcdsHeading tag="h3">{t('comment.generalCommentLabel')}</GcdsHeading>
            <div dangerouslySetInnerHTML={{ __html: generalComment }} />
          </div>
        )}

        {commentEnabled && selectedSectionIds.length > 0 && sections
          .filter(s => selectedSectionIds.includes(s.id))
          .map(section => {
            const sc = comments.find(c => c.sectionId === section.id)!
            const hasAny = sc?.subComments.some(s => s.comment.trim())
            if (!hasAny) return null
            return (
              <div key={section.id} style={{ marginTop: '1.5rem' }}>
                <GcdsHeading tag="h3">{section[lang]}</GcdsHeading>
                {sc.subComments.map((sub, i) => (
                  <div key={sub.id} style={{ marginBottom: '0.75rem' }}>
                    {sc.subComments.length > 1 && (
                      <GcdsText><strong>{t('comment.commentLegendConfirm', { number: i + 1 })}</strong></GcdsText>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: sub.comment }} />
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

  return (
    <>
      <StepProgress current={1} />
      <GcdsHeading tag="h1">{t('comment.pageTitle')}</GcdsHeading>
      <GcdsText>{t('comment.intro')}</GcdsText>

      <form onSubmit={handleSubmit}>
        {/* 1 ── Role */}
        <RoleCombobox
          value={role}
          error={roleError}
          onChange={key => { setRole(key); if (key) setRoleError('') }}
          containerRef={roleRef}
        />

        {/* 2 ── Document */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="document" style={labelStyle}>
            {t('comment.documentLabel')}
            {' '}<span aria-hidden="true" style={{ color: '#bc3331' }}>*</span>
          </label>
          <p style={hintStyle}>{t('comment.documentHint')}</p>
          <select
            id="document"
            value={docId}
            onChange={e => setDocId(e.target.value)}
            style={selectStyle}
          >
            <option value="">{t('comment.documentPlaceholder')}</option>
            {openDocs.map(d => (
              <option key={d.id} value={d.id}>{d[lang]}</option>
            ))}
          </select>
        </div>

        {/* 3 ── Support status (shown once document is chosen) */}
        {docId && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="support-status" style={labelStyle}>
              {t('comment.statusLabel')}
              {' '}<span aria-hidden="true" style={{ color: '#bc3331' }}>*</span>
            </label>
            <p style={hintStyle}>{t('comment.statusHint')}</p>
            <select
              id="support-status"
              value={supportStatus}
              onChange={e => {
                const next = e.target.value as SupportStatus | ''
                setSupportStatus(next)
                if (!isCommentEnabled(next)) {
                  setSelectedSectionIds([])
                  setGeneralComment('')
                }
              }}
              style={selectStyle}
            >
              <option value="">{t('comment.statusPlaceholder')}</option>
              {SUPPORT_STATUSES.map(s => (
                <option key={s} value={s}>{t(`comment.statuses.${s}`)}</option>
              ))}
            </select>
          </div>
        )}

        {/* 4 ── Comment area (statuses 2, 3, 4 only) */}
        {commentEnabled && (
          <>
            {draftRestored && (
              <GcdsNotice noticeRole="info" noticeTitleTag="h2" noticeTitle={t('draft.restoredTitle')} style={{ margin: '0 0 1.5rem' }}>
                {t('draft.restoredBody')}
                {' '}
                <GcdsButton type="button" buttonRole="danger" size="small" onClick={discardDraft}>
                  {t('draft.discard')}
                </GcdsButton>
              </GcdsNotice>
            )}

            <RichTextEditor
              id="general-comment"
              label={t('comment.generalCommentLabel')}
              value={generalComment}
              onChange={setGeneralComment}
            />

            <SectionMultiSelect
              sections={sections}
              selectedIds={selectedSectionIds}
              onChange={setSelectedSectionIds}
            />

            {selectedSectionIds.length > 0 && (
              <div>
                {sections
                  .filter(s => selectedSectionIds.includes(s.id))
                  .map((section) => {
                    const sectionComments = comments.find(c => c.sectionId === section.id)!
                    return (
                      <Section
                        key={section.id}
                        section={section}
                        comments={sectionComments}
                        onUpdate={updateSection}
                        showSplitControl={!!section.allowSplit}
                      />
                    )
                  })}
              </div>
            )}
          </>
        )}

        {/* 5 ── File uploads */}
        <GcdsFileUploader
          key={uploaderKey}
          uploaderId="attachments"
          name="attachments"
          label={t('comment.uploadsLabel')}
          hint={t('comment.uploadsHint')}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          style={{ marginBottom: uploadedFiles.length > 0 ? '0.5rem' : '2rem', marginTop: '0.5rem' }}
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

        {/* 6 ── Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <GcdsButton type="submit" disabled={!canSubmit}>{t('comment.submit')}</GcdsButton>
          {draftKey && (
            <GcdsButton type="button" buttonRole="secondary" onClick={saveDraft}>{t('draft.save')}</GcdsButton>
          )}
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
      </form>

      {docId && (
        <Link to={`/documents/${docId}/alt`} style={{ fontSize: '0.875rem', display: 'block', marginTop: '1.5rem' }}>
          {t('comment.tryTabLayout')}
        </Link>
      )}
    </>
  )
}
