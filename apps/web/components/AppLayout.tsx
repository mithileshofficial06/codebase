'use client';

import { motion } from 'framer-motion';

export default function AppLayout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="h-screen flex overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Left panel — Graph Canvas (75%) */}
      <div className="flex-[3] flex items-center justify-center relative">
        <span className="text-sm" style={{ color: '#333333' }}>
          Graph Canvas — coming soon
        </span>
      </div>

      {/* Right panel (25%) */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ background: '#0f0f0f' }}
      >
        {/* Subtle aurora blob behind right panel */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #1a0533 0%, transparent 70%)',
              filter: 'blur(120px)',
              top: '20%',
              left: '-20%',
              opacity: 0.4,
            }}
          />
        </div>

        {/* AI Chat — top 75% */}
        <div className="flex-[3] flex items-center justify-center relative z-10">
          <span className="text-sm" style={{ color: '#333333' }}>
            AI Chat — coming soon
          </span>
        </div>

        {/* Faint separator */}
        <div
          className="w-full h-px"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />

        {/* Health Score — bottom 25% */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <span className="text-sm" style={{ color: '#333333' }}>
            Health Score — coming soon
          </span>
        </div>
      </div>
    </motion.div>
  );
}
