'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const GraphCanvas = dynamic(() => import('./graph/GraphCanvas'), { ssr: false });

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
      <div className="flex-[3] relative" style={{ borderRight: '1px solid #1a1a1a' }}>
        <GraphCanvas />
      </div>

      {/* Right panel (25%) */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ background: '#0a0a0a', minWidth: 280 }}
      >
        {/* Aurora glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #1a0533 0%, transparent 70%)',
              filter: 'blur(100px)',
              top: '15%',
              left: '-30%',
              opacity: 0.3,
            }}
          />
        </div>

        {/* AI Chat — top 75% */}
        <div className="flex-[3] flex flex-col relative z-10 p-4 overflow-y-auto" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            AI Chat
          </div>
          {/* Mock chat messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '8px 12px', background: '#141414', borderRadius: '10px 10px 10px 2px', border: '1px solid #1f1f1f', fontSize: 12, color: '#999', maxWidth: '90%' }}>
              What does <code style={{ color: '#7eb8f7', fontSize: 11 }}>auth.ts</code> depend on?
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: '10px 10px 2px 10px', border: '1px solid rgba(59,130,246,0.1)', fontSize: 12, color: '#b0b0b0', maxWidth: '90%', alignSelf: 'flex-end', lineHeight: 1.5 }}>
              <strong style={{ color: '#7eb8f7' }}>auth.ts</strong> imports from <code style={{ color: '#10b981', fontSize: 11 }}>db.ts</code> and <code style={{ color: '#4b5563', fontSize: 11 }}>utils.ts</code>. It handles JWT token generation and session management.
            </div>
          </div>
        </div>

        {/* Health Score — bottom 25% */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
          <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Health Score
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#f59e0b', lineHeight: 1, fontFamily: 'var(--font-heading, sans-serif)' }}>
            74
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            / 100
          </div>
        </div>
      </div>
    </motion.div>
  );
}
