'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link2, Map, MessageCircle } from 'lucide-react';
import AuroraBackground from '@/components/landing/AuroraBackground';
import HeroTitle from '@/components/landing/HeroTitle';

type PageState = 'landing' | 'transitioning';

function useFadeUpObserver() {
  const ref = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    ref.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.fade-up').forEach((el) => ref.current?.observe(el));
    return () => ref.current?.disconnect();
  }, []);
}

function useCountUp(target: number, dur = 1400) {
  const [val, setVal] = useState(0);
  const elRef = useRef<HTMLDivElement | null>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const s = performance.now();
        const tick = (n: number) => {
          const p = Math.min((n - s) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, dur]);
  return { ref: elRef, value: val };
}

/* ═══ Nav ═══ */
function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="#f59e0b">
          <circle cx="7" cy="9" r="2.5" /><circle cx="17" cy="9" r="2.5" /><circle cx="12" cy="17" r="2.5" />
          <line x1="9.2" y1="10" x2="14.8" y2="10" stroke="#44403c" />
          <line x1="8" y1="11.2" x2="10.8" y2="15.2" stroke="#44403c" />
          <line x1="16" y1="11.2" x2="13.2" y2="15.2" stroke="#44403c" />
        </svg>
        CodeMap
      </div>
      <button className="nav-cta" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Analyze a Repo →</button>
    </nav>
  );
}

