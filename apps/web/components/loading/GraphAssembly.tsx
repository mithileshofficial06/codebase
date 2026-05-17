'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface GraphAssemblyProps {
  progress: number; // 0–1
  bloom: boolean;
}

interface Node {
  id: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

interface Edge {
  from: number;
  to: number;
}

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function GraphAssembly({ progress, bloom }: GraphAssemblyProps) {
  // Deterministic node layout — 5 nodes in a rough pentagon pattern
  const nodes: Node[] = useMemo(() => {
    const positions = [
      { cx: CX, cy: CY - 55 },          // top center
      { cx: CX + 60, cy: CY - 15 },     // right upper
      { cx: CX + 40, cy: CY + 50 },     // right lower
      { cx: CX - 40, cy: CY + 50 },     // left lower
      { cx: CX - 60, cy: CY - 15 },     // left upper
    ];
    return positions.map((p, i) => ({
      id: i,
      ...p,
      r: 5,
      color: COLORS[i],
    }));
  }, []);

  const edges: Edge[] = useMemo(
    () => [
      { from: 0, to: 1 },
      { from: 0, to: 4 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
    ],
    []
  );

  // Show elements based on progress
  const visibleNodes = Math.ceil(nodes.length * Math.min(progress * 1.8, 1));
  const visibleEdges = Math.ceil(
    edges.length * Math.max(0, (progress - 0.15) * 1.6)
  );

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* Subtle glow behind graph */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: bloom
            ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          scale: bloom ? 1.4 : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <svg width={SIZE} height={SIZE} className="relative z-10">
        <defs>
          {/* Glow filter for nodes */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges with traveling particle */}
        {edges.slice(0, visibleEdges).map((edge, i) => {
          const from = nodes[edge.from];
          const to = nodes[edge.to];
          if (!from || !to) return null;

          const pathId = `edge-path-${i}`;

          return (
            <g key={`edge-${i}`}>
              {/* The line */}
              <motion.line
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />

              {/* Traveling particle */}
              <path
                id={pathId}
                d={`M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`}
                fill="none"
                stroke="none"
              />
              <motion.circle
                r="1.5"
                fill={from.color}
                opacity={0.7}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: i * 0.08 + 0.3 }}
              >
                <animateMotion
                  dur={`${2 + i * 0.3}s`}
                  repeatCount="indefinite"
                  path={`M ${from.cx - from.cx} ${from.cy - from.cy} L ${to.cx - from.cx} ${to.cy - from.cy}`}
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </motion.circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.slice(0, visibleNodes).map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={bloom ? node.cx : node.cx + (Math.random() - 0.5) * 20}
            cy={bloom ? node.cy : node.cy + (Math.random() - 0.5) * 20}
            r={node.r}
            fill={node.color}
            filter="url(#node-glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 0.85,
              cx: bloom ? node.cx : undefined,
              cy: bloom ? node.cy : undefined,
            }}
            transition={
              bloom
                ? { type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }
                : { duration: 0.4, delay: i * 0.12 }
            }
          >
            {/* Soft pulse */}
            {!bloom && (
              <animate
                attributeName="opacity"
                values="0.6;0.95;0.6"
                dur={`${2 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            )}
          </motion.circle>
        ))}
      </svg>
    </div>
  );
}
