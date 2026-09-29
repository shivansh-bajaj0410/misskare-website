import Image from 'next/image';
import AnimateIn from './AnimateIn';

const TILES = Array.from({ length: 6 }, (_, i) => `/ugc/ugc-${i + 1}.jpg`);

export default function UGCGallery() {
  return (
    <section className="container-boutique py-20 sm:py-28">
      <AnimateIn className="text-center mb-10">
        <p className="eyebrow mb-2">@misskare</p>
        <h2 className="heading-serif text-3xl sm:text-4xl italic">Worn By You</h2>
      </AnimateIn>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {TILES.map((src, i) => (
          <AnimateIn key={src} delay={i * 0.05}>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src={src}
                alt="Customer styling MissKare"
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="#F6EFE6"
                >
                  <path d="M12 20s-7-4.35-9.5-8.8C.8 7.8 2.2 4 6 4c2 0 3.5 1.2 4 2.4C10.5 5.2 12 4 14 4c3.8 0 5.2 3.8 3.5 7.2C19 15.65 12 20 12 20z" />
                </svg>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
