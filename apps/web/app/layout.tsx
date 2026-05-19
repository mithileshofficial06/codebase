import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), { ssr: false });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'CodeMap — Understand Any Codebase',
  description:
    'Interactive dependency graph visualization, AI-powered code analysis, and health scoring for any GitHub repository.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AnimatedBackground />
        <div className="grain-overlay" aria-hidden="true">
          <svg>
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </div>
        {children}
      </body>
    </html>
  );
}
