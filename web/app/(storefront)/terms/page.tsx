import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms governing your use of the Vibio storefront, accounts, orders, and related services.',
};

const sections = [
  {
    title: 'Using the storefront',
    body: 'By browsing or purchasing on vibio.ma you agree to these terms. You must be at least 18 years old to place an order. Account credentials are personal and should not be shared.',
  },
  {
    title: 'Orders and pricing',
    body: 'All prices are shown in MAD and include applicable VAT unless stated otherwise. We reserve the right to correct pricing errors and to cancel an order if a product is unavailable; in that case any payment is refunded in full.',
  },
  {
    title: 'Shipping and delivery',
    body: 'Orders are dispatched from Casablanca. Estimated delivery windows are shared at checkout and are indicative, not guaranteed. Risk of loss passes to you once the parcel is delivered to the address you provided.',
  },
  {
    title: 'Intellectual property',
    body: 'All content on vibio.ma — photography, text, logos, and the storefront design — is owned by Vibio or its partners. You may not reproduce or republish this content without written permission.',
  },
  {
    title: 'Liability',
    body: 'Vibio is not liable for indirect or consequential losses arising from the use of the storefront. Nothing in these terms limits your statutory consumer rights under applicable law.',
  },
];

export default function TermsPage() {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-8 lg:p-10">
          <p className="section-eyebrow">Legal</p>
          <h1 className="font-heading text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
            Terms of service
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">
            These terms explain the rules that apply when you browse the Vibio
            storefront, create an account, or place an order. Please read them
            carefully before shopping with us.
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
