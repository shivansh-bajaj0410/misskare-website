import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { shopifyEnabled } from '@/lib/shopify';
import { getCollectionByHandle } from '@/lib/shopifyQueries';
import ShopBrowser from '@/components/ShopBrowser';
import AnimateIn from '@/components/AnimateIn';

export const dynamic = 'force-dynamic';

async function getCategory(slug) {
  if (shopifyEnabled) {
    try {
      const collection = await getCollectionByHandle(slug, { first: 1 });
      if (collection) return { name: collection.name, description: collection.description, slug: collection.slug };
    } catch (err) {
      console.error('Shopify collection fetch failed, falling back to local catalog:', err.message);
    }
  }
  return prisma.category.findUnique({ where: { slug } });
}

export default async function CategoryPage({ params }) {
  const category = await getCategory(params.category);
  if (!category) notFound();

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique">
        <AnimateIn className="mb-10 text-center">
          <p className="eyebrow mb-2">Category</p>
          <h1 className="heading-serif text-4xl italic">{category.name}</h1>
          <p className="text-ink/60 mt-3 max-w-md mx-auto">{category.description}</p>
        </AnimateIn>
        <ShopBrowser category={category.slug} />
      </div>
    </main>
  );
}
