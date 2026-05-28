# GC Design System — Comment Form Study

A prototype bilingual (EN/FR) comment submission form built with the GC Design System component library. Implements two layout variants, rich-text editing, draft auto-save, and a multi-step review flow.

---

## Tech stack

| Package | Version | Purpose |
|---|---|---|
| `@gcds-core/components-react` | ^1.2.0 | GC Design System web components (React wrapper) |
| `react` / `react-dom` | ^19 | UI framework |
| `react-router-dom` | ^7 | Client-side routing |
| `i18next` + `react-i18next` | ^26 / ^17 | EN/FR translations |
| `vite` | ^8 | Dev server and bundler |
| `typescript` | ^6 | Type checking |

---

## File map

```
src/
├── main.tsx                          # Entry — mounts providers + router
├── App.tsx                           # Routes + shared shell (header, nav, footer)
├── index.css                         # Global resets
│
├── AuthContext.tsx                   # Mock auth — swap for real IdP here
├── LangContext.tsx                   # EN/FR toggle, keeps i18next in sync
│
├── data.ts                           # Document catalogue (id, title EN/FR, version, sections)
│
├── i18n/
│   ├── index.ts                      # i18next init — registers translation + editor namespaces
│   ├── en.json                       # English strings (navigation, form labels, statuses, …)
│   └── fr.json                       # French strings (same keys)
│
├── CommentShared.tsx                 # All shared types, helpers, and sub-components
├── CommentPage.tsx                   # Layout A — list (all sections stacked vertically)
└── CommentPageAlt.tsx                # Layout B — tab (side nav + one section at a time)
│
└── components/
    └── richtext/
        ├── RichTextEditor.tsx        # contenteditable rich-text editor with toolbar
        ├── en.json                   # Editor toolbar labels (EN) — "editor" i18next namespace
        └── fr.json                   # Editor toolbar labels (FR)
```

---

## How the pieces connect

### 1. Entry point (`main.tsx`)

Wraps the app in three providers (order matters):

```
BrowserRouter → AuthProvider → LangProvider → App
```

- **`AuthProvider`** — exposes `useAuth()` → `{ user: { id, name } }`. The `user.id` is used to namespace localStorage draft keys so multiple users on the same browser don't collide.
- **`LangProvider`** — exposes `useLang()` → `{ lang, toggleLang }`. Calls `i18n.changeLanguage()` on toggle so GCDS components (which take a `lang` prop) and `t()` calls stay in sync.

### 2. Routing (`App.tsx`)

```
/                          → CommentPage       (list layout)
/documents/:id/alt         → CommentPageAlt    (tab layout)
```

Both routes share the same `AppLayout` shell (GcdsHeader, GcdsContainer, GcdsFooter). Breadcrumbs are rendered inside the header via a `<Routes>` sub-tree so they can read the `:id` param.

### 3. Document data (`data.ts`)

The catalogue is a static array of `DocumentRecord` objects. Each record has:

- `id` — URL slug and localStorage key fragment
- `en` / `fr` — bilingual title (accessed as `doc[lang]`)
- `version` — included in draft keys to invalidate stale drafts across version bumps
- `closingDate` — ISO date string; compared against `new Date()` to gate submissions
- `sections[]` — array of `{ id, en, fr }` used to build comment editors

**To add a document:** append an object to `DOCUMENTS`. Sections appear automatically in both layouts.

### 4. Shared types and components (`CommentShared.tsx`)

Everything both layouts need lives here.

**Types**

```ts
SubComment          { id: string; comment: string }
SectionComments     { sectionId: string; subComments: SubComment[] }
RoleKey             'manager' | 'director' | 'architect' | 'analyst' | 'researcher' | 'developer' | 'policy'
SupportStatus       'support' | 'support-with-comments' | 'support-with-modifications' | 'do-not-support' | 'reviewed-no-opinion'
Draft               { role, supportStatus?, generalComment?, selectedSectionIds?, comments, savedAt }
```

**Helpers**

```ts
isCommentEnabled(status)   // true for statuses 2, 3, 4 — gates comment area visibility
initComments(sections)     // seeds one empty SubComment per section on form init
emptySubComment()          // { id: crypto.randomUUID(), comment: '' }
```

**Sub-components**

