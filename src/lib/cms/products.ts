import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { exportPdpDescriptionHtml } from './pdpDescription';
import type { ProductRow, ProductsContent } from './types';
import { emptyRow } from './productRow';

const contentPath = path.join(process.cwd(), 'content/products.json');

type Seed = [handle: string, brand: string, model: string, year: string, sku: string, price: string];

const SEED: Seed[] = [
  ['honda-cbr650r', 'HONDA', 'CBR650R', '2024-present', '3dthinkpro-H001', '49800'],
  ['yamaha-mt-09', 'YAMAHA', 'MT-09', '2024-present', '3dthinkpro-Y001', '54800'],
  ['yamaha-yzf-r3', 'YAMAHA', 'YZF-R3', '2026-present', '3dthinkpro-Y002', '39800'],
  ['yamaha-mt-07', 'YAMAHA', 'MT-07', '2025-present', '3dthinkpro-Y003', '45800'],
  ['kawasaki-ninja500', 'Kawasaki', 'Ninja500', '2024-present', '3dthinkpro-K001', '42800'],
  ['kawasaki-z900', 'Kawasaki', 'Z900', '2025-present', '3dthinkpro-K002', '59800'],
  ['suzuki-gsx1300r', 'SUZUKI', 'GSX1300R', '2025-present', '3dthinkpro-S001', '64800'],
  ['bmw-gs1300', 'BMW', 'GS1300', 'All years', '3dthinkpro-B001', '69800'],
  ['honda-cbr1000-rr', 'HONDA', 'CBR1000-RR', '2024-present', '3dthinkpro-H002', '67800'],
];

export function seedRow(seed: Seed, index: number): ProductRow {
  const [handle, brand, model, year, sku, price] = seed;
  const title = `${brand} ${model}`;
  const base = emptyRow(`seed-${index + 1}`);
  return {
    ...base,
    handle,
    title,
    bodyHtml: `<p>Designed for <strong>${brand} ${model}</strong> (${year}). Model-specific fitment, direct replacement.</p>`,
    vendor: brand,
    tags: `${brand}, ${model}, Fitment`,
    option1Value: brand,
    option2Value: model,
    option3Value: year,
    sku,
    price,
    compareAtPrice: String(Number(price) + 8000),
    imageAlt: `${title} fitment`,
    seoTitle: `${title} - Fitment ${year}`.slice(0, 70),
    seoDescription: `Fits ${brand} ${model} (${year}).`.slice(0, 320),
  };
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeProducts(raw: Partial<ProductsContent> | null | undefined): ProductsContent {
  const rows = Array.isArray(raw?.rows)
    ? raw.rows.map((item, index): ProductRow => {
        const base = emptyRow(str(item?.id) || `row-${index + 1}`);
        const detailsText = str(item?.detailsText);
        const installationText = str(item?.installationText);
        const generated = exportPdpDescriptionHtml(detailsText, installationText);
        return {
          ...base,
          ...item,
          id: str(item?.id) || base.id,
          detailsText,
          installationText,
          bodyHtml: generated || str(item?.bodyHtml, base.bodyHtml),
          images: Array.isArray(item?.images) ? item.images.filter((x): x is string => typeof x === 'string') : [],
          published: bool(item?.published, false),
          requiresShipping: bool(item?.requiresShipping, true),
          taxable: bool(item?.taxable, true),
          status: item?.status === 'active' ? 'active' : 'draft',
        };
      })
    : [];

  return {
    imageBaseUrl: str(raw?.imageBaseUrl),
    rows,
  };
}

export function seededProducts(): ProductsContent {
  return {
    imageBaseUrl: '',
    rows: SEED.map(seedRow),
  };
}

export async function getProducts(): Promise<ProductsContent> {
  try {
    const raw = await readFile(contentPath, 'utf8');
    const parsed = JSON.parse(raw) as ProductsContent;
    if (Array.isArray(parsed?.rows) && parsed.rows.length > 0) return normalizeProducts(parsed);
  } catch {
    // 文件不存在或解析失败，回落到种子数据
  }
  return seededProducts();
}

export async function saveProducts(input: ProductsContent): Promise<ProductsContent> {
  const next = normalizeProducts(input);
  await mkdir(path.dirname(contentPath), { recursive: true });
  await writeFile(contentPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
