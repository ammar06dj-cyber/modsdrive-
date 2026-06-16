/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gauge, Car, Bus, ShieldAlert, Wifi, Database, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivePage } from '../types';
import { IS_DEMO_MODE } from '../supabaseClient';
import { Language, translations } from '../translations';

interface HeaderProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onToggleMobileFilter?: () => void;
  showMobileFilterButton?: boolean;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate, 
  onToggleMobileFilter, 
  showMobileFilterButton,
  lang = 'ar',
  onLanguageChange
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-white/10 bg-dark-header backdrop-blur-md sticky top-0 z-50">
      <div id="header-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Container & Mobile Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo and Brand */}
          <motion.div 
            id="brand-logo" 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover="hover"
            initial="initial"
          >
            <motion.div 
              variants={{
                initial: { scale: 1 },
                hover: { 
                  scale: 1.1,
                  boxShadow: "0 0 25px rgba(255,92,0,0.85)",
                  transition: { type: "spring", stiffness: 400, damping: 12 }
                }
              }}
              className="relative flex items-center justify-center w-8 h-8 rounded-sm bg-brand-cyan shadow-[0_0_15px_rgba(255,92,0,0.45)] transition-all duration-300"
            >
              <motion.div 
                variants={{
                  initial: { rotate: 0 },
                  hover: { 
                    rotate: [0, 45, -10, 120, 80, 110],
                    transition: {
                      duration: 1.2,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.4, 0.7, 0.85, 1],
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }
                }}
                className="relative flex items-center justify-center text-black"
              >
                <Gauge className="w-4.5 h-4.5" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white flex items-center gap-1 uppercase font-sans">
                <motion.span 
                  variants={{
                    initial: { y: 0 },
                    hover: { y: -1, transition: { type: "spring", stiffness: 300 } }
                  }}
                  className="text-brand-cyan inline-block"
                >
                  MODS
                </motion.span>
                <span className="text-white">DRIVE</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase -mt-0.5">{t.subtitle}</p>
            </div>
          </motion.div>

          {/* Elegant 3-Dots Filter Menu Trigger Button (Near web brand title on mobile) */}
          {showMobileFilterButton && onToggleMobileFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMobileFilter();
              }}
              className="lg:hidden p-2 bg-dark-card border border-[#ff5c00]/30 hover:border-brand-cyan/80 text-brand-cyan hover:text-white rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
              title="تصفية المحتوى / Filter Menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Controls */}
        <div id="navigation-controls" className="flex items-center gap-4">
          <button
            id="nav-btn-home"
            onClick={() => onNavigate('home')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-tighter transition-all duration-300 flex items-center gap-2 ${
              currentPage === 'home' || currentPage === 'detail'
                ? 'bg-[#16161D] border border-brand-cyan/40 text-brand-cyan shadow-[0_0_12px_rgba(255,92,0,0.18)] font-black'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{t.exploreFleet}</span>
          </button>

          {/* Languages Selector */}
          <div className="flex items-center gap-1 bg-[#121216] border border-white/10 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => onLanguageChange?.('en')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer select-none ${
                lang === 'en'
                  ? 'bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-black shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange?.('fr')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer select-none ${
                lang === 'fr'
                  ? 'bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-black shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLanguageChange?.('ar')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer select-none ${
                lang === 'ar'
                  ? 'bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-black shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              AR
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
