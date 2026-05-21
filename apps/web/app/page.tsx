'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link2, Map, MessageCircle, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

type PageState = 'landing' | 'transitioning';

function useFadeUpObserver() {
  const r = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    r.current = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach((el) => r.current?.observe(el));
    return () => r.current?.disconnect();
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
        const tick = (n: number) => { const p = Math.min((n - s) / dur, 1); setVal(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(tick); };
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
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn); }, []);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#lg)" strokeWidth="1.5" /><circle cx="8" cy="10" r="2" fill="#A78BFA" /><circle cx="16" cy="10" r="2" fill="#2DD4BF" /><circle cx="12" cy="16" r="2" fill="#8B5CF6" /><line x1="8" y1="10" x2="16" y2="10" stroke="#1e293b" strokeWidth="0.8" /><line x1="8" y1="10" x2="12" y2="16" stroke="#1e293b" strokeWidth="0.8" /><line x1="16" y1="10" x2="12" y2="16" stroke="#1e293b" strokeWidth="0.8" /><defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#A78BFA" /><stop offset="1" stopColor="#2DD4BF" /></linearGradient></defs></svg>
        CodeMap
      </div>
      <div className="nav-links">
        <button onClick={() => scrollTo('how-it-works')}>How it works</button>
        <button onClick={() => scrollTo('features')}>Features</button>
      </div>
      <button className="nav-cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Kick Start</button>
    </nav>
  );
}

/* ═══ Terminal ═══ */
function TerminalPreview() {
  const [lines, setLines] = useState<string[]>([]);
  const terminalLines = useRef([
    '$ codemap analyze vercel/next.js',
    '',
    '  [INIT] Cloning repository...',
    '  [INFO] 2,847 files scanned',
    '  [INFO] Dependency graph built (1,203 nodes)',
    '  [INFO] Health score: 74/100',
    '  [DONE] AI analysis ready',
  ]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < terminalLines.current.length) {
        const line = terminalLines.current[idx];
        setLines(prev => [...prev, line]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const getColor = (line: string) => {
    if (!line) return '#94A3B8';
    if (line.includes('[INFO]') || line.includes('[DONE]')) return '#34d399';
    if (line.includes('[INIT]')) return '#fbbf24';
    if (line.includes('$')) return '#A78BFA';
    return '#94A3B8';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20, rotateX: 5 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="terminal-window w-full max-w-md" style={{ perspective: 1000 }}>
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: '#ef4444' }} />
        <div className="terminal-dot" style={{ background: '#f59e0b' }} />
        <div className="terminal-dot" style={{ background: '#22c55e' }} />
        <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#64748B' }}>terminal</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, i) => (
          <div key={i} style={{ color: getColor(line), minHeight: '1.2em' }}>
            {line}
          </div>
        ))}
        <span className="cursor-blink" style={{ color: '#A78BFA' }}>▌</span>
      </div>
    </motion.div>
  );
}

/* ═══ Feature Graph SVG ═══ */
function FeatureGraphSVG() {
  const bc = '#0c0c1d', sc = '#1a1a35';
  return (
    <div className="visual-card" style={{ aspectRatio: '16/10' }}>
      <svg viewBox="0 0 400 250" width="100%" height="100%">
        <line x1="80" y1="125" x2="180" y2="70" stroke={sc} strokeWidth="1" /><line x1="80" y1="125" x2="180" y2="180" stroke={sc} strokeWidth="1" />
        <line x1="180" y1="70" x2="300" y2="95" stroke={sc} strokeWidth="1" /><line x1="180" y1="180" x2="300" y2="155" stroke={sc} strokeWidth="1" />
        <circle cx="80" cy="125" r="16" fill={bc} stroke="#8B5CF6" strokeWidth="1.5" />
        <text x="80" y="128" textAnchor="middle" fill="#64748B" fontSize="6.5" fontFamily="var(--font-code)">app.ts</text>
        <circle cx="180" cy="70" r="12" fill={bc} stroke={sc} strokeWidth="1" />
        <text x="180" y="73" textAnchor="middle" fill="#64748B" fontSize="6" fontFamily="var(--font-code)">routes</text>
        <circle cx="180" cy="180" r="14" fill={bc} stroke={sc} strokeWidth="1" />
        <text x="180" y="183" textAnchor="middle" fill="#64748B" fontSize="6" fontFamily="var(--font-code)">models</text>
        <circle cx="300" cy="95" r="11" fill={bc} stroke="#2DD4BF" strokeWidth="1" />
        <text x="300" y="98" textAnchor="middle" fill="#94A3B8" fontSize="6" fontFamily="var(--font-code)">ctrl</text>
        <circle cx="300" cy="155" r="12" fill={bc} stroke={sc} strokeWidth="1" />
        <text x="300" y="158" textAnchor="middle" fill="#64748B" fontSize="6" fontFamily="var(--font-code)">svc</text>
      </svg>
    </div>
  );
}

