'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLACEHOLDER = 'paste a GitHub URL...';
const GITHUB_PATTERN = /github\.com\/[\w.-]+\/[\w.-]+/;

interface UrlInputProps {
  onSubmit: (url: string) => void;
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = GITHUB_PATTERN.test(value);
  const showGlow = focused || value.length > 0;

  // Typewriter placeholder
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= PLACEHOLDER.length) {
        setTypedPlaceholder(PLACEHOLDER.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValid || submitted) return;
    setSubmitted(true);
    // Small delay before calling parent so exit animation plays
    setTimeout(() => onSubmit(value.trim()), 600);
  }, [isValid, submitted, onSubmit, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <AnimatePresence>
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-xl min-w-[500px] flex flex-col items-center"
        >
          <div className="relative w-full flex items-center">
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={typedPlaceholder}
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent text-white text-center text-base py-3 
                         focus:outline-none placeholder:text-[#333333]"
              style={{ fontFamily: 'var(--font-mono)' }}
            />

            {/* Arrow button */}
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full hover:bg-white/5 
                         transition-all duration-300 disabled:cursor-default disabled:hover:bg-transparent"
              aria-label="Submit"
            >
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  color: isValid ? '#6366f1' : '#333333',
                  filter: isValid
                    ? 'drop-shadow(0 0 8px rgba(99,102,241,0.6))'
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </button>
          </div>

          {/* Glowing underline */}
          <div className="w-full h-px bg-[#1a1a1a] relative overflow-visible">
            <motion.div
              className="absolute inset-0"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: 1,
                opacity: 1,
              }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              style={{ transformOrigin: 'center' }}
            >
              <div 
                className="w-full h-full" 
                style={{
                  background: '#6366f1',
                  boxShadow: '0 0 12px #6366f1, 0 0 24px rgba(99,102,241,0.6)',
                  animation: 'glow-pulse 2.5s ease-in-out infinite alternate'
                }} 
              />
            </motion.div>
          </div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.6 }}
            className="mt-5 text-[12px]"
            style={{ color: '#555555' }}
          >
            try github.com/vercel/next.js
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
