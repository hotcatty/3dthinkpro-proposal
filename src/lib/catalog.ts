export const SHOP_BRANDS = [
  { name: 'Honda', src: '/brands/honda.svg' },
  { name: 'Yamaha', src: '/brands/yamaha.svg' },
  { name: 'Kawasaki', src: '/brands/kawasaki.svg' },
  { name: 'Suzuki', src: '/brands/suzuki.svg' },
  { name: 'BMW', src: '/brands/bmw.svg' },
] as const;

export type ShopBrandName = (typeof SHOP_BRANDS)[number]['name'];

const TITLE_BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Harley', 'Ducati'] as const;

export type ProductMeta = {
  brand: string;
  brandLabel: string;
  model: string;
  year: string;
};

export function parseProductMeta(title: string): ProductMeta {
  const upper = title.toUpperCase();
  const brand = TITLE_BRANDS.find((item) => upper.includes(item.toUpperCase()))
    ?? (upper.includes('SPORTSTER') ? 'Harley' : '');

  const yearMatch = title.match(/\b((?:19|20)\d{2})\b/);
  const year = yearMatch?.[1] ?? '';

  let model = brand ? title.replace(new RegExp(brand, 'i'), '') : title;
  model = model
    .replace(/HIVE®?|Solo Seat|Seat|—|–|-/gi, ' ')
    .replace(/[（(]test[）)]/gi, '')
    .replace(/\b((?:19|20)\d{2})\+?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    brand,
    brandLabel: brand ? brand.toUpperCase() : '3DTHINKPRO',
    model: model || title,
    year,
  };
}

export function splitProductTitle(title: string) {
  const meta = parseProductMeta(title);
  return { brand: meta.brandLabel, model: meta.model };
}

export function resolveShopBrand(value?: string): ShopBrandName | '' {
  if (!value) return '';
  return SHOP_BRANDS.find((item) => item.name.toLowerCase() === value.toLowerCase())?.name ?? '';
}
