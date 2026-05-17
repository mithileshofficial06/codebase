'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link2, Map, MessageCircle } from 'lucide-react';
import AuroraBackground from '@/components/landing/AuroraBackground';
import HeroTitle from '@/components/landing/HeroTitle';

type PageState = 'landing' | 'transitioning';

/* ─── Helper: IntersectionObserver for fade-up ─────────────────── */
function useFadeUpObserver() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const els = document.querySelectorAll('.fade-up');
    els.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);
}

/* ─── Helper: Animate number count-up ──────────────────────────── */
function useCountUp(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, value };
}

/* ─── Sticky Nav Component ─────────────────────────────────────── */
function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="url(#nav-grad)" strokeWidth="2" />
          <circle cx="8" cy="10" r="2" fill="#a855f7" />
          <circle cx="16" cy="10" r="2" fill="#3b82f6" />
          <circle cx="12" cy="16" r="2" fill="#6366f1" />
          <line x1="8" y1="10" x2="16" y2="10" stroke="#333" strokeWidth="1" />
          <line x1="8" y1="10" x2="12" y2="16" stroke="#333" strokeWidth="1" />
          <line x1="16" y1="10" x2="12" y2="16" stroke="#333" strokeWidth="1" />
          <defs>
            <linearGradient id="nav-grad" x1="0" y1="0" x2="24" y2="24">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        CodeMap
      </div>
      <button className="nav-cta" onClick={scrollToTop}>
        Analyze a Repo →
      </button>
    </nav>
  );
}

/* ─── Hero Dependency Graph SVG ────────────────────────────────── */
function HeroDependencyGraph() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12" style={{ aspectRatio: '16/9' }}>
      <svg viewBox="0 0 640 360" width="100%" height="100%" className="opacity-90">
        {/* Edges — animate drawing in */}
        <line className="edge-line" x1="120" y1="180" x2="280" y2="100" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="120" y1="180" x2="280" y2="260" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="280" y1="100" x2="440" y2="140" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="280" y1="260" x2="440" y2="220" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="440" y1="140" x2="540" y2="180" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="440" y1="220" x2="540" y2="180" stroke="#333" strokeWidth="1.5" />
        <line className="edge-line" x1="280" y1="100" x2="280" y2="260" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />

        {/* Nodes */}
        <g className="graph-node" style={{ transformOrigin: '120px 180px' }}>
          <circle cx="120" cy="180" r="22" fill="#0d0d0d" stroke="#6366f1" strokeWidth="2" />
          <text x="120" y="184" textAnchor="middle" fill="#888" fontSize="8" fontFamily="var(--font-mono)">index.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '280px 100px' }}>
          <circle cx="280" cy="100" r="18" fill="#0d0d0d" stroke="#10b981" strokeWidth="2" />
          <text x="280" y="104" textAnchor="middle" fill="#888" fontSize="7" fontFamily="var(--font-mono)">auth.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '280px 260px' }}>
          <circle cx="280" cy="260" r="20" fill="#0d0d0d" stroke="#3b82f6" strokeWidth="2" />
          <text x="280" y="264" textAnchor="middle" fill="#888" fontSize="7" fontFamily="var(--font-mono)">api.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '440px 140px' }}>
          <circle cx="440" cy="140" r="16" fill="#0d0d0d" stroke="#a855f7" strokeWidth="2" />
          <text x="440" y="144" textAnchor="middle" fill="#888" fontSize="7" fontFamily="var(--font-mono)">db.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '440px 220px' }}>
          <circle cx="440" cy="220" r="15" fill="#0d0d0d" stroke="#f59e0b" strokeWidth="2" />
          <text x="440" y="224" textAnchor="middle" fill="#888" fontSize="7" fontFamily="var(--font-mono)">utils.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '540px 180px' }}>
          <circle cx="540" cy="180" r="24" fill="#0d0d0d" stroke="#ef4444" strokeWidth="2" />
          <text x="540" y="184" textAnchor="middle" fill="#888" fontSize="7" fontFamily="var(--font-mono)">config.ts</text>
        </g>
      </svg>
    </div>
  );
}

