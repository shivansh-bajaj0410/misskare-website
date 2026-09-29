import Image from 'next/image';
import AnimateIn from './AnimateIn';

const STRIP = [
  { src: '/story/story-1.jpg', h: 'h-64 sm:h-80' },
  { src: '/story/story-2.jpg', h: 'h-52 sm:h-64 mt-8' },
  { src: '/story/story-3.jpg', h: 'h-64 sm:h-80' },
];

export default function BrandStory() {
  return (
    <section className="bg-charcoal text-cream py-20 sm:py-28">
      <div className="container-boutique grid lg:grid-cols-2 gap-12 items-center">
        <AnimateIn>
          <p className="eyebrow text-goldlight mb-4">Our Story</p>
          <h2 className="heading-serif italic text-3xl sm:text-4xl leading-tight mb-6">
            Small ateliers. Slow stitching.
            <br />A boutique built on candlelight.
          </h2>
          <p className="text-cream/60 leading-relaxed mb-4">
            MissKare began as a single boutique shelf — lace sourced from small French mills,
            fitted by hand, sold one considered piece at a time. Every collection is still cut in
            limited runs, finished by artisans who treat a bra like a piece of jewelry.
          </p>
          <p className="text-cream/60 leading-relaxed">
            No fast fashion. No filler fabrics. Just pieces worth keeping in the top drawer for
            years, not seasons.
          </p>
        </AnimateIn>

        <AnimateIn delay={0.15} className="grid grid-cols-3 gap-3 sm:gap-4">
          {STRIP.map((s) => (
            <div key={s.src} className={`relative rounded-xl overflow-hidden ${s.h}`}>
              <Image
                src={s.src}
                alt="MissKare boutique detail"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          ))}
        </AnimateIn>
      </div>
    </section>
  );
}
