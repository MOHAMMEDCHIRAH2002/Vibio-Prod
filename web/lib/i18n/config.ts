'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

export const LANGUAGES = ['fr', 'ar'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'fr';

/** Storefront and admin keep INDEPENDENT language preferences. */
export const STORAGE_KEY = 'vibio-lang';
export const STORAGE_KEY_ADMIN = 'vibio-admin-lang';

export type Scope = 'admin' | 'storefront';

export function scopeFromPath(path: string | null | undefined): Scope {
  return path && path.startsWith('/admin') ? 'admin' : 'storefront';
}

export function storageKeyForScope(scope: Scope): string {
  return scope === 'admin' ? STORAGE_KEY_ADMIN : STORAGE_KEY;
}

/**
 * Read the persisted language for a given scope without touching i18next init,
 * so SSR and the first client render both use the same default (avoids
 * hydration mismatch). The stored value is applied AFTER mount.
 */
export function getStoredLanguage(scope: Scope = 'storefront'): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(storageKeyForScope(scope));
  return stored === 'ar' || stored === 'fr' ? stored : DEFAULT_LANGUAGE;
}

export function applyDocumentDirection(lang: Language) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    // Always init with the default so server HTML === first client render.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
