/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Plus, Trash2, Key, Database, Files, AlertTriangle, ArrowLeft, ExternalLink, ShieldCheck, Search, Filter, Edit3, Eye, EyeOff } from 'lucide-react';
import { Mod } from '../types';
import { IS_DEMO_MODE } from '../supabaseClient';
import { HighlightText } from './HighlightText';

import { Language, translations } from '../translations';

const IS_DEV = !!((import.meta as any).env && (import.meta as any).env.DEV);

interface AdminPageProps {
  mods: Mod[];
  onAddMod: (mod: Omit<Mod, 'id' | 'created_at' | 'downloads_count'>) => Promise<boolean>;
  onDeleteMod: (id: number) => Promise<boolean>;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  onNavigateHome: () => void;
  lang?: Language;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  mods,
  onAddMod,
  onDeleteMod,
  triggerToast,
  onNavigateHome,
  lang = 'ar',
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modPendingDelete, setModPendingDelete] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (modPendingDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modPendingDelete]);
  
  // Form fields
  const [modName, setModName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'cars' | 'trucks' | 'buses' | 'boats' | 'excavators' | 'maps' | 'motorcycles' | 'news' | 'others' | 'planes' | 'tractors' | 'updates' | 'trailers'>('cars');
  const [imageUrl, setImageUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [gameVersion, setGameVersion] = useState('v0.38');
  const [modVersion, setModVersion] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);
  const [fileSize, setFileSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination & Filtering state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVersion, setFilterVersion] = useState<string>('all');

  const t = translations[lang];

  // Dynamic distinct versions for the filter dropdown
  const uniqueVersions = useMemo(() => {
    const versions = mods
      .map(m => m.game_version)
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return Array.from(new Set(versions)).sort().reverse();
  }, [mods]);

  // List of formatted categories for filtering
  const categoriesList = [
    { key: 'all', label: t.categoryAll },
    { key: 'cars', label: t.categoryCars },
    { key: 'trucks', label: t.categoryTrucks },
    { key: 'buses', label: t.categoryBuses },
    { key: 'trailers', label: t.categoryTrailers },
    { key: 'boats', label: t.categoryBoats },
    { key: 'excavators', label: t.categoryExcavators },
    { key: 'maps', label: t.categoryMaps },
    { key: 'motorcycles', label: t.categoryMotorcycles },
    { key: 'planes', label: t.categoryPlanes },
    { key: 'tractors', label: t.categoryTractors },
    { key: 'others', label: t.categoryOthers },
  ];

  // Smart fuzzy and character-presence matching function for admin search
  const matchesSearchCriteria = (name: string, query: string): boolean => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return true;

    const targetName = name.toLowerCase();

    const checkText = (text: string): boolean => {
      // 1. Exact substring check (high accuracy direct matches)
      if (text.includes(cleanQuery)) return true;

      // 2. Individual words check (contains all words, in any order)
      const words = cleanQuery.split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        if (words.every(word => text.includes(word))) return true;
      }

      // 3. Sequential character presence check (characters are typed in order, e.g., 'm5' in 'BMW M5')
      let queryIdx = 0;
      for (let charIdx = 0; charIdx < text.length; charIdx++) {
        if (text[charIdx] === cleanQuery[queryIdx]) {
          queryIdx++;
        }
        if (queryIdx === cleanQuery.length) return true;
      }

      // 4. Complete letter presence check (all alphanumeric and Arabic characters typed in query must match letters in the text)
      const queryLetters = cleanQuery.replace(/[^a-z0-9\u0600-\u06FF]/g, ''); // supports English and Arabic alphabet
      if (queryLetters.length > 1) {
        let isAllPresent = true;
        for (let i = 0; i < queryLetters.length; i++) {
          if (!text.includes(queryLetters[i])) {
            isAllPresent = false;
            break;
          }
        }
        if (isAllPresent) return true;
      }

      return false;
    };

    return checkText(targetName);
  };

  // Search & dynamic filtering logic
  const filteredMods = useMemo(() => {
    return mods.filter(mod => {
      const matchesSearch = matchesSearchCriteria(mod.name, searchQuery);
      const matchesCategory = filterCategory === 'all' || mod.category === filterCategory;
      const matchesVersion = filterVersion === 'all' || mod.game_version === filterVersion;

      return matchesSearch && matchesCategory && matchesVersion;
    });
  }, [mods, searchQuery, filterCategory, filterVersion]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredMods.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedMods = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredMods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMods, activePage]);

  // Handle password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
    if (!adminPassword) {
      triggerToast("Admin access is not configured", "info");
      return;
    }
    if (password === adminPassword) {
      setIsAuthenticated(true);
      triggerToast("Access Granted! Welcome to Gearbox Administrative Deck.", "success");
    } else {
      triggerToast("Access Denied! Incorrect security code.", "info");
    }
  };

  // Populate existing mod details into the form fields
  const handlePopulateMod = (mod: Mod) => {
    setModName(mod.name || '');
    setDescription(mod.description || '');
    setCategory((mod.category?.toLowerCase() || 'cars') as any);
    setImageUrl(mod.image_url || '');
    setDownloadUrl(mod.download_url || '');
    setGameVersion(mod.game_version || 'v0.38');
    setModVersion(mod.mod_version || '');
    setGalleryUrls(mod.gallery_urls && mod.gallery_urls.length > 0 ? [...mod.gallery_urls] : ['']);
    setFileSize(mod.file_size || '');
    
    // Smooth scroll to the publisher form so the user can easily see their data loaded
    const formElement = document.getElementById('admin-console-root');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }

    triggerToast(
      lang === 'ar' 
        ? `تم تعبئة تفاصيل المود "${mod.name}" في لوحة التحكم بنجاح` 
        : lang === 'fr' 
        ? `Détails du mod "${mod.name}" chargés dans le panneau d'administration` 
        : `Loaded "${mod.name}" details into the administration input panel`,
      'success'
    );
  };

  // Submit new Mod creation
  const handleCreateModSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (IS_DEV) {
      console.log('AdminPage: Form submission triggered');
    }

    if (!modName || !description || !imageUrl || !downloadUrl || !gameVersion) {
      if (IS_DEV) {
        console.warn('AdminPage: Validation failed - missing fields');
      }
      triggerToast("Please fill in all requested fields", "info");
      return;
    }

    // Dynamic field validation triggers
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      triggerToast("Warning: Image URL should be a valid absolute HTTP link", "info");
    }
    if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
      triggerToast("Warning: Download URL should be a valid absolute HTTP link", "info");
    }

    const finalGalleryUrls = galleryUrls
      .filter((url): url is string => typeof url === 'string')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (IS_DEV) {
      console.log('AdminPage: Submitting data payload...', {
        name: modName,
        description,
        category,
        image_url: imageUrl,
        download_url: downloadUrl,
        game_version: gameVersion,
        mod_version: modVersion || undefined,
        gallery_urls: finalGalleryUrls.length > 0 ? finalGalleryUrls : undefined,
        file_size: fileSize || undefined,
      });
    }

    setIsSubmitting(true);
    try {
      const success = await onAddMod({
        name: modName,
        description,
        category,
        image_url: imageUrl,
        download_url: downloadUrl,
        game_version: gameVersion,
        mod_version: modVersion || undefined,
        gallery_urls: finalGalleryUrls.length > 0 ? finalGalleryUrls : undefined,
        file_size: fileSize || undefined,
      });

      if (success) {
        if (IS_DEV) {
          console.log('AdminPage: Mod saved successfully!');
        }
        // Reset form inputs
        setModName('');
        setDescription('');
        setImageUrl('');
        setDownloadUrl('');
        setGameVersion('v0.38');
        setModVersion('');
        setFileSize('');
        setGalleryUrls(['']);
        triggerToast("Modification record created and saved standard in DB!", "success");
      } else {
        if (IS_DEV) {
          console.warn('AdminPage: Add mod returned unsuccessful');
        }
        triggerToast("Failed to create the record", "info");
      }
    } catch (err: any) {
      if (IS_DEV) {
        console.error("AdminPage: Error caught during handleCreateModSubmit:", err);
      }
      const errMsg = err?.message || err?.details || JSON.stringify(err) || "Unknown database error";
      triggerToast(`Error saving to DB: ${errMsg}`, "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modPendingDelete) return;
    const { id } = modPendingDelete;
    setModPendingDelete(null);
    try {
      const success = await onDeleteMod(id);
      if (success) {
        triggerToast("Mod deleted successfully", "success");
      } else {
        triggerToast("Failed to delete the mod", "info");
      }
    } catch (err) {
      triggerToast("Error triggering deletion query", "info");
    }
  };

  // Lock Screen View
  if (!isAuthenticated) {
    return (
      <div id="admin-auth-lock-screen" className="max-w-md mx-auto py-16 px-4 animate-fade-in">
        <div className="bg-dark-card border border-white/5 rounded-xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-brand-cyan opacity-80"></div>
          
          <div className="w-14 h-14 bg-black/40 border border-brand-cyan/20 text-brand-cyan rounded-xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(255,92,0,0.18)]">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">Administrative Deck</h2>
            <p className="text-xs text-gray-500">Authorized clearance required to publish vehicles or manage files</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Security Passcode</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Passcode..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-dark-input border border-white/10 text-white pl-10 pr-10 py-2.5 rounded outline-none focus:border-brand-cyan/80 transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-cyan transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>

            <button
              type="submit"
              className="w-full bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-2.5 px-4 rounded text-xs transition-colors shadow-[0_0_15px_rgba(255,92,0,0.25)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-tighter"
            >
              <span>Authorize Access</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={onNavigateHome}
              className="text-xs text-gray-500 hover:text-white font-mono flex items-center gap-1.5 justify-center mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Terminal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Administration Console
  return (
    <div id="admin-console-root" className="space-y-8 pb-16 animate-fade-in">
      
      {/* Header and warning banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs text-brand-cyan font-mono tracking-widest uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED ADMINISTRATIVE CONSOLE</span>
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 uppercase">Vehicle Fleet Publisher</h2>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="self-start sm:self-auto bg-white/5 border border-white/10 text-gray-400 hover:text-brand-cyan px-3.5 py-1.5 rounded text-xs font-mono transition-colors"
        >
          Session Lock (Logout)
        </button>
      </div>

      {/* Grid container: Publisher Form (left) & Active Registry list (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Span 5: Mod Upload Publisher form */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 space-y-5 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan opacity-80"></div>
            
            <div className="flex items-center gap-2 text-white">
              <Plus className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-base font-bold tracking-tight uppercase">Publish A New Vehicle</h3>
            </div>

            <form onSubmit={handleCreateModSubmit} className="space-y-4 text-xs font-mono">
              
              {/* Form Input: Mod Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">Mod / Fleet Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. BMW M5 F90 Competition 2021"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                  required
                />
              </div>

              {/* Form Input: Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">Category Selection / تحديد القسم</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all text-xs"
                >
                  <option value="cars">🚗 سيارات / Cars</option>
                  <option value="trucks">🚛 شاحنات / Trucks</option>
                  <option value="buses">🚌 حافلات / Buses</option>
                  <option value="trailers">📦 مقطورات / Trailers</option>
                  <option value="boats">🛥️ قوارب / Boats</option>
                  <option value="excavators">🏗️ حفارات / Excavators</option>
                  <option value="maps">🗺️ خرائط / Maps</option>
                  <option value="motorcycles">🏍️ دراجات نارية / Motorcycles</option>
                  <option value="planes">✈️ طائرات / Planes</option>
                  <option value="tractors">🚜 جرارات / Tractors</option>
                  <option value="others">📦 أخرى / Others</option>
                </select>
              </div>

              {/* Form Input: Game Version */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">Game Version / إصدار اللعبة الموافق للمود</label>
                <select
                  value={gameVersion}
                  onChange={(e) => setGameVersion(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all text-xs"
                  required
                >
                  <option value="v0.38">v0.38</option>
                  <option value="v0.37">v0.37</option>
                  <option value="v0.36">v0.36</option>
                  <option value="v0.35">v0.35</option>
                  <option value="v0.34">v0.34</option>
                  <option value="v0.33">v0.33</option>
                  <option value="v0.32">v0.32</option>
                  <option value="v0.31">v0.31</option>
                  <option value="v0.30">v0.30</option>
                  <option value="v0.29">v0.29</option>
                  <option value="v0.28">v0.28</option>
                  <option value="v0.27">v0.27</option>
                  <option value="v0.26">v0.26</option>
                  <option value="v0.25">v0.25</option>
                  <option value="v0.24">v0.24</option>
                </select>
              </div>

              {/* Form Input: Mod Version */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Mod Version (Optional) / إصدار المود (اختياري)</label>
                  <span className="text-[8px] text-gray-500">Optional / اختياري</span>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. v1.0, 2.4-beta, or leave empty"
                  value={modVersion}
                  onChange={(e) => setModVersion(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                />
              </div>

              {/* Form Input: Mod Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">
                    {lang === 'ar' ? 'حجم المود / الملف (اختياري)' : lang === 'fr' ? 'Taille du mod (Facultatif)' : 'Mod File Size (Optional)'}
                  </label>
                  <span className="text-[8px] text-gray-500">Optional / اختياري</span>
                </div>
                <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'مثال: 45 MB, 1.2 GB' : 'e.g. 45 MB, 1.2 GB'}
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                />
              </div>

              {/* Form Input: Image URL */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Cover Image URL</label>
                  <span className="text-[8px] text-gray-500">JPEG/PNG/WebP</span>
                </div>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                  required
                />
                <p className="text-[9px] text-gray-500 font-sans">
                  Paste direct public image URL (cloud storage links or public images).
                </p>
              </div>

              {/* Form Input: Sub-Image URLs (Secondary Screenshots) */}
              <div className="space-y-3 bg-black/35 p-3.5 rounded-lg border border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-brand-orange font-bold block">Sub-Image URLs / الصور الفرعية</label>
                    <span className="text-[9px] text-gray-500 block">Screenshots for the gallery (optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryUrls(prev => [...prev, ''])}
                    className="bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan text-[10px] uppercase tracking-tight px-2.5 py-1 rounded transition-all font-bold"
                  >
                    + Add Image Link
                  </button>
                </div>

                <div className="space-y-2">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="url" 
                        placeholder={`Sub-image URL #${index + 1}`}
                        value={url}
                        onChange={(e) => {
                          const updated = [...galleryUrls];
                          updated[index] = e.target.value;
                          setGalleryUrls(updated);
                        }}
                        className="flex-1 bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                      />
                      {galleryUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="bg-rose-950/45 hover:bg-rose-900/60 border border-rose-900/40 text-rose-400 p-2.5 rounded transition-all"
                          title="Remove Image Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Previews Grid if any valid images are pasted */}
                {galleryUrls.some(url => url.trim().startsWith('http')) && (
                  <div className="mt-3.5 pt-3 border-t border-white/5">
                    <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider mb-2 block">Live Previews:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {galleryUrls.filter(url => url.trim().startsWith('http')).map((url, index) => (
                        <div key={index} className="aspect-video bg-black rounded border border-white/10 overflow-hidden relative group">
                          <img 
                            src={url.trim()} 
                            alt={`Preview #${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input: Download URL */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">ModsFire Download URL</label>
                  <span className="text-[8px] text-gray-500">Direct download link</span>
                </div>
                <input 
                  type="url" 
                  placeholder="https://modsfire.com/XXXXXXXXXX"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs font-mono"
                  required
                />
                <p className="text-[9px] text-gray-500 font-sans">
                  The actual download link from ModsFire.
                </p>
              </div>

              {/* Form Input: Full Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">Tuning Specifications</label>
                <textarea 
                  rows={4}
                  placeholder="Engine details, handling variables, customs, and compatibility notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-dark-input border border-white/10 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-3 rounded text-xs transition-all shadow-[0_0_15px_rgba(255,92,0,0.2)] hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] disabled:opacity-40 cursor-pointer font-sans uppercase tracking-tight"
              >
                <span>{isSubmitting ? 'Registering fleet model...' : 'Publish Modification'}</span>
              </button>

            </form>

            {/* Information Sandbox notification */}
            {IS_DEMO_MODE && (
              <div className="bg-black/35 border border-white/5 p-4 rounded flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-normal font-sans">
                  <strong>Notice:</strong> Currently compiling in demo mode. Saving publishes these directly to your browser's persistent state container (<code className="text-brand-cyan font-mono">localStorage</code>).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Span 7: Active Registry Catalog lists */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Files className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-base font-bold text-white tracking-tight uppercase">
                  {lang === 'ar' ? 'نموذج قاعدة بيانات المودات' : lang === 'fr' ? 'Registre de Modifications' : 'Registry Database'} ({filteredMods.length === mods.length ? mods.length : `${filteredMods.length}/${mods.length}`})
                </h3>
              </div>
              <span className="text-[10px] text-gray-500 font-mono uppercase">Control panel</span>
            </div>

            {/* Search and Filters Section */}
            <div className="bg-black/35 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                <Filter className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{lang === 'ar' ? 'خيارات البحث والتصفية للناشر' : lang === 'fr' ? 'Filtrage & Triage' : 'Manager Search & Filters'}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                {/* Text query filter */}
                <div className="md:col-span-6 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center shrink-0 pointer-events-none text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs bg-dark-input border border-white/10 text-white pl-9 pr-8 py-2 rounded-lg outline-none focus:border-brand-cyan transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white font-mono text-sm leading-none p-1 shrink-0 rounded hover:bg-white/5"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Categories selector dropdown */}
                <div className="md:col-span-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs bg-dark-input border border-white/10 text-gray-300 px-2 py-2 rounded-lg outline-none focus:border-brand-cyan transition-all cursor-pointer font-sans"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Releases / Game Version selector dropdown */}
                <div className="md:col-span-3">
                  <select
                    value={filterVersion}
                    onChange={(e) => {
                      setFilterVersion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs bg-dark-input border border-white/10 text-gray-300 px-2 py-2 rounded-lg outline-none focus:border-brand-cyan transition-all cursor-pointer font-sans"
                  >
                    <option value="all">
                      {lang === 'ar' ? 'كل إصدارات اللعبة' : lang === 'fr' ? 'Toutes les versions' : 'All Game Releases'}
                    </option>
                    {uniqueVersions.map(ver => (
                      <option key={ver} value={ver}>
                        {ver}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset state helper button */}
              {(searchQuery || filterCategory !== 'all' || filterVersion !== 'all') && (
                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[10px] text-gray-500">
                  <span>
                    {lang === 'ar' 
                      ? `تم العثور على ${filteredMods.length} مود` 
                      : lang === 'fr' 
                      ? `${filteredMods.length} mod(s) filtré(s)` 
                      : `${filteredMods.length} mod(s) matched`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                      setFilterVersion('all');
                      setCurrentPage(1);
                    }}
                    className="text-brand-cyan hover:underline hover:text-[#FF7300] font-bold uppercase cursor-pointer"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              )}
            </div>

            {/* Mod listings viewport */}
            {paginatedMods.length > 0 ? (
              <div id="admin-mods-registry-table" className="divide-y divide-white/5 max-h-[640px] overflow-y-auto pr-2 space-y-3 pt-1">
                {paginatedMods.map((mod) => (
                  <div key={mod.id} className="flex gap-4 items-start py-3.5 first:pt-0">
                    {/* Clickable Area for Populating */}
                    <div 
                      onClick={() => handlePopulateMod(mod)}
                      className="flex-1 flex gap-4 items-start cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all duration-300 group/clickable"
                      title={lang === 'ar' ? 'اضغط لتعبئة وتعديل بيانات المود' : 'Click to load & edit details'}
                    >
                      {/* Tiny visual card preview */}
                      <div className="relative shrink-0 mt-0.5 group-hover/clickable:scale-105 transition-transform duration-300">
                        <img 
                          src={mod.image_url} 
                          alt="" 
                          className="w-16 h-12 rounded object-cover bg-slate-950 border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/clickable:opacity-100 flex items-center justify-center transition-all duration-300 rounded">
                          <Edit3 className="w-4 h-4 text-brand-cyan" />
                        </div>
                      </div>

                      {/* Metadata details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-200 group-hover/clickable:text-brand-cyan truncate pr-1 transition-colors" title={mod.name}>
                            <HighlightText text={mod.name} search={searchQuery} />
                          </span>
                          
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-black/60 border border-brand-cyan/20 text-brand-cyan">
                            {mod.category}
                          </span>
                          {mod.game_version && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/10 text-gray-300">
                              Game: {mod.game_version}
                            </span>
                          )}
                          {mod.mod_version && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-brand-cyan/10 text-brand-cyan">
                              Mod: {mod.mod_version}
                            </span>
                          )}
                          {mod.file_size && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-amber-500/10 text-amber-500">
                              Size: {mod.file_size}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-gray-500 font-mono mt-1.5 flex flex-wrap gap-x-4 gap-y-1 items-center" onClick={(e) => e.stopPropagation()}>
                          <span>Downloads: <strong className="text-brand-cyan">{mod.downloads_count.toLocaleString()}</strong></span>
                          <span>UID: <code className="text-gray-400">#{mod.id}</code></span>
                          <a 
                            href={mod.download_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white hover:underline flex items-center gap-0.5 shrink-0"
                          >
                            <span>ModsFire Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Controls (Preview, Edit, or Delete) */}
                    <div className="flex items-center gap-1.5 mt-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.history.pushState(null, '', `/mod/${mod.id}`);
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="bg-black/40 hover:bg-emerald-500/20 p-2 border border-white/5 hover:border-emerald-500/40 text-emerald-400 rounded transition-all duration-300 cursor-pointer"
                        title={lang === 'ar' ? 'معاينة صفحة المود كمستخدم' : 'Preview mod page as user'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePopulateMod(mod)}
                        className="bg-black/40 hover:bg-brand-cyan/20 p-2 border border-white/5 hover:border-brand-cyan/40 text-gray-400 hover:text-brand-cyan rounded transition-all duration-300 cursor-pointer"
                        title={lang === 'ar' ? 'تعديل / تعبئة بالنموذج' : 'Load into form / Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setModPendingDelete({ id: mod.id, name: mod.name })}
                        className="bg-black/40 hover:bg-red-950/40 p-2 border border-white/5 hover:border-red-500/30 text-gray-500 hover:text-red-400 rounded transition-all duration-300 cursor-pointer"
                        title="Permanently remove mod"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 font-mono text-xs">
                Registry is empty. Populate database using the publisher.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div id="admin-pagination-controls" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 mt-4">
                <span className="text-xs text-slate-400 font-medium">
                  {t.pageFormat
                    .replace('{current}', String(activePage))
                    .replace('{total}', String(totalPages))
                    .replace('{count}', String(filteredMods.length))
                  }
                </span>
                
                <div className="flex items-center gap-1.5 self-center">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border shrink-0 uppercase tracking-tighter ${
                      activePage === 1
                        ? 'border-white/5 bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 bg-dark-card hover:bg-brand-cyan/15 hover:border-brand-cyan/40 text-gray-300 hover:text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {t.prev}
                  </button>
                  
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-[120px] sm:max-w-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center border shrink-0 ${
                          activePage === pageNum
                            ? 'bg-brand-cyan/25 border-brand-cyan/40 text-brand-cyan'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10 cursor-pointer'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border shrink-0 uppercase tracking-tighter ${
                      activePage === totalPages
                        ? 'border-white/5 bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 bg-dark-card hover:bg-brand-cyan/15 hover:border-brand-cyan/40 text-gray-300 hover:text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {modPendingDelete && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-overlay-fade-in"
          onClick={() => setModPendingDelete(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] animate-responsive-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/25 text-red-500 mt-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {lang === 'ar' ? 'تأكيد الحذف' : lang === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion'}
                </h3>
                
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {lang === 'ar' 
                    ? `هل أنت متأكد من حذف المود "${modPendingDelete.name}" بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.` 
                    : lang === 'fr' 
                    ? `Êtes-vous sûr de vouloir supprimer définitivement "${modPendingDelete.name}" ? Cette action est irréversible.` 
                    : `Are you sure you want to permanently delete "${modPendingDelete.name}"? This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row gap-3 mt-6 ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setModPendingDelete(null)}
                className="flex-1 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer text-center font-sans"
              >
                {lang === 'ar' ? 'إلغاء' : lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 cursor-pointer text-center font-sans"
              >
                {lang === 'ar' ? 'حذف نهائياً' : lang === 'fr' ? 'Supprimer définitivement' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
