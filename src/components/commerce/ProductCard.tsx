import Link from 'next/link';
import { splitProductTitle } from '@/lib/catalog';
import { formatMoney } from '@/lib/shopify/products';
import type { ProductCardData } from '@/lib/shopify/types';

function CardImage({
  image,
  title,
  className,
  priority,
}: {
  image: NonNullable<ProductCardData['featuredImage']>;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`product-window-fill${className ? ` ${className}` : ''}`}>
      <img
        src={image.url}
        alt={image.altText || title}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </span>
  );
}

export default function ProductCard({
  product,
  layout = 'rail',
  priority = false,
}: {
  product: ProductCardData;
  layout?: 'rail' | 'shop';
  priority?: boolean;
}) {
  const { brand, model } = splitProductTitle(product.title);
  const shop = layout === 'shop';

  return (
    <Link href={`/products/${encodeURIComponent(product.handle)}`} className={`product-window${shop ? ' is-shop' : ''}`}>
      <div className="product-body">
        <div className="product-window-media">
          {product.featuredImage ? (
            <CardImage image={product.featuredImage} title={product.title} priority={priority} />
          ) : (
            <div className="media-empty">No image</div>
          )}
          {product.hoverImage && (
            <CardImage
              image={product.hoverImage}
              title={product.title}
              className="is-hover"
              priority={priority}
            />
          )}
          {shop && !product.availableForSale && (
            <span className="product-stock">OUT OF STOCK</span>
          )}
        </div>
        <p className="product-window-meta">
          <span className="product-window-brand">{brand}</span>
          {shop && <span className="product-window-rule" aria-hidden />}
          <span className="product-window-model">{model}</span>
        </p>
      </div>
      <div className="product-window-info">
        <p className="product-window-sku">{product.sku || product.handle}</p>
        <p className="product-window-price">{formatMoney(product.price)}</p>
      </div>
    </Link>
  );
}
