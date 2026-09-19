import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Vibio collects, stores, and uses personal information shared through the storefront and customer accounts.',
};

const sections = [
  {
    title: 'Information we collect',
    body: 'When you create an account, place an order, or subscribe to the newsletter, we collect the information you provide — name, email address, shipping details, and order history. We also collect limited technical data such as device type and pages visited.',
  },
  {
    title: 'How we use information',
    body: 'Personal data is used to process orders, deliver parcels, respond to service requests, and send occasional editorial updates you have explicitly opted into. Analytics data helps us understand how the storefront is used.',
  },
  {
    title: 'Sharing',
    body: 'We share data only with the partners required to fulfill your order: payment processors, shipping carriers, and our email platform. We do not sell personal information.',
  },
  {
    title: 'Your rights',
    body: 'You can access, correct, or delete your account data at any time from the account dashboard, or by writing to privacy@vibio.ma. Requests are handled within 30 days.',
  },
  {
    title: 'Cookies',
    body: 'Essential cookies keep you signed in and maintain your cart. Optional cookies support analytics and can be disabled through your browser settings.',
  },
];

export default function PrivacyPage() {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-8 lg:p-10">
          <p className="section-eyebrow">Legal</p>
          <h1 className="font-heading text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
            Privacy policy
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">
            Vibio treats customer data with the same care we apply to the products we
            curate. This policy outlines what we collect, why we collect it, and the
            control you always keep over your information.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="font-heading text-[1.6rem] leading-[1.1] tracking-[-0.04em] text-[#1E2519]">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[#52604C]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.26em] text-[#7A8162]">
            Last updated: April 2026
          </p>
        </div>
      </div>
    </section>
  );
}
