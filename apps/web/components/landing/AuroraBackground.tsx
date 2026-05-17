'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const mx = useSpring(rawX, { stiffness: 25, damping: 50, mass: 2 });
  const my = useSpring(rawY, { stiffness: 25, damping: 50, mass: 2 });

  const mxOffset = useTransform(mx, [0, 1], [-15, 15]);
  const myOffset = useTransform(my, [0, 1], [-15, 15]);
  const mxOffsetInv = useTransform(mx, [0, 1], [15, -15]);
  const myOffsetInv = useTransform(my, [0, 1], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#09090b', zIndex: 0 }}
    >
      {/* Blob 1 — very dark indigo, top-left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(30, 20, 60, 0.6) 0%, transparent 70%)',
          top: '-20%',
          left: '-10%',
          x: mxOffset,
          y: myOffset,
        }}
        animate={{ x: [0, 40, -20, 30, 0], y: [0, -30, 35, -15, 0] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Blob 2 — very dark blue, top-right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(15, 25, 50, 0.5) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          x: mxOffsetInv,
          y: myOffsetInv,
        }}
        animate={{ x: [0, -35, 20, -25, 0], y: [0, 30, -25, 18, 0] }}
        transition={{ duration: 26, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Blob 3 — very dark purple, bottom-left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 650,
          height: 650,
          background: 'radial-gradient(circle, rgba(25, 12, 35, 0.5) 0%, transparent 70%)',
          bottom: '-20%',
          left: '-5%',
          x: mxOffset,
          y: myOffsetInv,
        }}
        animate={{ x: [0, 30, -40, 22, 0], y: [0, -20, 30, -35, 0] }}
        transition={{ duration: 32, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Blob 4 — very dark teal, bottom-right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(5, 30, 28, 0.4) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          x: mxOffsetInv,
          y: myOffset,
        }}
        animate={{ x: [0, -28, 35, -20, 0], y: [0, 25, -30, 18, 0] }}
        transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />
    </div>
  );
}
