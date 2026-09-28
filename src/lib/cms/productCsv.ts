import { exportPdpDescriptionHtml } from './pdpDescription';
import type { ProductRow, ProductsContent } from './types';
import { collapseYears, expandYearRange, isAllYearsToken } from './yearRange';

export const CSV_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Option2 Name',
  'Option2 Value',
  'Option3 Name',
  'Option3 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Variant Barcode',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Variant Image',
  'Gift Card',
  'SEO Title',
  'SEO Description',
  'Variant Weight Unit',
  'Status',
  'Cost per item',
];

function cell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function absoluteImage(base: string, src: string): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  const root = base.replace(/\/+$/, '');
  return root ? `${root}${src.startsWith('/') ? src : `/${src}`}` : src;
}

function isYearOption(name: string): boolean {
  return /year|年份|fitment|年款/i.test(name.trim());
}

/** Discrete Year option values written to Shopify (ranges expand here). */
export function shopifyYearValues(row: ProductRow): string[] {
  if (!isYearOption(row.option3Name || 'Year')) {
    return row.option3Value ? [row.option3Value] : [''];
  }
  const raw = row.option3Value.trim();
  if (!raw) return [''];
  if (isAllYearsToken(raw)) return [raw];
  const years = expandYearRange(raw);
  return years.length ? years : [raw];
}

function productColumns(
  row: ProductRow,
  yearValue: string,
  opts: { includeProductFields: boolean },
): string[] {
  return [
    row.handle,
    opts.includeProductFields ? row.title : '',
    opts.includeProductFields
      ? exportPdpDescriptionHtml(row.detailsText, row.installationText) || row.bodyHtml
      : '',
    opts.includeProductFields ? row.vendor : '',
    opts.includeProductFields ? row.productCategory : '',
    opts.includeProductFields ? row.type : '',
    opts.includeProductFields ? row.tags : '',
    opts.includeProductFields ? (row.published ? 'TRUE' : 'FALSE') : '',
    opts.includeProductFields ? row.option1Name : '',
    row.option1Value,
    opts.includeProductFields ? row.option2Name : '',
    row.option2Value,
    opts.includeProductFields ? row.option3Name : '',
    yearValue,
    // Keep the catalog SKU as-is — do not append year. Year is Option3, not part of SKU.
    row.sku,
    row.grams,
    row.inventoryTracker,
    row.inventoryQty,
    row.inventoryPolicy,
    row.fulfillmentService,
    row.price,
    row.compareAtPrice,
    row.requiresShipping ? 'TRUE' : 'FALSE',
    row.taxable ? 'TRUE' : 'FALSE',
    row.barcode,
  ];
}

function emptyCells(count: number): string[] {
  return Array.from({ length: count }, () => '');
}

function tailFields(row: ProductRow, includeSeo: boolean): string[] {
  return [
    'FALSE',
    includeSeo ? row.seoTitle : '',
    includeSeo ? row.seoDescription : '',
    row.weightUnit,
    includeSeo ? row.status : '',
    row.cost,
  ];
}

/**
 * Shopify CSV: admin may store Year as "2024-present"; export expands to one variant
 * row per discrete year so storefront buyers pick 2024 / 2025 / 2026.
 *
 * Shopify rules we must follow:
 * - Never write Image Alt / Image Position without Image Src ("Missing image source data")
 * - Extra variants: same Handle + option values + variant columns; leave Title/Body blank
 * - Extra images: Handle + Image Src/Position/Alt only (no variant fields)
 */
