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
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-[#888] text-sm hover:border-[#333] hover:text-white transition-all duration-200 shadow-lg"
      >
        <Search size={16} />
        <span>Search graph...</span>
        <kbd className="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-xs font-mono">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f]">
                  <Search size={20} className="text-[#666]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search files, modules, or systems..."
                    className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-[#666]"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="text-[#666] hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-[#1a1a1a]'
                            : 'hover:bg-[#151515]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-sm">
                          {result.type === 'cluster' ? '📦' : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {result.label}
                          </div>
                          <div className="text-[#666] text-sm font-mono truncate">
                            {result.path}
                          </div>
                        </div>
                        {index === selectedIndex && (
                          <kbd className="flex-shrink-0 px-2 py-1 bg-[#0d0d0d] border border-[#333] rounded text-xs text-[#888]">
                            ↵
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {query && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-[#666]">
                    No results found for "{query}"
                  </div>
                )}

                {/* Help text */}
                {!query && (
                  <div className="px-4 py-3 text-[#666] text-sm border-t border-[#1f1f1f]">
                    <div className="flex items-center justify-between">
                      <span>Navigate with ↑↓ • Select with ↵</span>
                      <span>ESC to close</span>
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
