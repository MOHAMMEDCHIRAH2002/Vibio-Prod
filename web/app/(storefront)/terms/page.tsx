'use client';

import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t, i18n } = useTranslation();
  const sections = ['storefront', 'orders', 'shipping', 'intellectualProperty', 'liability'];

  return (
    <section dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'} className="px-4 py-6 text-start sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-8 lg:p-10">
          <p className="section-eyebrow">{t('legal.terms.eyebrow')}</p>
          <h1 className="font-heading text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
            {t('legal.terms.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">{t('legal.terms.intro')}</p>
          <div className="mt-10 space-y-8">
            {sections.map((key) => (
              <article key={key}>
                <h2 className="font-heading text-[1.6rem] leading-[1.1] tracking-[-0.04em] text-[#1E2519]">
                  {t(`legal.terms.sections.${key}.title`)}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[#52604C]">
                  {t(`legal.terms.sections.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.26em] text-[#7A8162]">{t('legal.updated')}</p>
        </div>
      </div>
    </section>
  );
}
