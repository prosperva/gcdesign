export interface DocumentSection {
  id: string
  en: string
  fr: string
  allowSplit?: boolean
}

export interface DocumentRecord {
  id: string
  en: string
  fr: string
  version: string
  closingDate: string
  sections: DocumentSection[]
}

export const SECTIONS: DocumentSection[] = [
  { id: 'purpose',      en: 'Purpose and Scope',         fr: 'Objet et portée' },
  { id: 'defs',         en: 'Definitions',                fr: 'Définitions' },
  { id: 'policy',       en: 'Policy Requirements',        fr: 'Exigences de la politique', allowSplit: true },
  { id: 'roles',        en: 'Roles and Responsibilities', fr: 'Rôles et responsabilités' },
  { id: 'requirements', en: 'Requirements',               fr: 'Exigences' },
  { id: 'controls',     en: 'Security Controls',          fr: 'Contrôles de sécurité' },
]

export const DOCUMENTS: DocumentRecord[] = [
  {
    id: 'policy-im',
    en: 'Draft Policy on Information Management',
    fr: 'Politique sur la gestion de l\'information (ébauche)',
    version: '1.2',
    closingDate: '2026-12-31',
    sections: SECTIONS,
  },
  {
    id: 'directive-data',
    en: 'Directive on Data Management',
    fr: 'Directive sur la gestion des données',
    version: '2.0',
    closingDate: '2027-01-15',
    sections: SECTIONS,
  },
  {
    id: 'standard-security',
    en: 'Standard on Cybersecurity Controls',
    fr: 'Norme sur les contrôles de cybersécurité',
    version: '1.0',
    closingDate: '2025-03-31',
    sections: SECTIONS,
  },
]
