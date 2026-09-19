import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate, readingTime } from '@/lib/utils';
import { SERVER_API_URL } from '@/lib/serverApiUrl';

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/blog/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-primary-bg pt-28">
      <article className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1120px] space-y-6">
          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5B6455] transition-colors hover:text-[#1E2519]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to journal
            </Link>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags?.map((tag: any) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-[#EFF5E7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#273E1C]"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="mt-6 font-heading text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.94] tracking-[-0.06em] text-[#1E2519]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#78805F]">
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              <span>{readingTime(post.content)} min read</span>
            </div>

            {post.excerpt && (
              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                {post.excerpt}
              </p>
            )}
          </div>

          {post.coverImage && (
            <div className="surface-shell p-4">
              <div className="relative aspect-[1.55] overflow-hidden rounded-[32px] bg-[#F7F4EC]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1120px) 100vw, 1120px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="surface-shell p-6 sm:p-7 lg:p-8">
            <div className="prose prose-lg max-w-none whitespace-pre-line text-[#4E5948]">
              {post.content}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
