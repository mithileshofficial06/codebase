'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link2, Map, MessageCircle } from 'lucide-react';
import AuroraBackground from '@/components/landing/AuroraBackground';
import HeroTitle from '@/components/landing/HeroTitle';

type PageState = 'landing' | 'transitioning';

/* ─── IntersectionObserver for fade-up ─────────────────────────── */
function useFadeUpObserver() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    const els = document.querySelectorAll('.fade-up');
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);
}

/* ─── Animate count-up ─────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 1400) {
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

/* ═══ Nav ═══════════════════════════════════════════════════════════ */
function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="#818cf8">
          <circle cx="7" cy="9" r="2.5" />
          <circle cx="17" cy="9" r="2.5" />
          <circle cx="12" cy="17" r="2.5" />
          <line x1="9.2" y1="10" x2="14.8" y2="10" stroke="#3f3f46" />
          <line x1="8" y1="11.2" x2="10.8" y2="15.2" stroke="#3f3f46" />
          <line x1="16" y1="11.2" x2="13.2" y2="15.2" stroke="#3f3f46" />
        </svg>
        CodeMap
      </div>
      <button className="nav-cta" onClick={scrollToTop}>
        Analyze a Repo →
      </button>
    </nav>
  );
}

/* ═══ Hero Dependency Graph ═════════════════════════════════════════ */
function HeroDependencyGraph() {
  return (
    <div className="w-full max-w-xl mx-auto mt-10" style={{ aspectRatio: '16/9' }}>
      <svg viewBox="0 0 640 360" width="100%" height="100%" style={{ opacity: 0.6 }}>
        {/* Edges */}
        <line className="edge-line" x1="120" y1="180" x2="280" y2="100" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="120" y1="180" x2="280" y2="260" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="280" y1="100" x2="440" y2="140" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="280" y1="260" x2="440" y2="220" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="440" y1="140" x2="540" y2="180" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="440" y1="220" x2="540" y2="180" stroke="#27272a" strokeWidth="1" />
        <line className="edge-line" x1="280" y1="100" x2="280" y2="260" stroke="#1c1c1f" strokeWidth="1" strokeDasharray="4 4" />

        {/* Nodes */}
        <g className="graph-node" style={{ transformOrigin: '120px 180px' }}>
          <circle cx="120" cy="180" r="20" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
          <text x="120" y="183" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="var(--font-mono)">index.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '280px 100px' }}>
          <circle cx="280" cy="100" r="16" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
          <text x="280" y="103" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="var(--font-mono)">auth.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '280px 260px' }}>
          <circle cx="280" cy="260" r="18" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
          <text x="280" y="263" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="var(--font-mono)">api.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '440px 140px' }}>
          <circle cx="440" cy="140" r="14" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
          <text x="440" y="143" textAnchor="middle" fill="#71717a" fontSize="6.5" fontFamily="var(--font-mono)">db.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '440px 220px' }}>
          <circle cx="440" cy="220" r="13" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
          <text x="440" y="223" textAnchor="middle" fill="#71717a" fontSize="6.5" fontFamily="var(--font-mono)">utils.ts</text>
        </g>
        <g className="graph-node" style={{ transformOrigin: '540px 180px' }}>
          <circle cx="540" cy="180" r="22" fill="#111113" stroke="#818cf8" strokeWidth="1.5" />
          <text x="540" y="183" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontFamily="var(--font-mono)">config.ts</text>
        </g>
      </svg>
    </div>
  );
}

