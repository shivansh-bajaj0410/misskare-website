import { prisma } from '@/lib/db';
import { shopifyEnabled } from '@/lib/shopify';
import { getAllProducts, getCollections } from '@/lib/shopifyQueries';
import Hero from '@/components/Hero';
import NewArrivals from '@/components/NewArrivals';
import CategoryGrid from '@/components/CategoryGrid';
import BrandStory from '@/components/BrandStory';
import UGCGallery from '@/components/UGCGallery';
import Newsletter from '@/components/Newsletter';
import AnimateIn from '@/components/AnimateIn';
import Product3DSection from '@/components/Product3DSection';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  if (shopifyEnabled) {
    try {
      const [allProducts, categories] = await Promise.all([
        getAllProducts({ first: 40, sortKey: 'CREATED_AT', reverse: true }),
        getCollections(),
      ]);
      const newArrivals = allProducts.filter((p) => p.isNew).slice(0, 8);
      const heroProduct = allProducts.find((p) => p.featured) || allProducts[0] || null;
      return { newArrivals, categories, heroProduct };
    } catch (err) {
      console.error('Shopify home data fetch failed, falling back to local catalog:', err.message);
    }
  }

  const [newArrivals, categories, heroProduct] = await Promise.all([
    prisma.product.findMany({ where: { isNew: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany(),
    prisma.product.findFirst({ where: { featured: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  return { newArrivals, categories, heroProduct };
}

export default async function HomePage() {
  const { newArrivals, categories, heroProduct } = await getHomeData();

  return (
    <main>
      <Hero />
      <NewArrivals products={newArrivals} />
      <CategoryGrid categories={categories} />

      {heroProduct && (
        <section className="bg-ink py-20 sm:py-28">
          <div className="container-boutique grid lg:grid-cols-2 gap-10 items-center">
            <AnimateIn>
              <Product3DSection images={JSON.parse(heroProduct.images)} name={heroProduct.name} />
            </AnimateIn>
            <AnimateIn delay={0.15} className="text-cream">
              <p className="eyebrow text-goldlight mb-3">The Signature Piece</p>
              <h2 className="heading-serif italic text-3xl sm:text-4xl mb-4">{heroProduct.name}</h2>
              <p className="text-cream/60 leading-relaxed mb-6 max-w-md">{heroProduct.description}</p>
              <p className="text-2xl mb-6">{formatPrice(heroProduct.price)}</p>
              <Link href={`/product/${heroProduct.slug}`} className="btn-gold">
                View in 3D & Shop
              </Link>
            </AnimateIn>
          </div>
        </section>
      )}

      <BrandStory />
      <UGCGallery />
      <Newsletter />
    </main>
  );
}
