import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { translations } from '../i18n/translations'

const STORAGE_KEY = 'pre-fruits-language'
const LanguageContext = createContext(null)

// Persists the chosen language (Tamil by default) to AsyncStorage so the
// app reopens in whichever language the user picked last time.
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('ta')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'ta' || stored === 'en') setLanguageState(stored)
    })
  }, [])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    AsyncStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key) => translations[language][key] ?? key

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