/* ═══ Feature Graph SVG ═════════════════════════════════════════════ */
function FeatureGraphSVG() {
  return (
    <div className="visual-card" style={{ aspectRatio: '16/10' }}>
      <svg viewBox="0 0 400 250" width="100%" height="100%">
        <line x1="80" y1="125" x2="180" y2="70" stroke="#27272a" strokeWidth="1" />
        <line x1="80" y1="125" x2="180" y2="180" stroke="#27272a" strokeWidth="1" />
        <line x1="180" y1="70" x2="300" y2="95" stroke="#27272a" strokeWidth="1" />
        <line x1="180" y1="180" x2="300" y2="155" stroke="#27272a" strokeWidth="1" />
        <line x1="300" y1="95" x2="300" y2="155" stroke="#1c1c1f" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="80" cy="125" r="16" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
        <text x="80" y="128" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="var(--font-mono)">app.ts</text>
        <circle cx="180" cy="70" r="12" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
        <text x="180" y="73" textAnchor="middle" fill="#71717a" fontSize="6.5" fontFamily="var(--font-mono)">routes</text>
        <circle cx="180" cy="180" r="14" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
        <text x="180" y="183" textAnchor="middle" fill="#71717a" fontSize="6.5" fontFamily="var(--font-mono)">models</text>
        <circle cx="300" cy="95" r="11" fill="#111113" stroke="#818cf8" strokeWidth="1" />
        <text x="300" y="98" textAnchor="middle" fill="#a1a1aa" fontSize="6" fontFamily="var(--font-mono)">ctrl</text>
        <circle cx="300" cy="155" r="12" fill="#111113" stroke="#3f3f46" strokeWidth="1" />
        <text x="300" y="158" textAnchor="middle" fill="#71717a" fontSize="6" fontFamily="var(--font-mono)">svc</text>
      </svg>
    </div>
  );
}