/* ─── Feature Graph SVG (simpler) ──────────────────────────────── */
function FeatureGraphSVG() {
  return (
    <div className="visual-card" style={{ aspectRatio: '16/10' }}>
      <svg viewBox="0 0 400 250" width="100%" height="100%">
        {/* Edges */}
        <line x1="80" y1="125" x2="180" y2="70" stroke="#222" strokeWidth="1.5" />
        <line x1="80" y1="125" x2="180" y2="180" stroke="#222" strokeWidth="1.5" />
        <line x1="180" y1="70" x2="300" y2="95" stroke="#222" strokeWidth="1.5" />
        <line x1="180" y1="180" x2="300" y2="155" stroke="#222" strokeWidth="1.5" />
        <line x1="300" y1="95" x2="300" y2="155" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="3 3" />
        {/* Nodes */}
        <circle cx="80" cy="125" r="18" fill="#0d0d0d" stroke="#6366f1" strokeWidth="2" />
        <text x="80" y="129" textAnchor="middle" fill="#777" fontSize="7" fontFamily="var(--font-mono)">app.ts</text>
        <circle cx="180" cy="70" r="14" fill="#0d0d0d" stroke="#10b981" strokeWidth="2" />
        <text x="180" y="74" textAnchor="middle" fill="#777" fontSize="7" fontFamily="var(--font-mono)">routes</text>
        <circle cx="180" cy="180" r="16" fill="#0d0d0d" stroke="#3b82f6" strokeWidth="2" />
        <text x="180" y="184" textAnchor="middle" fill="#777" fontSize="7" fontFamily="var(--font-mono)">models</text>
        <circle cx="300" cy="95" r="12" fill="#0d0d0d" stroke="#a855f7" strokeWidth="2" />
        <text x="300" y="99" textAnchor="middle" fill="#777" fontSize="6" fontFamily="var(--font-mono)">ctrl</text>
        <circle cx="300" cy="155" r="13" fill="#0d0d0d" stroke="#f59e0b" strokeWidth="2" />
        <text x="300" y="159" textAnchor="middle" fill="#777" fontSize="6" fontFamily="var(--font-mono)">svc</text>
      </svg>
    </div>
  );
}