export function toCsvRows(content: ProductsContent): string[][] {
  const rows: string[][] = [CSV_HEADERS];
  for (const row of content.rows) {
    if (!row.handle && !row.title) continue;
    const years = shopifyYearValues(row);
    const images = row.images.filter(Boolean);
    const firstImage = images[0] ? absoluteImage(content.imageBaseUrl, images[0]) : '';

    years.forEach((yearValue, yearIndex) => {
      const firstVariant = yearIndex === 0;
      const withImage = firstVariant && Boolean(firstImage);
      rows.push([
        ...productColumns(row, yearValue, { includeProductFields: firstVariant }),
        withImage ? firstImage : '',
        withImage ? '1' : '',
        withImage ? row.imageAlt : '',
        '',
        ...tailFields(row, firstVariant),
      ]);
    });

    // Extra gallery images — image-only rows (no option/variant noise)
    images.slice(1).forEach((src, index) => {
      const abs = absoluteImage(content.imageBaseUrl, src);
      if (!abs) return;
      rows.push([
        row.handle,
        ...emptyCells(24), // Title … Barcode
        abs,
        String(index + 2),
        row.imageAlt,
        '',
        'FALSE',
        ...emptyCells(5), // SEO Title … Cost
      ]);
    });
  }
  return rows;
}

export function toCsv(content: ProductsContent): string {
  return `${toCsvRows(content).map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`;
}

