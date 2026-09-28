import { getProducts } from '@/lib/cms/products';
import ProductTable from './ProductTable';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const initial = await getProducts();
  return <ProductTable initial={initial} />;
}
