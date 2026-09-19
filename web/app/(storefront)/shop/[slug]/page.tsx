import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVER_API_URL } from '@/lib/serverApiUrl';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: { slug: string };
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/categories/${slug}`, {
      next: { revalidate: 300 },
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

export const revalidate = 300;

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.slug);

  if (!category) notFound();

  return <CategoryPageClient category={category} />;
}
