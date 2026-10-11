import type { MetadataRoute } from 'next';
import { siteGateEnabled } from '@/lib/siteGate';

export default function robots(): MetadataRoute.Robots {
  if (siteGateEnabled()) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
  };
}
