import { useEffect, useRef, useState, type Ref } from 'react'
import { useTranslation } from 'react-i18next'

// Not a real Role row — a sentinel the UI treats specially: checking it reveals a free-text
// field, and it's excluded from the numeric ids sent as CreateCommentRequest.roles (sent as
// otherRole instead). See CommentPage.tsx's handleConfirm.
export const OTHER_ROLE_ID = 'other'

export interface RoleOption {
  id: string
  label: string
}

interface RoleMultiSelectProps {
  roles: RoleOption[]
  selectedIds: string[]
  otherText: string
  error?: string
  otherError?: string
  onChange: (ids: string[]) => void
  onOtherTextChange: (text: string) => void
  containerRef?: Ref<HTMLDivElement>
}

export function RoleMultiSelect({
  roles, selectedIds, otherText, error, otherError, onChange, onOtherTextChange, containerRef,
}: RoleMultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', closeOnOutside)
    return () => document.removeEventListener('click', closeOnOutside)
  }, [open])

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id])
  }

  const hasError = !!error
  const includesOther = selectedIds.includes(OTHER_ROLE_ID)

  const buttonLabel = selectedIds.length === 0
    ? t('comment.rolePlaceholder')
    : t('comment.rolesSelected', { count: selectedIds.length })

  return (
    <div ref={containerRef} style={{ marginBottom: '1.5rem' }}>
      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontFamily: 'inherit' }}>
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
      <div ref={wrapperRef} style={{ position: 'relative' }}>
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
            border: `2px solid ${hasError ? '#bc3331' : '#284162'}`,
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
              maxHeight: '16rem',
              overflowY: 'auto',
            }}
          >
            {roles.map(role => (
              <label
                key={role.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderBottom: '1px solid #e8e8e8',
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: selectedIds.includes(role.id) ? '#f0f4fb' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(role.id)}
                  onChange={() => toggle(role.id)}
                  style={{ accentColor: '#284162', width: '1rem', height: '1rem', flexShrink: 0 }}
                />
                {role.label}
              </label>
            ))}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit',
                background: includesOther ? '#f0f4fb' : 'white',
              }}
            >
              <input
                type="checkbox"
                checked={includesOther}
                onChange={() => toggle(OTHER_ROLE_ID)}
                style={{ accentColor: '#284162', width: '1rem', height: '1rem', flexShrink: 0 }}
              />
              {t('comment.roles.other')}
            </label>
          </div>
        )}
      </div>

      {includesOther && (
        <div style={{ marginTop: '0.75rem' }}>
          <label
            htmlFor="role-other-text"
            style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontFamily: 'inherit' }}
          >
            {t('comment.roleOtherLabel')}
            {' '}<span aria-hidden="true" style={{ color: '#bc3331' }}>*</span>
          </label>
          {otherError && (
            <p role="alert" style={{ color: '#bc3331', fontSize: '0.875rem', margin: '0 0 0.375rem', fontFamily: 'inherit' }}>
              {otherError}
            </p>
          )}
          <input
            id="role-other-text"
            type="text"
            value={otherText}
            onChange={e => onOtherTextChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: `2px solid ${otherError ? '#bc3331' : '#284162'}`,
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}
