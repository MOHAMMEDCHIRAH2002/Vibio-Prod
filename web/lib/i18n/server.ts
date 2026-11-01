import { cookies } from 'next/headers';
import { localizeApiData } from './localized';

export function getServerLanguage(scope: 'storefront' | 'admin' = 'storefront'): 'fr' | 'ar' {
  const key = scope === 'admin' ? 'vibio-admin-lang' : 'vibio-lang';
  return cookies().get(key)?.value === 'ar' ? 'ar' : 'fr';
}

export function localizeServerData<T>(data: T, scope: 'storefront' | 'admin' = 'storefront'): T {
  return localizeApiData(data, getServerLanguage(scope));
}
