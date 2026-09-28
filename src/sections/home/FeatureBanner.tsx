import Button from '@/components/ui/Button';
import MediaFill from '@/components/cms/MediaFill';
import type { CampaignContent } from '@/lib/cms/types';

export default function FeatureBanner({ campaign }: { campaign: CampaignContent }) {
  const hasMedia = Boolean(campaign.media?.src);

  return (
    <section className={hasMedia ? 'feature-banner' : 'feature-banner is-empty'}>
      {hasMedia && <MediaFill media={campaign.media} className="feature-photo" />}
      {hasMedia && <div className="feature-mask" />}
      <div className="feature-copy">
        <div className="feature-copy-text">
          {campaign.title && <h2 className="fs-24 fw-medium">{campaign.title}</h2>}
          {campaign.description && <p className="fs-16 fw-regular">{campaign.description}</p>}
        </div>
        {campaign.ctaLabel && (
          <Button href={campaign.ctaHref || '/shop'} variant="accent">
            {campaign.ctaLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
