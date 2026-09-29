import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { shopifyEnabled } from '@/lib/shopify';
import { getProductByHandle, getCollectionByHandle } from '@/lib/shopifyQueries';
import ProductGallery from '@/components/ProductGallery';
import AddToCartPanel from '@/components/AddToCartPanel';
import ProductCard from '@/components/ProductCard';
import AnimateIn from '@/components/AnimateIn';
import Product3DSection from '@/components/Product3DSection';

export const dynamic = 'force-dynamic';

async function getProductData(slug) {
  if (shopifyEnabled) {
    try {
      const product = await getProductByHandle(slug);
      if (product) {
        let recommendations = [];
        if (product.category?.slug) {
          const collection = await getCollectionByHandle(product.category.slug, { first: 5 });
          recommendations = (collection?.products || []).filter((p) => p.id !== product.id).slice(0, 4);
        }
        return { product, recommendations };
      }
    } catch (err) {
      console.error('Shopify product fetch failed, falling back to local catalog:', err.message);
    }
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) return { product: null, recommendations: [] };

  const recommendations = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
  });
  return { product, recommendations };
}

export default async function ProductPage({ params }) {
  const { product, recommendations } = await getProductData(params.slug);
  if (!product) notFound();

  const images = JSON.parse(product.images);

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <AnimateIn>
            <ProductGallery images={images} name={product.name} />
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <AddToCartPanel product={product} />
          </AnimateIn>
        </div>

        {product.featured && (
          <div className="mt-20">
            <Product3DSection images={images} name={product.name} />
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="mt-24">
            <AnimateIn className="mb-8">
              <p className="eyebrow mb-2">Complete the Look</p>
              <h2 className="heading-serif text-2xl sm:text-3xl italic">You May Also Like</h2>
            </AnimateIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {recommendations.map((p, i) => (
                <AnimateIn key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </AnimateIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
