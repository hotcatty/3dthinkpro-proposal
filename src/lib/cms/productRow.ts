import type { ProductRow } from './types';

export function emptyRow(id: string): ProductRow {
  return {
    id,
    handle: '',
    title: '',
    bodyHtml: '',
    vendor: '',
    productCategory: '',
    type: 'Motorcycle Parts',
    tags: '',
    published: false,
    option1Name: 'Brand',
    option1Value: '',
    option2Name: 'Model',
    option2Value: '',
    option3Name: 'Year',
    option3Value: '',
    sku: '',
    detailsText: '',
    installationText: '',
    grams: '',
    inventoryTracker: 'shopify',
    inventoryQty: '',
    inventoryPolicy: 'deny',
    fulfillmentService: 'manual',
    price: '',
    compareAtPrice: '',
    requiresShipping: true,
    taxable: true,
    barcode: '',
    images: [],
    imageAlt: '',
    seoTitle: '',
    seoDescription: '',
    weightUnit: 'kg',
    status: 'draft',
    cost: '',
  };
}

export function makeId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
