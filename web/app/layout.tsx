import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Manrope, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import dynamic from 'next/dynamic';

const CustomCursor = dynamic(() => import('@/components/common/CustomCursor'), { ssr: false });
const ScrollProgress = dynamic(() => import('@/components/common/ScrollProgress'), { ssr: false });

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: {
    default: 'Vibio — Nature\'s Finest, Crafted for You',
    template: '%s | Vibio',
  },
  description:
    'Discover premium natural products: Medjool dates, gourmet chocolates, single-origin coffee, herbal infusions, and natural beauty — curated for those who appreciate the finest things.',
  keywords: ['luxury dates', 'premium chocolate', 'organic coffee', 'herbal tea', 'natural beauty'],
  authors: [{ name: 'Vibio' }],
  creator: 'Vibio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Vibio',
    title: 'Vibio — Nature\'s Finest, Crafted for You',
    description: 'Premium natural products — dates, chocolates, coffee, herbal infusions, and natural beauty.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibio',
    description: 'Nature\'s Finest, Crafted for You',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${manrope.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-primary-bg font-body antialiased text-text-dark">
        <ScrollProgress />
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
