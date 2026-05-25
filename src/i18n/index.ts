import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'
import editorEn from '../components/richtext/en.json'
import editorFr from '../components/richtext/fr.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, editor: editorEn },
    fr: { translation: fr, editor: editorFr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
