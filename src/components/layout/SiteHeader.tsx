import HeaderBar from './HeaderBar';
import { getCart } from '@/lib/shopify/cart';
import { getProducts } from '@/lib/shopify/products';

export default async function SiteHeader() {
  let count = 0;
  let catalog: { handle: string; title: string }[] = [];

  try {
    const cart = await getCart();
    count = cart?.totalQuantity ?? 0;
  } catch {
    count = 0;
  }

  try {
    const products = await getProducts({ first: 50, sortKey: 'UPDATED_AT', reverse: true, revalidate: 60 });
    catalog = products.map((product) => ({
      handle: product.handle,
      title: product.title,
    }));
  } catch {
    catalog = [];
  }

  return <HeaderBar count={count} catalog={catalog} />;
}
