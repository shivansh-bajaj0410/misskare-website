// Shopify Storefront API client. Safe to use from the browser — the
// Storefront API access token is a public, unauthenticated-access token
// designed for client apps (unlike the Admin API token, which must stay
// server-side only).

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2025-01';

export const shopifyEnabled = Boolean(DOMAIN && TOKEN && !TOKEN.startsWith('replace-with'));

const ENDPOINT = DOMAIN ? `https://${DOMAIN}/api/${API_VERSION}/graphql.json` : null;

export async function shopifyFetch(query, variables = {}) {
  if (!shopifyEnabled) {
    throw new Error(
      'Shopify is not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local.'
    );
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    // Product/collection data can be cached briefly; cart/checkout calls
    // should bypass this by calling shopifyFetch with { cache: 'no-store' }
    // handled by the caller if needed.
    next: { revalidate: 30 },
  });

  const json = await res.json();

  if (json.errors) {
    console.error('Shopify Storefront API error:', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0]?.message || 'Shopify Storefront API error');
  }

  return json.data;
}
