import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
import { SERVER_API_URL } from '@/lib/serverApiUrl';

const API_URL = SERVER_API_URL;

async function fetchJson(path: string) {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    fetchJson('/products?limit=1000'),
    fetchJson('/categories'),
    fetchJson('/blog?limit=1000'),
  ]);

  const staticRoutes = [
    { url: SITE_URL, priority: 1.0 },
    { url: `${SITE_URL}/shop`, priority: 0.9 },
    { url: `${SITE_URL}/about`, priority: 0.7 },
    { url: `${SITE_URL}/blog`, priority: 0.8 },
    { url: `${SITE_URL}/contact`, priority: 0.6 },
    { url: `${SITE_URL}/gifts`, priority: 0.7 },
  ].map(({ url, priority }) => ({
    url,
    lastModified: new Date(),
    priority,
    changeFrequency: 'weekly' as const,
  }));

  const productRoutes = (products?.products || []).map((p: any) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }));

  const categoryRoutes = (categories || []).map((c: any) => ({
    url: `${SITE_URL}/shop/${c.slug}`,
    lastModified: new Date(),
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  }));

  const blogRoutes = (posts?.posts || []).map((p: any) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt || p.createdAt),
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
