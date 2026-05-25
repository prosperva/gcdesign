import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GcdsFieldset, GcdsButton } from '@gcds-core/components-react'
import { useLang } from './LangContext'
import RichTextEditor from './components/richtext/RichTextEditor'
import type { DocumentSection } from './data'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SubComment {
  id: string
  comment: string
}

export interface SectionComments {
  sectionId: string
  subComments: SubComment[]
}

export const ROLE_KEYS = ['manager','director','architect','analyst','researcher','developer','policy'] as const
export type RoleKey = typeof ROLE_KEYS[number]

export type SupportStatus =
  | 'support'
  | 'support-with-comments'
  | 'support-with-modifications'
  | 'do-not-support'
  | 'reviewed-no-opinion'

export const SUPPORT_STATUSES: readonly SupportStatus[] = [
  'support',
  'support-with-comments',
  'support-with-modifications',
  'do-not-support',
  'reviewed-no-opinion',
] as const

export function isCommentEnabled(status: SupportStatus | ''): boolean {
  return status === 'support-with-comments'
    || status === 'support-with-modifications'
    || status === 'do-not-support'
}

export interface Draft {
  role: RoleKey | ''
  supportStatus?: SupportStatus | ''
  generalComment?: string
  selectedSectionIds?: string[]
  comments: SectionComments[]
  savedAt: string
}

export const emptySubComment = (): SubComment => ({ id: crypto.randomUUID(), comment: '' })

export const initComments = (sections: DocumentSection[]): SectionComments[] =>
  sections.map(s => ({ sectionId: s.id, subComments: [emptySubComment()] }))

// ── SubCommentField ───────────────────────────────────────────────────────────

interface SubCommentProps {
  sub: SubComment
  index: number
  onUpdate: (subId: string, value: string) => void
  onRemove: (subId: string) => void
  showRemove: boolean
}

