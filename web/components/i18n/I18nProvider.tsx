'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n, {
  applyDocumentDirection,
  getStoredLanguage,
  scopeFromPath,
  type Language,
} from '@/lib/i18n/config';

/**
 * Wraps the app with the i18next instance. Initial render uses the default
 * language (fr) so server and client HTML match; the persisted language is
 * applied after mount. Storefront and admin keep INDEPENDENT languages —
 * navigating between the two scopes re-applies that scope's stored language.
 */
export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const sync = (lng: string) => applyDocumentDirection(lng as Language);
    i18n.on('languageChanged', sync);

    const scope = scopeFromPath(pathname);
    const stored = getStoredLanguage(scope);

    if (stored !== i18n.language) {
      i18n.changeLanguage(stored).then(() => applyDocumentDirection(stored));
    } else {
      applyDocumentDirection(stored);
    }

    return () => {
      i18n.off('languageChanged', sync);
    };
  }, [pathname]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
