import { en, type TranslationKeys } from './en'
import { zh } from './zh'
import type { Language } from '@/types'

const translations: Record<Language, TranslationKeys> = { en, zh }

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang] || translations.en
}

export function t(lang: Language, path: string): string {
  const keys = path.split('.')
  let current: unknown = translations[lang] || translations.en
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}
