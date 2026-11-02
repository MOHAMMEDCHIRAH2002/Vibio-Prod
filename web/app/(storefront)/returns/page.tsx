'use client';

import { useTranslation } from 'react-i18next';

export default function ReturnsPage() {
  const { t, i18n } = useTranslation();
  const steps = ['request', 'prepare', 'ship', 'refund'];

  return (
    <section dir={i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr'} className="px-4 py-6 text-start sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-8 lg:p-10">
          <p className="section-eyebrow">{t('legal.returns.eyebrow')}</p>
          <h1 className="font-heading text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
            {t('legal.returns.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">{t('legal.returns.intro')}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {steps.map((key, index) => (
              <div key={key} className="card-luxury p-6">
                <h2 className="font-heading text-[1.5rem] leading-[1.1] tracking-[-0.04em] text-[#1E2519]">
                  {index + 1}. {t(`legal.returns.steps.${key}.title`)}
                </h2>
                <p className="mt-3 text-[15px] leading-8 text-[#52604C]">{t(`legal.returns.steps.${key}.body`)}</p>
              </div>
            ))}
          </div>
          <div className="surface-olive mt-8 p-6 sm:p-7">
            <p className="section-eyebrow">{t('legal.returns.helpTitle')}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-8 text-[#43503E]">
              {t('legal.returns.helpText')} <span className="font-semibold text-[#1E2519]">contact@vibio.ma</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
