'use client';

import { motion } from 'framer-motion';

export default function HeroTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center select-none"
    >
      <h1
        className="text-5xl md:text-7xl leading-[1.05] tracking-[-0.04em]"
        style={{ fontWeight: 700, color: '#fafaf9' }}
      >
        CodeMap
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 text-base md:text-lg tracking-[-0.01em]"
        style={{ color: '#a8a29e', fontWeight: 400 }}
      >
        Understand any codebase in seconds
      </motion.p>
    </motion.div>
  );
}