/* ═══ Hotspot File List ═════════════════════════════════════════════ */
function HotspotVisual() {
  const files = [
    { name: 'src/auth/session.ts', changes: 74, level: 'high' as const },
    { name: 'src/api/handler.ts', changes: 52, level: 'medium' as const },
    { name: 'src/db/connection.ts', changes: 38, level: 'medium' as const },
    { name: 'src/utils/format.ts', changes: 12, level: 'low' as const },
    { name: 'src/config/env.ts', changes: 5, level: 'low' as const },
  ];

  return (
    <div className="visual-card p-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Hotspot Analysis
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
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

/* ═══ Health Score Ring ═════════════════════════════════════════════ */
function HealthScoreRing({ score }: { score: number }) {
  const { ref, value } = useCountUp(score, 1400);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 100;
  const offset = circumference * (1 - progress);

  let strokeColor = '#34d399'; // green >70
  if (value <= 40) strokeColor = '#f87171'; // red <40
  else if (value <= 70) strokeColor = '#fbbf24'; // amber 40-70

  return (
    <div ref={ref} className="health-ring-container">
      <div className="relative" style={{ width: 130, height: 130 }}>
        <svg className="health-ring-svg" width="130" height="130" viewBox="0 0 110 110">
          <circle className="health-ring-bg" cx="55" cy="55" r={radius} />
          <circle
            className="health-ring-progress"
            cx="55"
            cy="55"
            r={radius}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl tracking-[-0.02em]"
            style={{ color: strokeColor, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </span>
        </div>
      </div>
      <span className="health-label">Health Score</span>
    </div>
  );
}

/* ═══ Chat Preview ═════════════════════════════════════════════════ */
function ChatPreview() {
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResponse(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="visual-card" style={{ height: 300 }}>
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
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#818cf8',
                  background: 'rgba(129, 140, 248, 0.08)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                }}
              >
                src/auth/session.ts
              </span>{' '}
              which exports <span style={{ color: '#fafafa', fontWeight: 500 }}>verifyToken</span>.
              It is used across 12 API routes via middleware.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Footer ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 CodeMap</span>
      <span>Understand any codebase, instantly.</span>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
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
      if (!/github\.com\/[\w.-]+\/[\w.-]+/.test(url)) return;
      setState('transitioning');
      setTimeout(() => {
        const encoded = encodeURIComponent(url.trim());
        router.push(`/analyze/${encoded}`);
      }, 1000);
    },
    [router]
  );

  return (
    <>
      <AuroraBackground />
      <StickyNav />

      <main className="relative z-10 w-full overflow-hidden" style={{ paddingTop: 56 }}>

        {/* ═══ HERO ═══ */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center py-16 relative px-6">
          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div
                key="landing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto"
              >
                <HeroTitle />

                {/* URL Input */}
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

                <HeroDependencyGraph />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="py-16 px-6">
          <div className="fade-up">
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Languages</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">Zero</div>
                <div className="stat-label">Setup</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">Free</div>
                <div className="stat-label">Public repos</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="border-t border-[#27272a] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 fade-up">
              <div className="section-label">How it works</div>
              <h2 className="text-2xl md:text-3xl tracking-[-0.03em]" style={{ fontWeight: 600, color: '#fafafa' }}>
                Three steps to clarity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="icon-card fade-up" style={{ transitionDelay: '0ms' }}>
                <div className="icon-box">
                  <Link2 size={18} strokeWidth={1.5} />
                </div>
                <h3>Paste a GitHub URL</h3>
                <p>Any public repository. No install, no signup, no setup.</p>
              </div>

              <div className="icon-card fade-up" style={{ transitionDelay: '100ms' }}>
                <div className="icon-box">
                  <Map size={18} strokeWidth={1.5} />
                </div>
                <h3>Explore the map</h3>
                <p>Every file becomes a node. Every import becomes an edge.</p>
              </div>

              <div className="icon-card fade-up" style={{ transitionDelay: '200ms' }}>
                <div className="icon-box">
                  <MessageCircle size={18} strokeWidth={1.5} />
                </div>
                <h3>Ask anything</h3>
                <p>Chat with your codebase. Get answers that reference real files.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE: Graph ═══ */}
        <section className="border-t border-[#27272a] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="feature-row fade-up">
              <div className="feature-text">
                <div className="section-label">Visualization</div>
                <h2 className="text-2xl md:text-3xl tracking-[-0.03em] mb-4" style={{ fontWeight: 600, color: '#fafafa' }}>
                  See the full picture
                </h2>
                <p style={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  CodeMap builds a live interactive dependency graph from real import analysis. No guesswork, no configuration — just paste and see.
                </p>
              </div>
              <div className="feature-visual">
                <FeatureGraphSVG />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE: Hotspots ═══ */}
        <section className="border-t border-[#27272a] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <div className="section-label">Risk detection</div>
                <h2 className="text-2xl md:text-3xl tracking-[-0.03em] mb-4" style={{ fontWeight: 600, color: '#fafafa' }}>
                  Know what&apos;s risky
                </h2>
                <p style={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Hotspot detection surfaces the files changed most frequently — the ones where bugs cluster and changes cascade.
                </p>
              </div>
              <div className="feature-visual">
                <HotspotVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE: Health + Chat ═══ */}
        <section className="border-t border-[#27272a] py-24 px-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-24">
            {/* Health */}
            <div className="feature-row fade-up">
              <div className="feature-text">
                <div className="section-label">Health score</div>
                <h2 className="text-2xl md:text-3xl tracking-[-0.03em] mb-4" style={{ fontWeight: 600, color: '#fafafa' }}>
                  Codebase health at a glance
                </h2>
                <p style={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  A single score reflecting coupling, complexity, and churn. See what needs attention before problems arise.
                </p>
              </div>
              <div className="feature-visual">
                <div className="visual-card flex items-center justify-center" style={{ padding: '2.5rem', aspectRatio: '4/3' }}>
                  <HealthScoreRing score={74} />
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <div className="section-label">AI analysis</div>
                <h2 className="text-2xl md:text-3xl tracking-[-0.03em] mb-4" style={{ fontWeight: 600, color: '#fafafa' }}>
                  Ask your codebase anything
                </h2>
                <p style={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Powered by Gemini. Answers reference your actual file names and real dependency relationships.
                </p>
              </div>
              <div className="feature-visual">
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="border-t border-[#27272a] py-24 px-6" style={{ background: '#09090b' }}>
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h2
              className="text-3xl md:text-4xl tracking-[-0.03em] mb-6"
              style={{ fontWeight: 600, color: '#fafafa' }}
            >
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
                      if (/github\.com\/[\w.-]+\/[\w.-]+/.test(val)) handleSubmit(val);
                    }
                  }}
                />
                <button className="analyze-btn" onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('section:last-of-type input');
                  if (input && /github\.com\/[\w.-]+\/[\w.-]+/.test(input.value)) handleSubmit(input.value);
                }}>
                  Analyze →
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Transition overlay */}
        <AnimatePresence>
          {state === 'transitioning' && (
            <motion.div
              key="transition-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ background: '#09090b' }}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
