import Button from '@/components/ui/Button';
import MediaFill from '@/components/cms/MediaFill';
import type { HeroContent } from '@/lib/cms/types';

export default function Hero({ hero }: { hero: HeroContent }) {
  if (!hero.enabled) return null;

  return (
    <section className="hero">
      <MediaFill media={hero.media} className="hero-photo" />
      {hero.ctaLabel && (
        <div className="hero-cta">
          <Button href={hero.ctaHref || '/shop'} variant="outline-white">
            {hero.ctaLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
