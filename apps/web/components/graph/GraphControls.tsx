'use client';

import { useGraphStore, FilterType } from '@/store/graphStore';

const FILTER_COLORS: Record<string, string> = {
  all: '#888888',
  core: '#3b82f6',
  hotspot: '#ef4444',
  stable: '#10b981',
  utility: '#4b5563',
};

const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  core: 'Core',
  hotspot: 'Hotspot',
  stable: 'Stable',
  utility: 'Utility',
};

export function FilterBar() {
  const { activeFilter, setActiveFilter } = useGraphStore();

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid #1f1f1f',
        borderRadius: 9999,
        padding: 4,
        zIndex: 20,
      }}
    >
      {(['all', 'core', 'hotspot', 'stable', 'utility'] as FilterType[]).map((filter) => {
        const isActive = activeFilter === filter;
        const color = FILTER_COLORS[filter];
        return (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              height: 28,
              paddingLeft: 12,
              paddingRight: 12,
              fontSize: 11,
              fontFamily: 'var(--font-code, monospace)',
              fontWeight: 500,
              color: isActive ? color : '#555555',
              background: isActive ? `${color}20` : 'transparent',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {FILTER_LABELS[filter]}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
