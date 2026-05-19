'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { RepoData } from '@codemap/shared';
import { ChatPanel } from './chat/ChatPanel';
import { useChat } from '@/hooks/useChat';

const GraphCanvas = dynamic(() => import('./graph/GraphCanvas'), { ssr: false });

interface AppLayoutProps {
  repoData: RepoData;
}

export default function AppLayout({ repoData }: AppLayoutProps) {
  // Build chat-compatible graph data from RepoData
  const chatGraphData = {
    nodes: repoData.nodes.map(n => ({
      id: n.id,
      label: n.label,
      nodeType: 'file',
      commitFrequency: n.commitFrequency,
      fileSize: n.size,
    })),
    edges: repoData.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
    })),
  };

  const { messages, isLoading, sendMessage } = useChat(chatGraphData);

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
        <GraphCanvas
          nodes={repoData.nodes}
          edges={repoData.edges}
        />
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
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            color: repoData.health.overall >= 70 ? '#10b981' : repoData.health.overall >= 40 ? '#f59e0b' : '#ef4444',
            lineHeight: 1,
            fontFamily: 'var(--font-heading, sans-serif)',
          }}>
            {repoData.health.overall}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            / 100
          </div>
          <div style={{ fontSize: 10, color: '#444', marginTop: 8 }}>
            {repoData.fileCount} files · {(repoData.totalSize / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>
    </motion.div>
  );
}