/* ─── Hotspot File List Visual ─────────────────────────────────── */
function HotspotVisual() {
  const files = [
    { name: 'src/auth/session.ts', changes: 74, level: 'high' as const },
    { name: 'src/api/handler.ts', changes: 52, level: 'medium' as const },
    { name: 'src/db/connection.ts', changes: 38, level: 'medium' as const },
    { name: 'src/utils/format.ts', changes: 12, level: 'low' as const },
    { name: 'src/config/env.ts', changes: 5, level: 'low' as const },
  ];

  return (
    <div className="visual-card p-5">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
        <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">Hotspot Analysis</span>
      </div>
      <div className="flex flex-col gap-1">
        {files.map((f) => (
          <div key={f.name} className="hotspot-file">
            <span className="file-name">
              <span className="file-icon" />
              {f.name}
            </span>
            <span className={`hotspot-badge ${f.level}`}>
              {f.changes} changes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Health Score Ring ─────────────────────────────────────────── */
function HealthScoreRing({ score }: { score: number }) {
  const { ref, value } = useCountUp(score, 1500);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 100;
  const offset = circumference * (1 - progress);

  let strokeColor = '#10b981'; // green >70
  if (value <= 40) strokeColor = '#ef4444'; // red <40
  else if (value <= 70) strokeColor = '#f59e0b'; // amber 40-70

  return (
    <div ref={ref} className="health-ring-container">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg className="health-ring-svg" width="140" height="140" viewBox="0 0 120 120">
          <circle className="health-ring-bg" cx="60" cy="60" r={radius} />
          <circle
            className="health-ring-progress"
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black" style={{ color: strokeColor }}>{value}</span>
        </div>
      </div>
      <span className="health-label">Health Score</span>
    </div>
  );
}

/* ─── Chat Preview ─────────────────────────────────────────────── */
function ChatPreview() {
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResponse(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="visual-card" style={{ height: 320 }}>
      <div className="chat-container">
        <div className="chat-bubble user">
          How is authentication handled?
        </div>

        {!showResponse && (
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        )}

        {showResponse && (
          <div className="chat-bubble ai">
            <div className="ai-avatar">AI</div>
            <div>
              Authentication is handled in{' '}
              <span className="text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded text-xs">
                src/auth/session.ts
              </span>{' '}
              which exports the <span className="text-white font-medium">verifyToken</span> function.
              It is used across 12 different API routes via middleware.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Footer ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 CodeMap. All rights reserved.</span>
      <span style={{ color: '#444' }}>Understand any codebase, instantly.</span>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [state, setState] = useState<PageState>('landing');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();

  useFadeUpObserver();

  const isValid = /github\.com\/[\w.-]+\/[\w.-]+/.test(inputValue);

  const handleSubmit = useCallback(
    (url: string) => {
      if (!isValid) return;
      setState('transitioning');
      setTimeout(() => {
        const encoded = encodeURIComponent(url.trim());
        router.push(`/analyze/${encoded}`);
      }, 1200);
    },
    [router, isValid]
  );

  return (
    <>
      <AuroraBackground />
      <StickyNav />

      <main className="relative z-10 w-full overflow-hidden" style={{ paddingTop: 64 }}>
        {/* Top subtle radial gradient spotlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }}
        />

        {/* ═══ HERO SECTION ═══ */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center py-20 relative">
          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div
                key="landing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-10 px-6 w-full max-w-4xl mx-auto"
              >
                <HeroTitle />

                {/* URL Input Box */}
                <div className="hero-input-box">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                    placeholder="github.com/vercel/next.js"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    className="analyze-btn"
                    disabled={!isValid}
                    onClick={() => handleSubmit(inputValue)}
                  >
                    Analyze →
                  </button>
                </div>

                {/* Hero Dependency Graph */}
                <HeroDependencyGraph />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ═══ STATS SECTION ═══ */}
        <section className="py-20 px-6">
          <div className="fade-up">
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Languages supported</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">Zero</div>
                <div className="stat-label">Setup required</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">Free</div>
                <div className="stat-label">Forever for public repos</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="border-t border-[#111111] py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 fade-up">
              <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
              <p className="text-[#888888]">Three simple steps to codebase mastery.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="icon-card fade-up" style={{ transitionDelay: '0ms' }}>
                <div className="icon-box link-icon">
                  <Link2 size={22} />
                </div>
                <h3>Paste a GitHub URL</h3>
                <p>Any public repository. No install, no signup, no setup required.</p>
              </div>

              {/* Card 2 */}
              <div className="icon-card fade-up" style={{ transitionDelay: '100ms' }}>
                <div className="icon-box map-icon">
                  <Map size={22} />
                </div>
                <h3>Explore the Map</h3>
                <p>Every file becomes a node. Every import becomes an edge. Instantly visual.</p>
              </div>

              {/* Card 3 */}
              <div className="icon-card fade-up" style={{ transitionDelay: '200ms' }}>
                <div className="icon-box chat-icon">
                  <MessageCircle size={22} />
                </div>
                <h3>Ask Anything</h3>
                <p>Chat with your codebase. Get answers that reference your actual files.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE 1: Graph Visualization ═══ */}
        <section className="border-t border-[#111111] py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="feature-row fade-up">
              <div className="feature-text">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">See the full picture instantly</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Stop grep-ing through files. CodeMap builds a live interactive dependency graph from real import analysis — not guesswork.
                </p>
              </div>
              <div className="feature-visual">
                <FeatureGraphSVG />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE 2: Hotspots ═══ */}
        <section className="border-t border-[#111111] py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Know what&apos;s risky before you touch it</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Hotspot detection surfaces the files changed most frequently — the ones where bugs cluster and changes cascade.
                </p>
              </div>
              <div className="feature-visual">
                <HotspotVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE 3: Health Score + AI Chat ═══ */}
        <section className="border-t border-[#111111] py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col gap-32">
            {/* Health Score */}
            <div className="feature-row fade-up">
              <div className="feature-text">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Codebase health at a glance</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  A single score that reflects coupling, complexity, and churn. See which areas need attention before problems arise.
                </p>
              </div>
              <div className="feature-visual">
                <div className="visual-card flex items-center justify-center" style={{ padding: '3rem', aspectRatio: '4/3' }}>
                  <HealthScoreRing score={74} />
                </div>
              </div>
            </div>

            {/* AI Chat */}
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ask your codebase anything</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Powered by Gemini. Answers reference your actual file names and real dependency relationships — not generic advice.
                </p>
              </div>
              <div className="feature-visual">
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section className="border-t border-[#1a1a1a] py-32 bg-[#050505] relative z-20 px-6">
          <div className="max-w-4xl mx-auto text-center fade-up">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
              Ready to understand your codebase?
            </h2>
            <div className="flex justify-center">
              <div className="hero-input-box">
                <input
                  type="text"
                  placeholder="github.com/vercel/next.js"
                  spellCheck={false}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (/github\.com\/[\w.-]+\/[\w.-]+/.test(val)) {
                        handleSubmit(val);
                      }
                    }
                  }}
                />
                <button className="analyze-btn" onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('section:last-of-type input');
                  if (input && /github\.com\/[\w.-]+\/[\w.-]+/.test(input.value)) {
                    handleSubmit(input.value);
                  }
                }}>
                  Analyze →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
        
        {/* Aurora compress effect during transition */}
        <AnimatePresence>
          {state === 'transitioning' && (
            <motion.div
              key="transition-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ background: '#080808' }}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
