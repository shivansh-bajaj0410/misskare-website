import { shopifyFetch } from './shopify';

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  tags
  productType
  vendor
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  images(first: 6) { edges { node { url altText } } }
  options { name values }
  collections(first: 1) { edges { node { title handle } } }
  variants(first: 100) {
    edges {
      node {
        id
        availableForSale
        price { amount }
        compareAtPrice { amount }
        selectedOptions { name value }
      }
    }
  }
`;

// --- Normalizer -------------------------------------------------------
// Maps a Shopify Storefront product node onto the same shape our
// components (ProductCard, AddToCartPanel, ProductGallery, ShopBrowser...)
// were built around, so those components don't need to change.
export function normalizeShopifyProduct(node) {
  if (!node) return null;

  const images = node.images.edges.map((e) => e.node.url);
  const variantsRaw = node.variants.edges.map((e) => e.node);
  const colorOption = node.options?.find((o) => o.name.toLowerCase() === 'color');
  const sizeOption = node.options?.find((o) => o.name.toLowerCase() === 'size');
  const colors = colorOption?.values || [];
  const sizes = sizeOption?.values || node.options?.[0]?.values || [];

  const variants = variantsRaw.map((v) => ({
    id: v.id, // Shopify variant GID — used as the cart merchandiseId
    price: Math.round(parseFloat(v.price.amount) * 100),
    compareAt: v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount) * 100) : null,
    available: v.availableForSale,
    color: v.selectedOptions.find((o) => o.name.toLowerCase() === 'color')?.value || colors[0] || 'Default',
    size: v.selectedOptions.find((o) => o.name.toLowerCase() === 'size')?.value || sizes[0] || 'One Size',
  }));

  const minPrice = Math.round(parseFloat(node.priceRange.minVariantPrice.amount) * 100);
  const compareAtRaw = node.compareAtPriceRange?.minVariantPrice?.amount;
  const compareAtMin = compareAtRaw ? Math.round(parseFloat(compareAtRaw) * 100) : null;

  const tags = (node.tags || []).map((t) => t.toLowerCase());
  const collectionNode = node.collections?.edges?.[0]?.node;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    description: node.description,
    price: minPrice,
    compareAt: compareAtMin && compareAtMin > minPrice ? compareAtMin : null,
    images: JSON.stringify(images.length ? images : ['data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MDAiIGhlaWdodD0iMTEyNSIgdmlld0JveD0iMCAwIDkwMCAxMTI1Ij48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjExMjUiIGZpbGw9IiMyNDFFMUEiLz48dGV4dCB4PSI0NTAiIHk9IjU2MiIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjM2IiBmaWxsPSIjRjZFRkU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NaXNzS2FyZTwvdGV4dD48L3N2Zz4=']),    colors: JSON.stringify(colors.length ? colors : ['Default']),
    sizes: JSON.stringify(sizes.length ? sizes : ['One Size']),
    variants,
    material: node.productType || null,
    featured: tags.includes('featured'),
    isNew: tags.includes('new'),
    rating: 4.8,
    reviewCount: 0,
    category: collectionNode ? { name: collectionNode.title, slug: collectionNode.handle } : null,
  };
}

// --- Product / collection queries --------------------------------------

export async function getAllProducts({ first = 60, query, sortKey, reverse } = {}) {
  const data = await shopifyFetch(
    `query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges { node { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { first, query, sortKey, reverse }
  );
  return data.products.edges.map((e) => normalizeShopifyProduct(e.node));
}

export async function getProductByHandle(handle) {
  const data = await shopifyFetch(
    `query ProductByHandle($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FRAGMENT} }
    }`,
    { handle }
  );
  return normalizeShopifyProduct(data.product);
}

export async function getCollections() {
  const data = await shopifyFetch(
    `query Collections {
      collections(first: 20) {
        edges {
          node {
            id
            handle
            title
            description
            image { url altText }
          }
        }
      }
    }`
  );
  return data.collections.edges.map((e) => ({
    id: e.node.id,
    slug: e.node.handle,
    name: e.node.title,
    description: e.node.description,
    heroImage: e.node.image?.url || '/categories/default.jpg',
  }));
}

export async function getCollectionByHandle(handle, { first = 60 } = {}) {
  const data = await shopifyFetch(
    `query CollectionByHandle($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        products(first: $first) { edges { node { ${PRODUCT_FRAGMENT} } } }
      }
    }`,
    { handle, first }
  );
  if (!data.collection) return null;
  return {
    id: data.collection.id,
    slug: data.collection.handle,
    name: data.collection.title,
    description: data.collection.description,
    products: data.collection.products.edges.map((e) => normalizeShopifyProduct(e.node)),
  };
}

// --- Cart mutations ------------------------------------------------------
// Shopify's Cart API is used directly so checkout goes through Shopify's
// real hosted checkout (cart.checkoutUrl) instead of our own Stripe flow.

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url }
            price { amount }
            selectedOptions { name value }
            product { title handle }
          }
        }
      }
    }
  }
`;

function normalizeCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: Math.round(parseFloat(cart.cost.subtotalAmount.amount) * 100),
    total: Math.round(parseFloat(cart.cost.totalAmount.amount) * 100),
    currency: cart.cost.totalAmount.currencyCode,
    lines: cart.lines.edges.map((e) => {
      const line = e.node;
      const merch = line.merchandise;
      const color = merch.selectedOptions.find((o) => o.name.toLowerCase() === 'color')?.value || '';
      const size = merch.selectedOptions.find((o) => o.name.toLowerCase() === 'size')?.value || merch.title;
      return {
        lineId: line.id,
        variantId: merch.id,
        name: merch.product.title,
        handle: merch.product.handle,
        image: merch.image?.url,
        price: Math.round(parseFloat(merch.price.amount) * 100),
        quantity: line.quantity,
        color,
        size,
      };
    }),
  };
}

export async function createCart(lines = []) {
  const data = await shopifyFetch(
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }`,
    { lines }
  );
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
  }
  return normalizeCart(data.cartCreate.cart);
}

export async function getCart(cartId) {
  const data = await shopifyFetch(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ${CART_FRAGMENT} }
    }`,
    { cartId }
  );
  return normalizeCart(data.cart);
}

export async function addCartLines(cartId, lines) {
  const data = await shopifyFetch(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }`,
    { cartId, lines }
  );
  if (data.cartLinesAdd.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
  }
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(cartId, lines) {
  const data = await shopifyFetch(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }`,
    { cartId, lines }
  );
  if (data.cartLinesUpdate.userErrors?.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '));
  }
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId, lineIds) {
  const data = await shopifyFetch(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }`,
    { cartId, lineIds }
  );
  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
  }
  return normalizeCart(data.cartLinesRemove.cart);
}
