'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HealthMetric } from '@codemap/shared';

interface MetricBarProps {
  metric: HealthMetric;
}

function getBarColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getBarGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(90deg, #22c55e, #4ade80)';
  if (score >= 60) return 'linear-gradient(90deg, #eab308, #fbbf24)';
  if (score >= 40) return 'linear-gradient(90deg, #f97316, #fb923c)';
  return 'linear-gradient(90deg, #ef4444, #f87171)';
}

export default function MetricBar({ metric }: MetricBarProps) {
  const [hovered, setHovered] = useState(false);
  const percentage = (metric.score / metric.max) * 100;
  const color = getBarColor(metric.score);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50 font-medium">{metric.name}</span>
        <span className="text-white/40 tabular-nums">{metric.score}/{metric.max}</span>
      </div>

      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background: getBarGradient(metric.score),
            boxShadow: `0 0 8px ${color}30`,
          }}
        />
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-md
                     bg-black/90 border border-white/10 text-xs text-white/60
                     whitespace-nowrap pointer-events-none z-50"
        >
          {metric.detail}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45
                          w-2 h-2 bg-black/90 border-r border-b border-white/10" />
        </motion.div>
      )}
    </div>
  );
}
