import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVER_API_URL } from '@/lib/serverApiUrl';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const res = await fetch(
    `${SERVER_API_URL}/api/products/${slug}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.shortDesc || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return <ProductDetailClient initialProduct={product} />;
}
