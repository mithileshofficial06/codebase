'use client';

import { memo, useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  source,
  target,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const focusedNodeId = useGraphStore((s) => s.focusedNodeId);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const weight = data?.weight || 1;
  const sourceColor = data?.sourceColor || '#4b5563';
  const targetColor = data?.targetColor || '#4b5563';
  const isClusterEdge = data?.isClusterEdge || false;

  // Focus mode logic
  const isConnectedToFocus = focusedNodeId && (source === focusedNodeId || target === focusedNodeId);
  const shouldDim = focusedNodeId && !isConnectedToFocus;

  // Stroke width based on weight — cluster edges are thicker
  let baseWidth: number;
  if (isClusterEdge) {
    baseWidth = Math.max(2, Math.min(6, 1.5 + weight * 0.4));
  } else {
    baseWidth = weight >= 4 ? 2.5 : weight === 3 ? 2 : weight === 2 ? 1.5 : 1;
  }

  const strokeWidth = isHovered ? baseWidth + 1.5 : baseWidth;
  const opacity = shouldDim ? 0.05 : isHovered ? 1.0 : isClusterEdge ? 0.6 : 0.4;

  const gradientId = `edge-gradient-${id}`;
  const pathId = `edge-path-${id}`;
  const markerId = `edge-marker-${id}`;

  // Show flowing particles on cluster edges always, file edges on hover or when connected to focus
  const showParticles = isClusterEdge || isHovered || isConnectedToFocus;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor={sourceColor} stopOpacity={isClusterEdge ? 0.8 : 0.5} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={isClusterEdge ? 0.8 : 0.5} />
        </linearGradient>

        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth={isClusterEdge ? 8 : 6}
          markerHeight={isClusterEdge ? 8 : 6}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={targetColor} opacity={0.6} />
        </marker>
      </defs>

      {/* Invisible fat path for easier hover */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={20} />

      {/* Glow path for cluster edges */}
      {isClusterEdge && (
        <path
          d={edgePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={baseWidth + 4}
          opacity={0.1}
          style={{ filter: 'blur(3px)' }}
        />
      )}

      {/* Visible edge path */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        opacity={opacity}
        markerEnd={`url(#${markerId})`}
        style={{ transition: 'stroke-width 200ms ease, opacity 200ms ease' }}
      />

      {/* Flowing particles */}
      {showParticles && (
        <>
          <circle r={isClusterEdge ? 3.5 : 2.5} fill={sourceColor} opacity={0.9}>
            <animateMotion dur={isClusterEdge ? '2s' : '1s'} repeatCount="indefinite">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          {isClusterEdge && (
            <circle r={2.5} fill={targetColor} opacity={0.6}>
              <animateMotion dur="2s" begin="1s" repeatCount="indefinite">
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </circle>
          )}
        </>
      )}

      {/* Weight label on hover for cluster edges */}
      {isHovered && isClusterEdge && weight > 1 && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          style={{
            fontSize: 9,
            fill: '#888',
            fontFamily: 'var(--font-code, monospace)',
          }}
        >
          {weight} deps
        </text>
      )}
    </g>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);
CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
