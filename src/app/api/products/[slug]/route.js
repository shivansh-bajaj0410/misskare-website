import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { shopifyEnabled } from '@/lib/shopify';
import { getProductByHandle, getAllProducts } from '@/lib/shopifyQueries';

export async function GET(request, { params }) {
  if (shopifyEnabled) {
    try {
      const product = await getProductByHandle(params.slug);
      if (product) {
        const all = await getAllProducts({ first: 20, query: `product_type:${product.material || ''}` });
        const recommendations = all.filter((p) => p.id !== product.id).slice(0, 4);
        return NextResponse.json({ product, recommendations });
      }
    } catch (err) {
      console.error('Shopify product-by-handle fetch failed, falling back to local catalog:', err.message);
    }
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const recommendations = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
  });

  return NextResponse.json({ product, recommendations });
}
