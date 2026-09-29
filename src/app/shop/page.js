import { prisma } from '@/lib/db';
import { shopifyEnabled } from '@/lib/shopify';
import { getCollections } from '@/lib/shopifyQueries';
import ShopBrowser from '@/components/ShopBrowser';
import AnimateIn from '@/components/AnimateIn';

export const dynamic = 'force-dynamic';

async function getCategories() {
  if (shopifyEnabled) {
    try {
      return await getCollections();
    } catch (err) {
      console.error('Shopify collections fetch failed, falling back to local catalog:', err.message);
    }
  }
  return prisma.category.findMany();
}

export default async function ShopPage() {
  const categories = await getCategories();

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique">
        <AnimateIn className="mb-10 text-center">
          <p className="eyebrow mb-2">Full Collection</p>
          <h1 className="heading-serif text-4xl italic">Shop All</h1>
        </AnimateIn>
        <ShopBrowser categories={categories} />
      </div>
    </main>
  );
}
