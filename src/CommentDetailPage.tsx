import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { GcdsHeading, GcdsText, GcdsButton, GcdsNotice } from '@gcds-core/components-react';
import { useLang } from './LangContext';
import { api, ApiError } from './api/api';
import type { CommentDetailDto, DocumentDto, SectionDto } from './api/types';

function titleFor(item: { titleEn: string; titleFr: string }, lang: 'en' | 'fr') {
  return lang === 'fr' ? item.titleFr : item.titleEn;
}

const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
  'support': { bg: '#e6f4ea', text: '#1e4620' },
  'support-with-comments': { bg: '#e6f4ea', text: '#1e4620' },
  'support-with-modifications': { bg: '#fdf0d5', text: '#7a4d00' },
  'do-not-support': { bg: '#fbe7e7', text: '#8b1d1d' },
  'reviewed-no-opinion': { bg: '#f0f0f0', text: '#444444' },
};

export default function CommentDetailPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [comment, setComment] = useState<CommentDetailDto | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [sections, setSections] = useState<SectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setNotFound(false);
    Promise.all([api.getComment(id), api.getDocuments(), api.getSections()])
      .then(([commentData, documentsData, sectionsData]) => {
        if (cancelled) return;
        setComment(commentData);
        setDocuments(documentsData);
        setSections(sectionsData);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const document = comment ? documents.find(d => d.id === comment.documentId) : undefined;
  const submittedAt = comment
    ? new Date(comment.submittedAt).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  function sectionTitle(sectionId: number | null) {
    if (!sectionId) return t('commentDetail.noSpecificSection');
    const section = sections.find(s => s.id === sectionId);
    return section ? titleFor(section, lang) : String(sectionId);
  }

  return (
    <>
      <GcdsButton type="button" buttonRole="secondary" onClick={() => navigate('/comments')} style={{ marginBottom: '1.5rem' }}>
        {t('commentDetail.back')}
      </GcdsButton>

      <GcdsHeading tag="h1">{t('commentDetail.pageTitle')}</GcdsHeading>

      {loading && <GcdsText>{t('commentDetail.loading')}</GcdsText>}

      {!loading && notFound && (
        <GcdsNotice noticeRole="danger" noticeTitleTag="h2" noticeTitle={t('commentDetail.notFoundTitle')}>
          {t('commentDetail.notFoundBody')}
        </GcdsNotice>
      )}

      {!loading && error && (
        <GcdsNotice noticeRole="danger" noticeTitleTag="h2" noticeTitle={t('commentDetail.loadErrorTitle')}>
          {t('commentDetail.loadErrorBody')}
        </GcdsNotice>
      )}

      {!loading && !error && !notFound && comment && (
        <>
          <div style={{ border: '1px solid #d3d3d3', borderRadius: '0.5rem', margin: '0 0 2rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem 1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('commentDetail.document')}
                </p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#284162' }}>
                  {document ? titleFor(document, lang) : comment.documentId}
                </p>
                <p style={{ margin: '0.375rem 0 0', fontSize: '0.85rem', color: '#5c5c5c' }}>
                  {t('commentDetail.version')} {comment.version}
                  {' · '}
                  <span style={{ fontFamily: 'monospace' }}>{t('commentDetail.id')} {comment.id}</span>
                </p>
              </div>

              {(() => {
                const colors = POSITION_COLORS[comment.supportStatus.id] ?? POSITION_COLORS['reviewed-no-opinion'];
                return (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      background: colors.bg,
                      color: colors.text,
                    }}
                  >
                    {titleFor(comment.supportStatus, lang)}
                  </span>
                );
              })()}
            </div>

            <dl style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', margin: 0, padding: '1rem 1.5rem', borderTop: '1px solid #e8e8e8', background: '#fafbfc' }}>
              <div>
                <dt style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('commentDetail.role')}
                </dt>
                <dd style={{ margin: '0.25rem 0 0' }}>
                  {[...comment.roles.map(r => titleFor(r, lang)), ...(comment.otherRole ? [comment.otherRole] : [])].join(', ') || '—'}
                </dd>
              </div>

              <div>
                <dt style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5c5c5c', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('commentDetail.submittedAt')}
                </dt>
                <dd style={{ margin: '0.25rem 0 0' }}>{submittedAt}</dd>
              </div>
            </dl>
          </div>

          <section style={{ marginBottom: '2rem' }}>
            <GcdsHeading tag="h2">{t('commentDetail.generalCommentLabel')}</GcdsHeading>
            {comment.generalComment
              ? <div dangerouslySetInnerHTML={{ __html: comment.generalComment }} />
              : <GcdsText>{t('commentDetail.noGeneralComment')}</GcdsText>}
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <GcdsHeading tag="h2">{t('commentDetail.sectionCommentsLabel')}</GcdsHeading>
            {comment.sections.length === 0 ? (
              <GcdsText>{t('commentDetail.noSectionComments')}</GcdsText>
            ) : (
              comment.sections.map((sub, i) => (
                <div key={i} style={{ borderTop: '1px solid #d3d3d3', padding: '1rem 0' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#284162' }}>
                    {sectionTitle(sub.sectionId)}
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: sub.comment }} />
                </div>
              ))
            )}
          </section>

          <section>
            <GcdsHeading tag="h2">{t('commentDetail.attachmentsLabel')}</GcdsHeading>
            {comment.attachments.length === 0 ? (
              <GcdsText>{t('commentDetail.noAttachments')}</GcdsText>
            ) : (
              <ul>
                {comment.attachments.map((file, i) => <li key={i}>{file}</li>)}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
