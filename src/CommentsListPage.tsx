import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { GcdsHeading, GcdsText, GcdsButton, GcdsNotice, GcdsTable, type ReactTableColumn } from '@gcds-core/components-react';
import { useLang } from './LangContext';
import { api } from './api/client';
import type { CommentListItem } from './api/types';

// NB: deliberately not named "id" — the @gcds-core/components-react GcdsTable
// wrapper (1.7.0) computes slotted-cell names from a data row's own "id" field,
// while the underlying web component expects names keyed by TanStack's internal
// row id (which defaults to the row's array index, since no getRowId is
// configured). Those only coincide when a row's "id" happens to equal its array
// position, which is never true for real database ids — so any row property
// literally named "id" silently breaks every slotted cell in that row. Naming
// it commentId sidesteps the bug entirely (the wrapper falls back to the row's
// array index, which is what the component actually expects).
interface CommentRow {
  commentId: number;
  document: string;
  documentLink: string | null;
  role: string;
  position: string;
  submitted: number;
}

export default function CommentsListPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [comments, setComments] = useState<CommentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const justSubmitted = Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    api.getComments()
      .then(data => { if (!cancelled) setComments(data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rows: CommentRow[] = useMemo(() => comments.map(c => ({
    commentId: c.id,
    document: (lang === 'fr' ? c.documentTitleFr : c.documentTitleEn) ?? c.documentId,
    documentLink: c.documentLink,
    role: t(`comment.roles.${c.role}`),
    position: t(`comment.statuses.${c.supportStatus}`),
    submitted: new Date(c.submittedAt).getTime(),
  })), [comments, lang, t]);

  const columns: ReactTableColumn<CommentRow>[] = useMemo(() => [
    {
      field: 'commentId',
      header: t('myComments.id'),
      sort: true,
      alignment: 'start',
    },
    {
      field: 'document',
      header: t('myComments.document'),
      sort: true,
      slotted: true,
      renderCell: ({ row }) => row.documentLink ? (
        <a
          href={row.documentLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${row.document} (${t('myComments.opensNewTab')})`}
          style={{ fontWeight: 700, color: '#284162' }}
        >
          {row.document}
        </a>
      ) : (
        <span style={{ fontWeight: 700, color: '#284162' }}>{row.document}</span>
      ),
    },
    {
      field: 'role',
      header: t('myComments.role'),
      sort: true,
    },
    {
      field: 'position',
      header: t('myComments.position'),
      sort: true,
    },
    {
      field: 'submitted',
      header: t('myComments.submittedAt'),
      sort: true,
      slotted: true,
      renderCell: ({ row }) => new Date(row.submitted).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    },
    {
      field: 'actions',
      header: t('myComments.actions'),
      alignment: 'center',
      slotted: true,
      renderCell: ({ row }) => (
        <GcdsButton
          type="button"
          buttonRole="secondary"
          size="small"
          onClick={() => navigate(`/comments/${row.commentId}`)}
        >
          {t('myComments.view')}
        </GcdsButton>
      ),
    },
  ], [t, lang, navigate]);

  return (
    <>
      <GcdsHeading tag="h1">{t('myComments.pageTitle')}</GcdsHeading>
      <GcdsText>{t('myComments.intro')}</GcdsText>

      {justSubmitted && (
        <GcdsNotice noticeRole="success" noticeTitleTag="h2" noticeTitle={t('myComments.submittedNoticeTitle')} style={{ marginBottom: '1.5rem' }}>
          {t('myComments.submittedNoticeBody')}
        </GcdsNotice>
      )}

      <GcdsButton type="button" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
        {t('myComments.createNew')}
      </GcdsButton>

      {loading && <GcdsText>{t('myComments.loading')}</GcdsText>}

      {!loading && error && (
        <GcdsNotice noticeRole="danger" noticeTitleTag="h2" noticeTitle={t('myComments.loadErrorTitle')}>
          {t('myComments.loadErrorBody')}
        </GcdsNotice>
      )}

      {!loading && !error && comments.length === 0 && (
        <GcdsText>{t('myComments.empty')}</GcdsText>
      )}

      {!loading && !error && comments.length > 0 && (
        <GcdsTable
          columns={columns}
          data={rows}
          sort
          pagination
          paginationSize={10}
          paginationSizeOptions={[5, 10, 25]}
          lang={lang}
          captionSlot={t('myComments.pageTitle')}
        />
      )}
    </>
  );
}
