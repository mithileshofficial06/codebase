/**
 * Premium SVG Icon System
 * Replaces all emoji with animated, gradient-capable SVG icons
 */

export const FlowIcons = {
  Authentication: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="auth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path
        d="M10 2L3 6v4c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-4z"
        stroke="url(#auth-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="10" cy="10" r="2" fill="url(#auth-gradient)" />
    </svg>
  ),

  ApiRequest: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="api-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M3 10h4m10 0h-4m-3-7v4m0 10v-4"
        stroke="url(#api-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="3" stroke="url(#api-gradient)" strokeWidth="1.5" fill="none" />
    </svg>
  ),

  Registration: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="reg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M4 17v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke="url(#reg-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6" r="3" stroke="url(#reg-gradient)" strokeWidth="1.5" fill="none" />
      <path d="M16 7v4m-2-2h4" stroke="url(#reg-gradient)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  Database: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="db-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <ellipse cx="10" cy="5" rx="6" ry="2" stroke="url(#db-gradient)" strokeWidth="1.5" fill="none" />
      <path
        d="M4 5v6c0 1.1 2.7 2 6 2s6-.9 6-2V5"
        stroke="url(#db-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 11v4c0 1.1 2.7 2 6 2s6-.9 6-2v-4"
        stroke="url(#db-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  UiRender: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <defs>
        <linearGradient id="ui-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect
        x="3" y="3" width="14" height="14" rx="2"
        stroke="url(#ui-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M3 8h14M8 8v9" stroke="url(#ui-gradient)" strokeWidth="1.5" />
    </svg>
  ),
};

export const ComplexityIndicator = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: { from: '#10b981', to: '#059669' },
    medium: { from: '#f59e0b', to: '#f97316' },
    high: { from: '#ef4444', to: '#dc2626' },
  };

  const bars = level === 'low' ? 1 : level === 'medium' ? 2 : 3;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <defs>
        <linearGradient id={`complexity-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[level].from} />
          <stop offset="100%" stopColor={colors[level].to} />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 5 + 2}
          y={12 - i * 3}
          width="3"
          height={i * 3 + 4}
          rx="1"
          fill={i < bars ? `url(#complexity-${level})` : '#1a1a1a'}
          opacity={i < bars ? 1 : 0.3}
        />
      ))}
    </svg>
  );
};

export const RiskIndicator = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <defs>
        <linearGradient id={`risk-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[level]} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors[level]} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke={colors[level]}
        strokeWidth="1.5"
        fill={`url(#risk-${level})`}
        opacity="0.6"
      />
      <path
        d="M8 5v3m0 2h.01"
        stroke={colors[level]}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const SystemTypeIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    entry: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
        <circle cx="7" cy="7" r="2" fill="#3b82f6" />
      </svg>
    ),
    route: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M7 2l5 5-5 5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    middleware: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="5" width="10" height="4" rx="1" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
        <path d="M5 7h4" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    service: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="4" stroke="#10b981" strokeWidth="1.5" fill="none" />
        <path d="M7 4v6M4 7h6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    model: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
        <path d="M3 6h8M6 3v8" stroke="#06b6d4" strokeWidth="1.5" />
      </svg>
    ),
    database: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <ellipse cx="7" cy="4" rx="4" ry="1.5" stroke="#ef4444" strokeWidth="1.5" fill="none" />
        <path d="M3 4v4c0 .8 1.8 1.5 4 1.5s4-.7 4-1.5V4" stroke="#ef4444" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    ui: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="#a855f7" strokeWidth="1.5" fill="none" />
        <path d="M2 5h10" stroke="#a855f7" strokeWidth="1.5" />
      </svg>
    ),
    utility: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M3 7l4-4 4 4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return iconMap[type] || iconMap.utility;
};

export const PlaybackIcons = {
  Play: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M4 2l10 6-10 6V2z" fill="currentColor" />
    </svg>
  ),

  Pause: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="4" y="2" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="9" y="2" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  ),

  Reset: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2 8a6 6 0 0 1 9-5.2M14 8a6 6 0 0 1-9 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M11 2v3h-3M5 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
