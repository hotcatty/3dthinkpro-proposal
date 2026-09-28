import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { CampaignContent, HomeContent, SocialCardContent } from './types';
import { MAX_CAMPAIGNS } from './types';

const contentPath = path.join(process.cwd(), 'content/home.json');

function asMedia(value: unknown): HomeContent['hero']['media'] {
  if (!value || typeof value !== 'object') return null;
  const media = value as { kind?: string; src?: string };
  if ((media.kind === 'image' || media.kind === 'video') && typeof media.src === 'string' && media.src) {
    return { kind: media.kind, src: media.src };
  }
  return null;
}

export function normalizeHome(raw: Partial<HomeContent> | null | undefined): HomeContent {
  const campaigns = Array.isArray(raw?.campaigns)
    ? raw.campaigns.slice(0, MAX_CAMPAIGNS).map((item, index): CampaignContent => ({
        id: item.id || `campaign-${index + 1}`,
        title: item.title ?? '',
        description: item.description ?? '',
        ctaLabel: item.ctaLabel ?? 'Discover More',
        ctaHref: item.ctaHref ?? '/shop',
        media: asMedia(item.media),
      }))
    : [];

  const cards = Array.isArray(raw?.social?.cards)
    ? raw.social.cards.map((item, index): SocialCardContent => ({
        id: item.id || `social-${index + 1}`,
        brand: item.brand ?? '',
        model: item.model ?? '',
        href: item.href ?? '/shop',
        media: asMedia(item.media),
      }))
    : [];

  return {
    hero: {
      enabled: raw?.hero?.enabled !== false,
      ctaLabel: raw?.hero?.ctaLabel ?? 'Discover Your Passion',
      ctaHref: raw?.hero?.ctaHref ?? '/shop',
      media: asMedia(raw?.hero?.media),
    },
    campaigns,
    social: {
      title: raw?.social?.title ?? 'Built for Your Bike',
      cards,
    },
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const raw = await readFile(contentPath, 'utf8');
  return normalizeHome(JSON.parse(raw) as HomeContent);
}

export async function saveHomeContent(input: HomeContent): Promise<HomeContent> {
  const next = normalizeHome(input);
  await mkdir(path.dirname(contentPath), { recursive: true });
  await writeFile(contentPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
