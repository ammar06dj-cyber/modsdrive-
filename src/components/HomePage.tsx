/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, Car, Truck, Bus, HelpCircle, ArrowRight, Ship, Construction, Map, Bike, Newspaper, Plane, Tractor, X, MoreVertical, Container, WifiOff, AlertTriangle } from 'lucide-react';
import { Mod } from '../types';
import { ModCard } from './ModCard';
import { Language, translations } from '../translations';
import { matchesSearchCriteria } from '../utils/search';
import { ModsDriveError } from '../supabaseClient';
import { normalizeGameVersion } from '../utils/version';

const IS_DEV = !!((import.meta as any).env && (import.meta as any).env.DEV);

interface HomePageProps {
  mods: Mod[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectMod: (id: number) => void;
  onNavigateToAdmin: () => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (open: boolean) => void;
  lang?: Language;
  error?: ModsDriveError | null;
}

const categoryItems = [
  { key: 'cars', icon: Car },
  { key: 'trucks', icon: Truck },
  { key: 'buses', icon: Bus },
  { key: 'trailers', icon: Container },
  { key: 'boats', icon: Ship },
  { key: 'excavators', icon: Construction },
  { key: 'maps', icon: Map },
  { key: 'motorcycles', icon: Bike },
  { key: 'planes', icon: Plane },
  { key: 'tractors', icon: Tractor },
  { key: 'others', icon: HelpCircle },
] as const;



// Custom hook to listen to URL search changes
export function useUrlState() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return searchParams;
}

