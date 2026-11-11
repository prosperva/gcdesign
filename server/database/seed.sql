-- Seed data for the lookup tables (Documents, Sections, Roles, SupportStatuses).
-- Run after schema.sql. Idempotent — each block only inserts if the table is empty,
-- so re-running this against an already-seeded database is a no-op.

-- ── Documents ────────────────────────────────────────────────────────────────

-- Sourced from the "Proposed change" dropdown on the CBHCC public-review comment
-- forms (https://cbhcc-cchcc.ca/en/comment-on-a-proposed-change-public-review/ and
-- its French counterpart) — 35 proposals for the 2026 cycle 2 public review. Id is
-- each proposal's own numbered code (e.g. 1666, 2044, ...) as used on that site, not
-- a sequential 1..35. Version is the review cycle ("2026-2"); every row currently
-- shares the same closing date and PDF link, per that site.
IF NOT EXISTS (SELECT 1 FROM dbo.Documents)
BEGIN
    SET IDENTITY_INSERT dbo.Documents ON;

    INSERT INTO dbo.Documents (Id, TitleEn, TitleFr, Version, ClosingDate, DocumentLink) VALUES
        (1666, N'(NBC) Clarification of Requirements for Certain Clear Spaces Where Required for Barrier-free Facilities', N'(CNB) Clarification des exigences visant certains espaces dégagés lorsqu''ils sont exigés pour les installations sans obstacles', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2044, N'(NBC) Energy Performance Tier 3 of the Prescriptive Path', N'(CNB) Palier de performance énergétique 3 de la méthode prescriptive', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2057, N'(NBC) Requirements for Energy Modeling Software', N'(CNB) Exigences relatives aux logiciels de modélisation énergétique', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2112, N'(NFC) Introduction of a New Standard for Aboveground Piping Systems', N'(CNPI) Introduction d''une nouvelle norme sur la tuyauterie hors sol', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2116, N'(NFC) Addition of Reference to ANSI/CAN/UL/ULC 2152:2021', N'(CNPI) Ajout d''un renvoi à la norme ANSI/CAN/UL/ULC 2152:2021', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2130, N'(NPC) Device Connections to Sanitary Drainage Systems', N'(CNP) Raccordement des dispositifs aux réseaux sanitaires d''évacuation', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2132, N'(NPC) Spacing of Cleanouts in Vertical Drainage Pipes', N'(CNP) Espacement des regards de nettoyage dans les tuyaux verticaux d''évacuation d''eaux usées', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2133, N'(NPC) Installation of Drainage Piping Without Depressions', N'(CNP) Installation de la tuyauterie d''évacuation sans dépressions', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2145, N'(NFC) Classification of Water-Miscible Liquid Mixtures', N'(CNPI) Classement des mélanges de liquides miscibles avec l''eau', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2153, N'(NFC) Classification of Additional Water Miscible Liquid Mixtures', N'(CNPI) Classement de mélanges de liquides miscibles avec l''eau supplémentaires', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2160, N'(NBC) Active Side-Wall Radon Stack', N'(CNB) Colonne de dépressurisation active par un mur extérieur', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2161, N'(NFC) Addition of Reference to CAN/CSA-B138.1-17/CAN/CSA-B138.2-17', N'(CNPI) Ajout d''un renvoi à la norme CAN/CSA B138.1-17/CAN/CSA-B138.2-17', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2173, N'(NBC) Requirements for Certain Discrete Products Installed in Plenums', N'(CNB) Exigences relatives à certains produits discrets installés dans les plénums', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2174, N'(NPC) Use of the IAPMO Water Demand Calculator in the Design of Potable Water Systems', N'(CNP) Utilisation du Calculateur de demande en eau de l''IAPMO pour la conception des réseaux d''alimentation en eau potable', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2181, N'(NBC) Minimum Energy Performance Compliance Level', N'(CNB) Niveau minimal de conformité aux exigences de performance énergétique', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2182, N'(NBC) Update to Energy Modeling Rules for Heat Pumps', N'(CNB) Mise à jour des règles de modélisation énergétique applicables aux thermopompes', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2192, N'(NBC) Updating References to CSA B651 to the 2023 Edition and Simplifying the Framework in NBC Subsection 3.8.3. on the Design Requirements for Accessibility in Buildings Intended for Public Use', N'(CNB) Remplacement des renvois à la norme CSA B651 par des renvois à l''édition de 2023 et simplification du cadre de la sous-section 3.8.3. du CNB sur les exigences de conception en matière d''accessibilité dans les bâtiments destinés au public', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2195, N'(NECB) Referencing the NPC for Hot Service Water Flow Rates and Shut-off', N'(CNÉB) Renvoi au CNP pour les débits et les dispositifs d''arrêt de l''eau sanitaire chaude', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2205, N'(NBC) New Section 9.37.-2030 on Operational GHG Emissions', N'(CNB) Nouvelle section 9.37.-2030 sur les émissions de GES opérationnelles', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2216, N'(NBC) Roof Load Transfer to Braced Wall Panels', N'(CNB) Transfert des charges de toit aux panneaux muraux contreventés', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2221, N'(NPC) Updates to Referenced Documents', N'(CNP) Mise à jour des documents incorporés par renvoi', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2225, N'(NBC) Introduction of References to CAN/ULC 743.1:2020 and CAN/ULC 743.2:2021', N'(CNB) Introduction de renvois aux normes CAN/ULC 743.1:2020 et CAN/ULC 743.2:2021', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2226, N'(NBC) Fibre-reinforced Gypsum Panels', N'(CNB) Panneaux de plâtre renforcés de fibres', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2240, N'(NBC) Replacement of a Withdrawn Standard with New Standards for Fans', N'(CNB) Remplacement d''une norme retirée par de nouvelles normes sur les ventilateurs', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2241, N'(NPC) Deletion of a Withdrawn CSA Standard and Introduction of Requirements for Additional Plumbing Fixtures', N'(CNP) Suppression d''une norme CSA retirée et introduction d''exigences visant des appareils sanitaires supplémentaires', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2242, N'(NPC) Adds Requirements for Press-Connect Water Fittings', N'(CNP) Ajout d''exigences visant les raccords à sertir pour l''alimentation en eau', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2243, N'(NPC) Installation of Emergency Eye Wash and Shower Fixtures', N'(CNP) Installation de douches oculaires et de douches d''urgence', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2244, N'(NPC) Addition of Requirements for Mechanical Tee Fittings', N'(CNP) Ajout d''exigences relatives aux tés mécaniques', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2256, N'(NBC) Acceptable Monitoring Devices for the Ventilation of Storage Garages', N'(CNB) Dispositifs de détection acceptables pour la ventilation des garages de stationnement', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2257, N'(NBC) Carbon Monoxide Detectors Installed in Lieu of Carbon Monoxide Alarms', N'(CNB) Installation de détecteurs de monoxyde de carbone en remplacement des avertisseurs de monoxyde de carbone', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2263, N'(NECB) Adding New Cross-Reference that Points to the Defined Terms', N'(CNÉB) Ajout d''un nouveau renvoi aux termes définis', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2265, N'(NECB) Defined Terms related to Operational Greenhouse Gas (GHG) Emissions', N'(CNÉB) Termes définis relatifs aux émissions de gaz à effet de serre (GES) opérationnelles', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2267, N'(NBC) Minimum Thermal Resistance Value for Duct Insulation', N'(CNB) Valeur de résistance thermique minimale pour le calorifugeage des conduits', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2268, N'(NECB) "Thermal Bridge" as a Defined Term', N'(CNÉB) « Pont thermique » en tant que terme défini', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html'),
        (2318, N'(NPC) Acceptance of CCMC Code Conformity Assessments', N'(CNP) Acceptation des évaluations de conformité aux codes publiées par le CCMC', '2026-2', '2026-12-21 23:59:00', 'https://cbhcc-cchcc.ca/eng/public-review/2026_2/nbc_provision.html');

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
