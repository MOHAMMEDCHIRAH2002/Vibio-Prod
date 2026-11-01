import { SERVER_API_URL } from '@/lib/serverApiUrl';
import ReviewsSectionClient from './ReviewsSectionClient';
import { localizeServerData } from '@/lib/i18n/server';

async function getRecentReviews() {
  try {
    const res = await fetch(
      `${SERVER_API_URL}/api/reviews/recent?limit=4`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return localizeServerData(await res.json());
  } catch {
    return [];
  }
}

export default async function TestimonialsSection() {
  const reviews = await getRecentReviews();

  if (!reviews.length) return null;

  const displayedReviews = (reviews as any[]).slice(0, 4);

  return <ReviewsSectionClient reviews={displayedReviews} />;
}
