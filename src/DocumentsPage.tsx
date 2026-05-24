import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GcdsHeading, GcdsText } from '@gcds-core/components-react'
import { useLang } from './LangContext'
import { DOCUMENTS } from './data'

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <>
      <GcdsHeading tag="h1">{t('documents.pageTitle')}</GcdsHeading>
      <GcdsText>{t('documents.intro')}</GcdsText>

      <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0' }}>
        {DOCUMENTS.map(doc => {
          const closing = new Date(doc.closingDate)
          const isExpired = new Date() > closing
          const formattedDate = closing.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
          })

          return (
            <li
              key={doc.id}
              style={{
                borderTop: '1px solid #d3d3d3',
                padding: '1.25rem 0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  {isExpired ? (
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '1.125rem', color: '#333' }}>
                      {doc[lang]}
                    </p>
                  ) : (
                    <a
                      href={`/documents/${doc.id}`}
                      onClick={e => { e.preventDefault(); navigate(`/documents/${doc.id}`) }}
                      style={{ fontWeight: 700, fontSize: '1.125rem', color: '#284162', textDecoration: 'underline', display: 'block', marginBottom: '0.25rem' }}
                    >
                      {doc[lang]}
                    </a>
                  )}
                  <GcdsText marginBottom="0" style={{ fontSize: '0.9rem', color: '#5c5c5c' }}>
                    {t('documents.version')} {doc.version}
                  </GcdsText>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: isExpired ? '#f1f1f1' : '#d6ecd2',
                    color: isExpired ? '#5c5c5c' : '#1b5e20',
                    marginBottom: '0.35rem',
                  }}>
                    {isExpired ? t('documents.statusClosed') : t('documents.statusOpen')}
                  </span>
                  <GcdsText marginBottom="0" style={{ fontSize: '0.85rem', color: '#5c5c5c' }}>
                    {isExpired ? t('documents.closedOn') : t('documents.closesOn')} {formattedDate}
                  </GcdsText>
                </div>
              </div>
            </li>
          )
        })}
        <li style={{ borderTop: '1px solid #d3d3d3' }} />
      </ul>
    </>
  )
}
