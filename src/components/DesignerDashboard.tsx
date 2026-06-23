/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  List, 
  LogOut, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  AlertCircle, 
  ShieldAlert,
  Loader2,
  Tag,
  Globe,
  Layers,
  FileText
} from 'lucide-react';
import { 
  getCurrentDesignerUser, 
  signOutDesignerUser, 
  getModsByCreator, 
  createDesignerMod, 
  DesignerUser, 
  IS_DEMO_MODE 
} from '../supabaseClient';
import { Mod } from '../types';
import { translations } from '../translations';

interface DesignerDashboardProps {
  lang: 'ar' | 'en' | 'fr';
  triggerToast: (message: string, type: 'success' | 'info') => void;
  onNavigate: (page: 'home' | 'detail' | 'amdj0602' | 'privacy-policy' | 'designer-login' | 'designer-dashboard' | 'not-found') => void;
}

export function DesignerDashboard({ lang, triggerToast, onNavigate }: DesignerDashboardProps) {
  const t = translations[lang] as any;

  // Active designer section states
  const [designer, setDesigner] = useState<DesignerUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [myMods, setMyMods] = useState<Mod[]>([]);
  const [loadingMods, setLoadingMods] = useState(false);

  // Form Fields State
  const [modName, setModName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'cars' | 'trucks' | 'buses' | 'boats' | 'excavators' | 'maps' | 'motorcycles' | 'news' | 'others' | 'planes' | 'tractors' | 'updates' | 'trailers'>('cars');
  const [gameVersion, setGameVersion] = useState('v0.38');
  const [modVersion, setModVersion] = useState('');
  const [modsfireUrl, setModsfireUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  // Submit UI feedbacks
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the authenticated designer user state
  const loadDesignerSession = useCallback(async () => {
    setCheckingAuth(true);
    try {
      const user = await getCurrentDesignerUser();
      if (!user) {
        setDesigner(null);
      } else {
        setDesigner(user);
        // Sync active creations
        fetchDesignerMods(user.id);
      }
    } catch (err) {
      console.error("Failed checking auth session in dashboard:", err);
      setDesigner(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Fetch all mods representing work of the logged-in user
  const fetchDesignerMods = async (creatorId: string) => {
    setLoadingMods(true);
    try {
      const data = await getModsByCreator(creatorId);
      setMyMods(data);
    } catch (err: any) {
      console.error("Failed retrieving mods for creator:", err);
      triggerToast(err.message || t.errorDatabase, 'info');
    } finally {
      setLoadingMods(false);
    }
  };

  useEffect(() => {
    loadDesignerSession();
  }, [loadDesignerSession]);

  // Sign out designer action handler
  const handleLogoutClick = async () => {
    try {
      await signOutDesignerUser();
      triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح.' : lang === 'fr' ? 'Déconnecté avec succès.' : 'Logged out successfully.', 'info');
      setDesigner(null);
      onNavigate('designer-login');
    } catch (err: any) {
      triggerToast(err.message || 'Logout failed', 'info');
    }
  };

  // Form submission handler
  const handleSubmitMod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designer) {
      triggerToast(t.loginRequiredTitle, 'info');
      return;
    }

    // Basic Validation
    if (!modName.trim() || !description.trim() || !modsfireUrl.trim()) {
      triggerToast(t.validationEmptyFields, 'info');
      return;
    }

    // Payment validation
    if (isPaid && !paymentLink.trim()) {
      triggerToast(lang === 'ar' ? 'يرجى تزويد رابط الدفع للمود المدفوع.' : lang === 'fr' ? 'Veuillez saisir le lien de paiement pour le mod payant.' : 'Please provide a payment URL for paid mods.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: modName.trim(),
        description: description.trim(),
        category,
        image_url: coverImageUrl.trim() || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", // placeholder
        download_url: modsfireUrl.trim(),
        game_version: gameVersion,
        mod_version: modVersion.trim() || undefined,
        // Carry paid and payment link inside a custom structure or custom values if supported, 
        // but to ensure we don't break existing DB schema, keep default values.
      };

      await createDesignerMod(payload, designer.id);

      triggerToast(t.modSubmittedReviewSuccess, 'success');

      // Clear Form Fields
      setModName('');
      setDescription('');
      setCategory('cars');
      setGameVersion('v0.38');
      setModVersion('');
      setModsfireUrl('');
      setCoverImageUrl('');
      setIsPaid(false);
      setPaymentLink('');

      // Auto Refresh Registry
      await fetchDesignerMods(designer.id);
    } catch (err: any) {
      console.error("Failed creating mod submission:", err);
      const errMsg = err?.message || "Database action aborted";
      triggerToast(t.modSubmittedReviewFail.replace('{error}', errMsg), 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Human category translator helper
  const renderCategoryLabel = (cat: string) => {
    const key = `category${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    return t[key] || cat;
  };

  // Render Loader screen
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 text-center animate-fade-in">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin mb-4" />
        <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
          {t.loading}
        </p>
      </div>
    );
  }

  // Not Logged In View
  if (!designer) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fade-in" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="bg-dark-card border border-white/5 rounded-2xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/80"></div>
          
          <div className="flex items-center justify-center mb-2">
            <span className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">
              {t.loginRequiredTitle}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {t.loginRequiredDesc}
            </p>
          </div>

          <button
            onClick={() => onNavigate('designer-login')}
            className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-3 px-4 rounded shadow-[0_0_15px_rgba(21,114,138,0.2)] hover:shadow-[0_0_25px_rgba(21,114,138,0.4)] transition-all duration-300 text-xs uppercase tracking-wider cursor-pointer font-sans"
          >
            {t.loginButton}
          </button>
        </div>
      </div>
    );
  }

  // Loaded Designer Dashboard Grid View
  return (
    <div className="space-y-8 max-w-7xl mx-auto" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] text-brand-cyan font-mono tracking-widest uppercase flex items-center gap-1.5 justify-start">
            <Globe className="w-3.5 h-3.5 text-brand-cyan/70" />
            <span>{t.designerDashboardTitle}</span>
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 uppercase">
            {lang === 'ar' ? 'لوحة تحكم مصممي المركبات' : lang === 'fr' ? 'Espace Création Designer' : 'Designer Workspace'}
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            {t.loggedInAs} <span className="text-brand-cyan font-semibold font-mono">{designer.email}</span> {IS_DEMO_MODE && <span className="text-yellow-500 font-bold font-mono"> (DEMO MODE)</span>}
          </p>
        </div>

        <button
          onClick={handleLogoutClick}
          className="self-start sm:self-auto bg-white/5 hover:bg-red-500/10 border border-white/10 text-gray-400 hover:text-red-400 px-4 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Déconnexion' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Primary layout columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SECTION A: Add new mod form (Left Column span 5) */}
        <div id="add-new-mod-section" className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan/85"></div>
            
            <div className="flex items-center gap-2 text-white mb-5 border-b border-white/5 pb-3">
              <Plus className="w-4 h-4 text-brand-cyan animate-pulse" />
              <h3 className="text-sm font-bold tracking-tight uppercase font-sans">
                {t.addNewMod}
              </h3>
            </div>

            <form onSubmit={handleSubmitMod} className="space-y-4 text-xs font-mono">
              
              {/* Form Input: Mod Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                  {lang === 'ar' ? 'اسم التعديل / السيارة' : lang === 'fr' ? 'Nom du Mod / Véhicule' : 'Mod / Fleet Name'} *
                </label>
                <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'مثال: نيسان باترول فتك 2022' : lang === 'fr' ? 'ex. Bugatti Chiron Pur Sport' : 'e.g. Toyota Land Cruiser 2023'}
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50"
                  required
                />
              </div>

              {/* Form Input: Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                  {lang === 'ar' ? 'الوصف الفني الكامل' : lang === 'fr' ? 'Description Technique' : 'Technical Description'} *
                </label>
                <textarea 
                  rows={4}
                  placeholder={lang === 'ar' ? 'طريقة التحكم، الميزات، مشاكل معروفة...' : lang === 'fr' ? 'Points forts du véhicule, physique, fonctionnalités...' : 'State the specifications, custom physics details, mapping layouts...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50 resize-y"
                  required
                />
              </div>

              {/* Form input: Two Column select (Category & Game Version) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                    {t.adminCategory} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all text-xs focus:ring-1 focus:ring-brand-cyan/50"
                  >
                    <option value="cars">🚗 {t.categoryCars}</option>
                    <option value="trucks">🚛 {t.categoryTrucks}</option>
                    <option value="buses">🚌 {t.categoryBuses}</option>
                    <option value="trailers">📦 {t.categoryTrailers}</option>
                    <option value="boats">🛥️ {t.categoryBoats}</option>
                    <option value="excavators">🏗️ {t.categoryExcavators}</option>
                    <option value="maps">🗺️ {t.categoryMaps}</option>
                    <option value="motorcycles">🏍️ {t.categoryMotorcycles}</option>
                    <option value="planes">✈️ {t.categoryPlanes}</option>
                    <option value="tractors">🚜 {t.categoryTractors}</option>
                    <option value="updates">⚙️ {t.categoryUpdates}</option>
                    <option value="news">📰 {t.categoryNews}</option>
                    <option value="others">📦 {t.categoryOthers}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                    {t.versionLabel} *
                  </label>
                  <select
                    value={gameVersion}
                    onChange={(e) => setGameVersion(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all text-xs focus:ring-1 focus:ring-brand-cyan/50"
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

              </div>

              {/* Form input: Mod Version */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                  {lang === 'ar' ? 'نسخة المود (اختياري)' : lang === 'fr' ? 'Version du Mod (optionnel)' : 'Mod Version (optional)'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. v1.2"
                  value={modVersion}
                  onChange={(e) => setModVersion(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50"
                />
              </div>

              {/* Form input: ModsFire Download link */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                  {t.modsfireUrl} *
                </label>
                <input 
                  type="url" 
                  placeholder="https://modsfire.com/..."
                  value={modsfireUrl}
                  onChange={(e) => setModsfireUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50"
                  required
                />
                <p className="text-[9px] text-gray-500 font-sans tracking-normal">
                  {t.modsfireHelper}
                </p>
              </div>

              {/* Form input: Temporary Cover Image text field */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                  {t.coverImageUrl} (TEMPORARY)
                </label>
                <input 
                  type="url" 
                  placeholder={t.coverImageHelper}
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50"
                />
                <p className="text-[9px] text-yellow-500/80 font-sans tracking-normal">
                  {lang === 'ar' ? 'مؤقت - سيتم تمكين السحب والإفلات اليدوي للصور قريباً.' : lang === 'fr' ? 'Aperçu temporaire - Le glisser-déposer d\'images sera intégré dans une phase ultérieure.' : 'Temporary text URL only. Drag & drop image repository coming in the next phase.'}
                </p>
              </div>

              {/* Form input: PAID CHECKBOX */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-wider text-gray-300 select-none">
                  <input 
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.checked ?? e.target.checked)}
                    className="w-4 h-4 rounded bg-black/50 border-white/5 text-brand-cyan focus:ring-brand-cyan cursor-pointer"
                  />
                  <span>{t.isPaidMod}</span>
                </label>

                {/* Conditional Paid Payment details field */}
                {isPaid && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5 animate-fade-in"
                  >
                    <label className="text-[10px] uppercase tracking-wider text-brand-cyan block font-bold">
                      {t.paymentLink} *
                    </label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://www.patreon.com/your-page"
                      required={isPaid}
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      className="w-full bg-black/40 border border-brand-cyan/30 text-white px-3 py-2.5 rounded outline-none focus:border-brand-cyan transition-all font-sans text-xs focus:ring-1 focus:ring-brand-cyan/50"
                    />
                  </motion.div>
                )}
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-3 px-4 rounded shadow-[0_0_15px_rgba(21,114,138,0.2)] hover:shadow-[0_0_25px_rgba(21,114,138,0.4)] transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-wider mt-4 cursor-pointer font-sans"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t.submitReview}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* SECTION B: My submitted mods list (Right Column span 7) */}
        <div id="my-submitted-mods-section" className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 relative overflow-hidden shadow-xl min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan/85"></div>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
              <div className="flex items-center gap-2 text-white">
                <List className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-bold tracking-tight uppercase font-sans">
                  {t.myModsTitle}
                </h3>
              </div>
              <button
                onClick={() => fetchDesignerMods(designer.id)}
                className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer uppercase font-mono tracking-wider flex items-center gap-1.5"
              >
                {loadingMods ? (
                  <Loader2 className="w-3 h-3 animate-spin text-brand-cyan" />
                ) : (
                  <span>{lang === 'ar' ? 'تحديث اللائحة' : lang === 'fr' ? 'Actualiser' : 'Refresh'}</span>
                )}
              </button>
            </div>

            {/* List entries layout */}
            {loadingMods && myMods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-cyan mb-2" />
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">
                  {t.loading}
                </span>
              </div>
            ) : myMods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-xl bg-black/10">
                <Clock className="w-8 h-8 text-gray-600 mb-3" />
                <p className="text-xs text-gray-500 font-sans max-w-xs leading-normal">
                  {t.noModsSubmitted}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 text-start">{t.tableModName}</th>
                      <th className="pb-3 text-start">{t.tableCategory}</th>
                      <th className="pb-3 text-start">{t.tableStatus}</th>
                      <th className="pb-3 text-start">{t.tableDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myMods.map((mod) => {
                      const statusColor = 
                        mod.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : mod.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                      const statusIcon = 
                        mod.status === 'approved' 
                          ? <CheckCircle className="w-3 h-3" />
                          : mod.status === 'rejected'
                          ? <XCircle className="w-3 h-3" />
                          : <Clock className="w-3 h-3" />;

                      const displayStatus = 
                        mod.status === 'approved'
                          ? t.statusApproved || 'Approved'
                          : mod.status === 'rejected'
                          ? t.statusRejected || 'Rejected'
                          : t.statusPending || 'Pending';

                      return (
                        <tr key={mod.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-3 max-w-[180px] sm:max-w-[240px] truncate">
                            <span className="font-sans font-bold text-white block truncate leading-relaxed">
                              {mod.name}
                            </span>
                            {mod.mod_version && (
                              <span className="text-[10px] text-gray-500">
                                {t.modVersion}: {mod.mod_version}
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-start font-sans text-gray-400">
                            {renderCategoryLabel(mod.category)}
                          </td>
                          <td className="py-4 text-start">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-bold tracking-wide border uppercase ${statusColor}`}>
                              {statusIcon}
                              <span>{displayStatus}</span>
                            </span>
                          </td>
                          <td className="py-4 text-start text-[10px] text-gray-500 font-sans">
                            {mod.created_at 
                              ? new Date(mod.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default DesignerDashboard;
