import type { ProductReview } from '@/lib/cms/types';

function Stars({ count = 5, size = 20 }: { count?: number; size?: number }) {
  return (
    <span className="pdp-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <img key={i} src="/icons/star.svg" alt="" width={size} height={size} />
      ))}
    </span>
  );
}

function Flag({ country }: { country: string }) {
  const code = /^[a-z]{2}$/i.test(country) ? country.toLowerCase() : '';
  if (!code) return null;
  return <img className="pdp-flag" src={`/flags/${code}.svg`} alt="" width={20} height={20} />;
}

export default function ReviewList({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="pdp-review-list">
      {reviews.map((review) => (
        <article key={review.id} className="pdp-review">
          <div className="pdp-review-meta">
            <div className="pdp-review-rate">
              <p className="pdp-label">RATE:</p>
              <Stars count={review.rating} size={20} />
            </div>
            <p className="pdp-review-name">{review.name}</p>
            {review.date ? <p className="pdp-review-date">{review.date}</p> : null}
          </div>
          <div className="pdp-review-body">
            <p className="pdp-review-text">{review.text}</p>
            {review.images.length > 0 && (
              <div className="pdp-review-photos">
                {review.images.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
            )}
            <div className="pdp-review-foot">
              <div className="pdp-review-tags">
                {review.ownerBadge === 'Verified buyer' ? (
                  <span className="pdp-purchased">Purchased</span>
                ) : review.ownerBadge ? (
                  <span>{review.ownerBadge}</span>
                ) : null}
                {review.country || review.location ? (
                  <span className="pdp-review-loc">
                    <Flag country={review.country} />
                    {review.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
