import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SERVER_API_URL } from '@/lib/serverApiUrl';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: { slug: string };
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/categories/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory(params.slug);

  if (!cat) {
    return { title: 'Category Not Found' };
  }

  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.slug);

  if (!category) notFound();
  if (category.slug !== params.slug) {
    redirect(`/shop/${encodeURIComponent(category.slug)}`);
  }

  return <CategoryPageClient category={category} />;
}