export function SubCommentField({ sub, index, onUpdate, onRemove, showRemove }: SubCommentProps) {
  const { t } = useTranslation()
  return (
    <GcdsFieldset
      legend={t('comment.commentLegend', { number: index + 1 })}
      legendSize="h4"
      style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #26374a' }}
    >
      <RichTextEditor
        id={`sub-comment-${sub.id}`}
        label={t('comment.commentLabel')}
        value={sub.comment}
        onChange={html => onUpdate(sub.id, html)}
      />
      {showRemove && (
        <GcdsButton type="button" buttonRole="danger" size="small" style={{ marginTop: '0.5rem' }} onClick={() => onRemove(sub.id)}>
          {t('comment.removeComment')}
        </GcdsButton>
      )}
    </GcdsFieldset>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
  section: DocumentSection
  comments: SectionComments
  onUpdate: (sectionId: string, subComments: SubComment[]) => void
  hideLegend?: boolean
  showSplitControl?: boolean
}

export function Section({ section, comments, onUpdate, hideLegend, showSplitControl }: SectionProps) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const isSplit = comments.subComments.length > 1

  function updateSubComment(subId: string, value: string) {
    onUpdate(section.id, comments.subComments.map(s => s.id === subId ? { ...s, comment: value } : s))
  }

  function handleSplitToggle(checked: boolean) {
    if (checked) {
      onUpdate(section.id, [...comments.subComments, emptySubComment()])
    } else {
      onUpdate(section.id, [comments.subComments[0]])
    }
  }

  function addSubComment() {
    onUpdate(section.id, [...comments.subComments, emptySubComment()])
  }

  function removeSubComment(subId: string) {
    onUpdate(section.id, comments.subComments.filter(s => s.id !== subId))
  }

  const splitCheckbox = showSplitControl && (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 400, cursor: 'pointer', color: '#284162', fontFamily: 'inherit' }}>
      <input
        type="checkbox"
        checked={isSplit}
        onChange={e => handleSplitToggle(e.target.checked)}
        style={{ accentColor: '#284162', width: '1rem', height: '1rem', flexShrink: 0, cursor: 'pointer' }}
      />
      {t('comment.splitComment')}
    </label>
  )

  const subFields = isSplit
    ? comments.subComments.map((sub, i) => (
        <SubCommentField
          key={sub.id} sub={sub} index={i}
          onUpdate={updateSubComment} onRemove={removeSubComment}
          showRemove={comments.subComments.length > 1}
        />
      ))
    : (
      <RichTextEditor
        id={`comment-${comments.subComments[0].id}`}
        label={t('comment.commentLabel')}
        value={comments.subComments[0].comment}
        onChange={html => updateSubComment(comments.subComments[0].id, html)}
      />
    )

  if (hideLegend) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        {showSplitControl && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            {splitCheckbox}
          </div>
        )}
        {subFields}
        {isSplit && (
          <GcdsButton type="button" buttonRole="secondary" size="small" style={{ marginTop: '1rem' }} onClick={addSubComment}>
            {t('comment.addComment')}
          </GcdsButton>
        )}
      </div>
    )
  }

  return (
    <fieldset style={{ border: '1px solid #d9d9d9', borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '2rem' }}>
      <legend style={{ padding: '0 0.25rem', fontWeight: 700, fontSize: '1.125rem', color: '#284162' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {section[lang]}
          {splitCheckbox}
        </span>
      </legend>
      {subFields}
      {isSplit && (
        <GcdsButton type="button" buttonRole="secondary" size="small" style={{ marginTop: '1rem' }} onClick={addSubComment}>
          {t('comment.addComment')}
        </GcdsButton>
      )}
    </fieldset>
  )
}

// ── StepProgress ──────────────────────────────────────────────────────────────

export function StepProgress({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useTranslation()
  const steps = [t('comment.stepComment'), t('comment.stepReview'), t('comment.stepSubmitted')]

  return (
    <nav aria-label={t('comment.stepsLabel')} style={{ marginBottom: '1.75rem' }}>
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, alignItems: 'flex-start' }}>
        {steps.map((label, i) => {
          const step = i + 1
          const done = step < current
          const active = step === current
          const color = done ? '#278400' : active ? '#284162' : '#767676'
          return (
            <li key={step} style={{ display: 'flex', alignItems: 'flex-start', flex: step < steps.length ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: '4.5rem' }}>
                <div
                  aria-current={active ? 'step' : undefined}
                  style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done || active ? color : 'white',
                    border: `2px solid ${color}`,
                    color: done || active ? 'white' : color,
                    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                  }}
                >
                  {done ? '✓' : step}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: active ? 700 : 400, color, textAlign: 'center', lineHeight: 1.3 }}>
                  {label}
                </span>
              </div>
              {step < steps.length && (
                <div style={{ flex: 1, height: '2px', background: done ? '#278400' : '#d9d9d9', margin: '1rem 0.25rem 0' }} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── SectionMultiSelect ────────────────────────────────────────────────────────

interface SectionMultiSelectProps {
  sections: DocumentSection[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function SectionMultiSelect({ sections, selectedIds, onChange }: SectionMultiSelectProps) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', closeOnOutside)
    return () => document.removeEventListener('click', closeOnOutside)
  }, [open])

  const allSelected = sections.length > 0 && selectedIds.length === sections.length

  function toggleAll() {
    onChange(allSelected ? [] : sections.map(s => s.id))
  }

  function toggle(id: string) {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(s => s !== id)
      : [...selectedIds, id]
    )
  }

  const buttonLabel = selectedIds.length === 0
    ? t('comment.sectionsSelectPlaceholder')
    : allSelected
      ? t('comment.allSections')
      : t('comment.sectionsSelected', { count: selectedIds.length })

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontFamily: 'inherit' }}
      >
        {t('comment.sectionsSelectLabel')}
      </label>
      <p style={{ fontSize: '0.875rem', color: '#5c5c5c', margin: '0 0 0.375rem', fontFamily: 'inherit' }}>
        {t('comment.sectionsSelectHint')}
      </p>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            border: '2px solid #284162',
            borderRadius: open ? '4px 4px 0 0' : '4px',
            background: 'white',
            color: selectedIds.length === 0 ? '#767676' : '#333',
            fontSize: '1rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span>{buttonLabel}</span>
          <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ flexShrink: 0, marginLeft: '0.5rem', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M1 1l4 4 4-4" stroke="#284162" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '2px solid #284162',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 100,
            }}
          >
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', borderBottom: '2px solid #d9d9d9',
              cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
            }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                style={{ accentColor: '#284162', width: '1rem', height: '1rem', flexShrink: 0 }}
              />
              {t('comment.allSections')}
            </label>
            {sections.map(section => (
              <label
                key={section.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e8e8e8',
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: selectedIds.includes(section.id) ? '#f0f4fb' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(section.id)}
                  onChange={() => toggle(section.id)}
                  style={{ accentColor: '#284162', width: '1rem', height: '1rem', flexShrink: 0 }}
                />
                {section[lang]}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── RoleCombobox ──────────────────────────────────────────────────────────────

interface RoleComboboxProps {
  value: RoleKey | ''
  error?: string
  onChange: (key: RoleKey | '') => void
  containerRef?: React.Ref<HTMLDivElement>
}

export function RoleCombobox({ value, error, onChange, containerRef }: RoleComboboxProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState(() => value ? t(`comment.roles.${value}`) : '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setSearch(value ? t(`comment.roles.${value}`) : '')
  }, [value, t])

  const filtered = ROLE_KEYS.filter(k =>
    !search || t(`comment.roles.${k}`).toLowerCase().includes(search.toLowerCase())
  )

  function select(key: RoleKey) {
    onChange(key)
    setSearch(t(`comment.roles.${key}`))
    setOpen(false)
  }

  function handleInput(val: string) {
    setSearch(val)
    onChange('')
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      if (!value) setSearch('')
    }, 150)
  }

  const hasError = !!error

  return (
    <div ref={containerRef} style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="role-combobox"
        style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontFamily: 'inherit' }}
      >
        {t('comment.roleLabel')}
        {' '}<span aria-hidden="true" style={{ color: '#bc3331' }}>*</span>
      </label>
      <p style={{ fontSize: '0.875rem', color: '#5c5c5c', margin: '0 0 0.375rem', fontFamily: 'inherit' }}>
        {t('comment.roleHint')}
      </p>
      {hasError && (
        <p role="alert" style={{ color: '#bc3331', fontSize: '0.875rem', margin: '0 0 0.375rem', fontFamily: 'inherit' }}>
          {error}
        </p>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id="role-combobox"
          type="text"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-haspopup="listbox"
          aria-controls="role-listbox"
          aria-autocomplete="list"
          aria-required="true"
          aria-invalid={hasError || undefined}
          value={search}
          placeholder={t('comment.rolePlaceholder')}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          autoComplete="off"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: `2px solid ${hasError ? '#bc3331' : '#284162'}`,
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        {open && filtered.length > 0 && (
          <ul
            id="role-listbox"
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 2px)',
              left: 0,
              right: 0,
              maxHeight: '16rem',
              overflowY: 'auto',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              border: '2px solid #284162',
              borderRadius: '4px',
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 100,
            }}
          >
            {filtered.map(key => (
              <li
                key={key}
                role="option"
                aria-selected={value === key}
                onMouseDown={e => { e.preventDefault(); select(key) }}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  background: value === key ? '#e8f0fb' : 'white',
                  fontWeight: value === key ? 600 : 400,
                  borderBottom: '1px solid #e8e8e8',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}
              >
                {t(`comment.roles.${key}`)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
