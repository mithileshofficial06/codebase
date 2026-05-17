'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse-tracking motion values — normalised 0-1
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const mx = useSpring(rawX, { stiffness: 30, damping: 40, mass: 1.5 });
  const my = useSpring(rawY, { stiffness: 30, damping: 40, mass: 1.5 });

  // Amplify the parallax effect (15-20px shift)
  const mxOffset = useTransform(mx, [0, 1], [-20, 20]);
  const myOffset = useTransform(my, [0, 1], [-20, 20]);
  
  // Inverse offset for some blobs
  const mxOffsetInv = useTransform(mx, [0, 1], [20, -20]);
  const myOffsetInv = useTransform(my, [0, 1], [20, -20]);

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
      style={{ background: '#080808', zIndex: 0 }}
    >
      {/* Blob 1 — rich deep purple #2d1b69, top-left quadrant, slow drift */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, #2d1b69 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          opacity: 0.7,
          x: mxOffset,
          y: myOffset,
        }}
        animate={{
          x: [0, 60, -30, 45, 0],
          y: [0, -40, 50, -20, 0],
        }}
        transition={{
          duration: 25,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* Blob 2 — dark royal blue #1e3a8a, top-right quadrant, different speed */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, #1e3a8a 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          opacity: 0.6,
          x: mxOffsetInv,
          y: myOffsetInv,
        }}
        animate={{
          x: [0, -50, 30, -40, 0],
          y: [0, 45, -35, 25, 0],
        }}
        transition={{
          duration: 22,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* Blob 3 — deep magenta/violet #4a1942, bottom-left, slowest drift */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, #4a1942 0%, transparent 70%)',
          bottom: '-20%',
          left: '-5%',
          opacity: 0.7,
          x: mxOffset,
          y: myOffsetInv,
        }}
        animate={{
          x: [0, 40, -55, 30, 0],
          y: [0, -30, 40, -50, 0],
        }}
        transition={{
          duration: 28,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* Blob 4 — very dark cyan #064e3b, bottom-right, medium speed */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 750,
          height: 750,
          background: 'radial-gradient(circle, #064e3b 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          opacity: 0.65,
          x: mxOffsetInv,
          y: myOffset,
        }}
        animate={{
          x: [0, -40, 50, -30, 0],
          y: [0, 35, -45, 25, 0],
        }}
        transition={{
          duration: 20,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
    </div>
  );
}
