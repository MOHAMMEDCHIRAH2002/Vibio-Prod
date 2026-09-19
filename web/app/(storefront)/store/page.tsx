import type { Metadata } from 'next';
import StoreLocator from '@/components/store/StoreLocator';

export const metadata: Metadata = {
  title: 'Visit our store — Vibio',
  description:
    'Visit the Vibio boutique in Casablanca. Find our address, opening hours, phone, WhatsApp and directions on the map.',
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px]">
          <StoreLocator />
        </div>
      </section>
    </div>
  );
}
