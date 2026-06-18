/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, Car, Truck, Bus, ChevronRight, Calendar, HelpCircle, Container } from 'lucide-react';
import { Mod } from '../types';
import { Language, translations } from '../translations';
import { HighlightText } from './HighlightText';

interface ModCardProps {
  mod: Mod;
  onSelect: (id: number) => void;
  lang?: Language;
  searchTerm?: string;
}

export const ModCard: React.FC<ModCardProps> = ({ mod, onSelect, lang = 'ar', searchTerm = '' }) => {
  const t = translations[lang];

  // Category configuration
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'cars':
        return {
          label: t.categoryCars,
          icon: <Car className="w-3 h-3" />,
          bgColor: 'bg-black/80',
          borderColor: 'border-white/10',
          textColor: 'text-brand-cyan',
          glow: 'hover:shadow-[0_0_15px_rgba(255,92,0,0.18)] hover:border-brand-cyan/20'
        };
      case 'trucks':
        return {
          label: t.categoryTrucks,
          icon: <Truck className="w-3 h-3" />,
          bgColor: 'bg-black/80',
          borderColor: 'border-white/10',
          textColor: 'text-brand-cyan',
          glow: 'hover:shadow-[0_0_15px_rgba(255,92,0,0.18)] hover:border-brand-cyan/20'
        };
      case 'buses':
        return {
          label: t.categoryBuses,
          icon: <Bus className="w-3 h-3" />,
          bgColor: 'bg-black/80',
          borderColor: 'border-white/10',
          textColor: 'text-brand-cyan',
          glow: 'hover:shadow-[0_0_15px_rgba(255,92,0,0.18)] hover:border-brand-cyan/20'
        };
      case 'trailers':
        return {
          label: t.categoryTrailers,
          icon: <Container className="w-3 h-3" />,
          bgColor: 'bg-black/80',
          borderColor: 'border-white/10',
          textColor: 'text-brand-cyan',
          glow: 'hover:shadow-[0_0_15px_rgba(255,92,0,0.18)] hover:border-brand-cyan/20'
        };
      default:
        return {
          label: t.categoryOthers,
          icon: <HelpCircle className="w-3 h-3" />,
          bgColor: 'bg-black/80',
          borderColor: 'border-white/10',
          textColor: 'text-brand-cyan',
          glow: 'hover:shadow-[0_0_15px_rgba(255,92,0,0.18)] hover:border-brand-cyan/20'
        };
    }
  };

  const cat = getCategoryDetails(mod.category);

  // Format date nicely
  const formattedDate = new Date(mod.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      id={`mod-card-${mod.id}`}
      onClick={() => onSelect(mod.id)}
      className={`group relative flex flex-col bg-dark-card border border-white/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${cat.glow}`}
    >
      {/* Image Panel with skeleton loading fallback and zoom */}
      <div id={`mod-card-image-panel-${mod.id}`} className="relative h-36 w-full overflow-hidden bg-slate-950">
        <img 
          src={mod.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'} 
          alt={mod.name} 
          loading="lazy"
          className="w-full h-full object-cover filter saturate-75 opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
          onError={(e) => {
            // Fallback if image doesn't load
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Category Floating Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${cat.bgColor} ${cat.textColor} shadow-md`}>
            {cat.icon}
            <span>{cat.label}</span>
          </span>
        </div>

        {/* Game Version Floating Badge */}
        {mod.game_version && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-black text-brand-orange border border-brand-orange/40 shadow-md backdrop-blur-sm font-mono">
              <span>{mod.game_version}</span>
            </span>
          </div>
        )}

        {/* Floating Download Statistic */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-gray-400 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono flex items-center gap-1 shadow-md">
          <Download className="w-3 h-3 text-brand-cyan" />
          <span>{mod.downloads_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Content Area */}
      <div id={`mod-card-content-${mod.id}`} className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-white mb-1 group-hover:text-brand-cyan transition-colors line-clamp-1">
            <HighlightText text={mod.name} search={searchTerm} />
          </h4>

          {/* Version tags */}
          {(mod.game_version || mod.mod_version) && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {mod.game_version && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-gray-300 border border-white/5">
                  🎮 {mod.game_version}
                </span>
              )}
              {mod.mod_version && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10">
                  📦 {mod.mod_version}
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {mod.description}
          </p>
        </div>

        {/* Footer Area with Action Indicators */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-gray-500 flex items-center gap-1 text-[10px]">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>

          <span className="text-brand-cyan text-[10px] font-black uppercase tracking-tighter group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
            <span>{lang === 'ar' ? 'عرض التفاصيل' : lang === 'fr' ? 'Voir détails' : 'View details'}</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

    </div>
  );
};