| Component | Props | Purpose |
|---|---|---|
| `StepProgress` | `current: 1 \| 2 \| 3` | Step indicator (Comment → Review → Submitted) |
| `RoleCombobox` | `value`, `error`, `onChange`, `containerRef` | Accessible combobox with type-ahead filtering over `ROLE_KEYS` |
| `SectionMultiSelect` | `sections`, `selectedIds`, `onChange` | Custom multi-select dropdown with "All sections" toggle and click-outside close |
| `Section` | `section`, `comments`, `onUpdate`, `hideLegend?`, `showSplitControl?` | Renders one section's comment editor(s). `showSplitControl` adds a checkbox to split into multiple sub-comments. Pass `hideLegend` in the tab layout (section name comes from the side nav, not a fieldset legend). |
| `SubCommentField` | `sub`, `index`, `onUpdate`, `onRemove`, `showRemove` | Single rich-text editor within a split section, wrapped in a fieldset |

### 5. Rich-text editor (`components/richtext/RichTextEditor.tsx`)

A `contenteditable` div with a toolbar. Uses `document.execCommand` for formatting. Toolbar actions: bold, italic, underline, strikethrough, text colour, heading level, bullet list, ordered list, indent/outdent, insert/delete table, undo, redo.

Uses the `editor` i18n namespace (`useTranslation('editor')`), which is registered separately from the main `translation` namespace in `i18n/index.ts`.

> **Note:** `execCommand` is deprecated but remains the only cross-browser `contenteditable` API without a heavyweight dependency.

### 6. List layout (`CommentPage.tsx`)

**Form flow**

```
Role (combobox, required)
↓
Document (native <select>, required — only open docs shown)
↓
Support status (native <select>, required)
↓  [only when status is 2, 3, or 4]
General comment (RichTextEditor)
Sections to comment on (SectionMultiSelect)
  ↓ [for each selected section]
  Section editor (Section, split checkbox on first section only)
↓
File uploads (GcdsFileUploader)
↓
Submit / Save draft
```

**Why native `<select>` instead of `GcdsSelect`?**
GCDS Stencil components only read `defaultValue` on mount; they don't respond to programmatic `value` changes. Native selects support the React controlled pattern needed to restore drafts and reset on document change.

**Draft persistence**

Key format: `draft:{userId}:{docId}:v{version}`

Auto-saves 1.5 s after any change to `role`, `supportStatus`, `generalComment`, `selectedSectionIds`, or `comments`. Manual "Save draft" button saves immediately. Switching documents loads that document's draft (or starts fresh); the previous doc's draft is preserved in storage.

**Multi-step review**

`confirming` state switches to a read-only review screen (step 2). Confirming transitions to `submitted` (step 3) and removes the draft from localStorage.

### 7. Tab layout (`CommentPageAlt.tsx`)

Same form flow and draft shape as the list layout, but sections are navigated via `GcdsSideNav` instead of being stacked. Key differences:

- `filteredSections = sections.filter(s => selectedSectionIds.includes(s.id))` — only selected sections appear in the nav
- `clampedTab = Math.min(activeTab, filteredSections.length - 1)` — prevents out-of-bounds when selection changes
- `showSplitControl={clampedTab === 0}` — split checkbox only on the first section in the nav
- `hideLegend` passed to `Section` — the section heading comes from the nav link, not a fieldset legend

A link at the top of each layout lets users switch between them (`/` ↔ `/documents/:id/alt`).

---

## Adding a new document

Edit `src/data.ts`:

```ts
{
  id: 'my-new-doc',
  en: 'My New Policy Document',
  fr: 'Mon nouveau document de politique',
  version: '1.0',
  closingDate: '2026-12-31',       // ISO date — past dates close the form
  sections: [
    { id: 'background', en: 'Background', fr: 'Contexte' },
    { id: 'requirements', en: 'Requirements', fr: 'Exigences' },
  ],
}
```

The document appears in the dropdown automatically. No other changes required.

---

## Connecting a real backend

On confirmed submission, both pages build a `requestBody` object:

```ts
{
  userId: string
  role: RoleKey
  supportStatus: SupportStatus
  generalComment: string        // HTML string, empty when status is 1 or 5
  documentId: string
  version: string
  submittedAt: string           // ISO timestamp
  attachments: string[]         // file names from GcdsFileUploader
  sections: Array<{
    sectionId: string
    subComments: Array<{ comment: string }>   // HTML strings, only non-empty entries
  }>
}
```

Replace the `handleConfirm` function body in both `CommentPage.tsx` and `CommentPageAlt.tsx` with a `fetch`/`axios` POST. The `requestBody` object is already assembled.

---

## Replacing mock auth

`AuthContext.tsx` exports a hardcoded `MOCK_USER`. Replace the `AuthProvider` body with your real IdP integration (Azure AD MSAL, Keycloak, etc.) and keep the same `{ user: { id, name } }` context shape — no other files need to change.
