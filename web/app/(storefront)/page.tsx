import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import PromoBanners from '@/components/home/PromoBanners';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BrandStorySection from '@/components/home/BrandStorySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import VisitStoreSection from '@/components/home/VisitStoreSection';
import NewsletterSection from '@/components/home/NewsletterSection';

export const metadata: Metadata = {
  title: "Vibio - Nature's Finest, Crafted for You",
  description:
    'Discover premium natural products: Medjool dates, gourmet chocolates, single-origin coffee and tea, herbal infusions, and natural beauty curated for those who appreciate the finest.',
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/* <PromoBanners /> */}
      <CategoriesSection />
      <FeaturedProducts />
      <BrandStorySection />
      <TestimonialsSection />
      <VisitStoreSection />
      <NewsletterSection />
    </>
  );
}
