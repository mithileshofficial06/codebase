'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode, GitBranch, Activity } from 'lucide-react';
import { GraphNode } from '@codemap/shared';
import { useGraphStore } from '@/store/graphStore';
import { getNodeColor } from '@/lib/graphUtils';

interface NodeDetailProps {
  node: GraphNode;
}

export default function NodeDetail({ node }: NodeDetailProps) {
  const selectNode = useGraphStore((s) => s.selectNode);
  const color = getNodeColor(node);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-4 right-4 w-80 z-50"
      >
        <div
          className="glass-card p-5 space-y-4"
          style={{ borderColor: `${color}20` }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
              />
              <h3 className="text-base font-semibold text-white/90 truncate">{node.label}</h3>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          {/* Path */}
          <p className="text-xs font-mono text-white/40 break-all">{node.path}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatItem icon={<FileCode className="w-3.5 h-3.5" />} label="Size" value={formatSize(node.size)} />
            <StatItem icon={<GitBranch className="w-3.5 h-3.5" />} label="Deps" value={String(node.dependencies.length)} />
            <StatItem icon={<Activity className="w-3.5 h-3.5" />} label="Commits" value={String(node.commitFrequency)} />
          </div>

          {/* Dependencies */}
          {node.dependencies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Dependencies ({node.dependencies.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {node.dependencies.map((dep, i) => (
                  <div key={i} className="text-xs font-mono text-white/35 truncate hover:text-white/60 transition-colors">
                    {dep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependents */}
          {node.dependents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Used by ({node.dependents.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {node.dependents.map((dep, i) => (
                  <div key={i} className="text-xs font-mono text-white/35 truncate hover:text-white/60 transition-colors">
                    {dep}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-white/[0.03]">
      <div className="text-white/30">{icon}</div>
      <span className="text-sm font-semibold text-white/80">{value}</span>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
