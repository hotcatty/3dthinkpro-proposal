import Link from 'next/link';
import Button from '@/components/ui/Button';
import ReviewList from '@/components/reviews/ReviewList';
import { featuredReviewFor, getReviews } from '@/lib/cms/reviews';
import { getJudgeMeReviews, getJudgeMeStats } from '@/lib/judgeme/reviews';

function Stars({ count = 5, size = 24 }: { count?: number; size?: number }) {
  return (
    <span className="pdp-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <img key={i} src="/icons/star.svg" alt="" width={size} height={size} />
      ))}
    </span>
  );
}

export default async function CommunityPage() {
  const [{ reviews }, liveReviews, liveStats] = await Promise.all([
    getReviews(),
    getJudgeMeReviews(),
    getJudgeMeStats(),
  ]);
  const featured = featuredReviewFor(reviews);

  return (
    <div>
      <section className="page-hero is-light">
        <img className="page-hero-bg" src="/community/hero.png" alt="" />
        <h1>community</h1>
      </section>

      <section className="comm-intro">
        <div>
          <h2>800 Miles, Zero Numbness — A Rider&apos;s Story</h2>
          <p>
            Follow Marcus on his weekend run from the California coast to the desert, and the seat
            that changed how he rides.
          </p>
        </div>
        <div className="comm-intro-photo">
          <img src="/community/story.png" alt="A rider on a coastal highway" />
        </div>
      </section>

      <section className="feature-banner" id="marcus">
        <div className="media-fill">
          <img src="/community/marcus.png" alt="" />
        </div>
        <div className="feature-mask" />
        <div className="feature-copy">
          <div className="feature-copy-text">
            <h2 className="fs-32 fw-bold">Marcus T.</h2>
            <p className="fs-16">
              Long-distance tourer from California. Rides a BMW R1250GS. Has run the coast-to-desert
              loop more than a dozen times.
            </p>
          </div>
          <Button href="#comments" variant="accent">
            Read Marcus T’s Story
          </Button>
        </div>
      </section>

      {featured ? (
        <section className="pdp-featured comm-quote">
          <div className="pdp-featured-row is-mid">
            <div className="pdp-featured-copy">
              <div className="pdp-featured-rate">
                <Stars count={featured.rating} size={24} />
                {liveStats.count > 0 ? (
                  <p className="pdp-featured-count">({liveStats.count})</p>
                ) : null}
              </div>
              <p className="pdp-featured-quote">“{featured.text}”</p>
              <p className="pdp-featured-author">{featured.name}</p>
              {liveReviews.length > 0 ? (
                <a href="#comments" className="pdp-key-more">
                  Read More
                </a>
              ) : null}
            </div>
            <Link href="/shop" className="pdp-reviews-btn">
              Browse Goods
            </Link>
          </div>
        </section>
      ) : null}

      <section className="feature-banner" id="aiko">
        <div className="media-fill">
          <img src="/community/aiko.png" alt="" />
        </div>
        <div className="feature-mask" />
        <div className="feature-copy">
          <div className="feature-copy-text">
            <h2 className="fs-32 fw-bold">Aiko S.</h2>
            <p className="fs-16">
              Daily commuter in Tokyo. Rides a Yamaha MT-07 through some of the most stop-and-go
              traffic in the world.
            </p>
          </div>
          <Button href="#comments" variant="accent">
            Read Aiko S’s Story
          </Button>
        </div>
      </section>

      {liveReviews.length > 0 ? (
        <section className="comm-comments" id="comments">
          <h2 className="pdp-section-title">Top Comments</h2>
          <ReviewList reviews={liveReviews} />
        </section>
      ) : null}
    </div>
  );
}
