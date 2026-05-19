'use client';

import { X, GitCommit, HardDrive, ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '@/store/graphStore';

const TYPE_COLORS: Record<string, string> = {
  core: '#3b82f6',
  hotspot: '#ef4444',
  stable: '#10b981',
  utility: '#4b5563',
};

const TYPE_LABELS: Record<string, string> = {
  core: 'Core',
  hotspot: 'Hotspot',
  stable: 'Stable',
  utility: 'Utility',
};

export function NodeDetail() {
  const { selectedNode, isDetailOpen, setDetailOpen, setSelectedNode, nodes } = useGraphStore();

  if (!isDetailOpen || !selectedNode) return null;

  const nodeType = (selectedNode as any).nodeType || 'utility';
  const color = TYPE_COLORS[nodeType] || '#4b5563';

  const deps: string[] = (selectedNode as any).dependencies || [];
  const dependents: string[] = (selectedNode as any).dependents || [];

  return (
    <AnimatePresence>
      {isDetailOpen && (
        <motion.div
          key="node-detail"
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 260,
            height: '100%',
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid #1f1f1f',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 14px 12px',
            borderBottom: '1px solid #1f1f1f',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--font-code, monospace)',
                  color: '#7eb8f7',
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {selectedNode.label}
                </span>
              </div>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: `${color}20`,
                color,
                fontSize: 9,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {TYPE_LABELS[nodeType] || nodeType}
              </span>
            </div>
            <button
              onClick={() => { setDetailOpen(false); setSelectedNode(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
            {/* Stats 2×2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#111111', padding: '10px', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 10, marginBottom: 4 }}>
                  <GitCommit size={10} /> commits
                </div>
                <div style={{ color: '#e5e5e5', fontSize: 16, fontWeight: 600 }}>
                  {(selectedNode as any).commitFrequency || 0}
                </div>
              </div>
              <div style={{ background: '#111111', padding: '10px', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 10, marginBottom: 4 }}>
                  <HardDrive size={10} /> size
                </div>
                <div style={{ color: '#e5e5e5', fontSize: 16, fontWeight: 600 }}>
                  {selectedNode.size ? `${(selectedNode.size / 1024).toFixed(1)} KB` : 'N/A'}
                </div>
              </div>
              <div style={{ background: '#111111', padding: '10px', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 10, marginBottom: 4 }}>
                  <ArrowUpRight size={10} /> imports
                </div>
                <div style={{ color: '#e5e5e5', fontSize: 16, fontWeight: 600 }}>{deps.length}</div>
              </div>
              <div style={{ background: '#111111', padding: '10px', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 10, marginBottom: 4 }}>
                  <ArrowDownLeft size={10} /> imported by
                </div>
                <div style={{ color: '#e5e5e5', fontSize: 16, fontWeight: 600 }}>{dependents.length}</div>
              </div>
            </div>

            {/* Risk warning for hotspots */}
            {nodeType === 'hotspot' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <AlertTriangle size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#f59e0b', lineHeight: 1.4 }}>
                  High change frequency — risky to modify
                </span>
              </div>
            )}

            {/* Imports list */}
            {deps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Imports
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {deps.map((depId) => {
                    const depNode = nodes.find(n => n.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => {
                          if (depNode) setSelectedNode(depNode);
                        }}
                        style={{
                          padding: '2px 8px',
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          borderRadius: 4,
                          color: '#7eb8f7',
                          fontSize: 10,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-code, monospace)',
                        }}
                      >
                        {depId}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Imported by list */}
            {dependents.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Imported by
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {dependents.map((depId) => {
                    const depNode = nodes.find(n => n.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => {
                          if (depNode) setSelectedNode(depNode);
                        }}
                        style={{
                          padding: '2px 8px',
                          background: 'rgba(75,85,99,0.15)',
                          border: '1px solid rgba(75,85,99,0.3)',
                          borderRadius: 4,
                          color: '#999',
                          fontSize: 10,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-code, monospace)',
                        }}
                      >
                        {depId}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NodeDetail;
