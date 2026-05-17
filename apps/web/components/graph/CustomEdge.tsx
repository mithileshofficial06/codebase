'use client';

import { memo, useState, useId } from 'react';
import { BaseEdge, type EdgeProps, getSmoothStepPath } from 'reactflow';

interface CustomEdgeData {
  weight: number;
  sourceColor: string;
  targetColor: string;
}

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<CustomEdgeData>) {
  const [hovered, setHovered] = useState(false);
  const gradientId = useId();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const strokeWidth = hovered ? 2.5 : 1.5;
  const opacity = hovered ? 0.7 : 0.2;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={data?.sourceColor || '#8b5cf6'} stopOpacity={opacity} />
          <stop offset="100%" stopColor={data?.targetColor || '#3b82f6'} stopOpacity={opacity} />
        </linearGradient>
      </defs>

      {/* Invisible wider path for easier hovering */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />

      {/* Visible edge */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        style={{
          transition: 'stroke-width 0.2s, opacity 0.2s',
          filter: hovered ? `drop-shadow(0 0 4px ${data?.sourceColor || '#8b5cf6'}40)` : 'none',
        }}
      />

      {/* Particle on hover */}
      {hovered && (
        <circle r="3" fill={data?.sourceColor || '#8b5cf6'} opacity={0.8}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </g>
  );
}

export default memo(CustomEdgeComponent);
