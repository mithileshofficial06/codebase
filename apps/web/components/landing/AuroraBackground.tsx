'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const mx = useSpring(rawX, { stiffness: 18, damping: 55, mass: 3 });
  const my = useSpring(rawY, { stiffness: 18, damping: 55, mass: 3 });
  const mxO = useTransform(mx, [0, 1], [-10, 10]);
  const myO = useTransform(my, [0, 1], [-10, 10]);
  const mxI = useTransform(mx, [0, 1], [10, -10]);
  const myI = useTransform(my, [0, 1], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width);
    rawY.set((e.clientY - r.top) / r.height);
  };

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="fixed inset-0 overflow-hidden grid-bg" style={{ background: '#020617', zIndex: 0 }}>
      <motion.div className="aurora-blob" style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)', top: '-15%', left: '-8%', x: mxO, y: myO }}
        animate={{ x: [0, 40, -20, 30, 0], y: [0, -25, 35, -15, 0] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }} />
      <motion.div className="aurora-blob" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)', top: '-5%', right: '-5%', x: mxI, y: myI }}
        animate={{ x: [0, -30, 20, -25, 0], y: [0, 25, -20, 15, 0] }}
        transition={{ duration: 25, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }} />
      <motion.div className="aurora-blob" style={{ width: 650, height: 650, background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', bottom: '-20%', left: '20%', x: mxO, y: myI }}
        animate={{ x: [0, 25, -35, 20, 0], y: [0, -18, 28, -30, 0] }}
        transition={{ duration: 35, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }} />
      <motion.div className="aurora-blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%)', bottom: '-10%', right: '-5%', x: mxI, y: myO }}
        animate={{ x: [0, -20, 25, -15, 0], y: [0, 18, -22, 12, 0] }}
        transition={{ duration: 28, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }} />
    </div>
  );
}
