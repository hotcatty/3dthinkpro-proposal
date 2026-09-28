import type { ProductsContent } from './types';
import { absoluteImage } from './productCsv';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

/** Shopify CSV / Admin 拉图必须是公网 HTTP(S)。localhost 和相对路径都不行。 */
export function isPublicHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const host = url.hostname.toLowerCase();
    if (LOCAL_HOSTS.has(host)) return false;
    if (host.endsWith('.local')) return false;
    return Boolean(host);
  } catch {
    return false;
  }
}

export function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return LOCAL_HOSTS.has(host) || host.endsWith('.local');
  } catch {
    return false;
  }
}

/** `/cms/foo.jpg` → `foo.jpg`。其它路径不算本地上传。 */
export function localCmsFilename(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;
  const pathOnly = trimmed.startsWith('http') ? pathName(trimmed) : trimmed;
  const match = pathOnly.match(/^\/cms\/([^/?#]+)$/);
  if (!match) return null;
  const name = match[1];
  if (!name || name.includes('..') || name.includes('\\') || name.includes('/')) return null;
  return name;
}

function pathName(value: string): string {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

export function csvImageIssues(content: ProductsContent): string[] {
  const issues: string[] = [];
  const base = content.imageBaseUrl.trim();
  if (base && !isPublicHttpUrl(base)) {
    issues.push(
      `图片基础网址「${base}」不是公网地址。Shopify 导入 CSV 时访问不了 localhost / 相对路径。`,
    );
  }

  let relative = 0;
  let unusable = 0;
  for (const row of content.rows) {
    if (!row.handle && !row.title) continue;
    for (const src of row.images.filter(Boolean)) {
      const abs = absoluteImage(base, src);
      if (!abs) continue;
      if (!/^https?:\/\//i.test(abs)) {
        relative += 1;
        continue;
      }
      if (!isPublicHttpUrl(abs)) unusable += 1;
    }
  }

  if (relative > 0) {
    issues.push(
      `${relative} 张图导出后仍是相对路径（如 /cms/…）。不填公网「图片基础网址」时，Shopify 拉不下来。`,
    );
  }
  if (unusable > 0) {
    issues.push(`${unusable} 张图的 Image Src 指向本机或无效地址，Shopify 拉不下来。`);
  }
  return issues;
}
