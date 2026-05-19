'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';
import { useReactFlow } from 'reactflow';

/**
 * Semantic Graph Search
 * Intelligent search with smooth zoom and focus
 */
export function GraphSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; label: string; path: string; type: 'node' | 'cluster' }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { nodes, clusters, viewLevel } = useGraphStore();
  const { setFocusedNode, setFocusedCluster, setSearchQuery } = useGraphStore();
  const { fitView, getNode } = useReactFlow();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const searchResults: typeof results = [];

    // Search in current view
    if (viewLevel === 'architecture') {
      // Search clusters
      clusters.forEach(cluster => {
        if (
          cluster.label.toLowerCase().includes(lowerQuery) ||
          cluster.humanLabel.toLowerCase().includes(lowerQuery) ||
          cluster.folder.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: cluster.id,
            label: cluster.humanLabel,
            path: cluster.folder,
            type: 'cluster',
          });
        }
      });
    } else {
      // Search file nodes
      nodes.forEach(node => {
        if (
          node.label.toLowerCase().includes(lowerQuery) ||
          node.path.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: node.id,
            label: node.label,
            path: node.path,
            type: 'node',
          });
        }
      });
    }

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query, nodes, clusters, viewLevel]);

  const handleSelect = (result: typeof results[0]) => {
    setSearchQuery(query);
    
    if (result.type === 'cluster') {
      setFocusedCluster(result.id);
    } else {
      setFocusedNode(result.id);
    }

    // Zoom to node
    setTimeout(() => {
      const node = getNode(result.id);
      if (node) {
        fitView({
          nodes: [node],
          duration: 800,
          padding: 0.5,
        });
      }
    }, 100);

    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* Search trigger button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 bg-[#0d0d0d]/90 backdrop-blur-xl border border-[#1f1f1f] rounded-lg text-[#888] text-sm hover:border-[#333] hover:text-white hover:bg-[#111]/90 transition-all duration-200 shadow-lg"
      >
        <Search size={15} />
        <span className="font-medium">Search graph...</span>
        <kbd className="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-xs font-mono text-[#666]">
          ⌘K
        </kbd>
      </motion.button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -30 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="bg-[#0d0d0d]/95 backdrop-blur-2xl border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1f1f1f]">
                  <Search size={20} className="text-[#666] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search files, modules, or systems..."
                    className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-[#666] font-medium"
                    style={{ fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="text-[#666] hover:text-white transition-colors p-1 hover:bg-[#1a1a1a] rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150 ${
                          index === selectedIndex
                            ? 'bg-[#1a1a1a] border-l-2 border-l-[#f59e0b]'
                            : 'hover:bg-[#151515] border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-[#1a1a1a] border flex items-center justify-center transition-colors ${
                          index === selectedIndex ? 'border-[#333] bg-[#1f1f1f]' : 'border-[#1f1f1f]'
                        }`}>
                          {result.type === 'cluster' ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <rect x="2" y="2" width="12" height="12" rx="2" stroke="#888" strokeWidth="1.5" fill="none" />
                              <path d="M2 6h12M6 2v12" stroke="#888" strokeWidth="1.5" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 2h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#888" strokeWidth="1.5" fill="none" />
                              <path d="M9 2v3h3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate text-sm mb-0.5">
                            {result.label}
                          </div>
                          <div className="text-[#666] text-xs font-mono truncate">
                            {result.path}
                          </div>
                        </div>
                        {index === selectedIndex && (
                          <kbd className="flex-shrink-0 px-2 py-1 bg-[#0d0d0d] border border-[#333] rounded text-xs text-[#666] font-mono">
                            ↵
                          </kbd>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {query && results.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center">
                      <Search size={20} className="text-[#666]" />
                    </div>
                    <p className="text-[#888] text-sm font-medium mb-1">No results found</p>
                    <p className="text-[#666] text-xs">Try a different search term</p>
                  </div>
                )}

                {/* Help text */}
                {!query && (
                  <div className="px-5 py-3 text-[#666] text-xs border-t border-[#1f1f1f] bg-[#0a0a0a]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono">↑</kbd>
                          <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono">↓</kbd>
                          <span className="text-[#666]">Navigate</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono">↵</kbd>
                          <span className="text-[#666]">Select</span>
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono">ESC</kbd>
                        <span className="text-[#666]">Close</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
