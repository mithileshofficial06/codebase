'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link2, Map, MessageCircle, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';
import AuroraBackground from '@/components/landing/AuroraBackground';

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
  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#lg)" strokeWidth="1.5" /><circle cx="8" cy="10" r="2" fill="#A855F7" /><circle cx="16" cy="10" r="2" fill="#00D9FF" /><circle cx="12" cy="16" r="2" fill="#7C3AED" /><line x1="8" y1="10" x2="16" y2="10" stroke="#1e293b" strokeWidth="0.8" /><line x1="8" y1="10" x2="12" y2="16" stroke="#1e293b" strokeWidth="0.8" /><line x1="16" y1="10" x2="12" y2="16" stroke="#1e293b" strokeWidth="0.8" /><defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#A855F7" /><stop offset="1" stopColor="#00D9FF" /></linearGradient></defs></svg>
        CodeMap
      </div>
      <button className="nav-cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Get Started <ArrowRight size={14} /></button>
    </nav>
  );
}

/* ═══ Terminal ═══ */
function TerminalPreview() {
  const [lines, setLines] = useState<string[]>([]);
  const terminalLines = useRef([
    '$ codemap analyze vercel/next.js',
    '',
    '  ⏳ Cloning repository...',
    '  ✓ 2,847 files scanned',
    '  ✓ Dependency graph built (1,203 nodes)',
    '  ✓ Health score: 74/100',
    '  ✓ AI analysis ready',
    '',
    '  → Open dashboard: localhost:3000/analyze',
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
    if (line.includes('✓')) return '#34d399';
    if (line.includes('⏳')) return '#fbbf24';
    if (line.includes('$')) return '#A855F7';
    if (line.includes('→')) return '#00D9FF';
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
        <span className="cursor-blink" style={{ color: '#A855F7' }}>▌</span>
      </div>
    </motion.div>
  );
}

/* ═══ Feature Graph SVG ═══ */
function FeatureGraphSVG() {
  const bc = '#0F172A', sc = '#1e293b';
  return (
    <div className="visual-card" style={{ aspectRatio: '16/10' }}>
      <svg viewBox="0 0 400 250" width="100%" height="100%">
        <line x1="80" y1="125" x2="180" y2="70" stroke={sc} strokeWidth="1" /><line x1="80" y1="125" x2="180" y2="180" stroke={sc} strokeWidth="1" />
        <line x1="180" y1="70" x2="300" y2="95" stroke={sc} strokeWidth="1" /><line x1="180" y1="180" x2="300" y2="155" stroke={sc} strokeWidth="1" />
        <circle cx="80" cy="125" r="16" fill={bc} stroke="#7C3AED" strokeWidth="1.5" />
        <text x="80" y="128" textAnchor="middle" fill="#64748B" fontSize="6.5" fontFamily="var(--font-code)">app.ts</text>
        <circle cx="180" cy="70" r="12" fill={bc} stroke={sc} strokeWidth="1" />
        <text x="180" y="73" textAnchor="middle" fill="#64748B" fontSize="6" fontFamily="var(--font-code)">routes</text>
        <circle cx="180" cy="180" r="14" fill={bc} stroke={sc} strokeWidth="1" />
        <text x="180" y="183" textAnchor="middle" fill="#64748B" fontSize="6" fontFamily="var(--font-code)">models</text>
        <circle cx="300" cy="95" r="11" fill={bc} stroke="#00D9FF" strokeWidth="1" />
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
function ChatPreview() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className="visual-card" style={{ height: 280 }}>
      <div className="chat-container">
        <div className="chat-bubble user">How is authentication handled?</div>
        {!show && <div className="typing-dots"><span /><span /><span /></div>}
        {show && (<div className="chat-bubble ai"><div className="ai-avatar">AI</div><div>Authentication is in <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: '#A855F7', background: 'rgba(124,58,237,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>src/auth/session.ts</span> via <span style={{ color: '#fff', fontWeight: 500 }}>verifyToken</span>. Used across 12 API routes.</div></div>)}
      </div>
    </div>
  );
}

/* ═══ Footer ═══ */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#lg2)" strokeWidth="1.5" /><circle cx="8" cy="10" r="2" fill="#A855F7" /><circle cx="16" cy="10" r="2" fill="#00D9FF" /><circle cx="12" cy="16" r="2" fill="#7C3AED" /><defs><linearGradient id="lg2" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#A855F7" /><stop offset="1" stopColor="#00D9FF" /></linearGradient></defs></svg>
            CodeMap
          </div>
          <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.6, maxWidth: 260 }}>Understand any codebase instantly with AI-powered dependency analysis and visualization.</p>
        </div>
        <div className="footer-col"><h4>Product</h4><a href="#">Features</a><a href="#">Pricing</a><a href="#">Changelog</a><a href="#">Docs</a></div>
        <div className="footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a></div>
        <div className="footer-col"><h4>Connect</h4><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a><a href="#">Twitter</a><a href="#">Discord</a></div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 CodeMap. All rights reserved.</span>
        <span>Built for developers, by developers.</span>
      </div>
    </footer>
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
      <AuroraBackground />
      <StickyNav />
      <main className="relative z-10 w-full overflow-hidden" style={{ paddingTop: 64 }}>

        {/* ═══ HERO — Asymmetric ═══ */}
        <section className="min-h-[90vh] flex items-center py-20 px-6 relative">
          {/* Radial glow behind hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)' }} />

          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 md:gap-16">

                {/* Left — Text */}
                <div className="flex-1 max-w-xl">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="section-badge" style={{ marginBottom: '1.5rem' }}>
                      <Zap size={12} /> AI-Powered Analysis
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.04em] mb-5" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      <span className="gradient-text">Understand any</span><br />
                      <span className="gradient-text-accent">codebase</span>{' '}
                      <span className="gradient-text">instantly</span>
                    </h1>
                    <p className="text-base md:text-lg mb-8" style={{ color: '#94A3B8', lineHeight: 1.7, maxWidth: 440 }}>
                      Paste a GitHub URL and get an interactive dependency graph, health scoring, and AI-powered code analysis in seconds.
                    </p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    <div className="hero-input-box mb-4">
                      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                        placeholder="github.com/vercel/next.js" spellCheck={false} autoComplete="off" />
                      <button className="analyze-btn" disabled={!isValid} onClick={() => handleSubmit(inputValue)}>Analyze →</button>
                    </div>
                    <div className="stats-inline">
                      <div className="stat-block"><div className="stat-val">50+</div><div className="stat-lbl">Languages</div></div>
                      <div className="stat-block"><div className="stat-val">Zero</div><div className="stat-lbl">Setup</div></div>
                      <div className="stat-block"><div className="stat-val">Free</div><div className="stat-lbl">Public repos</div></div>
                    </div>
                  </motion.div>
                </div>

                {/* Right — Terminal */}
                <div className="flex-1 flex justify-center">
                  <TerminalPreview />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="glow-separator" />

        {/* ═══ BENTO FEATURES ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 fade-up">
              <div className="section-badge" style={{ margin: '0 auto 1.25rem' }}><Zap size={12} /> Features</div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Everything you need to explore code</h2>
              <p style={{ color: '#94A3B8', maxWidth: 500, margin: '0 auto' }}>Powerful tools that help you understand, navigate, and analyze any repository.</p>
            </div>

            <div className="bento-grid fade-up" style={{ transitionDelay: '100ms' }}>
              <div className="bento-card featured">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}><Map size={18} color="#A855F7" strokeWidth={1.5} /></div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem' }}>Interactive Dependency Graph</h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>Every file becomes a node. Every import becomes an edge. Navigate visually and understand how your code connects.</p>
                <FeatureGraphSVG />
              </div>
              <div className="bento-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.15)' }}><BarChart3 size={18} color="#00D9FF" strokeWidth={1.5} /></div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Health Scoring</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>Coupling, complexity, and churn distilled into one score.</p>
                <div className="flex justify-center"><HealthScoreRing score={74} /></div>
              </div>
              <div className="bento-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}><Shield size={18} color="#f87171" strokeWidth={1.5} /></div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Risk Detection</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>Find the files where bugs cluster and changes cascade.</p>
                <HotspotVisual />
              </div>
              <div className="bento-card featured">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}><MessageCircle size={18} color="#A855F7" strokeWidth={1.5} /></div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem' }}>AI Code Analysis</h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>Ask questions about your codebase and get answers that reference real files, functions, and dependency paths.</p>
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        <div className="glow-separator" />

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 fade-up">
              <div className="section-badge" style={{ margin: '0 auto 1.25rem' }}>How it works</div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Three steps to clarity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: <Link2 size={18} strokeWidth={1.5} />, n: '01', h: 'Paste a URL', p: 'Any public GitHub repository. No install, no signup, no config.' },
                { icon: <Map size={18} strokeWidth={1.5} />, n: '02', h: 'Explore the map', p: 'Files as nodes, imports as edges. Navigate your codebase visually.' },
                { icon: <MessageCircle size={18} strokeWidth={1.5} />, n: '03', h: 'Ask anything', p: 'AI-powered chat that references your actual code and dependencies.' },
              ].map((c, i) => (
                <div key={i} className="bento-card fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#A855F7' }}>{c.icon}</div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'rgba(148,163,184,0.08)', lineHeight: 1 }}>{c.n}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem', color: '#fff' }}>{c.h}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.7 }}>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="glow-separator" />

        {/* ═══ CTA ═══ */}
        <section className="py-28 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%)' }} />
          <div className="max-w-2xl mx-auto text-center fade-up relative z-10">
            <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>Ready to explore?</h2>
            <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '1rem' }}>Start understanding your codebase in seconds. Free for all public repositories.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Get Started Free <ArrowRight size={16} /></button>
              <button className="btn-secondary">View on GitHub <ArrowRight size={14} /></button>
            </div>
          </div>
        </section>

        <Footer />

        <AnimatePresence>
          {state === 'transitioning' && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-50 pointer-events-none" style={{ background: '#020617' }} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
