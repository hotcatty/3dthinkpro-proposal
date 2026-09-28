const IMAGE = `
  fragment ImageFields on Image {
    url(transform: { maxWidth: 1200, preferredContentType: WEBP })
    altText
    width
    height
  }
`;

const MONEY = `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const VARIANT = `
  fragment VariantFields on ProductVariant {
    id
    title
    sku
    availableForSale
    quantityAvailable
    selectedOptions { name value }
    price { ...MoneyFields }
    compareAtPrice { ...MoneyFields }
    image { ...ImageFields }
  }
`;

const PRODUCT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    metafields(identifiers: [
      { namespace: "custom", key: "details" }
      { namespace: "custom", key: "installation" }
    ]) {
      namespace
      key
      type
      value
    }
    availableForSale
    options { id name values }
    featuredImage { ...ImageFields }
    images(first: 12) {
      nodes { ...ImageFields }
    }
    variants(first: 50) {
      nodes { ...VariantFields }
    }
    priceRange {
      minVariantPrice { ...MoneyFields }
      maxVariantPrice { ...MoneyFields }
    }
    compareAtPriceRange {
      minVariantPrice { ...MoneyFields }
      maxVariantPrice { ...MoneyFields }
    }
  }
`;

const PRODUCT_CARD = `
  fragment ProductCardFields on Product {
    id
    handle
    title
    availableForSale
    options { id name values }
    featuredImage { ...ImageFields }
    images(first: 2) {
      nodes { ...ImageFields }
    }
    variants(first: 1) {
      nodes { sku }
    }
    priceRange {
      minVariantPrice { ...MoneyFields }
    }
    compareAtPriceRange {
      minVariantPrice { ...MoneyFields }
    }
  }
`;

const CART = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { ...MoneyFields }
      totalAmount { ...MoneyFields }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost { totalAmount { ...MoneyFields } }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions { name value }
            price { ...MoneyFields }
            product {
              handle
              title
              featuredImage { ...ImageFields }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${IMAGE}
  ${MONEY}
  ${PRODUCT_CARD}
  query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCardFields }
    }
  }
`;

/** Homepage Iconic Products rail. Sort follows Shopify Admin collection order. */
export const COLLECTION_PRODUCTS_QUERY = `
  ${IMAGE}
  ${MONEY}
  ${PRODUCT_CARD}
  query CollectionProducts($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys) {
    collection(handle: $handle) {
      handle
      title
      products(first: $first, sortKey: $sortKey) {
        nodes { ...ProductCardFields }
      }
    }
  }
`;

export const PRODUCT_QUERY = `
  ${IMAGE}
  ${MONEY}
  ${VARIANT}
  ${PRODUCT}
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

/** PDP You May Also Like. RELATED = Search & Discovery / Shopify smart recs. */
export const PRODUCT_RECOMMENDATIONS_QUERY = `
  ${IMAGE}
  ${MONEY}
  ${PRODUCT_CARD}
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductCardFields
    }
  }
`;

export const PRODUCT_HANDLES_QUERY = `
  query ProductHandles($first: Int!) {
    products(first: $first) {
      nodes { handle }
    }
  }
`;

export const CART_QUERY = `
  ${IMAGE}
  ${MONEY}
  ${CART}
  query Cart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
`;

export const CART_CREATE = `
  ${IMAGE}
  ${MONEY}
  ${CART}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD = `
  ${IMAGE}
  ${MONEY}
  ${CART}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE = `
  ${IMAGE}
  ${MONEY}
  ${CART}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE = `
  ${IMAGE}
  ${MONEY}
  ${CART}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;
