-- GcDesignStudy database schema.
--
-- This project is DB-first: this script — not EF migrations — is the source of truth
-- for the schema. Run it directly against SQL Server to (re)create the tables, then keep
-- server/GcDesignStudy.Api/Entities/ and Data/AppDbContext.cs in sync with it by hand.
--
-- Safe to re-run: each CREATE TABLE is guarded, so it only creates what's missing.
--
--   docker exec -i gcdesign-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P '<password>' -d GcDesignStudy -i /dev/stdin < schema.sql

-- ── Lookup tables ──────────────────────────────────────────────────────────
-- Predefined, global reference data — all identified by a plain numeric Id; there's no
-- semantic string key anywhere in this schema (Role/SupportStatus display text comes
-- from the frontend's i18n files, keyed by that same numeric id as a string, e.g.
-- "comment.roles.1" — see src/i18n/en.json). No FK relationship between Documents and
-- Sections — sections are the same set for every document (see src/data.ts).

IF OBJECT_ID('dbo.Documents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Documents (
        Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Documents PRIMARY KEY,
        TitleEn      NVARCHAR(300)     NOT NULL,
        TitleFr      NVARCHAR(300)     NOT NULL,
        Version      NVARCHAR(20)      NOT NULL,
        ClosingDate  DATETIME2         NOT NULL,
        DocumentLink NVARCHAR(500)     NOT NULL
    );
END;

IF OBJECT_ID('dbo.Sections', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Sections (
        Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Sections PRIMARY KEY,
        TitleEn    NVARCHAR(300)     NOT NULL,
        TitleFr    NVARCHAR(300)     NOT NULL,
        AllowSplit BIT               NOT NULL,
        SortOrder  INT               NOT NULL
    );
END;

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Roles PRIMARY KEY,
        TitleEn   NVARCHAR(300)     NOT NULL,
        TitleFr   NVARCHAR(300)     NOT NULL,
        SortOrder INT               NOT NULL
    );
END;

IF OBJECT_ID('dbo.SupportStatuses', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SupportStatuses (
        Id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SupportStatuses PRIMARY KEY,
        TitleEn         NVARCHAR(300)     NOT NULL,
        TitleFr         NVARCHAR(300)     NOT NULL,
        CommentsEnabled BIT               NOT NULL,
        SortOrder       INT               NOT NULL
    );
END;

-- ── Comments ────────────────────────────────────────────────────────────────
-- Main submission row. UserId is the Entra ID "oid" claim once real auth lands
-- (currently a dev-mode stand-in — see CurrentUserService.cs).

IF OBJECT_ID('dbo.Comments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Comments (
        Id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Comments PRIMARY KEY,
        UserId          NVARCHAR(100)     NOT NULL,
        DocumentId      INT               NOT NULL,
        Version         NVARCHAR(20)      NOT NULL,
        SupportStatusId INT               NOT NULL,
        OtherRole       NVARCHAR(200)     NULL,  -- free text when "Other" is selected alongside/instead of a listed role
        GeneralComment  NVARCHAR(MAX)     NULL,
        Attachments     NVARCHAR(MAX)     NOT NULL,  -- JSON-serialized string[]
        SubmittedAt     DATETIME2         NOT NULL,

        CONSTRAINT FK_Comments_Documents_DocumentId
            FOREIGN KEY (DocumentId) REFERENCES dbo.Documents (Id),
        CONSTRAINT FK_Comments_SupportStatuses_SupportStatusId
            FOREIGN KEY (SupportStatusId) REFERENCES dbo.SupportStatuses (Id)
    );

    CREATE INDEX IX_Comments_UserId ON dbo.Comments (UserId);
    CREATE INDEX IX_Comments_DocumentId ON dbo.Comments (DocumentId);
    CREATE INDEX IX_Comments_SupportStatusId ON dbo.Comments (SupportStatusId);
END;

-- ── CommentRoles ────────────────────────────────────────────────────────────
-- A comment can be submitted under more than one role (e.g. Manager + Policy
-- Officer) — many-to-many join table, no own Id.

IF OBJECT_ID('dbo.CommentRoles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CommentRoles (
        CommentId INT NOT NULL,
        RoleId    INT NOT NULL,

        CONSTRAINT PK_CommentRoles PRIMARY KEY (CommentId, RoleId),
        CONSTRAINT FK_CommentRoles_Comments_CommentId
            FOREIGN KEY (CommentId) REFERENCES dbo.Comments (Id) ON DELETE CASCADE,
        CONSTRAINT FK_CommentRoles_Roles_RoleId
            FOREIGN KEY (RoleId) REFERENCES dbo.Roles (Id)
    );

    CREATE INDEX IX_CommentRoles_RoleId ON dbo.CommentRoles (RoleId);
END;

-- ── CommentSections ─────────────────────────────────────────────────────────
-- "Split comment" blocks belonging to a Comment. SectionId is nullable — null
-- means the block was left as a general remark, not tied to a specific section.

IF OBJECT_ID('dbo.CommentSections', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CommentSections (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CommentSections PRIMARY KEY,
        CommentId   INT               NOT NULL,
        SectionId   INT               NULL,
        CommentText NVARCHAR(MAX)     NOT NULL,

        CONSTRAINT FK_CommentSections_Comments_CommentId
            FOREIGN KEY (CommentId) REFERENCES dbo.Comments (Id) ON DELETE CASCADE,
        CONSTRAINT FK_CommentSections_Sections_SectionId
            FOREIGN KEY (SectionId) REFERENCES dbo.Sections (Id)
    );

    CREATE INDEX IX_CommentSections_CommentId ON dbo.CommentSections (CommentId);
    CREATE INDEX IX_CommentSections_SectionId ON dbo.CommentSections (SectionId);
END;
