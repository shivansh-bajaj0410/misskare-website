import Link from 'next/link';
import Image from 'next/image';
import AnimateIn from './AnimateIn';

export default function CategoryGrid({ categories }) {
  return (
    <section className="container-boutique py-20 sm:py-28">
      <AnimateIn className="text-center mb-12">
        <p className="eyebrow mb-2">Curated For You</p>
        <h2 className="heading-serif text-3xl sm:text-4xl italic">Shop by Category</h2>
      </AnimateIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat, i) => (
          <AnimateIn key={cat.id} delay={i * 0.08}>
            <Link href={`/shop/${cat.slug}`} className="group block relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src={cat.heroImage}
                alt={cat.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="heading-serif italic text-xl sm:text-2xl text-cream">{cat.name}</h3>
                <p className="text-cream/70 text-xs mt-1 hidden sm:block">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-goldlight text-xs uppercase tracking-widest2 mt-3 group-hover:gap-2 transition-all">
                  Shop Now →
                </span>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
