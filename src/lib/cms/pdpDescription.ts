/** Section HTML for Shopify descriptions that `pdpCopyFromProduct` can parse. */

export function escapePdpText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Figma 516:3036 `paragraphIndent` — first-line indent, applied on the storefront. */
export const PDP_PARAGRAPH_INDENT = '24px';

const STEP_NUMBER = /^\s*\d+\.\s+/;
const STEP_BULLET = /^\s*(?:[·•●▪◦]\s+|\*\s+)/;
const UL_MARKER = /^\s*(?:[-·•●▪◦]\s+|\*\s+)/;
const OL_MARKER = /^\s*\d+\.\s+/;
const INDENT_MARKER = /^\s*>\s+/;
const HTML_BLOCK = /<(p|ul|ol|div|li|blockquote)\b/i;
const TOP_BLOCK_RE = /<(blockquote|p|ul|ol)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

type PdpBlockType = 'p' | 'indent' | 'ul' | 'ol';

type PdpBlock = {
  type: PdpBlockType;
  text: string;
  indent?: boolean;
};

export function isIndentedAttrs(attrs: string) {
  if (/\bpdp-indent\b/i.test(attrs)) return true;
  const indent = attrs.match(/text-indent\s*:\s*([^;}"']+)/i);
  if (!indent) return false;
  const value = indent[1].trim().toLowerCase();
  return Boolean(value) && value !== '0' && value !== '0px' && value !== '0em' && value !== '0rem';
}

/** Visible step copy that survives Shopify stripping class/style/blockquote. */
export function looksLikeStepText(text: string) {
  const value = text.replace(/\u00a0/g, ' ').trim();
  return STEP_NUMBER.test(value) || STEP_BULLET.test(value);
}

function stripLeadingNumber(text: string) {
  return text.replace(STEP_NUMBER, '');
}

function stripLeadingBullet(text: string) {
  return text.replace(STEP_BULLET, '').replace(/^\s*-\s+/, '');
}

function editorIndentClass() {
  return ' class="pdp-indent"';
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function htmlFragmentToText(html: string) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<(strong|b)\b[^>]*>/gi, '**')
      .replace(/<\/(strong|b)>/gi, '**')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

function parsePlainLine(line: string): PdpBlock | null {
  if (!line.trim()) return null;
  if (INDENT_MARKER.test(line)) {
    const text = line.replace(INDENT_MARKER, '');
    if (OL_MARKER.test(text)) return { type: 'ol', text: text.replace(OL_MARKER, ''), indent: true };
    if (UL_MARKER.test(text)) return { type: 'ul', text: text.replace(UL_MARKER, ''), indent: true };
    return { type: 'indent', text };
  }
  if (OL_MARKER.test(line)) return { type: 'ol', text: line.replace(OL_MARKER, '') };
  if (UL_MARKER.test(line)) return { type: 'ul', text: line.replace(UL_MARKER, '') };
  return { type: 'p', text: line };
}

function parsePlainSection(text: string): PdpBlock[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .flatMap((line) => {
      const item = parsePlainLine(line);
      return item ? [item] : [];
    });
}

function pushHtmlLines(blocks: PdpBlock[], type: PdpBlockType, html: string, indent = false) {
  const text = htmlFragmentToText(html);
  if (!text) return;
  if (type === 'p' || type === 'indent') {
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (type === 'indent' || looksLikeStepText(line)) {
          if (OL_MARKER.test(line)) {
            blocks.push({ type: 'ol', text: stripLeadingNumber(line), indent: true });
            return;
          }
          if (UL_MARKER.test(line) || STEP_BULLET.test(line)) {
            blocks.push({ type: 'ul', text: stripLeadingBullet(line), indent: true });
            return;
          }
          blocks.push({ type: 'indent', text: line });
          return;
        }
        blocks.push({ type: 'p', text: line });
      });
    return;
  }
  blocks.push({ type, text: text.replace(/\n+/g, ' '), indent });
}

function parseListItems(blocks: PdpBlock[], tag: 'ol' | 'ul', inner: string, listIndented: boolean) {
  const itemRe = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
  let item: RegExpExecArray | null;
  let found = false;
  while ((item = itemRe.exec(inner))) {
    found = true;
    const indented = listIndented || isIndentedAttrs(item[1] ?? '');
    pushHtmlLines(blocks, tag, item[2] ?? '', indented);
  }
  if (!found) pushHtmlLines(blocks, tag, inner, listIndented);
}

