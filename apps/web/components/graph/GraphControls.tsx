'use client';

import { useGraphStore, ViewLevel } from '@/store/graphStore';
import { ChevronLeft } from 'lucide-react';

const LEVEL_CONFIG: { id: ViewLevel; label: string; icon: string }[] = [
  { id: 'architecture', label: 'Architecture', icon: '🏗' },
  { id: 'module', label: 'Modules', icon: '📦' },
  { id: 'file', label: 'Files', icon: '📄' },
];

export function LevelSwitcher() {
  const { viewLevel, setViewLevel, expandedCluster, collapseCluster, clusters } = useGraphStore();

  const expandedClusterName = expandedCluster
    ? clusters.find(c => c.id === expandedCluster)?.humanLabel || expandedCluster
    : null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid #1f1f1f',
        borderRadius: 12,
        padding: 4,
        zIndex: 20,
      }}
    >
      {/* Back button (shown in module view) */}
      {viewLevel === 'module' && expandedCluster && (
        <button
          onClick={collapseCluster}
          style={{
            height: 30,
            width: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #1f1f1f',
            borderRadius: 8,
            cursor: 'pointer',
            color: '#888',
            flexShrink: 0,
            transition: 'all 200ms ease',
          }}
          title="Back to Architecture"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      {/* Level buttons */}
      {LEVEL_CONFIG.map((level) => {
        const isActive = viewLevel === level.id;
        const isModuleWithoutCluster = level.id === 'module' && !expandedCluster && viewLevel !== 'module';

        return (
          <button
            key={level.id}
            onClick={() => {
              if (level.id === 'module' && !expandedCluster) return;
              setViewLevel(level.id);
            }}
            style={{
              height: 30,
              paddingLeft: 10,
              paddingRight: 12,
              fontSize: 11,
              fontFamily: 'var(--font-body, sans-serif)',
              fontWeight: 500,
              color: isActive ? '#ffffff' : isModuleWithoutCluster ? '#333' : '#666',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: isModuleWithoutCluster ? 'default' : 'pointer',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: isModuleWithoutCluster ? 0.4 : 1,
            }}
          >
            <span style={{ fontSize: 13 }}>{level.icon}</span>
            {level.label}
          </button>
        );
      })}

      {/* Breadcrumb for module view */}
      {viewLevel === 'module' && expandedClusterName && (
        <div style={{
          height: 30,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          paddingRight: 12,
          borderLeft: '1px solid #1f1f1f',
          marginLeft: 2,
        }}>
          <span style={{
            fontSize: 10,
            color: '#888',
            fontFamily: 'var(--font-code, monospace)',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {expandedClusterName}
          </span>
        </div>
      )}
    </div>
  );
}

/* Keep FilterBar export for backward compatibility */
export const FilterBar = LevelSwitcher;
export default LevelSwitcher;
