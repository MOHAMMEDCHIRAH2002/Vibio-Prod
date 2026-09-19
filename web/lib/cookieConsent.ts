/**
 * Cookie consent storage + gating.
 *
 * Necessary cookies are always on (session, cart, auth, language, and the
 * consent record itself) — they can't be toggled off. Analytics and marketing
 * are opt-in and default to OFF until the user explicitly accepts, so no
 * analytics/marketing scripts may run before consent is granted.
 */

export const CONSENT_KEY = 'vibio-cookie-consent';
export const CONSENT_VERSION = 1;

export interface CookieConsent {
  version: number;
  necessary: true; // always enabled
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

/** The stored choice, or null when the user hasn't decided yet (→ show banner). */
export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    // Re-ask if the consent schema changed.
    if (parsed?.version !== CONSENT_VERSION) return null;
    return { ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    timestamp: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* storage unavailable — banner will simply reappear next visit */
  }
  // Let any consent-gated loaders react without a page reload.
  try {
    window.dispatchEvent(new CustomEvent('vibio:consent', { detail: consent }));
  } catch {}
  applyConsent(consent);
  return consent;
}

/**
 * Load consent-gated scripts. This is the single place analytics/marketing tags
 * should be initialised — it only runs their loaders when consent is granted,
 * guaranteeing nothing loads beforehand. There are no third-party analytics in
 * the project today, so these branches are intentionally empty stubs ready to
 * be filled in (e.g. GA, Meta Pixel) without touching the consent logic.
 */
export function applyConsent(consent: CookieConsent) {
  if (typeof window === 'undefined') return;
  if (consent.analytics) {
    // e.g. loadGoogleAnalytics();
  }
  if (consent.marketing) {
    // e.g. loadMetaPixel();
  }
}
