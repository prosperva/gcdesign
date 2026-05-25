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

export interface Draft {
  role: RoleKey | ''
  customRole: string
  comments: SectionComments[]
  savedAt: string
}

export const ROLE_KEYS = ['manager','director','architect','analyst','researcher','developer','policy','other'] as const
export type RoleKey = typeof ROLE_KEYS[number]

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
}

export function Section({ section, comments, onUpdate, hideLegend }: SectionProps) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const isSplit = comments.subComments.length > 1

  function updateSubComment(subId: string, value: string) {
    onUpdate(section.id, comments.subComments.map(s => s.id === subId ? { ...s, comment: value } : s))
  }

  function split() {
    onUpdate(section.id, [...comments.subComments, emptySubComment()])
  }

  function removeSubComment(subId: string) {
    onUpdate(section.id, comments.subComments.filter(s => s.id !== subId))
  }

  const inner = isSplit ? (
    <>
      {comments.subComments.map((sub, i) => (
        <SubCommentField
          key={sub.id} sub={sub} index={i}
          onUpdate={updateSubComment} onRemove={removeSubComment}
          showRemove={comments.subComments.length > 1}
        />
      ))}
      <GcdsButton type="button" buttonRole="secondary" size="small" style={{ marginTop: '1rem' }} onClick={split}>
        {t('comment.addComment')}
      </GcdsButton>
    </>
  ) : (
    <>
      <RichTextEditor
        id={`comment-${comments.subComments[0].id}`}
        label={t('comment.commentLabel')}
        value={comments.subComments[0].comment}
        onChange={html => updateSubComment(comments.subComments[0].id, html)}
      />
      <GcdsButton type="button" buttonRole="secondary" size="small" style={{ marginTop: '0.75rem' }} onClick={split}>
        {t('comment.splitComment')}
      </GcdsButton>
    </>
  )

  return hideLegend
    ? <div style={{ marginBottom: '1rem' }}>{inner}</div>
    : <GcdsFieldset legend={section[lang]} legendSize="h3" style={{ marginBottom: '2rem' }}>{inner}</GcdsFieldset>
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
