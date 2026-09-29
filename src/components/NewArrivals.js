import AnimateIn from './AnimateIn';
import ProductCard from './ProductCard';

export default function NewArrivals({ products }) {
  if (!products?.length) return null;
  return (
    <section className="container-boutique py-20 sm:py-28">
      <AnimateIn className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Just In</p>
          <h2 className="heading-serif text-3xl sm:text-4xl italic">New Arrivals</h2>
        </div>
      </AnimateIn>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p, i) => (
          <AnimateIn key={p.id} delay={i * 0.06}>
            <ProductCard product={p} priority={i < 2} />
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
