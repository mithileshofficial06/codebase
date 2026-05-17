'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';

interface CustomNodeData {
  label: string;
  path: string;
  fileType: string;
  color: string;
  depCount: number;
  dependentCount: number;
  commitFrequency: number;
  isHotspot: boolean;
}

function CustomNodeComponent({ data, id }: NodeProps<CustomNodeData>) {
  const hoveredNodeId = useGraphStore((s) => s.hoveredNodeId);
  const setHoveredNode = useGraphStore((s) => s.setHoveredNode);
  const isHovered = hoveredNodeId === id;

  const nodeSize = Math.max(36, Math.min(56, 36 + (data.depCount + data.dependentCount) * 2));
  const glowIntensity = isHovered ? 0.6 : 0.25;
  const glowRadius = isHovered ? 12 : 6;

  return (
    <div
      onMouseEnter={() => setHoveredNode(id)}
      onMouseLeave={() => setHoveredNode(null)}
      className="relative group"
    >
      {/* Hotspot pulse rings */}
      {data.isHotspot && (
        <>
          <div
            className="absolute inset-0 rounded-lg pulse-ring"
            style={{
              border: `1px solid ${data.color}30`,
              margin: -4,
              borderRadius: 12,
            }}
          />
          <div
            className="absolute inset-0 rounded-lg pulse-ring"
            style={{
              border: `1px solid ${data.color}20`,
              margin: -4,
              borderRadius: 12,
              animationDelay: '1s',
            }}
          />
        </>
      )}

      {/* Node body */}
      <div
        className="relative px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
        style={{
          background: `${data.color}15`,
          border: `1px solid ${data.color}${isHovered ? '60' : '30'}`,
          boxShadow: `0 0 ${glowRadius}px ${data.color}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
          minWidth: nodeSize,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!w-1.5 !h-1.5 !bg-white/20 !border-0 !-top-1"
        />

        {/* File type dot */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: data.color, boxShadow: `0 0 4px ${data.color}80` }}
          />
          <span className="text-xs text-white/80 font-medium truncate max-w-[120px]">
            {data.label}
          </span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-1.5 !h-1.5 !bg-white/20 !border-0 !-bottom-1"
        />
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md
                     bg-black/90 border border-white/10 text-xs text-white/70 whitespace-nowrap
                     pointer-events-none z-50"
        >
          {data.path}
          <div className="text-[10px] text-white/40 mt-0.5">
            {data.depCount} deps · {data.dependentCount} dependents
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CustomNodeComponent);