/* ═══ Hero Graph ═══ */
function HeroDependencyGraph() {
  const nc = '#1c1917', sc = '#44403c', ac = '#f59e0b', tc = '#78716c', ec = '#2e2a27';
  return (
    <div className="w-full max-w-xl mx-auto mt-8" style={{ aspectRatio: '16/9' }}>
      <svg viewBox="0 0 640 360" width="100%" height="100%" style={{ opacity: 0.55 }}>
        <line className="edge-line" x1="120" y1="180" x2="280" y2="100" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="120" y1="180" x2="280" y2="260" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="280" y1="100" x2="440" y2="140" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="280" y1="260" x2="440" y2="220" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="440" y1="140" x2="540" y2="180" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="440" y1="220" x2="540" y2="180" stroke={ec} strokeWidth="1" />
        <line className="edge-line" x1="280" y1="100" x2="280" y2="260" stroke="#231f1d" strokeWidth="1" strokeDasharray="4 4" />
        {[
          { x: 120, y: 180, r: 20, label: 'index.ts', s: sc },
          { x: 280, y: 100, r: 16, label: 'auth.ts', s: sc },
          { x: 280, y: 260, r: 18, label: 'api.ts', s: sc },
          { x: 440, y: 140, r: 14, label: 'db.ts', s: sc },
          { x: 440, y: 220, r: 13, label: 'utils.ts', s: sc },
          { x: 540, y: 180, r: 22, label: 'config.ts', s: ac },
        ].map((n, i) => (
          <g key={i} className="graph-node" style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={nc} stroke={n.s} strokeWidth="1" />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fill={tc} fontSize="6.5" fontFamily="var(--font-mono)">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══ Feature Graph ═══ */
function FeatureGraphSVG() {
  const nc = '#1c1917', sc = '#44403c', ec = '#2e2a27', tc = '#78716c';
  return (
    <div className="visual-card" style={{ aspectRatio: '16/10' }}>
      <svg viewBox="0 0 400 250" width="100%" height="100%">
        <line x1="80" y1="125" x2="180" y2="70" stroke={ec} strokeWidth="1" />
        <line x1="80" y1="125" x2="180" y2="180" stroke={ec} strokeWidth="1" />
        <line x1="180" y1="70" x2="300" y2="95" stroke={ec} strokeWidth="1" />
        <line x1="180" y1="180" x2="300" y2="155" stroke={ec} strokeWidth="1" />
        <line x1="300" y1="95" x2="300" y2="155" stroke="#231f1d" strokeWidth="1" strokeDasharray="3 3" />
        {[
          { x: 80, y: 125, r: 16, l: 'app.ts', s: sc },
          { x: 180, y: 70, r: 12, l: 'routes', s: sc },
          { x: 180, y: 180, r: 14, l: 'models', s: sc },
          { x: 300, y: 95, r: 11, l: 'ctrl', s: '#f59e0b' },
          { x: 300, y: 155, r: 12, l: 'svc', s: sc },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={nc} stroke={n.s} strokeWidth="1" />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fill={tc} fontSize="6.5" fontFamily="var(--font-mono)">{n.l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══ Hotspot ═══ */
function HotspotVisual() {
  const files = [
    { name: 'src/auth/session.ts', changes: 74, level: 'high' },
    { name: 'src/api/handler.ts', changes: 52, level: 'medium' },
    { name: 'src/db/connection.ts', changes: 38, level: 'medium' },
    { name: 'src/utils/format.ts', changes: 12, level: 'low' },
    { name: 'src/config/env.ts', changes: 5, level: 'low' },
  ];
  return (
    <div className="visual-card p-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hotspot Analysis</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {files.map((f) => (
          <div key={f.name} className="hotspot-file">
            <span className="file-name"><span className="file-icon" />{f.name}</span>
            <span className={`hotspot-badge ${f.level}`}>{f.changes} changes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Health Ring ═══ */
function HealthScoreRing({ score }: { score: number }) {
  const { ref, value } = useCountUp(score);
  const r = 48, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  const color = value <= 40 ? '#f87171' : value <= 70 ? '#fbbf24' : '#34d399';
  return (
    <div ref={ref} className="health-ring-container">
      <div className="relative" style={{ width: 130, height: 130 }}>
        <svg className="health-ring-svg" width="130" height="130" viewBox="0 0 110 110">
          <circle className="health-ring-bg" cx="55" cy="55" r={r} />
          <circle className="health-ring-progress" cx="55" cy="55" r={r} stroke={color} strokeDasharray={c} strokeDashoffset={off} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl tracking-tight" style={{ color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
      </div>
      <span className="health-label">Health Score</span>
    </div>
  );
}

/* ═══ Chat ═══ */
function ChatPreview() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className="visual-card" style={{ height: 300 }}>
      <div className="chat-container">
        <div className="chat-bubble user">How is authentication handled?</div>
        {!show && <div className="typing-dots"><span /><span /><span /></div>}
        {show && (
          <div className="chat-bubble ai">
            <div className="ai-avatar">AI</div>
            <div>
              Authentication is in{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                src/auth/session.ts
              </span>{' '}
              via <span style={{ color: '#fafaf9', fontWeight: 500 }}>verifyToken</span>. Used across 12 API routes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Footer ═══ */
function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 CodeMap</span>
      <span style={{ color: '#57534e' }}>Understand any codebase, instantly.</span>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>
    </footer>
  );
}

/* ═══ Section helper ═══ */
function SectionHead({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <div className="text-center mb-14 fade-up">
      <div className="section-label">{label}</div>
      <h2 className="text-2xl md:text-3xl tracking-tight mb-3" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>{title}</h2>
      {desc && <p style={{ color: '#a8a29e', maxWidth: 480, margin: '0 auto', fontSize: '0.95rem' }}>{desc}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [state, setState] = useState<PageState>('landing');
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  useFadeUpObserver();

  const handleSubmit = useCallback((url: string) => {
    if (!/github\.com\/[\w.-]+\/[\w.-]+/.test(url)) return;
    setState('transitioning');
    setTimeout(() => router.push(`/analyze/${encodeURIComponent(url.trim())}`), 1000);
  }, [router]);

  const isValid = /github\.com\/[\w.-]+\/[\w.-]+/.test(inputValue);

  return (
    <>
      <AuroraBackground />
      <StickyNav />
      <main className="relative z-10 w-full overflow-hidden" style={{ paddingTop: 60 }}>

        {/* ═══ HERO ═══ */}
        <section className="min-h-[82vh] flex flex-col items-center justify-center py-16 relative px-6">
          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
                <HeroTitle />
                <div className="hero-input-box">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                    placeholder="github.com/vercel/next.js" spellCheck={false} autoComplete="off" />
                  <button className="analyze-btn" disabled={!isValid} onClick={() => handleSubmit(inputValue)}>Analyze →</button>
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
              <div className="stat-item"><div className="stat-number">50+</div><div className="stat-label">Languages</div></div>
              <div className="stat-divider" />
              <div className="stat-item"><div className="stat-number">Zero</div><div className="stat-label">Setup</div></div>
              <div className="stat-divider" />
              <div className="stat-item"><div className="stat-number">Free</div><div className="stat-label">Public repos</div></div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <SectionHead label="How it works" title="Three steps to clarity" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: <Link2 size={18} strokeWidth={1.5} />, h: 'Paste a GitHub URL', p: 'Any public repository. No install, no signup, no setup.' },
                { icon: <Map size={18} strokeWidth={1.5} />, h: 'Explore the map', p: 'Every file becomes a node. Every import becomes an edge.' },
                { icon: <MessageCircle size={18} strokeWidth={1.5} />, h: 'Ask anything', p: 'Chat with your codebase. Get answers referencing real files.' },
              ].map((c, i) => (
                <div key={i} className="icon-card fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="icon-box">{c.icon}</div>
                  <h3>{c.h}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══ FEATURE: Graph ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="feature-row fade-up">
              <div className="feature-text">
                <div className="section-label">Visualization</div>
                <h2 className="text-2xl md:text-3xl tracking-tight mb-4" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>See the full picture</h2>
                <p style={{ color: '#a8a29e', lineHeight: 1.7, fontSize: '0.95rem' }}>CodeMap builds a live interactive dependency graph from real import analysis. No guesswork — just paste and see.</p>
              </div>
              <div className="feature-visual"><FeatureGraphSVG /></div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══ FEATURE: Hotspots ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <div className="section-label">Risk detection</div>
                <h2 className="text-2xl md:text-3xl tracking-tight mb-4" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>Know what&apos;s risky</h2>
                <p style={{ color: '#a8a29e', lineHeight: 1.7, fontSize: '0.95rem' }}>Hotspot detection surfaces the files changed most frequently — where bugs cluster and changes cascade.</p>
              </div>
              <div className="feature-visual"><HotspotVisual /></div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══ FEATURE: Health + Chat ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-28">
            <div className="feature-row fade-up">
              <div className="feature-text">
                <div className="section-label">Health score</div>
                <h2 className="text-2xl md:text-3xl tracking-tight mb-4" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>Codebase health at a glance</h2>
                <p style={{ color: '#a8a29e', lineHeight: 1.7, fontSize: '0.95rem' }}>A single score reflecting coupling, complexity, and churn.</p>
              </div>
              <div className="feature-visual">
                <div className="visual-card flex items-center justify-center" style={{ padding: '2.5rem', aspectRatio: '4/3' }}>
                  <HealthScoreRing score={74} />
                </div>
              </div>
            </div>
            <div className="feature-row reversed fade-up">
              <div className="feature-text">
                <div className="section-label">AI analysis</div>
                <h2 className="text-2xl md:text-3xl tracking-tight mb-4" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>Ask your codebase anything</h2>
                <p style={{ color: '#a8a29e', lineHeight: 1.7, fontSize: '0.95rem' }}>Powered by Gemini. Answers reference real files and dependencies.</p>
              </div>
              <div className="feature-visual"><ChatPreview /></div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══ CTA ═══ */}
        <section className="py-28 px-6" style={{ background: '#0c0a09' }}>
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h2 className="text-3xl md:text-4xl tracking-tight mb-6" style={{ fontWeight: 600, color: '#fafaf9', letterSpacing: '-0.03em' }}>
              Ready to understand your codebase?
            </h2>
            <div className="flex justify-center">
              <div className="hero-input-box">
                <input type="text" placeholder="github.com/vercel/next.js" spellCheck={false} autoComplete="off"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit((e.target as HTMLInputElement).value); }} />
                <button className="analyze-btn" onClick={() => {
                  const el = document.querySelector<HTMLInputElement>('section:last-of-type input');
                  if (el) handleSubmit(el.value);
                }}>Analyze →</button>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <AnimatePresence>
          {state === 'transitioning' && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }} className="fixed inset-0 z-50 pointer-events-none" style={{ background: '#0c0a09' }} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
