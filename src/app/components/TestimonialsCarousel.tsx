'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function TestimonialsCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') showPrevious();
    if (event.key === 'ArrowRight') showNext();
  };
  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 45) return;
    if (distance < 0) showNext();
    else showPrevious();
  };

  return (
    <section
      aria-label="Student testimonials"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
      className="relative mx-auto max-w-5xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div
        className="testimonial-screenshot-frame relative mx-auto flex h-[min(70vh,48rem)] min-h-[24rem] w-full max-w-[30rem] items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-5"
        role="group"
        aria-roledescription="slide"
        aria-label={`${activeIndex + 1} of ${images.length}`}
      >
        <Image
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`Student feedback screenshot ${activeIndex + 1}`}
          fill
          sizes="(max-width: 640px) 90vw, 480px"
          priority={activeIndex === 0}
          className="testimonial-screenshot object-contain p-3 sm:p-5"
        />
      </div>

      <button
        type="button"
        onClick={showPrevious}
        aria-label="Show previous student feedback"
        className="absolute left-0 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg ring-1 ring-gray-200 transition hover:scale-105 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 sm:left-3 sm:translate-x-0"
      >
        <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={showNext}
        aria-label="Show next student feedback"
        className="absolute right-0 top-1/2 flex h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg ring-1 ring-gray-200 transition hover:scale-105 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 sm:right-3 sm:translate-x-0"
      >
        <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="mt-5 flex items-center justify-center gap-4">
        <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">
          {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" aria-hidden="true">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{ width: `${((activeIndex + 1) / images.length) * 100}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        Use the arrows or swipe to browse
      </p>
    </section>
  );
}