function parseHtmlSection(html: string, inheritedIndent = false): PdpBlock[] {
  const blocks: PdpBlock[] = [];
  const source = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const re = new RegExp(TOP_BLOCK_RE.source, 'gi');
  let match: RegExpExecArray | null;
  let last = 0;

  while ((match = re.exec(source))) {
    const leading = source.slice(last, match.index);
    if (leading.trim()) {
      parsePlainSection(htmlFragmentToText(leading)).forEach((block) => {
        blocks.push(inheritedIndent ? { ...block, indent: true, type: block.type === 'p' ? 'indent' : block.type } : block);
      });
    }
    last = match.index + match[0].length;
    const tag = match[1].toLowerCase();
    const attrs = match[2] ?? '';
    const inner = match[3] ?? '';
    if (tag === 'blockquote') {
      parseHtmlSection(inner, true).forEach((block) => blocks.push(block));
      continue;
    }
    if (tag === 'p') {
      const indented = inheritedIndent || isIndentedAttrs(attrs);
      pushHtmlLines(blocks, indented ? 'indent' : 'p', inner, indented);
      continue;
    }
    parseListItems(blocks, tag === 'ol' ? 'ol' : 'ul', inner, inheritedIndent || isIndentedAttrs(attrs));
  }

  const trailing = source.slice(last);
  if (trailing.trim()) {
    parsePlainSection(htmlFragmentToText(trailing)).forEach((block) => {
      blocks.push(inheritedIndent ? { ...block, indent: true, type: block.type === 'p' ? 'indent' : block.type } : block);
    });
  }
  return blocks;
}

function parseLegacySection(text: string): PdpBlock[] {
  const source = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!source) return [];
  if (HTML_BLOCK.test(source)) {
    const parsed = parseHtmlSection(source.replace(/<\/?div\b[^>]*>/gi, '\n'));
    if (parsed.length) return parsed;
  }
  return parsePlainSection(source);
}

function inlineToHtml(text: string) {
  return text
    .split('**')
    .map((part, index) => {
      const escaped = escapePdpText(part);
      return index % 2 === 1 ? `<strong>${escaped}</strong>` : escaped;
    })
    .join('');
}

function takeRun(blocks: PdpBlock[], start: number, type: 'ol' | 'ul') {
  const items: PdpBlock[] = [];
  let index = start;
  while (index < blocks.length && blocks[index].type === type) {
    if (blocks[index].text.trim()) items.push(blocks[index]);
    index += 1;
  }
  return { items, next: index };
}

function runIsIndented(items: PdpBlock[]) {
  return items.some((item) => item.indent);
}

/** Shopify-safe: no class/style/blockquote. Indented lists become `1. ` / `· ` paragraphs. */
function blocksToShopifyHtml(blocks: PdpBlock[]): string {
  const out: string[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    if (!block.text.trim()) {
      index += 1;
      continue;
    }

    if (block.type === 'p') {
      out.push(`<p>${inlineToHtml(block.text)}</p>`);
      index += 1;
      continue;
    }

    if (block.type === 'indent') {
      const text = looksLikeStepText(block.text) ? block.text : block.text;
      out.push(`<p>${inlineToHtml(text)}</p>`);
      index += 1;
      continue;
    }

    const { items, next } = takeRun(blocks, index, block.type);
    index = next;
    if (!items.length) continue;

    if (runIsIndented(items)) {
      if (block.type === 'ol') {
        items.forEach((item, step) => {
          out.push(`<p>${inlineToHtml(`${step + 1}. ${stripLeadingNumber(item.text)}`)}</p>`);
        });
        continue;
      }
      items.forEach((item) => {
        out.push(`<p>${inlineToHtml(`· ${stripLeadingBullet(item.text)}`)}</p>`);
      });
      continue;
    }

    const lis = items.map((item) => `<li>${inlineToHtml(item.text)}</li>`).join('');
    out.push(block.type === 'ol' ? `<ol>${lis}</ol>` : `<ul>${lis}</ul>`);
  }

  return out.join('');
}

