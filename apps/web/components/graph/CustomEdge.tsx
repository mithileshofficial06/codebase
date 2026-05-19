'use client';

import { memo, useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  // Stroke width based on weight
  const baseWidth = weight >= 4 ? 2.5 : weight === 3 ? 2 : weight === 2 ? 1.5 : 1;
  const strokeWidth = isHovered ? baseWidth + 1 : baseWidth;
  const opacity = isHovered ? 1.0 : 0.5;

  const gradientId = `edge-gradient-${id}`;
  const pathId = `edge-path-${id}`;
  const markerId = `edge-marker-${id}`;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <defs>
        {/* Gradient from source to target color */}
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor={sourceColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={0.6} />
        </linearGradient>

        {/* Arrowhead marker */}
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={targetColor} opacity={0.6} />
        </marker>
      </defs>

      {/* Invisible fat path for easier hover target */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />

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

      {/* Animated particle on hover */}
      {isHovered && (
        <circle r="3" fill={sourceColor} opacity={0.9}>
          <animateMotion dur="1s" repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}
    </g>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);
CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
