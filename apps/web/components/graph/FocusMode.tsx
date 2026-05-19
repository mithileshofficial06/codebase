'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '@/store/graphStore';
import { X } from 'lucide-react';

/**
 * Focus Mode Overlay
 * Provides cinematic focus isolation with backdrop dimming
 */
export function FocusMode() {
  const { focusedNodeId, focusedClusterId, clearFocus } = useGraphStore();
  const isFocused = !!(focusedNodeId || focusedClusterId);

  return (
    <AnimatePresence>
      {isFocused && (
        <>
          {/* Backdrop dimming */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 pointer-events-none z-10"
            style={{ backdropFilter: 'blur(1px)' }}
          />

          {/* Exit focus button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={clearFocus}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-sm font-medium hover:bg-[#222] hover:border-[#444] transition-all duration-200 shadow-lg"
          >
            <X size={16} />
            Exit Focus
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
