'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';

export type NodeType = 'core' | 'hotspot' | 'stable' | 'utility';

const TYPE_GLOW: Record<NodeType, string> = {
  core:    '0 0 8px 2px rgba(59,130,246,0.4)',
  hotspot: '0 0 10px 3px rgba(239,68,68,0.5)',
  stable:  '0 0 6px 2px rgba(16,185,129,0.3)',
  utility: '0 0 3px 1px rgba(75,85,99,0.2)',
};

function CustomNodeComponent({ id, data, selected }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const activeFilter = useGraphStore((s) => s.activeFilter);
  const setSelectedNode = useGraphStore((s) => s.setSelectedNode);

  const nodeType: NodeType = data.nodeType || 'utility';
  const extColor: string = data.extColor || '#4b5563';
  const isDimmed = activeFilter !== 'all' && activeFilter !== nodeType;

  const scale = selected ? 1.15 : isHovered ? 1.08 : isDimmed ? 0.85 : 1;
  const opacity = isDimmed ? 0.1 : 1;

  // Adaptive radius based on connectivity
  const connections = (data.dependencies?.length || 0) + (data.dependents?.length || 0);
  const radius = Math.max(6, Math.min(14, 6 + connections * 1.5));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setSelectedNode({
          id,
          label: data.label,
          nodeType: data.nodeType,
          commitFrequency: data.commitFrequency,
          size: data.fileSize,
          path: data.path,
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
      {/* Invisible handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1, background: 'transparent', border: 'none' }}
      />

      {/* Node circle */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            backgroundColor: extColor,
            boxShadow: isHovered || selected
              ? TYPE_GLOW[nodeType]
              : `0 0 4px 1px ${extColor}40`,
            border: selected ? '2px solid #ffffff' : `1px solid ${extColor}80`,
            transition: 'box-shadow 150ms ease',
          }}
        />

        {/* Hotspot pulsing ring */}
        {nodeType === 'hotspot' && (
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: `1.5px solid ${extColor}`,
              animation: 'hotspot-pulse 2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Label — always visible */}
      <div
        style={{
          marginTop: 4,
          fontFamily: 'var(--font-code, "Geist Mono", monospace)',
          fontSize: 10,
          fontWeight: 500,
          color: selected ? '#ffffff' : isHovered ? '#e0e0e0' : '#aaaaaa',
          backgroundColor: 'rgba(8,8,8,0.85)',
          padding: '1px 5px',
          borderRadius: 3,
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 150ms ease',
          letterSpacing: '-0.01em',
        }}
        title={data.path || data.label}
      >
        {data.label}
      </div>

      {/* Folder path shown on hover */}
      {isHovered && data.folder && data.folder !== '_root' && (
        <div
          style={{
            marginTop: 1,
            fontSize: 8,
            color: '#666',
            fontFamily: 'var(--font-code, monospace)',
            backgroundColor: 'rgba(8,8,8,0.9)',
            padding: '0 4px',
            borderRadius: 2,
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {data.folder}
        </div>
      )}

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
