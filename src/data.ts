export interface DocumentSection {
  id: string
  en: string
  fr: string
}

export interface DocumentRecord {
  id: string
  en: string
  fr: string
  version: string
  closingDate: string
  sections: DocumentSection[]
}

export const DOCUMENTS: DocumentRecord[] = [
  {
    id: 'policy-im',
    en: 'Draft Policy on Information Management',
    fr: 'Politique sur la gestion de l\'information (ébauche)',
    version: '1.2',
    closingDate: '2026-06-30',
    sections: [
      { id: 'purpose', en: 'Purpose and Scope',         fr: 'Objet et portée' },
      { id: 'defs',    en: 'Definitions',                fr: 'Définitions' },
      { id: 'policy',  en: 'Policy Requirements',        fr: 'Exigences de la politique' },
      { id: 'roles',   en: 'Roles and Responsibilities', fr: 'Rôles et responsabilités' },
    ],
  },
  {
    id: 'directive-data',
    en: 'Directive on Data Management',
    fr: 'Directive sur la gestion des données',
    version: '2.0',
    closingDate: '2026-07-15',
    sections: [
      { id: 'purpose',      en: 'Purpose and Scope', fr: 'Objet et portée' },
      { id: 'defs',         en: 'Definitions',        fr: 'Définitions' },
      { id: 'requirements', en: 'Requirements',       fr: 'Exigences' },
    ],
  },
  {
    id: 'standard-security',
    en: 'Standard on Cybersecurity Controls',
    fr: 'Norme sur les contrôles de cybersécurité',
    version: '1.0',
    closingDate: '2025-03-31',
    sections: [
      { id: 'purpose',  en: 'Purpose and Scope',  fr: 'Objet et portée' },
      { id: 'controls', en: 'Security Controls',  fr: 'Contrôles de sécurité' },
    ],
  },
]