/** Editor HTML: same step paragraphs as export, plus `pdp-indent` for the 24px preview. */
function blocksToEditorHtml(blocks: PdpBlock[]): string {
  const out: string[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    if (!block.text.trim()) {
      index += 1;
      continue;
    }

    if (block.type === 'p') {
      out.push(`<p>${inlineToHtml(block.text)}</p>`);
      index += 1;
      continue;
    }

    if (block.type === 'indent') {
      out.push(`<p${editorIndentClass()}>${inlineToHtml(block.text)}</p>`);
      index += 1;
      continue;
    }

    const { items, next } = takeRun(blocks, index, block.type);
    index = next;
    if (!items.length) continue;

    if (runIsIndented(items)) {
      if (block.type === 'ol') {
        items.forEach((item, step) => {
          out.push(`<p${editorIndentClass()}>${inlineToHtml(`${step + 1}. ${stripLeadingNumber(item.text)}`)}</p>`);
        });
        continue;
      }
      items.forEach((item) => {
        out.push(`<p${editorIndentClass()}>${inlineToHtml(`· ${stripLeadingBullet(item.text)}`)}</p>`);
      });
      continue;
    }

    const lis = items.map((item) => `<li>${inlineToHtml(item.text)}</li>`).join('');
    out.push(block.type === 'ol' ? `<ol>${lis}</ol>` : `<ul>${lis}</ul>`);
  }

  return out.join('');
}

export function isEmptySectionHtml(html: string) {
  return !html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/?(p|ul|ol|li|div|blockquote|strong|b|em|i|u)\b[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

function serializeSection(text: string, mode: 'shopify' | 'editor') {
  const source = (text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!source) return '';
  const html = mode === 'shopify' ? blocksToShopifyHtml(parseLegacySection(source)) : blocksToEditorHtml(parseLegacySection(source));
  return isEmptySectionHtml(html) ? '' : html;
}

/** Copy/download/Shopify body: one format, no class/style/blockquote. */
export function sectionToHtml(text: string) {
  return serializeSection(text, 'shopify');
}

export function sectionToEditorHtml(text: string) {
  return serializeSection(text, 'editor') || '<p></p>';
}

export function persistSectionHtml(html: string) {
  return serializeSection(html, 'editor');
}

/** @deprecated Editor/export no longer emit class+style+blockquote. Kept for old callers. */
export function sanitizeSectionHtml(html: string) {
  return serializeSection(html, 'shopify');
}

export const PDP_DETAILS_HEADING = 'Details';
export const PDP_INSTALLATION_HEADING = 'Installation';

const SECTION_HEADING_RE = /<h[1-6][^>]*>\s*(details|installation)\s*<\/h[1-6]>/gi;

/** One TipTap document: old details + installation, each under a heading. */
export function combineSectionsToEditorHtml(detailsText: string, installationText: string) {
  const details = sectionToEditorHtml(detailsText);
  const installation = sectionToEditorHtml(installationText);
  return `<h2>${PDP_DETAILS_HEADING}</h2>${details}<h2>${PDP_INSTALLATION_HEADING}</h2>${installation}`;
}

/** Split the editor document back into the two stored section fields. */
export function splitEditorHtmlToSections(html: string): { detailsText: string; installationText: string } {
  const source = html ?? '';
  const matches = [...source.matchAll(SECTION_HEADING_RE)];

  if (!matches.length) {
    return { detailsText: persistSectionHtml(source), installationText: '' };
  }

  const buckets: Record<'details' | 'installation', string[]> = { details: [], installation: [] };
  const leading = source.slice(0, matches[0].index ?? 0);
  if (leading.trim()) buckets.details.push(leading);

  matches.forEach((match, index) => {
    const key = String(match[1] ?? '').toLowerCase();
    if (key !== 'details' && key !== 'installation') return;
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    buckets[key].push(source.slice(start, end));
  });

  return {
    detailsText: persistSectionHtml(buckets.details.join('')),
    installationText: persistSectionHtml(buckets.installation.join('')),
  };
}

export function exportPdpDescriptionHtml(detailsText: string, installationText: string) {
  const detailsHtml = sectionToHtml(detailsText);
  const installationHtml = sectionToHtml(installationText);
  const parts: string[] = [];
  if (detailsHtml) parts.push(`<div data-pdp-section="details">${detailsHtml}</div>`);
  if (installationHtml) parts.push(`<div data-pdp-section="installation">${installationHtml}</div>`);
  return parts.join('\n');
}

export function downloadPdpHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function pdpHtmlFilename(sku: string, handle: string, id: string) {
  const raw = (sku || handle || id || 'pdp-description').trim().replace(/[^\w.-]+/g, '-');
  return `${raw || 'pdp-description'}.html`;
}
