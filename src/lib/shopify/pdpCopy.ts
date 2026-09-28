import type { Metafield } from './types';

export type PdpCopy = {
  detailsHtml: string;
  installationHtml: string;
};

const SECTION_KEYS = ['details', 'installation'] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

function trimHtml(html: string) {
  return html.replace(/^\s+|\s+$/g, '').replace(/^(<p><br\s*\/?><\/p>)+|(<p><br\s*\/?><\/p>)+$/gi, '').trim();
}

function escapeText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Visible step copy: `1. Remove…` / `· …`. Class/style are only added here, after Shopify. */
function paragraphLooksLikeStep(inner: string) {
  const text = inner
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
  return /^\d+\.\s+/.test(text) || /^[·•●▪◦]\s+/.test(text);
}

function markStepParagraphs(html: string) {
  return html.replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi, (full, attrs = '', inner: string) => {
    if (/\bpdp-indent\b/i.test(attrs) || /text-indent\s*:/i.test(attrs)) return full;
    if (!paragraphLooksLikeStep(inner)) return full;
    if (/\bclass\s*=/i.test(attrs)) {
      return `<p${attrs.replace(/class=(["'])/i, 'class=$1pdp-indent ')}>${inner}</p>`;
    }
    return `<p class="pdp-indent"${attrs}>${inner}</p>`;
  });
}

export function sanitizePdpHtml(html: string) {
  return markStepParagraphs(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/<\/?(iframe|object|embed|link|meta)\b[^>]*>/gi, ''),
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

type RichNode = {
  type?: string;
  listType?: string;
  value?: string;
  bold?: boolean;
  italic?: boolean;
  children?: RichNode[];
};

function richTextToHtml(node: RichNode): string {
  const children = (node.children ?? []).map(richTextToHtml).join('');
  switch (node.type) {
    case 'root':
      return children;
    case 'paragraph':
      return `<p>${children || '<br>'}</p>`;
    case 'heading':
      return `<p>${children}</p>`;
    case 'list':
      return node.listType === 'ordered' ? `<ol>${children}</ol>` : `<ul>${children}</ul>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'text': {
      let text = escapeText(node.value ?? '');
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      return text;
    }
    default:
      return children || escapeText(node.value ?? '');
  }
}

function metafieldToHtml(field: Metafield | undefined) {
  const raw = field?.value?.trim();
  if (!raw) return '';
  if (field?.type === 'rich_text_field' || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as RichNode;
      if (parsed && typeof parsed === 'object' && parsed.type) {
        return trimHtml(richTextToHtml(parsed));
      }
    } catch {
      /* fall through */
    }
  }
  if (looksLikeHtml(raw)) return trimHtml(raw);
  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeText(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function innerByAttr(html: string, key: SectionKey) {
  const re = new RegExp(
    `<([a-z][a-z0-9]*)([^>]*\\bdata-pdp-section=["']?${key}["']?[^>]*)>([\\s\\S]*?)</\\1>`,
    'i',
  );
  return trimHtml(html.match(re)?.[3] ?? '');
}

function innerById(html: string, key: SectionKey) {
  const re = new RegExp(
    `<([a-z][a-z0-9]*)([^>]*\\bid=["']${key}["'][^>]*)>([\\s\\S]*?)</\\1>`,
    'i',
  );
  return trimHtml(html.match(re)?.[3] ?? '');
}

function splitByMarkers(
  html: string,
  pattern: RegExp,
): Partial<Record<SectionKey, string>> | null {
  const matches = [...html.matchAll(pattern)];
  if (!matches.length) return null;
  const out: Partial<Record<SectionKey, string>> = {};
  matches.forEach((match, index) => {
    const key = String(match[1] || '').toLowerCase() as SectionKey;
    if (!SECTION_KEYS.includes(key)) return;
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? html.length) : html.length;
    out[key] = trimHtml(html.slice(start, end));
  });
  return out;
}

function parseDescriptionHtml(html: string): PdpCopy {
  const source = trimHtml(html);
  if (!source) return { detailsHtml: '', installationHtml: '' };

  const byAttr = {
    detailsHtml: innerByAttr(source, 'details'),
    installationHtml: innerByAttr(source, 'installation'),
  };
  if (byAttr.detailsHtml || byAttr.installationHtml) return byAttr;

  const byId = {
    detailsHtml: innerById(source, 'details'),
    installationHtml: innerById(source, 'installation'),
  };
  if (byId.detailsHtml || byId.installationHtml) return byId;

  const byComment = splitByMarkers(source, /<!--\s*pdp:(details|installation)\s*-->/gi);
  if (byComment) {
    return {
      detailsHtml: byComment.details ?? '',
      installationHtml: byComment.installation ?? '',
    };
  }

  const byHeading = splitByMarkers(
    source,
    /<h[1-3][^>]*>\s*(details|installation)\s*<\/h[1-3]>/gi,
  );
  if (byHeading) {
    return {
      detailsHtml: byHeading.details ?? '',
      installationHtml: byHeading.installation ?? '',
    };
  }

  return { detailsHtml: source, installationHtml: '' };
}

function findMetafield(fields: Metafield[], key: SectionKey) {
  return fields.find(
    (field) => field.namespace === 'custom' && field.key === key,
  );
}

export function pdpCopyFromProduct(input: {
  descriptionHtml?: string | null;
  metafields?: Array<Metafield | null> | null;
}): PdpCopy {
  const fields = (input.metafields ?? []).filter((field): field is Metafield => Boolean(field));
  const parsed = parseDescriptionHtml(input.descriptionHtml ?? '');
  const detailsHtml = metafieldToHtml(findMetafield(fields, 'details')) || parsed.detailsHtml;
  const installationHtml =
    metafieldToHtml(findMetafield(fields, 'installation')) || parsed.installationHtml;
  return {
    detailsHtml: detailsHtml ? sanitizePdpHtml(detailsHtml) : '',
    installationHtml: installationHtml ? sanitizePdpHtml(installationHtml) : '',
  };
}
