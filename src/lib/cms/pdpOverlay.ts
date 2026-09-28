import type { ProductRow } from './types';
import type { Product } from '@/lib/shopify/types';
import { parseProductMeta } from '@/lib/catalog';

export function fitmentFromCms(product: Product, row?: ProductRow): string {
  const meta = parseProductMeta(row?.title || product.title);
  const brand = (row?.option1Value || meta.brandLabel || '').trim();
  const model = (row?.option2Value || meta.model || product.title).replace(/-/g, ' ').trim();
  const year = (row?.option3Value || '')
    .replace(/present/gi, 'Present')
    .replace(/\s+to\s+/gi, '-')
    .trim();
  return ['Fits', brand, model, year].filter(Boolean).join(' ');
}
