import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { GcdsHeading, GcdsText, GcdsButton, GcdsNotice, GcdsTable, GcdsPagination, type ReactTableColumn } from '@gcds-core/components-react';
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, totalCount);

  // GCDS's reference table layout puts the rows-per-page control and the row-count status
  // directly after the Sort button and directly before the table — that's GcdsTable's own
  // native .gcds-table__row-management row. There's no prop to put real content there
  // though: its status text is wrong here (the table only ever sees the current page's
  // rows, not the true server-side total of 49), and its rows-per-page select only renders
  // when `pagination` is true, which we can't use since that would make the table paginate
  // our already-paginated 10 rows client-side instead of fetching from the server. So this
  // injects our own control + corrected text directly into the shadow DOM to match the
  // reference's exact element order. Re-synced on every render (no deps) since Stencil's
  // own re-renders can reset this subtree.
  useEffect(() => {
    const tableEl = tableContainerRef.current?.querySelector('gcds-table');
    const rowManagement = tableEl?.shadowRoot?.querySelector('.gcds-table__row-management') as HTMLElement | null;
    if (!rowManagement) return;

    const statusEl = rowManagement.querySelector('.gcds-table__page-info') as HTMLElement | null;
    if (statusEl) {
      statusEl.textContent = t('myComments.rangeOf', { from: rangeFrom, to: rangeTo, count: totalCount });
      statusEl.style.borderInlineStart = '1px solid #d3d3d3';
      statusEl.style.paddingInlineStart = '1rem';
    }

    let selectEl = rowManagement.querySelector('select[data-custom-page-size]') as HTMLSelectElement | null;
    if (!selectEl) {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.5rem';
      label.appendChild(document.createTextNode(''));

      selectEl = document.createElement('select');
      selectEl.dataset.customPageSize = 'true';
      selectEl.style.border = 'none';
      selectEl.style.background = 'transparent';
      selectEl.style.font = 'inherit';
      selectEl.addEventListener('change', () => {
        setPageSize(Number(selectEl!.value));
        setPage(1);
      });
      label.appendChild(selectEl);

      rowManagement.insertBefore(label, statusEl ?? rowManagement.firstChild);
    }

    const labelTextNode = selectEl.parentElement?.firstChild;
    if (labelTextNode) labelTextNode.textContent = t('myComments.rowsPerPage');

    selectEl.innerHTML = '';
    PAGE_SIZE_OPTIONS.forEach(size => {
      const opt = document.createElement('option');
      opt.value = String(size);
      opt.textContent = String(size);
      selectEl!.appendChild(opt);
    });
    selectEl.value = String(pageSize);
  });

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
      // GcdsTable's `sort` prop is global ("enable sorting, overridable per column") — a
      // column that omits `sort` inherits that global default rather than staying
      // unsortable, so this must be explicit. Document title isn't sortable server-side
      // (see SORT_FIELD_TO_API above).
      sort: false,
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
      sort: false,
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
          {/* The rows-per-page control and row-count status are injected directly into
              GcdsTable's own native .gcds-table__row-management row (see the effect above)
              to match the GC Design System reference's exact element order — Sort button,
              then this row, then the table — rather than duplicating them as a separate
              element here. */}
          <GcdsTable
            columns={columns as unknown as ReactTableColumn[]}
            data={rows as unknown as Record<string, unknown>[]}
            sort
            lang={lang}
            captionSlot={t('myComments.pageTitle')}
          />

          {totalPages > 1 && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <GcdsPagination
                display="list"
                currentPage={page}
                totalPages={totalPages}
                label={t('myComments.paginationLabel')}
                lang={lang}
                onGcdsClick={(e: CustomEvent<string | object>) => {
                  const detail = e.detail
                  if (typeof detail === 'object' && detail !== null && 'page' in detail) {
                    setPage((detail as { page: number }).page)
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
