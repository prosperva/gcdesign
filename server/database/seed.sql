-- Seed data for the lookup tables (Documents, Sections, Roles, SupportStatuses).
-- Run after schema.sql. Idempotent — each block only inserts if the table is empty,
-- so re-running this against an already-seeded database is a no-op.

-- ── Documents ────────────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM dbo.Documents)
BEGIN
    SET IDENTITY_INSERT dbo.Documents ON;

    INSERT INTO dbo.Documents (Id, TitleEn, TitleFr, Version, ClosingDate, DocumentLink) VALUES
        (1, 'Standard on Cybersecurity Controls', N'Norme sur les contrôles de cybersécurité', '1.0', '2025-03-31', 'https://example.com/documents/standard-security.pdf'),
        (2, 'Draft Policy on Information Management', N'Politique sur la gestion de l''information (ébauche)', '1.2', '2026-12-31', 'https://example.com/documents/policy-im.pdf'),
        (3, 'Directive on Data Management', N'Directive sur la gestion des données', '2.0', '2027-01-15', 'https://example.com/documents/directive-data.pdf');

    SET IDENTITY_INSERT dbo.Documents OFF;
END;

-- ── Sections ─────────────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM dbo.Sections)
BEGIN
    SET IDENTITY_INSERT dbo.Sections ON;

    INSERT INTO dbo.Sections (Id, TitleEn, TitleFr, AllowSplit, SortOrder) VALUES
        (1, 'Purpose and Scope', N'Objet et portée', 1, 0),
        (2, 'Definitions', N'Définitions', 1, 1),
        (3, 'Policy Requirements', N'Exigences de la politique', 1, 2),
        (4, 'Roles and Responsibilities', N'Rôles et responsabilités', 1, 3),
        (5, 'Requirements', N'Exigences', 1, 4),
        (6, 'Security Controls', N'Contrôles de sécurité', 1, 5);

    SET IDENTITY_INSERT dbo.Sections OFF;
END;

-- ── Roles ────────────────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM dbo.Roles)
BEGIN
    SET IDENTITY_INSERT dbo.Roles ON;

    INSERT INTO dbo.Roles (Id, TitleEn, TitleFr, SortOrder) VALUES
        (1, 'Manager', N'Gestionnaire', 0),
        (2, 'Director', N'Directeur / Directrice', 1),
        (3, 'Architect', N'Architecte', 2),
        (4, 'Analyst', N'Analyste', 3),
        (5, 'Researcher', N'Chercheur / Chercheuse', 4),
        (6, 'Developer / Engineer', N'Développeur / Ingénieur', 5),
        (7, 'Policy Officer', N'Responsable des politiques', 6);

    SET IDENTITY_INSERT dbo.Roles OFF;
END;

-- ── SupportStatuses ──────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM dbo.SupportStatuses)
BEGIN
    SET IDENTITY_INSERT dbo.SupportStatuses ON;

    INSERT INTO dbo.SupportStatuses (Id, TitleEn, TitleFr, CommentsEnabled, SortOrder) VALUES
        (1, 'I support', N'J''appuie', 0, 0),
        (2, 'I support, with comments', N'J''appuie, avec commentaires', 1, 1),
        (3, 'I support, with modifications', N'J''appuie, avec modifications', 1, 2),
        (4, 'I do not support, with reasons', N'Je n''appuie pas, avec raisons', 1, 3),
        (5, 'I have reviewed but have no opinion', N'J''ai examiné mais je n''ai pas d''opinion', 0, 4);

    SET IDENTITY_INSERT dbo.SupportStatuses OFF;
END;
