'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const mx = useSpring(rawX, { stiffness: 20, damping: 50, mass: 2.5 });
  const my = useSpring(rawY, { stiffness: 20, damping: 50, mass: 2.5 });

  const mxOffset = useTransform(mx, [0, 1], [-12, 12]);
  const myOffset = useTransform(my, [0, 1], [-12, 12]);
  const mxOffsetInv = useTransform(mx, [0, 1], [12, -12]);
  const myOffsetInv = useTransform(my, [0, 1], [12, -12]);

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
      style={{ background: '#0c0a09', zIndex: 0 }}
    >
      {/* Warm amber glow — top left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 650,
          height: 650,
          background: 'radial-gradient(circle, rgba(120, 60, 10, 0.35) 0%, transparent 70%)',
          top: '-18%',
          left: '-8%',
          x: mxOffset,
          y: myOffset,
        }}
        animate={{ x: [0, 35, -18, 28, 0], y: [0, -25, 30, -12, 0] }}
        transition={{ duration: 35, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Deep copper — top right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(80, 30, 10, 0.3) 0%, transparent 70%)',
          top: '-8%',
          right: '-4%',
          x: mxOffsetInv,
          y: myOffsetInv,
        }}
        animate={{ x: [0, -28, 18, -22, 0], y: [0, 22, -18, 14, 0] }}
        transition={{ duration: 28, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Dark rust — bottom left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(60, 20, 8, 0.3) 0%, transparent 70%)',
          bottom: '-18%',
          left: '-4%',
          x: mxOffset,
          y: myOffsetInv,
        }}
        animate={{ x: [0, 25, -32, 18, 0], y: [0, -16, 24, -28, 0] }}
        transition={{ duration: 32, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Faint warm brown — bottom right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(50, 25, 10, 0.25) 0%, transparent 70%)',
          bottom: '-12%',
          right: '-8%',
          x: mxOffsetInv,
          y: myOffset,
        }}
        animate={{ x: [0, -22, 28, -16, 0], y: [0, 20, -24, 15, 0] }}
        transition={{ duration: 26, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
      />
    </div>
  );
}