/* ═══ Hotspot ═══ */
function HotspotVisual() {
  const files = [{ name: 'src/auth/session.ts', changes: 74, level: 'high' }, { name: 'src/api/handler.ts', changes: 52, level: 'medium' }, { name: 'src/db/connection.ts', changes: 38, level: 'medium' }, { name: 'src/utils/format.ts', changes: 12, level: 'low' }, { name: 'src/config/env.ts', changes: 5, level: 'low' }];
  return (
    <div className="visual-card p-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hotspot Analysis</span>
      </div>
      <div className="flex flex-col gap-0.5">{files.map((f) => (<div key={f.name} className="hotspot-file"><span className="file-name"><span className="file-icon" />{f.name}</span><span className={`hotspot-badge ${f.level}`}>{f.changes} changes</span></div>))}</div>
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
        <svg className="health-ring-svg" width="130" height="130" viewBox="0 0 110 110"><circle className="health-ring-bg" cx="55" cy="55" r={r} /><circle className="health-ring-progress" cx="55" cy="55" r={r} stroke={color} strokeDasharray={c} strokeDashoffset={off} /></svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl tracking-tight" style={{ color, fontWeight: 700, fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}>{value}</span></div>
      </div>
      <span className="health-label">Health Score</span>
    </div>
  );
}

/* ═══ Chat ═══ */
const chatQA = [
  { q: 'How is auth handled?', a: 'Authentication is in src/auth/session.ts via verifyToken. Used across 12 API routes.' },
  { q: 'What files are most critical?', a: 'The most coupled file is src/api/handler.ts — it imports 23 modules and is imported by 8 others.' },
  { q: 'Where are the API routes?', a: 'All API routes live in src/routes/. There are 14 route files handling REST endpoints.' },
];

