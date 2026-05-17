'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ScoreNumberProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(135deg, #22c55e, #4ade80)';
  if (score >= 60) return 'linear-gradient(135deg, #eab308, #facc15)';
  if (score >= 40) return 'linear-gradient(135deg, #f97316, #fb923c)';
  return 'linear-gradient(135deg, #ef4444, #f87171)';
}

export default function ScoreNumber({ score }: ScoreNumberProps) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (score - startValue) * eased);

      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [score]);

  const color = getScoreColor(display);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-6xl font-bold tabular-nums"
        style={{
          background: getScoreGradient(display),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: `drop-shadow(0 0 20px ${color}30)`,
          transition: 'filter 0.5s ease',
        }}
      >
        {display}
      </motion.div>
      <div className="text-xs text-white/30 mt-1 tracking-widest">/ 100</div>
    </div>
  );
}
