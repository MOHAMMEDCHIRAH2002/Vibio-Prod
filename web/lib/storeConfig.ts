/**
 * Single source of truth for physical-store information.
 *
 * Every value is overridable through `NEXT_PUBLIC_STORE_*` environment
 * variables (baked at build time), with sensible defaults so the store page
 * always renders. Nothing about the store should be hardcoded elsewhere —
 * import from here instead.
 */

const env = (key: string, fallback = ''): string => {
  const raw = process.env[key];
  return raw && raw.trim() ? raw.trim() : fallback;
};

/** Digits-only phone, ready for tel:/wa.me links. */
const digits = (v: string) => v.replace(/[^0-9]/g, '');

export interface OpeningHour {
  /** i18n key under `store.days.*` */
  key: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface StoreConfig {
  name: string;
  addressLines: string[];
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  mapEmbedUrl: string;
  mapLinkUrl: string;
  photos: { src: string; alt: string }[];
  hours: OpeningHour[];
}

const phone = env('NEXT_PUBLIC_STORE_PHONE_NUMBER', '+212 600 000 000');
const whatsapp = env('NEXT_PUBLIC_STORE_WHATSAPP_NUMBER', phone);
const address = env(
  'NEXT_PUBLIC_STORE_ADDRESS',
  '12 Boulevard d’Anfa, Casablanca 20250, Maroc',
);

// Photos: comma-separated URLs via env, else on-brand placeholders.
const photoEnv = env('NEXT_PUBLIC_STORE_PHOTOS');
const photoUrls = photoEnv
  ? photoEnv.split(',').map((s) => s.trim()).filter(Boolean)
  : [
      'https://placehold.co/1200x900/273E1C/FBF7EE/png?text=Vibio+Boutique',
      'https://placehold.co/800x600/3D8B45/FBF7EE/png?text=Th%C3%A9+%26+Caf%C3%A9',
      'https://placehold.co/800x600/B9894B/FBF7EE/png?text=Dattes+%26+Chocolat',
      'https://placehold.co/800x600/1E2519/D8B36A/png?text=Espace+Cadeaux',
    ];

export const storeConfig: StoreConfig = {
  name: env('NEXT_PUBLIC_STORE_NAME', 'Vibio'),
  addressLines: address.split(',').map((s) => s.trim()).filter(Boolean),
  city: env('NEXT_PUBLIC_STORE_CITY', 'Casablanca'),
  country: env('NEXT_PUBLIC_STORE_COUNTRY', 'Maroc'),
  phone,
  whatsapp,
  email: env('NEXT_PUBLIC_STORE_EMAIL', 'hello@vibio.com'),
  // Keyless embed form — works without a Google Maps API key.
  mapEmbedUrl: env(
    'NEXT_PUBLIC_STORE_MAP_EMBED_URL',
    `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`,
  ),
  mapLinkUrl: env(
    'NEXT_PUBLIC_STORE_MAP_LINK',
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  ),
  photos: photoUrls.map((src, i) => ({ src, alt: `Vibio store ${i + 1}` })),
  hours: [
    { key: 'monToFri', open: '09:00', close: '19:00' },
    { key: 'saturday', open: '10:00', close: '18:00' },
    { key: 'sunday', closed: true },
  ],
};

export const telHref = `tel:${digits(storeConfig.phone) ? '+' + digits(storeConfig.phone) : ''}`;

export const whatsappHref = (message?: string) => {
  const num = digits(storeConfig.whatsapp);
  if (!num) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${text}`;
};

export const hasWhatsApp = Boolean(digits(storeConfig.whatsapp));
