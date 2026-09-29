'use client';

import dynamic from 'next/dynamic';
import AnimateIn from './AnimateIn';
import ErrorBoundary from './ErrorBoundary';

const ProductShowcase3D = dynamic(() => import('./ProductShowcase3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] sm:h-[520px] rounded-2xl bg-charcoal animate-pulse flex items-center justify-center text-cream/40 text-sm">
      Loading 3D view…
    </div>
  ),
});

function Fallback({ images, name }) {
  return (
    <div className="w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-charcoal relative">
      <img src={images[0]} alt={name} className="w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 flex items-end justify-center pb-6">
        <p className="text-cream/60 text-xs uppercase tracking-widest2">3D view unavailable — showing photo</p>
      </div>
    </div>
  );
}

export default function Product3DSection({ images, name }) {
  return (
    <AnimateIn>
      <p className="eyebrow mb-2">Interactive View</p>
      <h2 className="heading-serif text-2xl sm:text-3xl italic mb-6">Rotate & Explore</h2>
      <ErrorBoundary fallback={<Fallback images={images} name={name} />}>
        <ProductShowcase3D images={images} name={name} />
      </ErrorBoundary>
    </AnimateIn>
  );
}
