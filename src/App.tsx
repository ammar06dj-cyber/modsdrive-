/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { NotFoundPage } from './components/NotFoundPage';
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton';

const AdminPage = lazy(() => import('./components/AdminPage'));
const ModDetailPage = lazy(() => import('./components/ModDetailPage'));
const DesignerAuthPage = lazy(() => import('./components/DesignerAuthPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
import { FeedbackToast } from './components/FeedbackToast';

import { getMods, createMod, deleteMod, IS_DEMO_MODE, ModsDriveError } from './supabaseClient';
import { Mod, RouteState, ActivePage } from './types';
import { Hammer, Github, ShieldAlert, Cpu } from 'lucide-react';
import { Language, translations } from './translations';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [mods, setMods] = useState<Mod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ModsDriveError | null>(null);
  
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

  // Parse active browser route
  const parseBrowserRoute = useCallback((): RouteState => {
    // 1. Support legacy hash routing by redirecting to clean routes if hash exists
    const hash = window.location.hash || '';
    if (hash) {
      let cleanPath = '/';
      if (hash.startsWith('#/mod/') || hash.startsWith('#mod/')) {
        const cleanHash = hash.startsWith('#/mod/') ? hash.substring(2) : hash.substring(1);
        const parts = cleanHash.split('/');
        const id = parseInt(parts[1], 10);
        if (!isNaN(id)) {
          cleanPath = `/mod/${id}`;
        }
      } else if (hash === '#/amdj0602' || hash === '#amdj0602') {
        cleanPath = '/amdj0602';
      } else if (hash === '#/privacy-policy' || hash === '#privacy-policy') {
        cleanPath = '/privacy-policy';
      }
      
      // Replace hash URL with clean pathname URL
      window.history.replaceState(null, '', window.location.origin + cleanPath);
    }

    const pathname = window.location.pathname;
    
    if (pathname === '/' || pathname === '') {
      return { page: 'home' };
    } else if (pathname.startsWith('/mod/')) {
      const parts = pathname.split('/');
      if (parts.length === 3) {
        const id = parseInt(parts[2], 10);
        if (!isNaN(id) && id > 0 && pathname === `/mod/${id}`) {
          return { page: 'detail', selectedModId: id };
        }
      }
      return { page: 'not-found' };
    } else if (pathname === '/amdj0602' || pathname.endsWith('/amdj0602')) {
      return { page: 'amdj0602' };
    } else if (pathname === '/privacy-policy' || pathname.endsWith('/privacy-policy')) {
      return { page: 'privacy-policy' };
    } else if (pathname === '/designer-login' || pathname.endsWith('/designer-login')) {
      return { page: 'designer-login' };
    } else {
      return { page: 'not-found' };
    }
  }, []);

  const [route, setRoute] = useState<RouteState>({ page: 'home' });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Scroll to absolute top whenever the page route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page, route.selectedModId]);

  // Update browser tab title dynamically based on route and loaded mod data
  useEffect(() => {
    if (route.page === 'home') {
      document.title = "ModsDrive";
    } else if (route.page === 'detail' && route.selectedModId !== undefined) {
      const activeMod = mods.find(m => m.id === route.selectedModId);
      if (activeMod?.name) {
        document.title = `${activeMod.name} - ModsDrive`;
      } else {
        document.title = "ModsDrive";
      }
    } else if (route.page === 'privacy-policy') {
      document.title = "Privacy Policy - ModsDrive";
    } else if (route.page === 'amdj0602') {
      document.title = "Admin - ModsDrive";
    } else if (route.page === 'designer-login') {
      document.title = "Designers - ModsDrive";
    } else if (route.page === 'not-found') {
      document.title = "404 - ModsDrive";
    }
  }, [route, mods]);

  // Sync state router with popstate event
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseBrowserRoute());
    };

    // Parse once on mount
    setRoute(parseBrowserRoute());

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseBrowserRoute]);

  // Load mods list
  const loadModsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMods();
      setMods(data);
      setError(null);
    } catch (err: any) {
      setError(err as ModsDriveError);
      setMods([]);
      setToast({
        message: err.message || "Unable to retrieve simulator catalogue from network.",
        type: "info"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load/reload mods when application mounts or when navigating back to the home view
  useEffect(() => {
    loadModsList();
  }, [loadModsList, route.page]);

  // Navigation setter with support for preserving query parameters
  const handleNavigate = useCallback((
    page: ActivePage, 
    selectedModId?: number,
    preserveParams = false
  ) => {
    let path = '/';
    if (page === 'detail' && selectedModId !== undefined) {
      if (window.location.pathname === '/' || window.location.pathname === '') {
        sessionStorage.setItem('mods_drive_search_params', window.location.search);
      }
      path = `/mod/${selectedModId}`;
    } else if (page === 'amdj0602') {
      path = '/amdj0602';
    } else if (page === 'privacy-policy') {
      if (window.location.pathname === '/' || window.location.pathname === '') {
        sessionStorage.setItem('mods_drive_search_params', window.location.search);
      }
      path = '/privacy-policy';
    } else if (page === 'designer-login') {
      path = '/designer-login';
    } else if (page === 'home') {
      if (preserveParams) {
        const savedSearch = sessionStorage.getItem('mods_drive_search_params') || '';
        path = `/${savedSearch}`;
      } else {
        sessionStorage.removeItem('mods_drive_search_params');
        path = '/';
      }
    }

    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
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
      console.error('App [handleDeleteMod]: Failed to delete mod:', err);
      throw err;
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
        onNavigate={(page) => handleNavigate(page, undefined, false)} 
        onToggleMobileFilter={() => setIsMobileFilterOpen(p => !p)}
        showMobileFilterButton={route.page === 'home'}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onToggleTheme={toggleTheme}
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
            error={error}
          />
        )}

        {route.page === 'detail' && route.selectedModId !== undefined && (
          <Suspense fallback={<PageLoadingSkeleton lang={lang} />}>
            <ModDetailPage
              modId={route.selectedModId}
              onBack={() => handleNavigate('home', undefined, true)}
              onDownloaded={handleDownloaded}
              triggerToast={triggerToast}
              lang={lang}
            />
          </Suspense>
        )}

        {route.page === 'amdj0602' && (
          <Suspense fallback={<PageLoadingSkeleton lang={lang} />}>
            <AdminPage
              mods={mods}
              onAddMod={handleAddMod}
              onDeleteMod={handleDeleteMod}
              triggerToast={triggerToast}
              onNavigateHome={() => handleNavigate('home', undefined, true)}
              lang={lang}
            />
          </Suspense>
        )}

        {route.page === 'privacy-policy' && (
          <Suspense fallback={<PageLoadingSkeleton lang={lang} />}>
            <PrivacyPolicyPage
              onBack={() => handleNavigate('home', undefined, true)}
              lang={lang}
            />
          </Suspense>
        )}

        {route.page === 'designer-login' && (
          <Suspense fallback={<PageLoadingSkeleton lang={lang} />}>
            <DesignerAuthPage
              lang={lang}
              triggerToast={triggerToast}
            />
          </Suspense>
        )}

        {route.page === 'not-found' && (
          <NotFoundPage
            lang={lang}
            onNavigateHome={() => handleNavigate('home')}
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
            <span className="text-white/10 select-none">|</span>
            <button
              onClick={() => handleNavigate('privacy-policy')}
              className="text-gray-500 hover:text-brand-cyan transition-colors duration-200 cursor-pointer hover:underline font-sans"
            >
              {(t as any).privacyPolicy}
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
