'use client';

import { useState } from 'react';
import Image from '@/components/common/OptimizedImage';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Phone, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { storeConfig, telHref, whatsappHref, hasWhatsApp } from '@/lib/storeConfig';

export default function StoreLocator() {
  const { t } = useTranslation();
  const [mapFailed, setMapFailed] = useState(false);
  const s = storeConfig;
  const fullAddress = [...s.addressLines].join(', ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-shell p-6 sm:p-7 lg:p-8">
        <p className="section-eyebrow">{t('store.eyebrow')}</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="max-w-3xl font-heading text-[clamp(2.4rem,5vw,4.1rem)] leading-[0.95] tracking-[-0.05em] text-[#1E2519]">
            {t('store.title')}
          </h1>
          <p className="max-w-md text-[15px] leading-8 text-[#5B6455]">{t('store.subtitle')}</p>
        </div>
      </div>

      {/* Gallery */}
      {s.photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.photos.slice(0, 4).map((photo, i) => (
            <div
              key={photo.src}
              className={`group relative overflow-hidden rounded-[28px] border border-[#E7DDCC] bg-[#F4F0E5] ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto' : 'aspect-[4/3]'
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(30,37,25,0)_55%,rgba(30,37,25,0.28))] mix-blend-multiply" />
            </div>
          ))}
        </div>
      )}

      {/* Info + map */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Info column */}
        <div className="surface-shell flex flex-col gap-7 p-6 sm:p-7 lg:p-8">
          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E3D8C8] bg-white/72 text-[#273E1C]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B9894B]">
                {t('store.addressLabel')}
              </p>
              <address className="mt-2 not-italic text-[15px] leading-8 text-[#1E2519]">
                {s.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E3D8C8] bg-white/72 text-[#273E1C]">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B9894B]">
                {t('store.hoursLabel')}
              </p>
              <ul className="mt-2 space-y-1.5">
                {s.hours.map((h) => (
                  <li
                    key={h.key}
                    className="flex items-center justify-between gap-4 text-[15px] text-[#1E2519]"
                  >
                    <span className="text-[#4F594B]">{t(`store.days.${h.key}`)}</span>
                    <span className="ltr-nums font-medium">
                      {h.closed ? (
                        <span className="text-[#C9571A]">{t('store.closed')}</span>
                      ) : (
                        `${h.open} – ${h.close}`
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E3D8C8] bg-white/72 text-[#273E1C]">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B9894B]">
                {t('store.phoneLabel')}
              </p>
              <a
                href={telHref}
                className="ltr-nums mt-2 block text-[15px] font-medium text-[#1E2519] underline decoration-[#D1B987] underline-offset-4 transition-colors hover:text-[#4F6F2D]"
              >
                {s.phone}
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <a
              href={telHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#214915] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(33,73,21,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18370F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
              {t('store.callNow')}
            </a>
            {hasWhatsApp && (
              <a
                href={whatsappHref(t('store.waMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C7AD] bg-white px-6 py-3.5 text-sm font-semibold text-[#273E1C] transition-all duration-300 hover:border-[#C9A96E] hover:bg-[#FBF7EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                {t('store.messageWhatsApp')}
              </a>
            )}
            <a
              href={s.mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C7AD] bg-white px-6 py-3.5 text-sm font-semibold text-[#273E1C] transition-all duration-300 hover:border-[#C9A96E] hover:bg-[#FBF7EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <Navigation className="h-4 w-4" />
              {t('store.getDirections')}
            </a>
          </div>
        </div>

        {/* Map column with graceful fallback */}
        <div className="surface-shell overflow-hidden p-2 sm:p-2.5">
          <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-[26px] border border-[#E7DDCC] bg-[#EEF1E6]">
            {!mapFailed ? (
              <iframe
                title={t('store.mapTitle')}
                src={s.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setMapFailed(true)}
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <MapPin className="h-8 w-8 text-[#3D8B45]" />
                <p className="max-w-xs text-sm leading-7 text-[#4F594B]">{fullAddress}</p>
                <a
                  href={s.mapLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#214915] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#18370F]"
                >
                  {t('store.openInMaps')}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
