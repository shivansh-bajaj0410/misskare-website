'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div>
      <div className="flex gap-4">
        <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-colors ${
                active === i ? 'border-camel' : 'border-transparent'
              }`}
            >
              <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-black/5 cursor-zoom-in"
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={images[active]}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={
              zooming
                ? { transform: 'scale(1.9)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : undefined
            }
          />
        </div>
      </div>

      <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActive(i)}
            className={`relative w-16 aspect-[4/5] rounded-lg overflow-hidden border-2 shrink-0 ${
              active === i ? 'border-camel' : 'border-transparent'
            }`}
          >
            <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
