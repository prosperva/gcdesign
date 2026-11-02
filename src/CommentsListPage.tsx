import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { GcdsHeading, GcdsText, GcdsButton, GcdsNotice, GcdsTable, type ReactTableColumn } from '@gcds-core/components-react';
import { useLang } from './LangContext';
import { api } from './api/api';
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

// Maps a column's `field` (the row-data key, constrained by the naming gotcha above)
// to the sortBy value the API actually understands. Document title isn't in here — it's
// joined in by the middleware from a separate table, not sortable server-side.
const SORT_FIELD_TO_API: Record<string, string> = {
  commentId: 'id',
  role: 'role',
  position: 'position',
  submitted: 'submitted',
};

const PAGE_SIZE_OPTIONS = [5, 10, 25];

interface TableSortingState {
  sorting: { id: string; desc: boolean }[] | null;
}

export default function CommentsListPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<CommentListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('submitted');
  const [sortDescending, setSortDescending] = useState(true);

  const justSubmitted = Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    api.getComments({ page, pageSize, sortBy, sortDescending })
      .then(data => {
        if (cancelled) return;
        setComments(data.items);
        setTotalCount(data.totalCount);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, sortBy, sortDescending]);

  // The React wrapper's prop types only cover standard DOM events, not the table's own
  // gcdsTableStateChange — so this listens on the real custom element directly instead
  // of trying to pass an onGcdsTableStateChange prop the types don't know about.
  useEffect(() => {
    const tableEl = tableContainerRef.current?.querySelector('gcds-table');
    if (!tableEl) return;

    function handleStateChange(e: Event) {
      const sorting = (e as CustomEvent<TableSortingState>).detail.sorting;
      const next = sorting?.[0];
      const nextSortBy = next ? SORT_FIELD_TO_API[next.id] : undefined;

      if (nextSortBy && (nextSortBy !== sortBy || next!.desc !== sortDescending)) {
        setSortBy(nextSortBy);
        setSortDescending(next!.desc);
        setPage(1);
      } else if (!next && (sortBy !== 'submitted' || !sortDescending)) {
        // Sort cleared (or the user picked a non-sortable column, e.g. Document) — fall
        // back to the default order rather than silently keeping a stale sort applied.
        setSortBy('submitted');
        setSortDescending(true);
        setPage(1);
      }
    }

    tableEl.addEventListener('gcdsTableStateChange', handleStateChange);
    return () => tableEl.removeEventListener('gcdsTableStateChange', handleStateChange);
  }, [loading, error, sortBy, sortDescending]);

  const rows: CommentRow[] = useMemo(() => comments.map(c => ({
    commentId: c.id,
    document: (lang === 'fr' ? c.documentTitleFr : c.documentTitleEn) ?? String(c.documentId),
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
      field: 'position',
      header: t('myComments.position'),
      sort: true,
    },
    {
      field: 'role',
      header: t('myComments.role'),
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, totalCount);

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

      {!loading && !error && totalCount === 0 && (
        <GcdsText>{t('myComments.empty')}</GcdsText>
      )}

      {!loading && !error && totalCount > 0 && (
        <div ref={tableContainerRef}>
          {/* GcdsTableProps isn't actually generic — columns/data are typed as
              ReactTableColumn<Record<string, unknown>>[] / Record<string, unknown>[]
              regardless of the T a ReactTableColumn<T> is built with — so our concretely
              typed CommentRow columns/rows need a cast to satisfy the prop types. This is
              a vendor typing gap, not a real shape mismatch: at runtime these are exactly
              the CommentRow objects the renderCell callbacks above expect. */}
          <GcdsTable
            columns={columns as unknown as ReactTableColumn[]}
            data={rows as unknown as Record<string, unknown>[]}
            sort
            lang={lang}
            captionSlot={t('myComments.pageTitle')}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1.5rem',
              padding: '0.75rem 1rem',
              border: '1px solid #e0e0e0',
              borderTop: 'none',
              color: '#5c5c5c',
              fontSize: '0.875rem',
              flexWrap: 'wrap',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('myComments.rowsPerPage')}
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem' }}
              >
                {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>

            <span>{t('myComments.rangeOf', { from: rangeFrom, to: rangeTo, count: totalCount })}</span>

            <span style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                aria-label={t('myComments.previousPage')}
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: page <= 1 ? 'default' : 'pointer',
                  color: page <= 1 ? '#b0b0b0' : '#284162',
                  fontSize: '1rem',
                  padding: '0.25rem 0.5rem',
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t('myComments.nextPage')}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: page >= totalPages ? 'default' : 'pointer',
                  color: page >= totalPages ? '#b0b0b0' : '#284162',
                  fontSize: '1rem',
                  padding: '0.25rem 0.5rem',
                }}
              >
                ›
              </button>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
