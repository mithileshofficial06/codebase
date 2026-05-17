'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AuroraBackground from '@/components/landing/AuroraBackground';
import HeroTitle from '@/components/landing/HeroTitle';
import UrlInput from '@/components/landing/UrlInput';

type PageState = 'landing' | 'transitioning';

export default function Home() {
  const [state, setState] = useState<PageState>('landing');
  const router = useRouter();

  const handleSubmit = useCallback(
    (url: string) => {
      setState('transitioning');
      // After transition animation, navigate
      setTimeout(() => {
        const encoded = encodeURIComponent(url.trim());
        router.push(`/analyze/${encoded}`);
      }, 1200);
    },
    [router]
  );

  return (
    <>
      <AuroraBackground />

      <main className="relative z-10 w-full overflow-hidden">
        {/* Top subtle radial gradient spotlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }}
        />

        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center py-20 relative">
          <AnimatePresence mode="wait">
            {state === 'landing' && (
              <motion.div
                key="landing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-12 px-6 w-full max-w-4xl mx-auto"
              >
                <HeroTitle />
                <UrlInput onSubmit={handleSubmit} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* STATS SECTION */}
        <section className="border-t border-[#111111] py-16">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 text-center">
            <div>
              <p className="text-white font-bold text-3xl mb-2">50+</p>
              <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Languages supported</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-[#1a1a1a]"></div>
            <div>
              <p className="text-white font-bold text-3xl mb-2">Zero</p>
              <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Setup required</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-[#1a1a1a]"></div>
            <div>
              <p className="text-white font-bold text-3xl mb-2">Free</p>
              <p className="text-[#666666] text-sm uppercase tracking-wider font-bold">Forever for public repos</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="border-t border-[#111111] py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
              <p className="text-[#888888]">Three simple steps to codebase mastery.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-8 hover:shadow-[0_0_30px_rgba(45,27,105,0.15)] transition-all duration-300 group"
              >
                <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity">🔗</div>
                <h3 className="text-xl font-bold text-white mb-3">Paste a GitHub URL</h3>
                <p className="text-[#888888] leading-relaxed">Any public repository. No install, no signup, no setup required.</p>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-8 hover:shadow-[0_0_30px_rgba(45,27,105,0.15)] transition-all duration-300 group"
              >
                <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity">🗺</div>
                <h3 className="text-xl font-bold text-white mb-3">Explore the Map</h3>
                <p className="text-[#888888] leading-relaxed">Every file becomes a node. Every import becomes an edge. Instantly visual.</p>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-8 hover:shadow-[0_0_30px_rgba(45,27,105,0.15)] transition-all duration-300 group"
              >
                <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity">🤖</div>
                <h3 className="text-xl font-bold text-white mb-3">Ask Anything</h3>
                <p className="text-[#888888] leading-relaxed">Chat with your codebase. Get answers that reference your actual files.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="border-t border-[#111111] py-32 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-32">
            
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">See the full picture instantly</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Stop grep-ing through files. CodeMap builds a live interactive dependency graph from real import analysis — not guesswork.
                </p>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <div className="w-full max-w-md aspect-video bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl relative overflow-hidden flex items-center justify-center">
                  {/* Graph Placeholder */}
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="opacity-80 absolute inset-0">
                    <motion.line x1="100" y1="100" x2="200" y2="50" stroke="#333" strokeWidth="2" />
                    <motion.line x1="100" y1="100" x2="200" y2="150" stroke="#333" strokeWidth="2" />
                    <motion.line x1="200" y1="50" x2="300" y2="100" stroke="#333" strokeWidth="2" />
                    <motion.line x1="200" y1="150" x2="300" y2="100" stroke="#333" strokeWidth="2" />
                    <motion.line x1="200" y1="50" x2="200" y2="150" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                    
                    <motion.circle cx="100" cy="100" r="16" fill="#1a1a1a" stroke="#6366f1" strokeWidth="2" animate={{ scale: [1, 1.1, 1], boxShadow: '0 0 10px #6366f1' }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.circle cx="200" cy="50" r="12" fill="#1a1a1a" stroke="#10b981" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
                    <motion.circle cx="200" cy="150" r="14" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.1 }} />
                    <motion.circle cx="300" cy="100" r="18" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="2" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Know what's risky before you touch it</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Hotspot detection surfaces the files changed most frequently — the ones where bugs cluster and changes cascade.
                </p>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <div className="w-full max-w-md p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl flex flex-col items-center justify-center gap-8">
                  {/* Health Score Placeholder */}
                  <motion.div 
                    className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-[#333333]"
                    animate={{ borderColor: ['#333333', '#f59e0b', '#333333'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-5xl font-black text-[#f59e0b]">74</span>
                  </motion.div>
                  <div className="w-full space-y-3">
                    {[70, 40, 90, 60, 85].map((w, i) => (
                      <div key={i} className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${w}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ask your codebase anything</h2>
                <p className="text-[#888888] text-lg leading-relaxed">
                  Powered by Gemini. Answers reference your actual file names and real dependency relationships — not generic advice.
                </p>
              </div>
              <div className="flex-1 w-full flex justify-center">
                <div className="w-full max-w-md h-64 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl flex flex-col p-6 text-sm font-mono overflow-hidden relative">
                  {/* Chat UI Placeholder */}
                  <div className="flex gap-3 mb-6 opacity-70">
                    <div className="w-6 h-6 rounded bg-[#333333] flex-shrink-0" />
                    <div className="text-white mt-0.5">How is authentication handled?</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded bg-[#6366f1] flex-shrink-0" />
                    <div className="text-[#888888] flex-1 leading-loose">
                      Authentication is primarily handled in <span className="text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded">src/auth/session.ts</span> which exports the <span className="text-white">verifyToken</span> function. It is used across 12 different API routes...
                      <motion.span 
                        className="inline-block w-2 h-4 bg-white ml-1 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                  
                  {/* Subtle fade out at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* BOTTOM CTA SECTION */}
        <section className="border-t border-[#1a1a1a] py-32 bg-[#050505] relative z-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-12 tracking-tight">
              Ready to understand your codebase?
            </h2>
            <div className="flex justify-center">
              <UrlInput onSubmit={handleSubmit} />
            </div>
          </div>
        </section>
        
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
