'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { RepoData } from '@codemap/shared';
import { ChatPanel } from './chat/ChatPanel';
import { useChat } from '@/hooks/useChat';
import { useGraphStore } from '@/store/graphStore';
import { MessageCircle, Layers, AlertTriangle, Zap, ChevronRight } from 'lucide-react';

const GraphCanvas = dynamic(() => import('./graph/GraphCanvas'), { ssr: false });

interface AppLayoutProps {
  repoData: RepoData;
}

/* ─── Architecture Sidebar Tab ───────────────────────────────── */

function ArchitectureTab() {
  const { clusters, expandCluster, viewLevel } = useGraphStore();

  const entryPoints = clusters.filter(c => c.isEntryPoint);
  const hotspots = clusters
    .filter(c => c.hotspotCount > 0)
    .sort((a, b) => b.hotspotCount - a.hotspotCount);

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: 12,
    }} className="arch-scroll">
      {/* Module Tree */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          color: '#555',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          Modules ({clusters.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {clusters.map(c => (
            <button
              key={c.id}
              onClick={() => expandCluster(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: c.color,
                flexShrink: 0,
                boxShadow: `0 0 4px ${c.color}40`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11,
                  color: '#ccc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {c.humanLabel}
                </div>
              </div>
              <span style={{ fontSize: 9, color: '#555', flexShrink: 0 }}>
                {c.fileCount}
              </span>
              <ChevronRight size={10} color="#444" />
            </button>
          ))}
        </div>
      </div>

      {/* Entry Points */}
      {entryPoints.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Zap size={10} color="#f59e0b" /> Entry Points
          </div>
          {entryPoints.map(c => (
            <div key={c.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 0',
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                boxShadow: '0 0 4px rgba(245,158,11,0.5)',
              }} />
              <span style={{ fontSize: 10, color: '#f59e0b' }}>{c.humanLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hotspot Ranking */}
      {hotspots.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <AlertTriangle size={10} color="#ef4444" /> Risk Areas
          </div>
          {hotspots.slice(0, 5).map(c => (
            <div key={c.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 0',
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }} />
              <span style={{ fontSize: 10, color: '#ccc', flex: 1 }}>{c.humanLabel}</span>
              <span style={{
                fontSize: 9,
                color: '#ef4444',
                background: 'rgba(239,68,68,0.1)',
                padding: '1px 5px',
                borderRadius: 4,
              }}>
                {c.hotspotCount} hotspots
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Health Breakdown */}
      <div>
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          color: '#555',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: '#111', padding: 8, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#eee' }}>
              {clusters.reduce((s, c) => s + c.fileCount, 0)}
            </div>
            <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>Total Files</div>
          </div>
          <div style={{ background: '#111', padding: 8, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#eee' }}>
              {clusters.length}
            </div>
            <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>Modules</div>
          </div>
        </div>
      </div>

      <style>{`
        .arch-scroll::-webkit-scrollbar { width: 4px; }
        .arch-scroll::-webkit-scrollbar-track { background: transparent; }
        .arch-scroll::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 2px; }
      `}</style>
    </div>
  );
}

/* ─── Main Layout ────────────────────────────────────────────── */

export default function AppLayout({ repoData }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'arch'>('arch');

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
      {/* Left panel — Graph Canvas */}
      <div className="flex-[3] relative" style={{ borderRight: '1px solid #1a1a1a' }}>
        <GraphCanvas nodes={repoData.nodes} edges={repoData.edges} />
      </div>

      {/* Right panel */}
      <div
        className="flex flex-col relative"
        style={{ background: '#0a0a0a', width: 300, minWidth: 280 }}
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

        {/* Tab header */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #1a1a1a',
          background: '#0a0a0a',
          zIndex: 10,
          position: 'relative',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setActiveTab('arch')}
            style={{
              flex: 1,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'arch' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'arch' ? '#ccc' : '#555',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            <Layers size={12} /> Architecture
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              flex: 1,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'chat' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'chat' ? '#ccc' : '#555',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            <MessageCircle size={12} /> AI Chat
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 relative z-10" style={{ minHeight: 0 }}>
          {activeTab === 'chat' ? (
            <ChatPanel messages={messages} isLoading={isLoading} sendMessage={sendMessage} />
          ) : (
            <ArchitectureTab />
          )}
        </div>

        {/* Health Score — always visible at bottom */}
        <div
          className="flex flex-col items-center justify-center relative z-10 p-3"
          style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a', flexShrink: 0 }}
        >
          <div style={{ fontSize: 9, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Health Score
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 700,
            color: repoData.health.overall >= 70 ? '#10b981' : repoData.health.overall >= 40 ? '#f59e0b' : '#ef4444',
            lineHeight: 1,
            fontFamily: 'var(--font-heading, sans-serif)',
          }}>
            {repoData.health.overall}
          </div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>/ 100</div>
        </div>
      </div>
    </motion.div>
  );
}
