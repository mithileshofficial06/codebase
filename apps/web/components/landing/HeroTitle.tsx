'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HeroTitle() {
  const [shimmerDone, setShimmerDone] = useState(false);

  useEffect(() => {
    // Shimmer runs once then stops
    const timer = setTimeout(() => setShimmerDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="text-center select-none"
    >
      {/* Title with one-shot shimmer */}
      <h1 className="relative inline-block">
        <span
          className="text-6xl md:text-8xl font-black leading-none tracking-tighter"
          style={{ 
            fontFamily: 'var(--font-sans)',
            backgroundImage: 'linear-gradient(to right, #a855f7, #3b82f6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          CodeMap
        </span>

        {/* Shimmer overlay — runs once, uses aria-hidden so text isn't read twice */}
        {!shimmerDone && (
          <span
            aria-hidden="true"
            className="absolute inset-0 text-6xl md:text-8xl font-black leading-none tracking-tighter pointer-events-none"
            style={{
              fontFamily: 'var(--font-sans)',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer-sweep 1.6s ease-in-out forwards',
            }}
          >
            CodeMap
          </span>
        )}
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className="mt-6 text-base md:text-lg font-light tracking-wide"
        style={{ color: '#888888' }}
      >
        Understand any codebase in seconds
      </motion.p>
    </motion.div>
  );
}
