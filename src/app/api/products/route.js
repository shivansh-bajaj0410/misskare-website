import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { shopifyEnabled } from '@/lib/shopify';
import { getAllProducts, getCollectionByHandle } from '@/lib/shopifyQueries';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const ids = searchParams.get('ids')?.split(',').filter(Boolean);
  const search = searchParams.get('search') || searchParams.get('q');
  const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'featured';
  const limit = parseInt(searchParams.get('limit') || '60', 10);

  let products = null;

  if (shopifyEnabled) {
    try {
      if (category) {
        const collection = await getCollectionByHandle(category, { first: limit });
        products = collection?.products || [];
      } else if (ids?.length) {
        const all = await getAllProducts({ first: 250 });
        products = all.filter((p) => ids.includes(p.id));
      } else {
        let sortKey;
        let reverse = false;
        if (sort === 'newest') {
          sortKey = 'CREATED_AT';
          reverse = true;
        } else if (sort === 'price-asc') {
          sortKey = 'PRICE';
        } else if (sort === 'price-desc') {
          sortKey = 'PRICE';
          reverse = true;
        }
        products = await getAllProducts({
          first: limit,
          query: search || undefined,
          sortKey,
          reverse,
        });
      }
    } catch (err) {
      console.error('Shopify product fetch failed, falling back to local catalog:', err.message);
      products = null;
    }
  }

  if (!products) {
    // Local SQLite fallback — used when Shopify isn't configured, or if the
    // Shopify request above failed, so the storefront stays browsable.
    const where = {};
    if (ids?.length) where.id = { in: ids };
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice, 10);
      if (maxPrice) where.price.lte = parseInt(maxPrice, 10);
    }
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    products = prisma.product.findMany({ where, orderBy, take: limit, include: { category: true } });
  }

  if (colors.length) {
    products = products.filter((p) => {
      const pc = JSON.parse(p.colors);
      return colors.some((c) => pc.includes(c));
    });
  }
  if (sizes.length) {
    products = products.filter((p) => {
      const ps = JSON.parse(p.sizes);
      return sizes.some((s) => ps.includes(s));
    });
  }
  if (minPrice) products = products.filter((p) => p.price >= parseInt(minPrice, 10));
  if (maxPrice) products = products.filter((p) => p.price <= parseInt(maxPrice, 10));
  if (sort === 'featured') {
    products = [...products].sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  if (sort === 'rating') {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  return NextResponse.json({ products });
}
