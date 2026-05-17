'use client';

import { HealthScore } from '@codemap/shared';
import ScoreNumber from './ScoreNumber';
import MetricBar from './MetricBar';
import { motion } from 'framer-motion';

interface HealthPanelProps {
  health: HealthScore;
}

export default function HealthPanel({ health }: HealthPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-5 border-b"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white/70 tracking-wide uppercase">Health Score</h2>
      </div>

      <ScoreNumber score={health.overall} />

      <div className="mt-6 space-y-3.5">
        {health.metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <MetricBar metric={metric} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
