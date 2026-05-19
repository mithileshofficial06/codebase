'use client';

import { motion } from 'framer-motion';

export function StreamingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 0',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
          }}
        />
      ))}
    </motion.div>
  );
}

export default StreamingIndicator;
