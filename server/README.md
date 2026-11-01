# GcDesignStudy.Api

Backend for the comment-on-a-document flow: saves a submitted comment (main row +
its split-comment rows), lists a user's own comments, and serves the lookup data
(documents, sections, roles, support statuses) the comment form needs.

## Tables

| Table | What it is |
|---|---|
| `Comments` | Main comment submission row. FKs into `Documents`, `Roles`, and `SupportStatuses`. |
| `CommentSections` | Split-comment blocks per `Comment`. Optional FK into `Sections`. |
| `Documents` | Published documents open (or previously open) for comment. |
| `Sections` | Predefined sections a comment can be tied to — global, same set for every document (no per-document relationship, matching `src/data.ts`). |
| `Roles` | Valid role keys for the role picker. |
| `SupportStatuses` | Valid "your position" keys, with `CommentsEnabled` marking which ones unlock the comment fields (mirrors `isCommentEnabled()` in `CommentShared.tsx`). |

## Setup

This project is **DB-first**: the database is authoritative, and `Entities/` +
`AppDbContext.cs` are a hand-maintained model of a schema that already exists — they
don't create or own it. There are no EF migrations in this project and none should be
added; `dotnet ef migrations add` is not part of this workflow.

```bash
cd server/GcDesignStudy.Api
dotnet restore
```

Point `ConnectionStrings:Default` in `appsettings.json` (or an `appsettings.Development.json`
override, or user-secrets) at a SQL Server instance that already has the `Comments`,
`CommentSections`, `Documents`, `Sections`, `Roles`, and `SupportStatuses` tables (see
below) populated, then:

```bash
dotnet run
```

Swagger UI opens at `/swagger` in Development.

**If a schema change is needed**, make it directly in SQL (and seed any new lookup rows
the same way), then update the matching entity/`OnModelCreating` config in
`Data/AppDbContext.cs` by hand to match. The two must be kept in sync manually — EF won't
generate or detect the difference for you in this workflow.

## What's not wired up yet

- **Auth.** `Program.cs` calls `AddAuthentication()`/`AddAuthorization()` with no scheme —
  `[Authorize]` on `CommentsController` will 401 everything until a real scheme (JWT, cookie,
  etc.) is registered there. `CurrentUserService` just reads `ClaimTypes.NameIdentifier`
  off `HttpContext.User`, so it'll work with whatever you plug in.
- **CORS** is pointed at `http://localhost:5173` (the Vite dev server) only.

## Endpoints

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/comments` | Saves a `Comment` + its `CommentSection` rows. Called on confirm. |
| `GET` | `/api/comments` | Lists the logged-in user's own comments, newest first. |
| `GET` | `/api/comments/{id}` | Full detail for one of the user's own comments. |
| `GET` | `/api/documents` | Documents available for the document picker. |
| `GET` | `/api/sections` | Predefined sections available to comment on. |
| `GET` | `/api/roles` | Valid role keys for the role picker. |
| `GET` | `/api/support-statuses` | Valid position keys for the "Your position" picker. |
