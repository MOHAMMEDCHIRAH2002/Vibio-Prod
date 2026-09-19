import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description:
    'Our return window, eligibility rules, and the process for requesting a refund or replacement from Vibio.',
};

const steps = [
  {
    title: '1. Request within 14 days',
    body: 'Email care@vibio.ma from the address on your order within 14 days of delivery. Share your order number and a short note on what went wrong.',
  },
  {
    title: '2. Prepare the parcel',
    body: 'Return items in their original packaging, unused and sealed where applicable. Food items and consumables can only be returned if they arrive damaged or defective.',
  },
  {
    title: '3. Ship it back',
    body: 'We send a prepaid label for domestic returns. International customers arrange return shipping at their own cost unless the item was sent in error or arrived damaged.',
  },
  {
    title: '4. Refund within 7 days',
    body: 'Once the return is received and inspected, refunds are issued to the original payment method within seven working days. You will receive an email confirmation when the refund is processed.',
  },
];

export default function ReturnsPage() {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="surface-shell p-6 sm:p-8 lg:p-10">
          <p className="section-eyebrow">Care</p>
          <h1 className="font-heading text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.05em] text-[#1E2519]">
            Returns & refunds
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#5B6455]">
            We want every order to feel right the moment it arrives. If something
            isn&t quite what you expected, here is exactly how a return works.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.title} className="card-luxury p-6">
                <h2 className="font-heading text-[1.5rem] leading-[1.1] tracking-[-0.04em] text-[#1E2519]">
                  {step.title}
                </h2>
                <p className="mt-3 text-[15px] leading-8 text-[#52604C]">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="surface-olive mt-8 p-6 sm:p-7">
            <p className="section-eyebrow">Need help faster?</p>
            <p className="mt-3 max-w-xl text-[15px] leading-8 text-[#43503E]">
              Our care team answers returns questions within one business day. Write
              to <span className="font-semibold text-[#1E2519]">care@vibio.ma</span>{' '}
              with your order number and photos if the parcel arrived damaged.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
