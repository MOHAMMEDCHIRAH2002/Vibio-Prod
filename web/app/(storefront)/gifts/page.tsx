import type { Metadata } from 'next';
import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gift Boxes',
  description: 'Curated luxury gift boxes for every occasion, beautifully presented and thoughtfully selected.',
};

const gifts = [
  {
    title: 'The Tea Ceremony',
    desc: 'Loose-leaf tea, refined teaware, and a composed service set for slow evenings and premium hosting.',
    image: '/thes/tea_ceremony.jpg',
    price: 'From 299 MAD',
    href: '/shop/coffee-tea',
  },
  {
    title: 'The Chocolate Salon',
    desc: 'A gourmet edit of caramel and cocoa pieces selected for gifting with modern, understated elegance.',
    image: '/chocolat/tablette-chocolat-caramel.jpg',
    price: 'From 449 MAD',
    href: '/shop/chocolates',
  },
  {
    title: 'The Wellness Ritual',
    desc: 'A premium self-care box that blends calming botanicals with a softer, more intimate luxury tone.',
    image: '/beauty/beauty.png',
    price: 'From 599 MAD',
    href: '/shop',
  },
  {
    title: 'The Morning Pairing',
    desc: 'Coffee, tea, and gourmet details curated to create a memorable breakfast or hosting moment.',
    image: '/accessoires/la-theiere-.jpg',
    price: 'From 399 MAD',
    href: '/shop/coffee-tea',
  },
];

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-6">
          <div className="surface-shell relative overflow-hidden p-6 sm:p-7 lg:p-8">
            <div className="absolute right-0 top-0 hidden h-full w-[40%] lg:block">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80"
                alt="Luxury gift preparation"
                fill
                priority
                sizes="40vw"
                className="object-cover opacity-75"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_48%,rgba(255,255,255,0.28)_100%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-end">
              <div>
                <div className="lux-pill w-fit px-4 py-2">
                  <Gift className="h-3.5 w-3.5" />
                  Signature gifting
                </div>
                <h1 className="mt-7 max-w-[10ch] font-heading text-[clamp(3rem,6vw,5.2rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                  The Vibio gifting atelier.
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  Gift boxes are styled as complete sensory experiences, with tea, coffee,
                  gourmet sweets, and accessories arranged like a boutique luxury editorial.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: '4', label: 'gift concepts' },
                  { value: '48h', label: 'dispatch time' },
                  { value: 'Free', label: 'wrapping included' },
                ].map((stat) => (
                  <div key={stat.label} className="surface-panel px-5 py-5">
                    <p className="font-heading text-[1.9rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6b6b63]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 border-b border-[#ECE6D9] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Gift concepts</p>
                <h2 className="font-heading text-[clamp(2.3rem,4.7vw,3.9rem)] leading-[0.98] tracking-[-0.05em] text-[#1E2519]">
                  Designed to feel ready, polished, and generous.
                </h2>
              </div>
              <p className="max-w-xl text-[15px] leading-8 text-[#5B6455]">
                Each box is composed to communicate premium quality immediately —
                a thoughtful selection for those you value.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {gifts.map((gift) => (
                <Link
                  key={gift.title}
                  href={gift.href}
                  className="group card-luxury block overflow-hidden p-4 sm:p-5"
                >
                  <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#F7F4EC]">
                      <Image
                        src={gift.image}
                        alt={gift.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-4 py-2">
                      <div>
                        <div className="lux-pill w-fit px-4 py-2">
                          <Sparkles className="h-3.5 w-3.5" />
                          Gift atelier
                        </div>
                        <h3 className="mt-5 font-heading text-[clamp(2rem,3vw,3rem)] leading-[0.96] tracking-[-0.05em] text-[#1E2519]">
                          {gift.title}
                        </h3>
                        <p className="mt-4 text-[15px] leading-8 text-[#5B6455]">{gift.desc}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-[#ECE6D9] pt-4">
                        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#273E1C]">
                          {gift.price}
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#273E1C]">
                          Explore box
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#ECE6D9] pt-6">
              <p className="text-sm text-[#5B6455]">
                Looking for something bespoke for corporate or private gifting?
              </p>
              <Link href="/contact" className="btn-gold">
                Contact our gift concierge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
