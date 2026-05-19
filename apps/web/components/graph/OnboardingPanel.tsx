'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '@/store/graphStore';
import { Sparkles, ArrowRight } from 'lucide-react';

export function OnboardingPanel() {
  const {
    clusters,
    onboardingDismissed,
    onboardingData,
    onboardingLoading,
    dismissOnboarding,
    setOnboardingData,
    setOnboardingLoading,
  } = useGraphStore();

  // Fetch onboarding summary from Gemini
  useEffect(() => {
    if (onboardingDismissed || onboardingData || onboardingLoading || clusters.length === 0) return;

    setOnboardingLoading(true);

    const compactClusters = clusters.map(c => ({
      humanLabel: c.humanLabel,
      fileCount: c.fileCount,
      totalSize: c.totalSize,
      isEntryPoint: c.isEntryPoint,
      hotspotCount: c.hotspotCount,
    }));

    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clusters: compactClusters }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.summary) {
          setOnboardingData(data.summary);
        } else {
          setOnboardingData(null);
        }
      })
      .catch(() => setOnboardingData(null))
      .finally(() => setOnboardingLoading(false));
  }, [clusters, onboardingDismissed, onboardingData, onboardingLoading, setOnboardingData, setOnboardingLoading]);

  if (onboardingDismissed) return null;

  // Build fallback content if AI is not available
  const fallbackContent = clusters.length > 0 ? (
    <div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 12, lineHeight: 1.6 }}>
        This repository contains <strong style={{ color: '#ccc' }}>{clusters.length} modules</strong>:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {clusters.slice(0, 6).map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: c.color,
              flexShrink: 0,
              boxShadow: `0 0 4px ${c.color}50`,
            }} />
            <span style={{ fontSize: 11, color: '#bbb' }}>{c.humanLabel}</span>
            <span style={{ fontSize: 9, color: '#555', marginLeft: 'auto' }}>{c.fileCount} files</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // Parse AI content into styled sections
  const renderContent = () => {
    if (onboardingLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 11 }}>
          <div style={{
            width: 12,
            height: 12,
            border: '2px solid #333',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Analyzing architecture...
        </div>
      );
    }

    if (onboardingData) {
      // Render markdown-ish content
      const lines = onboardingData.split('\n').filter(l => l.trim());
      return (
        <div style={{ fontSize: 11, color: '#999', lineHeight: 1.7 }}>
          {lines.map((line, i) => {
            const trimmed = line.trim();
            // Bold headers
            if (trimmed.startsWith('**') && trimmed.includes(':**')) {
              const headerMatch = trimmed.match(/\*\*(.+?):\*\*\s*(.*)/);
              if (headerMatch) {
                return (
                  <div key={i} style={{ marginTop: i > 0 ? 10 : 0, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {headerMatch[1]}
                    </span>
                    {headerMatch[2] && (
                      <div style={{ color: '#ccc', marginTop: 2 }}>{headerMatch[2]}</div>
                    )}
                  </div>
                );
              }
            }
            // Bullet points
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              return (
                <div key={i} style={{ paddingLeft: 8, color: '#aaa' }}>
                  {trimmed}
                </div>
              );
            }
            // Numbered items
            if (/^\d+\./.test(trimmed)) {
              return (
                <div key={i} style={{ paddingLeft: 8, color: '#aaa' }}>
                  {trimmed}
                </div>
              );
            }
            return <div key={i}>{trimmed}</div>;
          })}
        </div>
      );
    }

    return fallbackContent;
  };

  return (
    <AnimatePresence>
      {!onboardingDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            maxHeight: '70vh',
            overflowY: 'auto',
            background: 'rgba(10,10,10,0.94)',
            backdropFilter: 'blur(24px)',
            border: '1px solid #1f1f1f',
            borderRadius: 16,
            padding: 24,
            zIndex: 30,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.05)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#eee' }}>
                Project Overview
              </div>
              <div style={{ fontSize: 9, color: '#555' }}>
                AI-generated architecture summary
              </div>
            </div>
          </div>

          {/* Content */}
          {renderContent()}

          {/* CTA */}
          <button
            onClick={dismissOnboarding}
            style={{
              marginTop: 20,
              width: '100%',
              height: 36,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Explore Architecture <ArrowRight size={13} />
          </button>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OnboardingPanel;
