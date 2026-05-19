'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';

function ClusterNodeComponent({ id, data }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const expandCluster = useGraphStore((s) => s.expandCluster);

  const {
    label,
    humanLabel,
    fileCount,
    color,
    hotspotCount,
    isEntryPoint,
    avgCommitFreq,
    totalSize,
  } = data;

  // Scale orb size by file count (min 64px, max 130px)
  const baseSize = Math.max(64, Math.min(130, 50 + fileCount * 4));
  const size = isHovered ? baseSize * 1.06 : baseSize;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => expandCluster(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      {/* Orb */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
            animation: hotspotCount > 0 ? 'cluster-pulse 3s ease-in-out infinite' : undefined,
          }}
        />

        {/* Main orb */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}18 50%, ${color}08 100%)`,
            border: `1.5px solid ${color}50`,
            boxShadow: isHovered
              ? `0 0 30px ${color}40, 0 0 60px ${color}20, inset 0 0 20px ${color}15`
              : `0 0 20px ${color}25, inset 0 0 15px ${color}10`,
            transition: 'box-shadow 300ms ease, width 250ms ease, height 250ms ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {/* File count inside orb */}
          <div style={{
            fontSize: Math.max(18, size * 0.2),
            fontWeight: 700,
            color: color,
            lineHeight: 1,
            fontFamily: 'var(--font-heading, sans-serif)',
          }}>
            {fileCount}
          </div>
          <div style={{
            fontSize: 9,
            color: `${color}aa`,
            letterSpacing: '0.02em',
          }}>
            files
          </div>
        </div>

        {/* START HERE badge */}
        {isEntryPoint && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: '#f59e0b',
            color: '#000',
            fontSize: 7,
            fontWeight: 700,
            padding: '2px 5px',
            borderRadius: 4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 0 8px rgba(245,158,11,0.5)',
          }}>
            START
          </div>
        )}

        {/* Hotspot indicator */}
        {hotspotCount > 0 && (
          <div style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ef4444',
            border: '2px solid #080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 0 6px rgba(239,68,68,0.5)',
          }}>
            {hotspotCount}
          </div>
        )}
      </div>

      {/* Label below orb */}
      <div style={{
        marginTop: 10,
        textAlign: 'center',
        maxWidth: 140,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: isHovered ? '#ffffff' : '#cccccc',
          fontFamily: 'var(--font-body, sans-serif)',
          transition: 'color 200ms ease',
          lineHeight: 1.3,
        }}>
          {humanLabel || label}
        </div>
        <div style={{
          fontSize: 9,
          color: '#555',
          marginTop: 2,
          fontFamily: 'var(--font-code, monospace)',
        }}>
          {(totalSize / 1024).toFixed(1)} KB
        </div>
      </div>

      {/* Hover tooltip with details */}
      {isHovered && (
        <div style={{
          marginTop: 6,
          padding: '4px 8px',
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid #1f1f1f',
          borderRadius: 6,
          fontSize: 9,
          color: '#888',
          fontFamily: 'var(--font-code, monospace)',
          whiteSpace: 'nowrap',
        }}>
          Double-click to explore
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      <style>{`
        @keyframes cluster-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export const ClusterNodeComponent_Memo = memo(ClusterNodeComponent);
ClusterNodeComponent_Memo.displayName = 'ClusterNode';
export default ClusterNodeComponent_Memo;
