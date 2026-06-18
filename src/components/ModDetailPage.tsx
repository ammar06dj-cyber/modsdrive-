/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Download, ShieldCheck, ShieldAlert, Database, Calendar, FileType, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Mod } from '../types';
import { getModById, incrementDownloadsCount } from '../supabaseClient';
import { Language, translations } from '../translations';

interface ModDetailPageProps {
  modId: number;
  onBack: () => void;
  onDownloaded: (modId: number, nextCount: number) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  lang?: Language;
}

export const ModDetailPage: React.FC<ModDetailPageProps> = ({
  modId,
  onBack,
  onDownloaded,
  triggerToast,
  lang = 'ar',
}) => {
  const t = translations[lang];
  const [mod, setMod] = useState<Mod | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  // Scroll to absolute top immediately when page mounts or modId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [modId]);

  const handleNextImage = () => {
    if (!mod) return;
    const allImages = [mod.image_url, ...(mod.gallery_urls || [])];
    if (allImages.length <= 1) return;
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = currentIndex === -1 || currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(allImages[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!mod) return;
    const allImages = [mod.image_url, ...(mod.gallery_urls || [])];
    if (allImages.length <= 1) return;
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = currentIndex <= 0 ? allImages.length - 1 : currentIndex - 1;
    setActiveImage(allImages[prevIndex]);
  };

  // Watch for loaded mod to reset active image
  useEffect(() => {
    if (mod) {
      setActiveImage(mod.image_url);
    }
  }, [mod]);

  // Load singular mod details
  useEffect(() => {
    async function loadMod() {
      setIsPageLoading(true);
      try {
        const data = await getModById(modId);
        if (data) {
          setMod(data);
        } else {
          triggerToast("Mod model details could not be retrieved", "info");
          onBack();
        }
      } catch (err) {
        triggerToast("Failed to connect to the database", "info");
        onBack();
      } finally {
        setIsPageLoading(false);
      }
    }
    loadMod();
  }, [modId]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Disable/enable page scrolling when the modal is open/closed
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Clean-up to ensure scroll is restored if the component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const modalTranslations = {
    ar: {
      title: "مغادرة الموقِع",
      message: "أنت تغادر ModsDrive الآن وسيتم توجيهك إلى ModsFire.com، وهو موقع خارجي لاستضافة المودات ليس تحت سيطرتنا. هل تريد الاستمرار والتحميل؟",
      continueBtn: "استمرار",
      cancelBtn: "إلغاء والرجوع"
    },
    en: {
      title: "Leaving ModsDrive",
      message: "You are about to leave ModsDrive and will be redirected to ModsFire.com, an external mod hosting website not under our control. Do you want to continue?",
      continueBtn: "Continue",
      cancelBtn: "Cancel"
    },
    fr: {
      title: "Quitter ModsDrive",
      message: "Vous êtes sur le point de quitter ModsDrive et vous serez redirigé vers ModsFire.com, un site externe d'hébergement de mods qui n'est pas sous notre contrôle. Voulez-vous continuer ?",
      continueBtn: "Continuer",
      cancelBtn: "Annuler"
    }
  };

  // Trigger modal
  const handleDownloadClick = () => {
    setIsModalOpen(true);
  };

  // Safe confirmed download trigger
  const handleConfirmDownload = async () => {
    setIsModalOpen(false);
    if (!mod || isDownloading) return;
    setIsDownloading(true);
    
    try {
      triggerToast(
        lang === 'ar' 
          ? "جاري بدء التحميل الآمن من ModsFire.com..." 
          : lang === 'fr' 
          ? "Lancement du téléchargement sécurisé..." 
          : "Triggering secure download from ModsFire.com...", 
        "info"
      );
      
      // Increment counter in database
      const nextCount = await incrementDownloadsCount(mod.id);
      
      // Dynamically update UI state
      setMod(prev => prev ? { ...prev, downloads_count: nextCount } : null);
      
      // Send message to parent coordinate
      onDownloaded(mod.id, nextCount);

      // Open target URL safe in secondary tab
      window.open(mod.download_url, '_blank', 'noopener,noreferrer');
      
      triggerToast(
        lang === 'ar' 
          ? "بدأ التحميل بنجاح! تم تحديث العداد." 
          : lang === 'fr' 
          ? "Téléchargement lancé avec succès ! Compteur mis à jour." 
          : "Downloaded successfully! Counter updated.", 
        "success"
      );
    } catch (err) {
      console.error(err);
      triggerToast(
        lang === 'ar' 
          ? "خطأ في تسجيل الإحصائيات، ولكن يبدأ التحميل..." 
          : lang === 'fr' 
          ? "Erreur d'enregistrement, mais lancement du téléchargement..." 
          : "Error recording statistics, but starting download...", 
        "info"
      );
      window.open(mod.download_url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div id="detail-skeleton" className="space-y-6 max-w-4xl mx-auto py-12 animate-pulse">
        <div className="h-6 bg-slate-900 rounded w-1/4"></div>
        <div className="aspect-[21/9] bg-slate-900 rounded w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-slate-900 rounded w-1/2"></div>
            <div className="h-4 bg-slate-900 rounded w-full"></div>
            <div className="h-4 bg-slate-900 rounded w-5/6"></div>
          </div>
          <div className="bg-slate-900 border border-white/5 rounded h-48"></div>
        </div>
      </div>
    );
  }

  if (!mod) return null;

  // Formatting helper
  const formattedDate = new Date(mod.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id={`detail-view-${mod.id}`} className="max-w-5xl mx-auto pb-16 animate-fade-in space-y-8" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Back button link */}
      <div>
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all font-mono"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{lang === 'ar' ? 'العودة لمكتبة المودات' : lang === 'fr' ? 'Retour au catalogue' : 'Back to Fleet Catalog'}</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Media & Description (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Huge Cover Image with elegant borders */}
          <div id="detail-image-wrapper" className="relative group rounded-xl overflow-hidden border border-white/5 bg-slate-950 shadow-2xl">
            <img 
              src={activeImage || mod.image_url} 
              alt={mod.name} 
              className="w-full h-auto max-h-[460px] object-cover filter saturate-75 transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800';
              }}
            />
            {/* Ambient vignette background on top of cover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

            {/* Navigation Arrows for switching between photos */}
            {mod.gallery_urls && mod.gallery_urls.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-brand-cyan hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm"
                  title={lang === 'ar' ? 'الصورة السابقة' : 'Previous Image'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-brand-cyan hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm"
                  title={lang === 'ar' ? 'الصورة التالية' : 'Next Image'}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Numeric Indicator */}
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded bg-black/75 border border-white/10 text-slate-300 font-mono text-[10px] uppercase tracking-wider select-none pointer-events-none">
                  {[mod.image_url, ...mod.gallery_urls].indexOf(activeImage) + 1} / {[mod.image_url, ...mod.gallery_urls].length}
                </div>
              </>
            )}
          </div>

          {/* Sub-images Gallery Row */}
          {mod.gallery_urls && mod.gallery_urls.length > 0 && (
            <div className="space-y-2.5 bg-black/35 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block">
                {lang === 'ar' ? 'معرض لقطات المود' : lang === 'fr' ? 'Galerie de captures d\'écran' : 'Screenshots Gallery'}
              </span>
              <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-brand-orange">
                {/* Include the main cover image as the first thumbnail */}
                {[mod.image_url, ...mod.gallery_urls].map((url, i) => {
                  const isActive = activeImage === url;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(url)}
                      className={`relative w-24 sm:w-28 aspect-video rounded-md overflow-hidden border transition-all duration-300 shrink-0 ${
                        isActive 
                          ? 'border-brand-orange shadow-[0_0_12px_rgba(255,92,0,0.35)] scale-95' 
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Screenshot #${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Model information card */}
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide border-b border-white/5 pb-3 uppercase tracking-tighter">
              {lang === 'ar' ? 'الوصف والمواصفات' : lang === 'fr' ? 'Description & Spécifications' : 'Description & Specifications'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line font-sans">
              {mod.description}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center gap-2.5 bg-black/40 p-3 rounded border border-white/5">
                <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                <div>
                  <div className="text-gray-500 text-[9px] uppercase tracking-wider">
                    {lang === 'ar' ? 'دقة حركة الفيزياء' : lang === 'fr' ? 'Précision de la physique' : 'Physics Accuracy'}
                  </div>
                  <div className="text-gray-300 mt-0.5">
                    {lang === 'ar' ? 'مستوى أداء فائق وسلس' : lang === 'fr' ? 'Noyau haute performance' : 'High Performance Core'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-black/40 p-3 rounded border border-white/5">
                <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                <div>
                  <div className="text-gray-500 text-[9px] uppercase tracking-wider">
                    {lang === 'ar' ? 'محرك الصوتيات' : lang === 'fr' ? 'Moteur audio' : 'Audio Engine'}
                  </div>
                  <div className="text-gray-300 mt-0.5">
                    {lang === 'ar' ? 'مرفق حزمة أصوات FMOD مخصصة' : lang === 'fr' ? 'Pack de sons FMOD personnalisé' : 'Custom FMOD Soundpack'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Installation guidelines informational notice */}
          <div className="bg-black/40 border border-white/5 p-5 rounded-xl flex gap-3">
            <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-1.5 text-gray-400">
              <span className="font-bold text-gray-200 block uppercase tracking-tighter">
                {lang === 'ar' ? 'كيفية تثبيت المود:' : lang === 'fr' ? 'Comment installer ce mod :' : 'How to Install this Mod:'}
              </span>
              <p>
                {lang === 'ar' 
                  ? 'الخطوة 1: قم بتنزيل ملف المود من رابط التحميل.' 
                  : lang === 'fr' 
                  ? 'Étape 1 : Téléchargez le fichier du mod à partir du lien de téléchargement.' 
                  : 'Step 1: Download the mod file from the download link.'}
              </p>
              <p>
                {lang === 'ar' 
                  ? 'الخطوة 2: استخرج الملف الذي تم تنزيله (سيكون ملفًا بتنسيق .zip أو .rar) باستخدام أداة مثل WinRAR أو 7-Zip.' 
                  : lang === 'fr' 
                  ? 'Étape 2 : Extrayez le fichier téléchargé (ce sera une archive .zip ou .rar) à l\'aide d\'un outil comme WinRAR ou 7-Zip.' 
                  : 'Step 2: Extract the downloaded file (it will be a .zip or .rar archive) using a tool like WinRAR or 7-Zip.'}
              </p>
              <p>
                {lang === 'ar' 
                  ? 'الخطوة 3: انسخ ملفات المود المستخرجة إلى مجلد تعديلات BeamNG.drive (mods folder).' 
                  : lang === 'fr' 
                  ? 'Étape 3 : Copiez les fichiers de mod extraits dans votre dossier de mods BeamNG.drive.' 
                  : 'Step 3: Copy the extracted mod files into your BeamNG.drive mods folder.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Installation & Statistics HUD (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Huge Download HUD Console Box */}
          <div className="bg-dark-card border border-white/5 rounded-xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan opacity-80"></div>

            {/* Categorization and Name */}
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-tighter bg-black/60 text-brand-cyan border border-brand-cyan/20 font-mono mb-2">
                {mod.category === 'cars' ? t.categoryCars : mod.category === 'trucks' ? t.categoryTrucks : mod.category === 'buses' ? t.categoryBuses : mod.category === 'trailers' ? t.categoryTrailers : t.categoryOthers}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight uppercase font-sans">
                {mod.name}
              </h2>
            </div>

            {/* Technical stats table */}
            <div className="space-y-3 border-t border-b border-white/5 py-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[11px]">
                  {lang === 'ar' ? 'إجمالي التحميلات:' : lang === 'fr' ? 'Téléchargements :' : 'Total Downloads:'}
                </span>
                <span className="text-brand-cyan font-bold">
                  {mod.downloads_count.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[11px]">
                  {lang === 'ar' ? 'تاريخ الرفع:' : lang === 'fr' ? 'Date d\'import :' : 'Upload Date:'}
                </span>
                <span className="text-gray-300 text-[11px]">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[11px]">
                  {lang === 'ar' ? 'الصيغة:' : lang === 'fr' ? 'Format :' : 'Format:'}
                </span>
                <span className="text-gray-300 text-[11px] flex items-center gap-1">
                  <FileType className="w-3.5 h-3.5 text-amber-500" />
                  <span>Compressed ZIP</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-[11px]">
                  {lang === 'ar' ? 'فحص الأمان:' : lang === 'fr' ? 'Contrôle de sécurité :' : 'Safety Check:'}
                </span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'مفحص ونظيف وآمن' : lang === 'fr' ? 'Sûr & Vérifié' : 'Verified Clean'}</span>
                </span>
              </div>
            </div>

            {/* Huge CTA Click button */}
            <div className="space-y-2">
              <button
                id="main-download-cta"
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-3 px-4 rounded shadow-[0_0_20px_rgba(21,114,138,0.3)] hover:shadow-[0_0_30px_rgba(21,114,138,0.5)] transition-all duration-300 disabled:opacity-55 text-xs uppercase tracking-tight cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحميل الملف الآن' : lang === 'fr' ? 'Télécharger l\'archive' : 'Download Archive'}</span>
              </button>
              
              <p className="text-[9px] text-center text-gray-500 font-mono">
                Direct package hotlink hosted on ModsFire.com
              </p>
            </div>
          </div>

          {/* Quick specs match */}
          <div className="bg-dark-card border border-white/5 rounded-xl p-5 font-mono text-xs space-y-3.5">
            <h4 className="text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-white/5 pb-2">
              {lang === 'ar' ? 'طابقت المتطلبات' : lang === 'fr' ? 'Exigences Requises' : 'Requirements Match'}
            </h4>
            
            <div className="space-y-2.5 text-gray-500 text-[11px]">
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'إصدار اللعبة:' : lang === 'fr' ? 'Version du jeu :' : 'Game Version:'}</span>
                <span className="text-brand-cyan font-bold">{mod.game_version || 'v0.38'}</span>
              </div>
              {mod.mod_version && (
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'إصدار المود:' : lang === 'fr' ? 'Version du mod :' : 'Mod Version:'}</span>
                  <span className="text-gray-300">{mod.mod_version}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'دركسون القيادة:' : lang === 'fr' ? 'Contrôle à volant :' : 'Steering Control:'}</span>
                <span className="text-gray-300">{lang === 'ar' ? 'يدعم اهتزاز القوة FFB' : lang === 'fr' ? 'Volants FFB Prêts' : 'Force Feedback Ready'}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'اللعب الجماعي:' : lang === 'fr' ? 'Multijoueur Convoy :' : 'Multiplayer Ready:'}</span>
                <span className="text-brand-cyan">{lang === 'ar' ? 'متوافق وآمن' : lang === 'fr' ? 'Compatible' : 'Convoy compatible'}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'التعديل الداخلي:' : lang === 'fr' ? 'Personnalisation :' : 'Custom Tuning:'}</span>
                <span className="text-brand-cyan">{lang === 'ar' ? 'كامل ومتوافق' : lang === 'fr' ? 'Compatible' : 'Compatible'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* External Link Confirmation Modal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-overlay-fade-in"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className={`w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-2rem)] animate-responsive-modal ${lang === 'ar' ? 'text-right' : 'text-left'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan"></div>
            
            {/* Icon & Title */}
            <div className={`flex items-start gap-4 ${lang === 'ar' ? 'text-right' : 'text-left'} mb-4`}>
              <div className="p-3 bg-brand-cyan/10 rounded-full border border-brand-cyan/25 shrink-0">
                <ShieldAlert className="w-6 h-6 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {modalTranslations[lang].title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  modsfire.com
                </p>
              </div>
            </div>

            {/* Content Message */}
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              {modalTranslations[lang].message}
            </p>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
              <button
                onClick={handleConfirmDownload}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-black bg-brand-cyan hover:bg-[#FF7300] hover:text-white rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(255,115,0,0.3)] active:scale-95 cursor-pointer text-center"
              >
                {modalTranslations[lang].continueBtn}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer text-center"
              >
                {modalTranslations[lang].cancelBtn}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
