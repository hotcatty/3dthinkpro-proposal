import type { CmsMedia } from '@/lib/cms/types';

export default function MediaFill({ media, className }: { media: CmsMedia | null; className?: string }) {
  const box = `media-fill${className ? ` ${className}` : ''}`;
  if (!media?.src) return <div className={box} />;

  if (media.kind === 'video') {
    return (
      <div className={box} suppressHydrationWarning>
        {/* Extensions (e.g. WXT YouTube dubbing) inject nodes into <video>; do not treat as app markup. */}
        <video src={media.src} autoPlay muted loop playsInline suppressHydrationWarning />
      </div>
    );
  }

  return (
    <div className={box}>
      <img src={media.src} alt="" />
    </div>
  );
}
