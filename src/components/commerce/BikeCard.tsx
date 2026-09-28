import Image from 'next/image';
import Link from 'next/link';
import type { CmsMedia } from '@/lib/cms/types';

export type BikeCardData = {
  href: string;
  media?: CmsMedia | null;
  brand: string;
  model: string;
};

export default function BikeCard({ href, media, brand, model }: BikeCardData) {
  return (
    <Link href={href} className="bike-card">
      {media?.kind === 'video' && media.src ? (
        <video src={media.src} muted loop playsInline autoPlay />
      ) : media?.src ? (
        <Image src={media.src} alt={`${brand} ${model}`} width={600} height={600} />
      ) : null}
      <div className="bike-card-mask" />
      <p className="bike-card-title">
        <span>{brand}</span>
        <span>{model}</span>
      </p>
    </Link>
  );
}
