'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'X',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Facebook',
    href: '#',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
];
import BrandLogo from '@/components/common/BrandLogo';

const shopLinks = [
  { href: '/shop/coffee-tea', key: 'footer.links.coffeeTea' },
  { href: '/shop/dates-sweets', key: 'footer.links.datesSweets' },
  { href: '/shop/chocolates', key: 'footer.links.chocolates' },
  { href: '/gifts', key: 'footer.links.giftBoxes' },
];

const companyLinks = [
  { href: '/about', key: 'footer.links.ourStory' },
  { href: '/blog', key: 'footer.links.journal' },
  { href: '/store', key: 'common.visitStore' },
  { href: '/contact', key: 'footer.links.contact' },
  { href: '/wishlist', key: 'footer.links.wishlist' },
];

const legalLinks = [
  { href: '/privacy', key: 'footer.legal.privacy' },
  { href: '/terms', key: 'footer.legal.terms' },
  { href: '/returns', key: 'footer.legal.returns' },
];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mx-auto max-w-[1540px]">
        <div className="surface-shell relative overflow-hidden rounded-[38px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          {/* Luxury background details */}
          <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-[#D8B36A]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-[#EFF5E7]/60 blur-3xl" />
          <div className="pointer-events-none absolute right-10 bottom-2 select-none font-heading text-[clamp(5rem,14vw,11rem)] leading-none tracking-[-0.1em] text-[#273E1C]/[0.025]">
            Vibio
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
              {/* Brand column */}
              <div className="max-w-xl">
                <Link href="/" className="inline-flex">
                  <BrandLogo
                    className="h-11 w-36 sm:h-[3.5rem] sm:w-48"
                    sizes="(min-width: 640px) 192px, 144px"
                    align="left"
                    trimPadding
                  />
                </Link>

                <div className="mt-5 h-px w-24 bg-[#D8B36A]/45" />

                <h2 className="mt-7 font-heading italic text-[clamp(2.35rem,3.7vw,3.9rem)] leading-[0.93] tracking-[-0.05em] text-[#1E2519]">
                  {t('footer.taglineA')}
                  <br />
                  {t('footer.taglineB')}
                </h2>

                <p className="mt-5 max-w-lg text-[15px] leading-8 text-[#5B6455]">
                  {t('footer.description')}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {SOCIAL.map(({ label, href, path }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E3D8C8] bg-[#FFFEFA]/80 text-[#273E1C] shadow-[0_10px_24px_rgba(30,37,25,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CDB68B] hover:bg-[#FFF9EE]"
                    >
                      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                        <path d={path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B9894B]">
                    {t('footer.shop')}
                  </p>

                  <div className="mt-5 space-y-3">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-[15px] text-[#4F594B] transition-all duration-300 hover:translate-x-1 hover:text-[#214915]"
                      >
                        {t(link.key)}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B9894B]">
                    {t('footer.company')}
                  </p>

                  <div className="mt-5 space-y-3">
                    {companyLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-[15px] text-[#4F594B] transition-all duration-300 hover:translate-x-1 hover:text-[#214915]"
                      >
                        {t(link.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact atelier */}
            <div className="relative overflow-hidden rounded-[34px] border border-[#CFB98F] bg-[#F4F0E5] p-6 shadow-[0_22px_65px_rgba(30,37,25,0.065)] sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#D8B36A]/16 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-white/45 blur-3xl" />

              <div className="relative z-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B9894B]">
                  {t('footer.contactLabel')}
                </p>

                <p className="mt-5 max-w-md text-sm leading-7 text-[#4A5644]">
                  {t('footer.contactTitle')} {t('footer.contactText')}
                </p>

                <div className="mt-7 space-y-4">
                  {[
                    { icon: Mail, label: 'hello@vibio.com' },
                    { icon: Phone, label: '+212 6 00 00 00 00' },
                    { icon: MapPin, label: 'Casablanca, Morocco' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 text-sm text-[#1E2519]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E3D8C8] bg-white/72 text-[#273E1C] shadow-[0_10px_24px_rgba(30,37,25,0.045)]">
                        <Icon className="h-4 w-4" />
                      </div>

                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-3 rounded-[18px] bg-[#214915] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_42px_rgba(33,73,21,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18370F]"
                  >
                    {t('footer.speak')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl-flip" />
                  </Link>

                  <Link
                    href="/store"
                    className="inline-flex items-center gap-2.5 rounded-[18px] border border-[#CFB98F] bg-white/70 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#273E1C] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C9A96E] hover:bg-[#FFF9EE]"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('common.visitStore')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="relative z-10 mt-10 flex flex-col gap-4 border-t border-[#E8DECF] pt-5 text-sm text-[#6D7463] sm:flex-row sm:items-center sm:justify-between">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>

            <div className="flex flex-wrap gap-5">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#7A7A72] transition-colors duration-300 hover:text-[#214915]"
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}