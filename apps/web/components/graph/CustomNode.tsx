'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';

const NODE_CONFIG = {
  core:    { color: '#3b82f6', radius: 16, shadow: '0 0 12px 3px rgba(59,130,246,0.5)' },
  hotspot: { color: '#ef4444', radius: 14, shadow: '0 0 10px 3px rgba(239,68,68,0.4)' },
  stable:  { color: '#10b981', radius: 11, shadow: '0 0 8px 2px rgba(16,185,129,0.3)' },
  utility: { color: '#4b5563', radius: 9,  shadow: '0 0 4px 1px rgba(75,85,99,0.2)' },
} as const;

export type NodeType = keyof typeof NODE_CONFIG;

function CustomNodeComponent({ id, data, selected }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const activeFilter = useGraphStore((s) => s.activeFilter);
  const setSelectedNode = useGraphStore((s) => s.setSelectedNode);

  const nodeType: NodeType = data.nodeType || 'utility';
  const cfg = NODE_CONFIG[nodeType];
  const isDimmed = activeFilter !== 'all' && activeFilter !== nodeType;

  const scale = selected ? 1.2 : isHovered ? 1.1 : isDimmed ? 0.9 : 1;
  const opacity = isDimmed ? 0.08 : 1;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // Build a mock node object the store expects
        setSelectedNode({
          id,
          label: data.label,
          nodeType: data.nodeType,
          commitFrequency: data.commitFrequency,
          size: data.fileSize,
          dependencies: data.dependencies || [],
          dependents: data.dependents || [],
        } as any);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transform: `scale(${scale})`,
        opacity,
        transition: 'transform 150ms ease, opacity 150ms ease',
      }}
    >
      {/* Invisible handles for edge connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      {/* Node circle */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: cfg.radius * 2,
            height: cfg.radius * 2,
            borderRadius: '50%',
            backgroundColor: `${cfg.color}e6`, // 90% opacity
            boxShadow: isHovered
              ? cfg.shadow.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 1.5})`)
              : cfg.shadow,
            border: selected ? '2px solid #ffffff' : 'none',
          }}
        />

        {/* Hotspot pulsing ring */}
        {nodeType === 'hotspot' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1.5px solid ${cfg.color}`,
              animation: 'hotspot-pulse 2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 6,
          fontFamily: 'var(--font-code, "Geist Mono", monospace)',
          fontSize: 9,
          color: selected ? '#ffffff' : isHovered ? '#cccccc' : '#888888',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '1px 4px',
          borderRadius: 3,
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 150ms ease',
        }}
        title={data.label}
      >
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      <style>{`
        @keyframes hotspot-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
CustomNode.displayName = 'CustomNode';
export default CustomNode;
