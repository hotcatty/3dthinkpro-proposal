import { getReviews } from '@/lib/cms/reviews';
import { getJudgeMeReviews, getJudgeMeStats } from '@/lib/judgeme/reviews';
import ReviewsTable from './ReviewsTable';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const [initial, liveReviews, liveStats] = await Promise.all([
    getReviews(),
    getJudgeMeReviews(),
    getJudgeMeStats(),
  ]);

  return <ReviewsTable initial={initial} liveReviews={liveReviews} liveStats={liveStats} />;
}
