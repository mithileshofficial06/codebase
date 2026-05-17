'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type StepStatus = 'pending' | 'active' | 'complete';

interface ChecklistItemProps {
  label: string;
  status: StepStatus;
}

export default function ChecklistItem({ label, status }: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-3 h-7">
      {/* Dot / Check */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {status === 'pending' && (
          <div className="w-2 h-2 rounded-full" style={{ background: '#333333' }} />
        )}

        {status === 'active' && (
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#3b82f6' }}
            animate={{
              boxShadow: [
                '0 0 4px rgba(59,130,246,0.4)',
                '0 0 12px rgba(59,130,246,0.8)',
                '0 0 4px rgba(59,130,246,0.4)',
              ],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {status === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Check className="w-4 h-4" style={{ color: '#10b981' }} strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <span
        className="text-sm font-normal transition-colors duration-300 relative"
        style={{
          color:
            status === 'complete'
              ? '#10b981'
              : status === 'active'
              ? '#cccccc'
              : '#444444',
        }}
      >
        {label}
        {/* Shimmer on active text */}
        {status === 'active' && (
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['-100% 0', '200% 0'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </span>
    </div>
  );
}
