/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Home, Compass } from 'lucide-react';
import { Language, translations } from '../translations';

interface NotFoundPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ lang, onNavigateHome }) => {
  const t = translations[lang] || translations.en;

  // Retrieve translation or fallback to English values if undefined
  const notFoundTitle = t.notFoundTitle || '404';
  const notFoundMessage = t.notFoundMessage || 'Page not found';
  const notFoundDesc = t.notFoundDesc || 'The page you are looking for does not exist or has been moved.';
  const backToHome = t.backToHome || 'Back to Home';
  const exploreFleet = t.exploreFleet || 'Explore Fleet';

  return (
    <div
      id="not-found-page"
      className="min-h-[80vh] flex flex-col items-center justify-center bg-dark-bg text-white px-4 py-16 text-center select-none"
    >
      <style>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          15% { transform: translate(-1px, 1px); }
          30% { transform: translate(-1px, -1px); }
          45% { transform: translate(1px, 1px); }
          60% { transform: translate(1px, -1px); }
          75% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 2.5s infinite ease-in-out;
          text-shadow: 
            2px 2px 0px rgba(255, 92, 0, 0.5), 
            -2px -2px 0px rgba(0, 191, 255, 0.3),
            0 0 20px rgba(255, 92, 0, 0.2);
        }
      `}</style>

      <div className="max-w-md w-full flex flex-col items-center">
        {/* Decorative elements representing broken link / empty road */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6 flex items-center justify-center"
        >
          {/* Pulse backdrop circle */}
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-brand-cyan/10 animate-pulse" />
          
          <div className="relative bg-dark-card border-2 border-brand-cyan/20 p-5 rounded-full text-brand-cyan">
            <AlertTriangle className="h-10 w-10 animate-pulse duration-[2s]" />
          </div>
        </motion.div>

        {/* Large animation-glitch 404 text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-7xl font-sans font-black tracking-widest text-brand-cyan animate-glitch"
        >
          {notFoundTitle}
        </motion.h1>

        {/* Friendly Route Not Found Messages */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-2xl font-bold tracking-tight text-gray-100"
        >
          {notFoundMessage}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-3 text-sm text-gray-400 leading-relaxed max-w-sm px-4"
        >
          {notFoundDesc}
        </motion.p>

        {/* Actions section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full px-6"
        >
          <button
            onClick={onNavigateHome}
            className="flex items-center justify-center gap-2 bg-brand-cyan text-white hover:bg-brand-cyan/90 active:scale-95 transition-all text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-lg font-mono shadow-lg shadow-brand-cyan/10 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            {backToHome}
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-brand-cyan/45 hover:bg-white/5 active:scale-95 transition-all text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-lg text-gray-300 hover:text-brand-cyan font-mono cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            {exploreFleet}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
