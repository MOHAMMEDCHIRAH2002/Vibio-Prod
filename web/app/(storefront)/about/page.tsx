import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    "Discover Vibio's story: natural rituals, Moroccan warmth, premium tea, coffee, dates, chocolates, and refined gifting.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
