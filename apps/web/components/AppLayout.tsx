'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ChatPanel } from './chat/ChatPanel';
import { useChat } from '@/hooks/useChat';

const GraphCanvas = dynamic(() => import('./graph/GraphCanvas'), { ssr: false });

// Same mock data as GraphCanvas for chat context
const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'app',      label: 'app.ts',      nodeType: 'core',    commitFrequency: 8,  fileSize: 4200 },
    { id: 'auth',     label: 'auth.ts',     nodeType: 'hotspot', commitFrequency: 24, fileSize: 3100 },
    { id: 'db',       label: 'db.ts',       nodeType: 'core',    commitFrequency: 5,  fileSize: 2800 },
    { id: 'router',   label: 'router.ts',   nodeType: 'core',    commitFrequency: 6,  fileSize: 1900 },
    { id: 'payment',  label: 'payment.ts',  nodeType: 'hotspot', commitFrequency: 18, fileSize: 3800 },
    { id: 'orders',   label: 'orders.ts',   nodeType: 'hotspot', commitFrequency: 15, fileSize: 4100 },
    { id: 'user',     label: 'user.ts',     nodeType: 'stable',  commitFrequency: 3,  fileSize: 2200 },
    { id: 'email',    label: 'email.ts',    nodeType: 'stable',  commitFrequency: 2,  fileSize: 1100 },
    { id: 'utils',    label: 'utils.ts',    nodeType: 'utility', commitFrequency: 1,  fileSize: 800 },
    { id: 'config',   label: 'config.ts',   nodeType: 'utility', commitFrequency: 1,  fileSize: 400 },
    { id: 'logger',   label: 'logger.ts',   nodeType: 'utility', commitFrequency: 1,  fileSize: 300 },
    { id: 'types',    label: 'types.ts',    nodeType: 'utility', commitFrequency: 2,  fileSize: 600 },
  ],
  edges: [
    { id: 'e1',  source: 'app',     target: 'auth',    weight: 3 },
    { id: 'e2',  source: 'app',     target: 'db',      weight: 3 },
    { id: 'e3',  source: 'app',     target: 'router',  weight: 2 },
    { id: 'e4',  source: 'router',  target: 'payment', weight: 2 },
    { id: 'e5',  source: 'router',  target: 'orders',  weight: 2 },
    { id: 'e6',  source: 'router',  target: 'user',    weight: 1 },
    { id: 'e7',  source: 'auth',    target: 'db',      weight: 3 },
    { id: 'e8',  source: 'auth',    target: 'utils',   weight: 1 },
    { id: 'e9',  source: 'orders',  target: 'payment', weight: 2 },
    { id: 'e10', source: 'orders',  target: 'email',   weight: 1 },
    { id: 'e11', source: 'orders',  target: 'db',      weight: 2 },
    { id: 'e12', source: 'payment', target: 'utils',   weight: 1 },
    { id: 'e13', source: 'payment', target: 'config',  weight: 1 },
    { id: 'e14', source: 'user',    target: 'db',      weight: 2 },
    { id: 'e15', source: 'email',   target: 'config',  weight: 1 },
    { id: 'e16', source: 'app',     target: 'logger',  weight: 1 },
    { id: 'e17', source: 'db',      target: 'config',  weight: 1 },
    { id: 'e18', source: 'orders',  target: 'types',   weight: 1 },
    { id: 'e19', source: 'user',    target: 'types',   weight: 1 },
  ],
};

export default function AppLayout() {
  const { messages, isLoading, sendMessage } = useChat(MOCK_GRAPH_DATA);

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
        <div className="flex-[3] relative z-10" style={{ minHeight: 0 }}>
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            sendMessage={sendMessage}
          />
        </div>

        {/* Health Score — bottom 25% */}
        <div
          className="flex-1 flex flex-col items-center justify-center relative z-10 p-4"
          style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}
        >
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
