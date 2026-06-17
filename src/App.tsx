/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ModDetailPage } from './components/ModDetailPage';
import { AdminPage } from './components/AdminPage';
import { FeedbackToast } from './components/FeedbackToast';
import { getMods, createMod, deleteMod, IS_DEMO_MODE } from './supabaseClient';
import { Mod, RouteState } from './types';
import { Hammer, Github, ShieldAlert, Cpu } from 'lucide-react';
import { Language, translations } from './translations';

export default function App() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Multi-language state with localStorage persistence
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'en' || saved === 'fr' || saved === 'ar') ? saved as Language : 'ar';
  });

  // Keep HTML document direction (RTL/LTR) in sync with active language
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  // Feedback toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Parse active hash route
  const parseHashRoute = useCallback((): RouteState => {
    // 1. Support path routing for /amdj0602 (so it works when typed directly)
    const pathname = window.location.pathname;
    if (pathname === '/amdj0602' || pathname.endsWith('/amdj0602')) {
      // Warm redirect: Replace history path with root and switch to hash route
      window.history.replaceState(null, '', window.location.origin + '/');
      window.location.hash = '#/amdj0602';
      return { page: 'amdj0602' };
    }

    const hash = window.location.hash || '#home';
    if (hash.startsWith('#mod/') || hash.startsWith('#/mod/')) {
      const cleanHash = hash.startsWith('#/mod/') ? hash.substring(2) : hash.substring(1);
      const parts = cleanHash.split('/');
      const id = parseInt(parts[1], 10);
      return { page: 'detail', selectedModId: isNaN(id) ? undefined : id };
    } else if (hash === '#amdj0602' || hash === '#/amdj0602') {
      return { page: 'amdj0602' };
    } else {
      return { page: 'home' };
    }
  }, []);

  const [route, setRoute] = useState<RouteState>({ page: 'home' });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state router with hashchange event
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };

    // Parse once on mount
    setRoute(parseHashRoute());

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [parseHashRoute]);

  // Load mods list
  const loadModsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMods();
      setMods(data);
    } catch (err) {
      setToast({
        message: "Unable to retrieve simulator catalogue from network.",
        type: "info"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModsList();
  }, [loadModsList]);

  // Navigation setter
  const handleNavigate = useCallback((page: 'home' | 'detail' | 'amdj0602', selectedModId?: number) => {
    if (page === 'detail' && selectedModId !== undefined) {
      window.location.hash = `#/mod/${selectedModId}`;
    } else if (page === 'amdj0602') {
      window.location.hash = '#/amdj0602';
    } else {
      window.location.hash = '#/home';
    }
  }, []);

  // Show Toast messaging helper
  const triggerToast = useCallback((message: string, type: 'success' | 'info') => {
    setToast({ message, type });
  }, []);

  // Add mod callback
  const handleAddMod = useCallback(async (newModData: Omit<Mod, 'id' | 'created_at' | 'downloads_count'>): Promise<boolean> => {
    try {
      console.log('App [handleAddMod]: Initiating mod save with payload:', newModData);
      const savedMod = await createMod(newModData);
      console.log('App [handleAddMod]: Mod successfully saved and returned:', savedMod);
      // Prepend to current cache state immediately for rapid reflection
      setMods(prevMods => [savedMod, ...prevMods]);
      return true;
    } catch (err) {
      console.error('App [handleAddMod]: Failed to save new mod:', err);
      // Rethrow to let the UI display the explicit database error message to the administrator
      throw err;
    }
  }, []);

  // Delete mod callback
  const handleDeleteMod = useCallback(async (id: number): Promise<boolean> => {
    try {
      const success = await deleteMod(id);
      if (success) {
        setMods(prevMods => prevMods.filter(m => m.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  // Download counter syncer
  const handleDownloaded = useCallback((modId: number, nextCount: number) => {
    setMods(prevMods => 
      prevMods.map(m => m.id === modId ? { ...m, downloads_count: nextCount } : m)
    );
  }, []);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 font-sans flex flex-col justify-between selection:bg-brand-cyan/20 selection:text-brand-cyan">
      
      {/* Primary Navigation Header */}
      <Header 
        currentPage={route.page} 
        onNavigate={(page) => handleNavigate(page)} 
        onToggleMobileFilter={() => setIsMobileFilterOpen(p => !p)}
        showMobileFilterButton={route.page === 'home'}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {route.page === 'home' && (
          <HomePage
            mods={mods}
            isLoading={isLoading}
            onRefresh={loadModsList}
            onSelectMod={(id) => handleNavigate('detail', id)}
            onNavigateToAdmin={() => handleNavigate('amdj0602')}
            isMobileFilterOpen={isMobileFilterOpen}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
            lang={lang}
          />
        )}

        {route.page === 'detail' && route.selectedModId !== undefined && (
          <ModDetailPage
            modId={route.selectedModId}
            onBack={() => handleNavigate('home')}
            onDownloaded={handleDownloaded}
            triggerToast={triggerToast}
            lang={lang}
          />
        )}

        {route.page === 'amdj0602' && (
          <AdminPage
            mods={mods}
            onAddMod={handleAddMod}
            onDeleteMod={handleDeleteMod}
            triggerToast={triggerToast}
            onNavigateHome={() => handleNavigate('home')}
            lang={lang}
          />
        )}
      </main>

      {/* Persistent Notification Overlay */}
      {toast && (
        <FeedbackToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Premium Dark Theme Gaming Footer */}
      <footer className="border-t border-white/5 bg-dark-header py-8 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-gray-500">
            <Cpu className="w-4 h-4 text-brand-cyan/70" />
            <span>Mods Drive © 2026. {t.aboutHub}</span>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
            <span className="text-gray-500 font-sans">{t.subtitle}</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
