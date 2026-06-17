/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Gauge, Car, Bus, ShieldAlert, Wifi, Database, MoreVertical, Globe, ChevronDown } from 'lucide-react';
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
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'EN', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', nativeLabel: 'FR', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', nativeLabel: 'AR', flag: '🇩🇿' },
  ] as const;

  const currentLangObj = languages.find(l => l.code === lang) || languages[2];

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

          {/* Languages Selector Dropdown */}
          <div ref={dropdownRef} className="relative z-50">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#121216]/95 hover:bg-[#16161D] border border-white/10 hover:border-brand-cyan/40 rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm select-none active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="font-bold flex items-center gap-1.5">
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.label}</span>
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-250 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div 
                className={`absolute ${
                  lang === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-36 rounded-lg bg-[#121216] border border-white/10 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange?.(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all duration-150 cursor-pointer select-none ${
                      lang === l.code
                        ? 'bg-brand-cyan/15 text-brand-cyan font-extrabold shadow-inner'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    <span className="text-[9px] opacity-40 font-mono font-bold uppercase">{l.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