export function downloadCsv(content: ProductsContent, filename = 'shopify-products.csv') {
  const blob = new Blob([`﻿${toCsv(content)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---------- CSV → ProductsContent (反向，用于导入) ----------

type DraftFields = Record<string, string>;

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Minimal RFC-4180 CSV parser that handles quoted fields, escaped quotes and CRLF.
 * Good enough for Shopify exports; doesn't try to be clever with multiline quoted bodies.
 */
export function parseCsvText(text: string): { headers: string[]; rows: string[][] } {
  const raw = stripBom(text);
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\r') { /* skip */ }
      else if (ch === '\n') {
        row.push(field); field = '';
        if (row.some((v) => v !== '')) records.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((v) => v !== '')) records.push(row);
  }
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).map((r) => {
    while (r.length < headers.length) r.push('');
    return r.slice(0, headers.length);
  });
  return { headers, rows };
}

const FIELD_MAP: Record<string, keyof DraftFields> = {
  'Handle': 'handle',
  'Title': 'title',
  'Body (HTML)': 'bodyHtml',
  'Vendor': 'vendor',
  'Product Category': 'productCategory',
  'Type': 'type',
  'Tags': 'tags',
  'Published': 'published',
  'Option1 Name': 'option1Name',
  'Option1 Value': 'option1Value',
  'Option2 Name': 'option2Name',
  'Option2 Value': 'option2Value',
  'Option3 Name': 'option3Name',
  'Option3 Value': 'option3Value',
  'Variant SKU': 'sku',
  'Variant Grams': 'grams',
  'Variant Inventory Tracker': 'inventoryTracker',
  'Variant Inventory Qty': 'inventoryQty',
  'Variant Inventory Policy': 'inventoryPolicy',
  'Variant Fulfillment Service': 'fulfillmentService',
  'Variant Price': 'price',
  'Variant Compare At Price': 'compareAtPrice',
  'Variant Requires Shipping': 'requiresShipping',
  'Variant Taxable': 'taxable',
  'Variant Barcode': 'barcode',
  'Image Src': 'imageSrc',
  'Image Position': 'imagePosition',
  'Image Alt Text': 'imageAlt',
  'Variant Image': 'variantImage',
  'Gift Card': 'giftCard',
  'SEO Title': 'seoTitle',
  'SEO Description': 'seoDescription',
  'Variant Weight Unit': 'weightUnit',
  'Status': 'status',
  'Cost per item': 'cost',
};

function yesNo(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === 'yes' || v === 'y' || v === '1';
}

interface RawProduct {
  primary: Record<string, string>;
  images: Array<{ src: string; alt: string; position: number }>;
  yearValues: string[];
}

export interface FromCsvResult {
  rows: ProductRow[];
  imageBaseUrl: string;
  warning: string;
}

/**
 * Parse a Shopify-formatted CSV into ProductsContent. Same handle → same row.
 * Multi-image rows are folded into the primary product's image library.
 * Recognises any column header we generate, and tolerates extra columns.
 */
export function fromCsvText(text: string): FromCsvResult {
  const { headers, rows } = parseCsvText(text);
  if (headers.length === 0) {
    return { rows: [], imageBaseUrl: '', warning: '文件为空或表头缺失' };
  }

  // Build header index by matching FIELD_MAP case-insensitively
  const indices: Record<string, number> = {};
  headers.forEach((h, i) => {
    const key = Object.keys(FIELD_MAP).find((k) => k.toLowerCase() === h.toLowerCase());
    if (key) indices[key] = i;
  });
  const missing = ['Handle', 'Title'].filter((k) => !(k in indices));
  if (missing.length) {
    return {
      rows: [],
      imageBaseUrl: '',
      warning: `表头缺少必需列：${missing.join('、')}。看起来不是 Shopify 产品 CSV。`,
    };
  }

  const byHandle = new Map<string, RawProduct>();
  for (const row of rows) {
    const fields: Record<string, string> = {};
    for (const [csvName, ourName] of Object.entries(FIELD_MAP)) {
      const idx = indices[csvName];
      if (idx !== undefined) fields[ourName] = (row[idx] ?? '').trim();
    }
    const handle = fields.handle || '';
    if (!handle) continue;
    let entry = byHandle.get(handle);
    if (!entry) {
      entry = { primary: fields, images: [], yearValues: [] };
      byHandle.set(handle, entry);
    }
    const imgSrc = fields.imageSrc;
    if (imgSrc) {
      entry.images.push({
        src: imgSrc,
        alt: fields.imageAlt || fields.title || '',
        position: Number(fields.imagePosition) || entry.images.length + 1,
      });
    }
    // Collect Year option values across variant rows so we can collapse 2024,2025 → 2024-present
    const yearName = fields.option3Name || entry.primary.option3Name || 'Year';
    if (fields.option3Value && isYearOption(yearName)) {
      entry.yearValues.push(fields.option3Value);
    }
    // Subsequent rows update text fields only when primary is empty (don't clobber with empty cells)
    for (const k of Object.keys(fields)) {
      if (k === 'imageSrc' || k === 'imagePosition' || k === 'imageAlt') continue;
      if (fields[k] && !entry.primary[k]) entry.primary[k] = fields[k];
    }
  }

  const out: ProductRow[] = [];
  let idCounter = 1;
  for (const [, entry] of byHandle) {
    const f = entry.primary;
    const imgs = entry.images
      .sort((a, b) => a.position - b.position)
      .map((i) => i.src);
    out.push({
      id: `imp${idCounter++}`,
      handle: f.handle || '',
      title: f.title || '',
      bodyHtml: f.bodyHtml || '',
      vendor: f.vendor || '',
      productCategory: f.productCategory || '',
      type: f.type || 'Motorcycle Parts',
      tags: f.tags || '',
      published: yesNo(f.published) || f.status === 'active',
      option1Name: f.option1Name || 'Brand',
      option1Value: f.option1Value || '',
      option2Name: f.option2Name || 'Model',
      option2Value: f.option2Value || '',
      option3Name: f.option3Name || 'Year',
      option3Value:
        entry.yearValues.length > 0
          ? collapseYears(entry.yearValues)
          : f.option3Value || '',
      sku: (f.sku || '').replace(/-\d{4}$/, ''),
      detailsText: '',
      installationText: '',
      grams: f.grams || '',
      inventoryTracker: f.inventoryTracker || 'shopify',
      inventoryQty: f.inventoryQty || '',
      inventoryPolicy: f.inventoryPolicy || 'deny',
      fulfillmentService: f.ulfillmentService || 'manual',
      price: f.price || '',
      compareAtPrice: f.compareAtPrice || '',
      requiresShipping: !f.requiresShipping || yesNo(f.requiresShipping),
      taxable: !f.taxable || yesNo(f.taxable),
      barcode: f.barcode || '',
      images: imgs,
      imageAlt: entry.images[0]?.alt || '',
      seoTitle: f.seoTitle || '',
      seoDescription: f.seoDescription || '',
      weightUnit: f.weightUnit || 'kg',
      status: f.status === 'active' ? 'active' : 'draft',
      cost: f.cost || '',
    });
  }

  let warning = '';
  if (!rows.length) warning = '没有数据行（表头之后为空）';
  else if (!out.length) warning = '解析成功但没找到任何 Handle 非空的行';
  return { rows: out, imageBaseUrl: '', warning };
}

export function downloadJson(content: ProductsContent, filename = 'products-backup.json') {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
