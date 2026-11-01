import type { Language } from './config';

/**
 * Selects an Arabic value when available and always preserves the French value
 * as the fallback. Empty strings are treated as untranslated values.
 */
export function localizedText(
  french: string | null | undefined,
  arabic: string | null | undefined,
  language: Language | string | undefined,
): string {
  if (language === 'ar' && arabic?.trim()) return arabic;
  return french ?? '';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Localizes API response objects without changing their Arabic source fields.
 * This lets existing components consume the French-shaped API while the
 * language switch also works for entities not yet migrated to a dedicated
 * presentation component.
 */
export function localizeApiData<T>(data: T, language: string | undefined): T {
  if (language !== 'ar') return data;
  if (Array.isArray(data)) {
    return data.map((item) => localizeApiData(item, language)) as T;
  }
  if (!isRecord(data)) return data;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith('_ar')) {
      result[key] = value;
      continue;
    }
    const arabic = data[`${key}_ar`];
    result[key] =
      typeof arabic === 'string' && arabic.trim()
        ? arabic
        : localizeApiData(value, language);
  }
  return result as T;
}
