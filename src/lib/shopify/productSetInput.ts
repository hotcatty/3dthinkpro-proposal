import { exportPdpDescriptionHtml } from '@/lib/cms/pdpDescription';
import type { ProductRow } from '@/lib/cms/types';
import { shopifyYearValues } from '@/lib/cms/productCsv';

export type ProductSetFile = {
  originalSource: string;
  alt?: string;
  filename?: string;
};

export function buildProductSetInput(
  row: ProductRow,
  existingId?: string,
  files?: ProductSetFile[],
  locationId?: string,
): Record<string, unknown> {
  const title = row.title.trim() || row.handle.trim() || 'Untitled';
  const handle = row.handle.trim();
  const descriptionHtml =
    exportPdpDescriptionHtml(row.detailsText, row.installationText) || row.bodyHtml;
  const tags = row.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const input: Record<string, unknown> = {
    title,
    descriptionHtml,
    vendor: row.vendor.trim() || undefined,
    productType: row.type.trim() || undefined,
    tags,
    status: row.status === 'active' ? 'ACTIVE' : 'DRAFT',
    ...variantFields(row, locationId),
  };

  if (existingId) input.id = existingId;
  if (handle) input.handle = handle;
  if (row.seoTitle.trim() || row.seoDescription.trim()) {
    input.seo = {
      title: row.seoTitle.trim() || undefined,
      description: row.seoDescription.trim() || undefined,
    };
  }
  if (files?.length) {
    input.files = files.map((file) => ({
      originalSource: file.originalSource,
      alt: file.alt || row.imageAlt.trim() || title,
      filename: file.filename,
      contentType: 'IMAGE',
      duplicateResolutionMode: 'REPLACE',
    }));
  }

  return input;
}

function variantFields(row: ProductRow, locationId?: string): Record<string, unknown> {
  const option1Name = row.option1Name.trim() || 'Brand';
  const option2Name = row.option2Name.trim() || 'Model';
  const option3Name = row.option3Name.trim() || 'Year';
  const option1Value = row.option1Value.trim();
  const option2Value = row.option2Value.trim();
  const years = shopifyYearValues(row).map((year) => year.trim()).filter(Boolean);
  const hasFitment = Boolean(option1Value || option2Value || years.length);

  const qty = Number(row.inventoryQty);
  const variantCore: Record<string, unknown> = {
    sku: row.sku.trim() || undefined,
    price: row.price.trim() || '0',
    compareAtPrice: row.compareAtPrice.trim() || undefined,
    barcode: row.barcode.trim() || undefined,
    inventoryPolicy: row.inventoryPolicy.trim().toLowerCase() === 'continue' ? 'CONTINUE' : 'DENY',
    taxable: row.taxable,
  };
  if (locationId && Number.isFinite(qty) && row.inventoryQty.trim() !== '') {
    variantCore.inventoryItem = { tracked: row.inventoryTracker.trim() !== '' };
    variantCore.inventoryQuantities = [{ locationId, name: 'available', quantity: Math.max(0, Math.round(qty)) }];
  }

  if (!hasFitment) {
    return {
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      variants: [{ ...variantCore, optionValues: [{ optionName: 'Title', name: 'Default Title' }] }],
    };
  }

  const brand = option1Value || 'Default';
  const model = option2Value || 'Default';
  const uniqueYears = [...new Set(years.length ? years : ['Default Title'])];

  return {
    productOptions: [
      { name: option1Name, values: [{ name: brand }] },
      { name: option2Name, values: [{ name: model }] },
      { name: option3Name, values: uniqueYears.map((name) => ({ name })) },
    ],
    variants: uniqueYears.map((year) => ({
      ...variantCore,
      optionValues: [
        { optionName: option1Name, name: brand },
        { optionName: option2Name, name: model },
        { optionName: option3Name, name: year },
      ],
    })),
  };
}
