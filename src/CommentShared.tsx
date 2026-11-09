import { useTranslation } from 'react-i18next'

export interface SplitComment {
  id: string
  sectionId: string
  comment: string
}

export const emptySplitComment = (): SplitComment => ({ id: crypto.randomUUID(), sectionId: '', comment: '' })

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
