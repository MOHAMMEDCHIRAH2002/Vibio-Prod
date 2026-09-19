import type { Metadata } from 'next';
import Link from 'next/link';
import Image from '@/components/common/OptimizedImage';
import { ArrowRight, BookOpen, Clock, Feather, Sparkles } from 'lucide-react';
import { formatDate, readingTime } from '@/lib/utils';
import { SERVER_API_URL } from '@/lib/serverApiUrl';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Stories, guides, and insights from the world of luxury natural products.',
};

export const revalidate = 0;

async function getPosts() {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/blog?limit=12`, {
      cache: 'no-store',
    });

    if (!res.ok) return { posts: [] };

    return res.json();
  } catch {
    return { posts: [] };
  }
}

export default async function BlogPage() {
  const { posts } = await getPosts();

  const safePosts = Array.isArray(posts) ? posts : [];
  const featuredPost = safePosts?.[0];
  const secondaryPosts = safePosts?.slice(1) || [];

  return (
    <div className="min-h-screen overflow-hidden bg-primary-bg pt-28">
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-7">
          {/* HERO */}
          <div className="surface-shell relative overflow-hidden p-0">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#EAF3DF]/70 blur-[110px]" />
              <div className="absolute right-0 top-0 h-full w-[48%] bg-[radial-gradient(circle_at_80%_20%,rgba(198,162,94,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,241,230,0.74))]" />
              <div className="absolute bottom-[-12%] right-[10%] font-heading text-[19vw] leading-none tracking-[-0.08em] text-[#1E2519]/[0.025]">
                Journal
              </div>
            </div>

            <div className="relative grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-14">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E2D5BE] bg-white/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#6F7D58] shadow-[0_18px_50px_rgba(39,62,28,0.06)] backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Vibio journal
                </div>

                <h1 className="mt-7 max-w-[10ch] font-heading text-[clamp(3.5rem,7vw,7.8rem)] leading-[0.86] tracking-[-0.075em] text-[#182215]">
                  Stories behind refined rituals.
                </h1>

                <p className="mt-7 max-w-2xl text-[15px] leading-8 text-[#5B6455] sm:text-[16px]">
                  Editorial notes, ingredient stories, hosting ideas, and product insights
                  designed to make every natural ritual feel more considered, sensory, and
                  beautifully composed.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="#journal-grid" className="btn-gold">
                    Explore articles
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="lux-pill px-4 py-3">
                    {safePosts.length} {safePosts.length === 1 ? 'published piece' : 'published pieces'}
                  </div>
                </div>
              </div>

              <div className="grid content-end gap-4 sm:grid-cols-3 lg:pl-8">
                {[
                  {
                    icon: BookOpen,
                    value: `${safePosts.length || 0}`,
                    label: 'Published pieces',
                    text: 'Guides, notes, and editorial stories.',
                  },
                  {
                    icon: Feather,
                    value: 'Guides',
                    label: 'And inspiration',
                    text: 'For rituals, gifting, and hosting.',
                  },
                  {
                    icon: Clock,
                    value: 'Editorial',
                    label: 'Brand voice',
                    text: 'A calmer way to discover products.',
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-[28px] border border-[#E5DAC7] bg-white/75 p-5 shadow-[0_28px_80px_rgba(39,62,28,0.07)] backdrop-blur transition duration-500 hover:-translate-y-1 hover:bg-white"
                    >
                      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DAC7] bg-[#F7F2E8] text-[#24531B]">
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="font-heading text-[2rem] leading-none tracking-[-0.055em] text-[#1E2519]">
                        {item.value}
                      </p>

                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A6E3E]">
                        {item.label}
                      </p>

                      <p className="mt-3 text-[13px] leading-6 text-[#697260]">
                        {item.text}
                      </p>

                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#EAF3DF] opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {!safePosts.length ? (
            <div className="surface-shell relative overflow-hidden px-6 py-24 text-center sm:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(198,162,94,0.14),transparent_35%)]" />

              <div className="relative mx-auto max-w-xl">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#E2D5BE] bg-[#F7F2E8] text-[#24531B]">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h2 className="font-heading text-[clamp(2.5rem,5vw,4.4rem)] leading-[0.9] tracking-[-0.06em] text-[#1E2519]">
                  The journal is being curated.
                </h2>

                <p className="mt-5 text-[15px] leading-8 text-[#5B6455]">
                  Articles, guides, and ritual notes will appear here once the editorial
                  collection is ready.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* FEATURED ARTICLE */}
              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group surface-shell relative block overflow-hidden p-5 transition duration-500 hover:-translate-y-1 sm:p-6 lg:p-7"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(198,162,94,0.12),transparent_32%),radial-gradient(circle_at_8%_90%,rgba(226,241,215,0.75),transparent_28%)]" />

                  <div className="relative grid gap-7 lg:grid-cols-[1.14fr_0.86fr]">
                    <div className="relative min-h-[380px] overflow-hidden rounded-[34px] border border-[#E7DECF] bg-[#F7F4EC] shadow-[0_35px_100px_rgba(39,62,28,0.10)]">
                      {featuredPost.coverImage ? (
                        <Image
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 58vw"
                          className="object-cover transition duration-[1200ms] group-hover:scale-[1.045]"
                        />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(226,241,215,0.9),rgba(247,244,236,1))]" />
                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(24,34,21,0.42))]" />

                      <div className="absolute bottom-5 left-5 right-5 rounded-[26px] border border-white/35 bg-white/25 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.18)] backdrop-blur-md">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                          Featured ritual
                        </p>

                        <p className="mt-2 max-w-xl font-heading text-[2rem] leading-[0.98] tracking-[-0.05em]">
                          {featuredPost.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-[34px] border border-[#E7DECF] bg-white/70 p-6 shadow-[0_30px_90px_rgba(39,62,28,0.06)] backdrop-blur sm:p-8">
                      <div>
                        <p className="section-eyebrow">Featured article</p>

                        <h2 className="mt-4 font-heading text-[clamp(2.5rem,4.8vw,5.2rem)] leading-[0.9] tracking-[-0.065em] text-[#1E2519]">
                          {featuredPost.title}
                        </h2>

                        {featuredPost.excerpt && (
                          <p className="mt-6 text-[15px] leading-8 text-[#5B6455]">
                            {featuredPost.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="mt-10 border-t border-[#ECE6D9] pt-5">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#78805F]">
                          {featuredPost.publishedAt && (
                            <span>{formatDate(featuredPost.publishedAt)}</span>
                          )}

                          {featuredPost.content && (
                            <span>{readingTime(featuredPost.content)} min read</span>
                          )}
                        </div>

                        <span className="mt-5 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#24531B]">
                          Read article
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24531B] text-white transition duration-300 group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* JOURNAL GRID */}
              <div id="journal-grid" className="surface-shell relative overflow-hidden p-6 sm:p-7 lg:p-8">
                <div className="pointer-events-none absolute bottom-[-14%] right-[-4%] font-heading text-[16vw] leading-none tracking-[-0.08em] text-[#1E2519]/[0.025]">
                  Notes
                </div>

                <div className="relative mb-7 flex flex-col gap-5 border-b border-[#ECE6D9] pb-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="section-eyebrow">More from the journal</p>

                    <h2 className="mt-3 max-w-4xl font-heading text-[clamp(2.4rem,4.6vw,4.7rem)] leading-[0.92] tracking-[-0.06em] text-[#1E2519]">
                      Guides, rituals, and brand perspective.
                    </h2>
                  </div>

                  <p className="max-w-md text-sm leading-7 text-[#68725F]">
                    A curated editorial space for natural products, refined hosting,
                    ingredient stories, and premium everyday rituals.
                  </p>
                </div>

                {secondaryPosts.length ? (
                  <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {secondaryPosts.map((post: any, index: number) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group relative overflow-hidden rounded-[34px] border border-[#E7DECF] bg-white/80 p-4 shadow-[0_24px_70px_rgba(39,62,28,0.055)] backdrop-blur transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_95px_rgba(39,62,28,0.09)]"
                      >
                        <div className="relative aspect-[1.08] overflow-hidden rounded-[28px] bg-[#F7F4EC]">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="(max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition duration-[1000ms] group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(226,241,215,0.9),rgba(247,244,236,1))]" />
                          )}

                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(24,34,21,0.25))] opacity-0 transition duration-500 group-hover:opacity-100" />

                          <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#24531B] backdrop-blur">
                            0{index + 1}
                          </div>
                        </div>

                        <div className="p-2 pt-5">
                          <div className="flex flex-wrap gap-2">
                            {post.tags?.slice(0, 2).map((tag: any) => (
                              <span
                                key={tag.id}
                                className="rounded-full border border-[#DDEAD2] bg-[#EFF5E7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#273E1C]"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>

                          <h3 className="mt-4 font-heading text-[clamp(1.8rem,2.4vw,2.35rem)] leading-[0.98] tracking-[-0.055em] text-[#1E2519]">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#5B6455]">
                              {post.excerpt}
                            </p>
                          )}

                          <div className="mt-6 flex items-center justify-between border-t border-[#ECE6D9] pt-4 text-[10px] uppercase tracking-[0.18em] text-[#78805F]">
                            <div className="flex flex-wrap gap-3">
                              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                              {post.content && <span>{readingTime(post.content)} min read</span>}
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D7C7AD] bg-white text-[#24531B] transition duration-300 group-hover:border-[#24531B] group-hover:bg-[#24531B] group-hover:text-white">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="relative rounded-[32px] border border-[#E7DECF] bg-[#FBFAF6] px-6 py-16 text-center">
                    <h3 className="font-heading text-[2.6rem] leading-none tracking-[-0.05em] text-[#1E2519]">
                      More stories coming soon.
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-[#5B6455]">
                      The editorial collection will grow with new guides, rituals, and product stories.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}