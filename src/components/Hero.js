'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const textVariants = {
  hidden: { opacity: 0, y: 26 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: 0.5 + i * 0.16, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const [useVideo, setUseVideo] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setHydrated(true);
    const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowData =
      connection?.saveData ||
      ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);

    // Only use the autoplay video on larger screens with decent connections.
    setUseVideo(!isSmallScreen && !isSlowData);
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Poster frame — always present as base layer to avoid flash / used as mobile fallback */}
      <img
        src="/media/boutique-hero-poster.jpg"
        alt="MissKare boutique — mannequins in lace and satin on candlelit shelving"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {hydrated && useVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/boutique-hero-poster.jpg"
        >
          <source src="/media/boutique-hero.mp4" type="video/mp4" media="(min-width: 1024px)" />
          <source src="/media/boutique-hero-mobile.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark-to-transparent gradient, bottom-heavier, for legibility */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-candlelight" />

      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 sm:pb-28 px-6 text-center">
        <motion.p
          custom={0}
          initial="hidden"
          animate="show"
          variants={textVariants}
          className="eyebrow text-goldlight mb-4"
        >
          The New Boutique Edit
        </motion.p>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={textVariants}
          className="heading-serif italic text-cream text-4xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-4xl"
        >
          Worn like a secret,
          <br />
          made like a heirloom.
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={textVariants}
          className="text-cream/70 mt-5 max-w-md text-sm sm:text-base"
        >
          Candlelit lace and second-skin satin — MissKare pieces are cut for confidence, stitched by hand.
        </motion.p>

        <motion.div custom={3} initial="hidden" animate="show" variants={textVariants} className="mt-9">
          <Link href="/shop" className="btn-gold">
            Shop the Edit
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