export const HomePage: React.FC<HomePageProps> = ({
  mods,
  isLoading,
  onRefresh,
  onSelectMod,
  onNavigateToAdmin,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  lang = 'ar',
  error: propError = null,
}) => {
  const t = translations[lang];

  const [error, setError] = useState<ModsDriveError | null>(null);

  useEffect(() => {
    setError(propError || null);
  }, [propError]);

  const getCategoryLabel = (key: string) => {
    switch (key) {
      case 'cars': return t.categoryCars;
      case 'trucks': return t.categoryTrucks;
      case 'buses': return t.categoryBuses;
      case 'trailers': return t.categoryTrailers;
      case 'boats': return t.categoryBoats;
      case 'excavators': return t.categoryExcavators;
      case 'maps': return t.categoryMaps;
      case 'motorcycles': return t.categoryMotorcycles;
      case 'planes': return t.categoryPlanes;
      case 'tractors': return t.categoryTractors;
      default: return t.categoryOthers;
    }
  };

  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'cars' | 'trucks' | 'buses' | 'boats' | 'excavators' | 'maps' | 'motorcycles' | 'news' | 'others' | 'planes' | 'tractors' | 'updates' | 'trailers'
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || 'all';
    const valid = ['all', 'cars', 'trucks', 'buses', 'boats', 'excavators', 'maps', 'motorcycles', 'news', 'others', 'planes', 'tractors', 'updates', 'trailers'];
    return (valid.includes(cat) ? cat : 'all') as any;
  });
  const [selectedVersion, setSelectedVersion] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('version') || 'all';
  });
  const [sortBy, setSortBy] = useState<'downloads' | 'newest' | 'id'>(() => {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get('sort') || 'downloads';
    if (sort === 'downloads' || sort === 'newest' || sort === 'id') return sort;
    return 'downloads';
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1', 10);
    return isNaN(page) || page < 1 ? 1 : page;
  });

  const urlParams = useUrlState();

  // Synchronize URL -> React State (bidirectionally on browser navigate/popstate)
  useEffect(() => {
    const search = urlParams.get('search') || '';
    if (search !== searchTerm) setSearchTerm(search);

    const cat = urlParams.get('category') || 'all';
    const valid = ['all', 'cars', 'trucks', 'buses', 'boats', 'excavators', 'maps', 'motorcycles', 'news', 'others', 'planes', 'tractors', 'updates', 'trailers'];
    const finalCat = valid.includes(cat) ? cat : 'all';
    if (finalCat !== selectedCategory) setSelectedCategory(finalCat as any);

    const ver = urlParams.get('version') || 'all';
    if (ver !== selectedVersion) setSelectedVersion(ver);

    const sort = urlParams.get('sort') || 'downloads';
    const finalSort = (sort === 'downloads' || sort === 'newest' || sort === 'id') ? sort : 'downloads';
    if (finalSort !== sortBy) setSortBy(finalSort as any);

    const pageStr = urlParams.get('page');
    const pageVal = pageStr ? parseInt(pageStr, 10) : 1;
    const finalPage = isNaN(pageVal) || pageVal < 1 ? 1 : pageVal;
    if (finalPage !== currentPage) setCurrentPage(finalPage);
  }, [urlParams]);

  // Synchronize React State -> URL Query String
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedVersion !== 'all') params.set('version', selectedVersion);
    if (sortBy !== 'downloads') params.set('sort', sortBy);
    if (currentPage !== 1) params.set('page', String(currentPage));

    const newQueryString = params.toString() ? '?' + params.toString() : '';
    const newUrl = `${window.location.pathname}${newQueryString}`;

    if (window.location.search !== newQueryString) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchTerm, selectedCategory, selectedVersion, sortBy, currentPage]);

  // Unified wrappers for updating filters that also trigger current page reset
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (cat: typeof selectedCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };
  const handleVersionChange = (ver: string) => {
    setSelectedVersion(ver);
    setCurrentPage(1);
  };
  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Dynamically extract unique game versions from the loaded mods
  const dynamicGameVersions = useMemo(() => {
    const versionsSet = new Set<string>();
    
    // Always include the current mods' versions
    mods.forEach(mod => {
      if (mod.game_version) {
        const normalized = normalizeGameVersion(mod.game_version);
        if (normalized) {
          versionsSet.add(normalized);
        }
      }
    });

    // We must ensure the default range requested is present: 0.24.x to 0.38.x
    const defaultVersions = [
      '0.38.x', '0.37.x', '0.36.x', '0.35.x', '0.34.x',
      '0.33.x', '0.32.x', '0.31.x', '0.30.x', '0.29.x',
      '0.28.x', '0.27.x', '0.26.x', '0.25.x', '0.24.x'
    ];
    defaultVersions.forEach(v => versionsSet.add(v));

    // Sort versions in descending order (higher versions first)
    return Array.from(versionsSet).sort((a, b) => {
      const cleanA = a.replace(/^[vV]/, '').replace(/\.x$/, '');
      const cleanB = b.replace(/^[vV]/, '').replace(/\.x$/, '');
      const numA = parseFloat(cleanA);
      const numB = parseFloat(cleanB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA;
      }
      return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [mods]);

  // Dynamic statistics
  const stats = useMemo(() => {
    if (IS_DEV) {
      console.log('[DEBUG] HomePage: Raw mods count from state:', {
        count: mods.length,
        itemIds: mods.map(m => m.id),
      });
    }

    const counts = {
      total: mods.length,
      cars: 0,
      trucks: 0,
      buses: 0,
      trailers: 0,
      boats: 0,
      excavators: 0,
      maps: 0,
      motorcycles: 0,
      news: 0,
      planes: 0,
      tractors: 0,
      updates: 0,
      others: 0,
    };
    mods.forEach(m => {
      if (m.category) {
        const cat = m.category.toLowerCase().trim();
        if (cat in counts) {
          counts[cat as keyof typeof counts]++;
        } else {
          // Additional fallback singular/plural mappings if needed
          if (cat === 'car') counts.cars++;
          else if (cat === 'truck') counts.trucks++;
          else if (cat === 'bus') counts.buses++;
          else if (cat === 'trailer' || cat === 'container' || cat === 'containers') counts.trailers++;
          else if (cat === 'boat') counts.boats++;
          else if (cat === 'excavator') counts.excavators++;
          else if (cat === 'map') counts.maps++;
          else if (cat === 'motorcycle' || cat === 'bike') counts.motorcycles++;
          else if (cat === 'plane') counts.planes++;
          else if (cat === 'tractor') counts.tractors++;
          else counts.others++;
        }
      } else {
        counts.others++;
      }
    });
    return counts;
  }, [mods]);

  // Game versions statistics
  const versionStats = useMemo(() => {
    const counts: Record<string, number> = { 'all': mods.length };
    dynamicGameVersions.forEach(v => {
      counts[v] = 0;
    });
    
    mods.forEach(mod => {
      dynamicGameVersions.forEach(v => {
        const modNormalized = mod.game_version ? normalizeGameVersion(mod.game_version) : '';
        const matchesDirect = modNormalized && modNormalized.toLowerCase() === v.toLowerCase();
        
        const rawVerNoX = v.replace(/\.x$/, '');
        const hasExplicit = matchesDirect || 
                            mod.description.toLowerCase().includes(v.toLowerCase()) || 
                            mod.name.toLowerCase().includes(v.toLowerCase()) ||
                            mod.description.toLowerCase().includes(rawVerNoX.toLowerCase()) ||
                            mod.name.toLowerCase().includes(rawVerNoX.toLowerCase()) ||
                            mod.description.toLowerCase().includes('v' + rawVerNoX.toLowerCase()) ||
                            mod.name.toLowerCase().includes('v' + rawVerNoX.toLowerCase());
        
        if (hasExplicit) {
          counts[v]++;
        } else {
          // If mod doesn't have an explicit version defined, fallback to ID mapping
          if (!mod.game_version) {
            const idx = dynamicGameVersions.indexOf(v);
            if (dynamicGameVersions.length > 0 && mod.id % dynamicGameVersions.length === idx) {
              counts[v]++;
            }
          }
        }
      });
    });
    return counts;
  }, [mods, dynamicGameVersions]);

  // Filter & Sort logic
  const filteredAndSortedMods = useMemo(() => {
    let result = mods.filter(mod => {
      const matchesSearch = matchesSearchCriteria(mod.name, searchTerm);
      const matchesCategory = selectedCategory === 'all' || 
                              (mod.category && mod.category.toLowerCase().trim() === selectedCategory);
      
      let matchesVersion = true;
      if (selectedVersion !== 'all') {
        const modNormalized = mod.game_version ? normalizeGameVersion(mod.game_version) : '';
        if (mod.game_version) {
          matchesVersion = (modNormalized.toLowerCase() === selectedVersion.toLowerCase());
        } else {
          const rawVerNoX = selectedVersion.replace(/\.x$/, '');
          const hasExplicit = mod.description.toLowerCase().includes(selectedVersion.toLowerCase()) || 
                              mod.name.toLowerCase().includes(selectedVersion.toLowerCase()) ||
                              mod.description.toLowerCase().includes(rawVerNoX.toLowerCase()) || 
                              mod.name.toLowerCase().includes(rawVerNoX.toLowerCase()) ||
                              mod.description.toLowerCase().includes('v' + rawVerNoX.toLowerCase()) || 
                              mod.name.toLowerCase().includes('v' + rawVerNoX.toLowerCase());
          if (hasExplicit) {
            matchesVersion = true;
          } else {
            const idx = dynamicGameVersions.indexOf(selectedVersion);
            if (dynamicGameVersions.length > 0) {
              matchesVersion = (mod.id % dynamicGameVersions.length === idx);
            } else {
              matchesVersion = true;
            }
          }
        }
      }

      return matchesSearch && matchesCategory && matchesVersion;
    });

    if (sortBy === 'downloads') {
      result = [...result].sort((a, b) => b.downloads_count - a.downloads_count);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [mods, searchTerm, selectedCategory, selectedVersion, sortBy, dynamicGameVersions]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAndSortedMods.length / itemsPerPage);

  const paginatedMods = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMods, currentPage]);

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Section */}
      <div className="flex flex-col items-center justify-center text-center py-4 sm:py-6 lg:py-8 px-4 space-y-1 sm:space-y-2 font-sans animate-fade-in">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          <span className="text-brand-cyan">Mods</span>Drive
        </h1>
        <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-300 tracking-wide">
          {t.heroSubtitle}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl leading-snug sm:leading-relaxed text-center">
          {t.heroDescription}
        </p>
      </div>

      <div id="homepage-root" className="animate-fade-in flex flex-col lg:flex-row gap-8 pb-12">
      
      {/* Mobile Sidebar Filter Drawer (Opens when clicking the three dots in top corner of the featured modifications header) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-filter-drawer">
          {/* Backdrop Overlay with blur */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-[#0c0c0e] border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl z-50">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-rose-400 text-gray-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-right">
                <h3 className="text-sm font-black text-brand-cyan">{t.filterTitle}</h3>
                <p className="text-[10px] text-gray-500">{t.filterDesc}</p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold text-right font-mono">{t.filterTitle}</h4>
              <div className="space-y-1 text-xs font-semibold max-h-[280px] overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    handleCategoryChange('all');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 border-r-2 transition-all flex justify-between items-center ${
                    selectedCategory === 'all'
                      ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan'
                      : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                  style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                >
                  <span>{t.categoryAll}</span>
                  <span className="text-[10px] opacity-75 bg-black/40 px-2 py-0.5 rounded-full">{stats.total}</span>
                </button>

                {categoryItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleCategoryChange(item.key);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-right px-3 py-2 border-r-2 transition-all flex justify-between items-center ${
                        selectedCategory === item.key
                          ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan'
                          : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                      }`}
                      style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                    >
                      <span className="flex items-center gap-2">
                        <IconComp className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                        <span className="truncate">{getCategoryLabel(item.key)}</span>
                      </span>
                      <span className="text-[10px] opacity-75 bg-black/40 px-2 py-0.5 rounded-full">
                        {stats[item.key as keyof typeof stats] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Versions */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold text-right font-mono">{t.versionLabel}</h4>
              <div className="space-y-1 text-xs font-semibold max-h-[220px] overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    handleVersionChange('all');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 border-r-2 transition-all flex justify-between items-center ${
                    selectedVersion === 'all'
                      ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan'
                      : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                  style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                >
                  <span>{t.allVersions}</span>
                  <span className="text-[10px] opacity-75 bg-black/40 px-2 py-0.5 rounded-full">{versionStats.all}</span>
                </button>

                {dynamicGameVersions.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      handleVersionChange(v);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 border-r-2 transition-all flex justify-between items-center ${
                      selectedVersion === v
                        ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan'
                        : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    <span>{t.versionLabel} {v}</span>
                    <span className="text-[10px] opacity-75 bg-black/40 px-2 py-0.5 rounded-full">
                      {versionStats[v]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-auto w-full py-2.5 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold text-xs uppercase rounded-lg hover:bg-brand-cyan/20 transition-all text-center font-sans cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}
      
      {/* Sidebar Filters - Left side */}
      <aside className="hidden lg:flex lg:w-64 flex-shrink-0 flex-col gap-6 font-sans lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1">
        
        {/* Categories Section */}
        <div className="bg-dark-card border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{t.filterTitle}</h3>
          <div className="space-y-1 text-xs font-semibold max-h-[380px] overflow-y-auto pr-1">
            
            <button
              onClick={() => handleCategoryChange('all')}
              className={`w-full text-left px-3 py-2.5 rounded transition-all flex justify-between items-center ${
                selectedCategory === 'all'
                  ? 'bg-brand-cyan/10 text-brand-cyan'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{t.categoryAll}</span>
              <span className="text-[10px] opacity-70 bg-black/40 px-2 py-0.5 rounded-full">{stats.total}</span>
            </button>

            {categoryItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleCategoryChange(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded transition-all flex justify-between items-center ${
                    selectedCategory === item.key
                      ? 'bg-brand-cyan/10 text-brand-cyan'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <IconComp className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span className="truncate">{getCategoryLabel(item.key)}</span>
                  </span>
                  <span className="text-[10px] opacity-70 bg-black/40 px-2 py-0.5 rounded-full">
                    {stats[item.key as keyof typeof stats] ?? 0}
                  </span>
                </button>
              );
            })}

          </div>
        </div>

        {/* Game Versions Section */}
        <div className="bg-dark-card border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{t.versionLabel}</h3>
          <div className="space-y-1 text-xs font-semibold max-h-[300px] overflow-y-auto pr-1">
            
            <button
              onClick={() => handleVersionChange('all')}
              className={`w-full text-left px-3 py-2.5 rounded transition-all flex justify-between items-center ${
                selectedVersion === 'all'
                  ? 'bg-brand-cyan/10 text-brand-cyan'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{t.allVersions}</span>
              <span className="text-[10px] opacity-70 bg-black/40 px-2 py-0.5 rounded-full">{versionStats.all}</span>
            </button>

            {dynamicGameVersions.map((version) => (
              <button
                key={version}
                onClick={() => handleVersionChange(version)}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex justify-between items-center ${
                  selectedVersion === version
                    ? 'bg-brand-cyan/10 text-brand-cyan'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{version}</span>
                <span className="text-[10px] opacity-70 bg-black/40 px-2 py-0.5 rounded-full">
                  {versionStats[version]}
                </span>
              </button>
            ))}

          </div>
        </div>

        {/* ModsFire Banner Static info */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-dark-input to-slate-950 border border-white/5 text-[11px] text-gray-500 leading-relaxed font-sans">
          All modification packages are hosted securely on <span className="text-gray-300 underline underline-offset-4 decoration-gray-700">ModsFire (modsfire.com)</span> mirroring servers for maximum lifetime longevity and uncapped hotlink speeds.
        </div>
      </aside>

      {/* Main Grid Content Area */}
      <section className="flex-1 bg-dark-section border border-white/5 rounded-xl p-6 lg:p-8 overflow-hidden flex flex-col gap-6">

        {/* Top Search and Sort Controls Area - Rearranged for beautiful vertical hierarchy */}
        <div id="top-search-sort-bar" className="flex flex-col gap-4 p-4 sm:p-5 bg-dark-card border border-white/5 rounded-xl">
          {/* ROW 1 - Stats bar (separate line) */}
          <div className="flex flex-row justify-between items-center text-xs text-gray-500 font-sans border-b border-white/5 pb-2 md:pb-2.5">
            <span className="font-semibold text-gray-400 bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/5">
              {lang === 'ar' ? `إجمالي المودات: ${stats.total}` : lang === 'fr' ? `Total : ${stats.total} mods` : `Total Mods: ${stats.total}`}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-mono">
              {lang === 'ar' ? 'سحابي نشط' : 'Cloud Sync Active'}
            </span>
          </div>

          {/* ROW 2 - Search and filters (separate line below) */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input on the Left */}
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-brand-cyan" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full text-xs bg-dark-input border border-white/10 rounded-lg py-2.5 pl-10 pr-12 text-gray-200 focus:outline-none focus:border-brand-cyan transition-colors placeholder-gray-500 font-semibold"
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 text-brand-cyan hover:text-rose-400 text-xs font-mono font-bold"
                >
                  {lang === 'ar' ? 'مسح' : lang === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>

            {/* Controls on the Right: Sort Select & Refresh (Sync) Button */}
            <div className="flex flex-row gap-3 items-center shrink-0 w-full md:w-auto">
              {/* Sort selector */}
              <div className="relative flex-1 md:w-48">
                <select 
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="w-full bg-dark-input border border-white/10 rounded-lg py-2.5 pl-3 pr-8 text-xs text-brand-cyan focus:outline-none focus:border-brand-cyan transition-colors font-bold uppercase tracking-wide cursor-pointer appearance-none"
                >
                  <option value="downloads" className="text-white bg-dark-card">🔥 {t.sortByDownloads}</option>
                  <option value="newest" className="text-white bg-dark-card">📅 {t.sortByNewest}</option>
                  <option value="id" className="text-white bg-dark-card">⭐ {t.sortByPopularity}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-brand-cyan">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Sync Button */}
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono uppercase text-gray-400 hover:text-brand-cyan transition-colors disabled:opacity-40 shrink-0"
                title="Sync Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-sans font-semibold tracking-wide text-[11px]">{isLoading ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error / Actual displays state */}
        {error ? (
          <div id="homepage-error-state" className="flex flex-col items-center justify-center py-16 px-4 bg-dark-card border border-red-500/15 rounded-2xl text-center shadow-xl space-y-4 max-w-lg mx-auto my-8 relative overflow-hidden" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50" />
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
              {error.code === 'NETWORK_ERROR' ? (
                <WifiOff className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
              {error.code === 'NETWORK_ERROR' ? t.errorNetwork : t.errorDatabase}
            </h3>
            <p className="text-xs text-gray-400 font-sans max-w-sm">
              {error.message || 'An unexpected error occurred while communicating with the database.'}
            </p>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 py-2.5 px-6 bg-brand-cyan hover:bg-[#FF7300] text-black font-extrabold uppercase rounded text-xs tracking-wider transition-colors duration-300 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.retryButton}</span>
            </button>
          </div>
        ) : isLoading ? (
          <div id="homepage-skeleton" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-dark-card/50 border border-white/5 rounded-xl overflow-hidden p-4 space-y-4 animate-pulse">
                <div className="h-32 bg-slate-900 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedMods.length > 0 ? (
          <div className="space-y-8">
            {/* Actual grid matching design grid height / spacing properties beautifully */}
            <div id="mods-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedMods.map((mod) => (
                <ModCard 
                  key={mod.id} 
                  mod={mod} 
                  onSelect={onSelectMod} 
                  lang={lang}
                  searchTerm={searchTerm}
                />
              ))}
            </div>

            {/* Beautiful pagination controls inside containing box */}
            {totalPages > 1 && (
              <div id="pagination-controls" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-6 border-t border-white/5 bg-dark-card/30 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-medium">
                  {t.pageFormat
                    .replace('{current}', String(currentPage))
                    .replace('{total}', String(totalPages))
                    .replace('{count}', String(filteredAndSortedMods.length))
                  }
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      document.getElementById('top-search-sort-bar')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                      currentPage === 1
                        ? 'border-white/5 bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 bg-dark-card hover:bg-[#ff5c00]/25 hover:border-brand-cyan/50 text-gray-300 hover:text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {t.prev}
                  </button>
                  
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[150px] sm:max-w-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          document.getElementById('top-search-sort-bar')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center border shrink-0 ${
                          currentPage === pageNum
                            ? 'bg-brand-cyan/25 border-brand-cyan/50 text-brand-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      document.getElementById('top-search-sort-bar')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                      currentPage === totalPages
                        ? 'border-white/5 bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 bg-dark-card hover:bg-[#ff5c00]/25 hover:border-brand-cyan/50 text-gray-300 hover:text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Search fallback matching elegant structure style */
          <div id="empty-state-fallback" className="bg-dark-card border border-dashed border-white/5 rounded-xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center mx-auto text-gray-500">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{t.noFavs}</h3>
            </div>
            <button 
              onClick={() => {
                handleSearchChange('');
                handleCategoryChange('all');
              }}
              className="text-[10px] bg-white/5 border border-white/10 hover:bg-white/10 text-brand-cyan px-4 py-2 rounded font-black tracking-tighter uppercase"
            >
              {lang === 'ar' ? 'إعادة ضبط التصفية' : lang === 'fr' ? 'Réinitialiser' : 'Reset Filters'}
            </button>
          </div>
        )}

      </section>

    </div>
    </div>
  );
};
