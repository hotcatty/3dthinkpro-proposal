import BikeCard from '@/components/commerce/BikeCard';
import ProductCard from '@/components/commerce/ProductCard';
import ProductRail from '@/components/commerce/ProductRail';
import FeatureBanner from '@/sections/home/FeatureBanner';
import Hero from '@/sections/home/Hero';
import { getHomeContent } from '@/lib/cms/store';
import {
  ICONIC_PRODUCTS_COLLECTION_ALIASES,
  ICONIC_PRODUCTS_COLLECTION_HANDLE,
  getCollectionProducts,
} from '@/lib/shopify/products';
import type { ProductCardData } from '@/lib/shopify/types';

export const dynamic = 'force-dynamic';

const ICONIC_COLLECTION_HANDLES = [
  ICONIC_PRODUCTS_COLLECTION_HANDLE,
  ...ICONIC_PRODUCTS_COLLECTION_ALIASES,
] as const;

export default async function HomePage() {
  const home = await getHomeContent();
  let products: ProductCardData[] = [];
  try {
    // Curated in Shopify Admin → Products → Collections → iconic-products.
    // COLLECTION_DEFAULT = merchant drag order. Empty/missing collection stays empty.
    // No catalog fallback — if Headless cannot see the collection, the rail stays empty.
    for (const handle of ICONIC_COLLECTION_HANDLES) {
      products = await getCollectionProducts({
        handle,
        first: 24,
        sortKey: 'COLLECTION_DEFAULT',
        revalidate: 0,
      });
      if (products.length) break;
    }
  } catch {
    products = [];
  }

  return (
    <>
      <Hero hero={home.hero} />

      <ProductRail title="Iconic Products">
        {products.length === 0 ? (
          <p className="empty-note">
            Products appear here once they are added to the Iconic Products collection
            ({ICONIC_PRODUCTS_COLLECTION_HANDLE}) and published to this storefront.
          </p>
        ) : (
          products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} />
          ))
        )}
      </ProductRail>

      {home.campaigns.map((campaign) => (
        <FeatureBanner key={campaign.id} campaign={campaign} />
      ))}

      {home.social.cards.length > 0 && (
        <ProductRail title={home.social.title}>
          {home.social.cards.map((card) => (
            <BikeCard
              key={card.id}
              href={card.href || '/shop'}
            media={card.media}
            brand={card.brand}
              model={card.model}
            />
          ))}
        </ProductRail>
      )}
    </>
  );
}