function ChatPreview() {
  const [active, setActive] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setDisplayed('');
    setTyping(true);
    const full = chatQA[active].a;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(full.slice(0, i));
      if (i >= full.length) { clearInterval(timer); setTyping(false); }
    }, 18);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="visual-card" style={{ height: 320 }}>
      <div className="chat-chips">
        {chatQA.map((c, i) => (
          <button key={i} className={`chat-chip ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{c.q}</button>
        ))}
      </div>
      <div className="chat-container">
        <div className="chat-bubble user">{chatQA[active].q}</div>
        <div className="chat-bubble ai">
          <div className="ai-avatar">AI</div>
          <div>{displayed}{typing && <span className="cursor-blink" style={{ color: '#A78BFA' }}>▌</span>}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Mini Graph Preview ═══ */
function MiniGraphPreview() {
  const nodes = [
    { x: 320, y: 60, r: 10, label: 'app.ts', color: '#8B5CF6' },
    { x: 160, y: 120, r: 8, label: 'routes', color: '#A78BFA' },
    { x: 480, y: 110, r: 8, label: 'auth', color: '#2DD4BF' },
    { x: 80, y: 210, r: 6, label: 'db', color: '#6366F1' },
    { x: 260, y: 220, r: 7, label: 'utils', color: '#A78BFA' },
    { x: 420, y: 200, r: 7, label: 'api', color: '#2DD4BF' },
    { x: 540, y: 240, r: 5, label: 'types', color: '#8B5CF6' },
    { x: 140, y: 290, r: 6, label: 'config', color: '#6366F1' },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[5,6],[3,7],[4,7],[4,5]];

  return (
    <svg viewBox="0 0 640 340" className="w-full h-auto mini-graph" style={{ maxHeight: 260 }}>
      <defs>
        {nodes.map((n, i) => (
          <radialGradient key={`g${i}`} id={`ng${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={n.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={n.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line key={`e${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="rgba(139,92,246,0.12)" strokeWidth="1"
          className="graph-edge" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}

      {/* Node glows */}
      {nodes.map((n, i) => (
        <circle key={`glow${i}`} cx={n.x} cy={n.y} r={n.r * 4} fill={`url(#ng${i})`}
          className="graph-node-glow" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n${i}`} className="graph-node" style={{ animationDelay: `${i * 0.12}s` }}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#0c0c1d" stroke={n.color} strokeWidth="1.5" />
          <text x={n.x} y={n.y + n.r + 14} textAnchor="middle" fill="#6B7A99" fontSize="9"
            fontFamily="var(--font-code)" style={{ letterSpacing: '0.02em' }}>
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}



/* ═══════════════════════════════════════════════════════════════════ */
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

      <StickyNav />
      <main className="relative z-10 w-full overflow-hidden" style={{ paddingTop: 64 }}>

        {/* ═══ HERO — Centered Premium ═══ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          {/* Background glow orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(45, 212, 191, 0.04) 40%, transparent 65%)' }} />

          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center text-center relative z-10">

                {/* ── Headline — Poster style ── */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-[-0.04em]" style={{ fontFamily: 'var(--font-heading)' }}>
                    <span style={{ fontWeight: 300, color: 'rgba(238,238,248,0.9)' }}>See the architecture of</span><br />
                    <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl" style={{ fontWeight: 900, color: '#EEEEF8' }}>any codebase</span>
                    <span style={{ fontWeight: 300, color: 'rgba(238,238,248,0.7)' }}> — </span>
                    <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl gradient-text-accent" style={{ fontWeight: 900 }}>instantly.</span>
                  </h1>
                </motion.div>

                {/* ── Subtitle ── */}
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
                  className="text-base md:text-lg mb-10 max-w-lg" style={{ color: '#A0AECB', lineHeight: 1.7 }}>
                  Paste a GitHub URL and get an interactive dependency graph, health scoring, and AI&#8209;powered code analysis in seconds.
                </motion.p>

                {/* ── Input — borderless glow underline ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                  className="w-full max-w-xl mb-4">
                  <div className="hero-input-glow">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                      placeholder="github.com/vercel/next.js" spellCheck={false} autoComplete="off" />
                    <button className="hero-input-btn" disabled={!isValid} onClick={() => handleSubmit(inputValue)}>Analyze →</button>
                  </div>
                </motion.div>

                {/* ── Inline stats ── */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}
                  className="text-xs md:text-sm tracking-wide mb-12" style={{ color: '#6B7A99' }}>
                  50+ languages &nbsp;·&nbsp; Zero setup &nbsp;·&nbsp; Free for public repos
                </motion.p>

                {/* ── Mini Graph Preview ── */}
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-2xl relative">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
                  <MiniGraphPreview />
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Scroll indicator ── */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 scroll-indicator">
            <span style={{ fontSize: '0.6rem', color: '#6B7A99', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7A99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </section>

        <div className="glow-separator" />

        {/* ═══ BENTO FEATURES ═══ */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 fade-up">
              <div className="section-badge" style={{ margin: '0 auto 1.25rem' }}><Zap size={12} /> Features</div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Everything you need to explore code</h2>
              <p style={{ color: '#94A3B8', maxWidth: 500, margin: '0 auto' }}>Powerful tools that help you understand, navigate, and analyze any repository.</p>
            </div>

            <div className="bento-grid fade-up" style={{ transitionDelay: '100ms' }}>
              <div className="bento-card featured">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}><Map size={18} color="#A78BFA" strokeWidth={1.5} /></div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem' }}>See the full picture instantly</h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>A live dependency graph built from real import analysis — every file, every edge, instantly.</p>
                <FeatureGraphSVG />
              </div>
              <div className="bento-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.15)' }}><BarChart3 size={18} color="#2DD4BF" strokeWidth={1.5} /></div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Health Scoring</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>Coupling, complexity, and churn distilled into one score.</p>
                <div className="flex justify-center"><HealthScoreRing score={74} /></div>
              </div>
              <div className="bento-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}><Shield size={18} color="#f87171" strokeWidth={1.5} /></div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Know what&#39;s risky before you touch it</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>Hotspot detection surfaces files changed most often — where bugs cluster and changes cascade.</p>
                <HotspotVisual />
              </div>
              <div className="bento-card featured">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}><MessageCircle size={18} color="#A78BFA" strokeWidth={1.5} /></div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem' }}>Ask your codebase anything</h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>Powered by Gemini. Answers reference real file names and dependency relationships — not generic advice.</p>
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        <div className="glow-separator" />

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 fade-up">
              <div className="section-badge" style={{ margin: '0 auto 1.25rem' }}>How it works</div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Three steps to clarity</h2>
              <p style={{ color: '#94A3B8', maxWidth: 420, margin: '0 auto', fontSize: '0.95rem' }}>From URL to full understanding in under 30 seconds.</p>
            </div>

            <div className="steps-container fade-up" style={{ transitionDelay: '100ms' }}>
              {[
                {
                  n: '01', h: 'Paste a URL', p: 'Any public GitHub repository. No install, no signup, no config.',
                  color: '#A78BFA', bg: 'rgba(168,85,247,0.06)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  ),
                },
                {
                  n: '02', h: 'Explore the map', p: 'Files as nodes, imports as edges. Navigate your codebase visually.',
                  color: '#2DD4BF', bg: 'rgba(0,217,255,0.06)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                  ),
                },
                {
                  n: '03', h: 'Ask anything', p: 'AI-powered chat that references your actual code and dependencies.',
                  color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="9" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="15" y1="10" x2="15" y2="10" />
                    </svg>
                  ),
                },
              ].map((c, i) => (
                <div key={i} className="step-card" style={{ '--step-color': c.color, '--step-bg': c.bg } as React.CSSProperties}>
                  {/* Connector line between cards */}
                  {i < 2 && <div className="step-connector"><div className="step-connector-line" /></div>}

                  {/* Step number watermark */}
                  <span className="step-number">{c.n}</span>

                  {/* Icon */}
                  <div className="step-icon">{c.icon}</div>

                  {/* Content */}
                  <h3 className="step-title">{c.h}</h3>
                  <p className="step-desc">{c.p}</p>

                  {/* Bottom accent bar */}
                  <div className="step-accent" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="glow-separator" />

        {/* ═══ BOTTOM CTA ═══ */}
        <section className="py-28 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(45, 212, 191, 0.03) 40%, transparent 70%)' }} />
          <div className="max-w-2xl mx-auto text-center fade-up relative z-10">
            <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Ready to map your codebase?</h2>
            <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '1rem' }}>Free forever for public repositories.</p>
            <div className="hero-input-box mb-2" style={{ maxWidth: 480, margin: '0 auto' }}>
              <input type="text" placeholder="github.com/vercel/next.js" spellCheck={false} autoComplete="off"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit((e.target as HTMLInputElement).value); }} />
              <button className="analyze-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Analyze repo →</button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '1.5rem' }}>No signup required · Free for public repos</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button className="btn-secondary">View on GitHub <ArrowRight size={14} /></button>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="site-footer">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#lg2)" strokeWidth="1.5" /><circle cx="8" cy="10" r="2" fill="#A78BFA" /><circle cx="16" cy="10" r="2" fill="#2DD4BF" /><circle cx="12" cy="16" r="2" fill="#8B5CF6" /><defs><linearGradient id="lg2" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#A78BFA" /><stop offset="1" stopColor="#2DD4BF" /></linearGradient></defs></svg>
                CodeMap
              </div>
              <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.6, maxWidth: 260 }}>Understand any codebase instantly with AI-powered dependency analysis and visualization.</p>
            </div>
            <div className="footer-col"><h4>Product</h4><a href="#">Features</a><a href="#">Pricing</a><a href="#">Changelog</a><a href="#">Docs</a></div>
            <div className="footer-col"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
            <div className="footer-col"><h4>Connect</h4><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a><a href="#">Twitter</a><a href="#">Discord</a></div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 CodeMap. All rights reserved.</span>
            <span>Built for developers, by developers.</span>
          </div>
        </footer>

        <AnimatePresence>
          {state === 'transitioning' && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-50 pointer-events-none" style={{ background: '#06060f' }} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

