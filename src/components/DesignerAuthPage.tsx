/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabaseClient, IS_DEMO_MODE, signUpDesigner, signInDesigner, ModsDriveError } from '../supabaseClient';
import { translations } from '../translations';

interface DesignerAuthPageProps {
  lang: 'ar' | 'en' | 'fr';
  triggerToast: (message: string, type: 'success' | 'info') => void;
}

export function DesignerAuthPage({ lang, triggerToast }: DesignerAuthPageProps) {
  const t = translations[lang] as any;

  // Tabs: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Visibility
  const [showPassword, setShowPassword] = useState(false);

  // Validation / Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
  }>({});

  // Sign in success info
  const [authenticatedUserEmail, setAuthenticatedUserEmail] = useState<string | null>(null);

  // Validate form
  const validateForm = () => {
    const errors: typeof validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = t.validationEmptyFields;
    } else if (!emailRegex.test(email)) {
      errors.email = t.validationInvalidEmail;
    }

    if (!password) {
      errors.password = t.validationEmptyFields;
    } else if (password.length < 6) {
      errors.password = t.validationPasswordLength;
    }

    if (activeTab === 'signup') {
      if (!displayName) {
        errors.displayName = t.validationEmptyFields;
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = t.validationPasswordMismatch;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (IS_DEMO_MODE) {
      triggerToast(t.demoModeAuthWarning, 'info');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'signup') {
        const data = await signUpDesigner(email, password, displayName);

        if (data?.user) {
          triggerToast(t.authSuccessSignUp, 'success');
          setAuthenticatedUserEmail(data.user.email ?? email);
          // Reset form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setDisplayName('');
        }
      } else {
        const data = await signInDesigner(email, password);

        if (data?.user) {
          triggerToast(t.authSuccessSignIn, 'success');
          setAuthenticatedUserEmail(data.user.email ?? email);
          // Reset form
          setEmail('');
          setPassword('');
        }
      }
    } catch (err: any) {
      console.error('Supabase Auth Exception:', err);
      triggerToast(err.message || 'Authentication error', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Header section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          <span className="text-brand-cyan">Mods</span>Drive
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">
          {t.designerAuthTitle}
        </p>
      </div>

      {/* When successfully authenticated */}
      {authenticatedUserEmail && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-6 mb-6 text-center animate-fade-in">
          <div className="flex items-center justify-center mb-3">
            <span className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/25 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
          </div>
          <h3 className="text-sm font-bold text-emerald-400">
            {activeTab === 'signup' ? t.authSuccessSignUp : t.authSuccessSignIn}
          </h3>
          <p className="text-xs text-gray-400 mt-2 font-sans">
            {t.loggedInAs} <span className="text-white font-semibold font-mono">{authenticatedUserEmail}</span>
          </p>
          <button
            onClick={() => setAuthenticatedUserEmail(null)}
            className="mt-4 text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors tracking-wider font-mono hover:underline cursor-pointer"
          >
            {lang === 'ar' ? 'تسجيل الخروج المبدئي' : lang === 'fr' ? 'Déconnexion' : 'Sign Out / Back'}
          </button>
        </div>
      )}

      {/* Main Form Box */}
      {!authenticatedUserEmail && (
        <div className="bg-dark-card border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cyan"></div>
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="grid grid-cols-2 bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
            <button
              onClick={() => {
                setActiveTab('signin');
                setValidationErrors({});
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-brand-cyan text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-sans">
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setValidationErrors({});
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-brand-cyan text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-sans">
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.signUp}</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name - Only For Sign Up mode */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                  {t.displayName}
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 mx-3" style={{ left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto' }} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t.displayNamePlaceholder}
                    className={`w-full py-2.5 bg-black/30 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-cyan/60 transition-all font-sans ${
                      lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                    } ${validationErrors.displayName ? 'border-red-500/50' : 'border-white/5'}`}
                  />
                </div>
                {validationErrors.displayName && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.displayName}</span>
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 mx-3" style={{ left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="designer@modsdrive.com"
                  className={`w-full py-2.5 bg-black/30 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-cyan/60 transition-all font-sans ${
                    lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                  } ${validationErrors.email ? 'border-red-500/50' : 'border-white/5'}`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 mx-3" style={{ left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full py-2.5 bg-black/30 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-cyan/60 transition-all font-sans ${
                    lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                  } ${validationErrors.password ? 'border-red-500/50' : 'border-white/5'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  style={{ right: lang === 'ar' ? 'auto' : '12px', left: lang === 'ar' ? '12px' : 'auto' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-[10px] text-red-400 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field - Only For Sign Up mode */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 mx-3" style={{ left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full py-2.5 bg-black/30 border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-cyan/60 transition-all font-sans ${
                      lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                    } ${validationErrors.confirmPassword ? 'border-red-500/50' : 'border-white/5'}`}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {/* Notice regarding connection */}
            {IS_DEMO_MODE && (
              <div className="bg-amber-950/20 border border-amber-500/10 p-3 rounded-lg text-amber-500/90 text-[10px] leading-relaxed font-sans">
                {t.demoModeAuthWarning}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-cyan hover:bg-[#FF7300] text-black font-black py-3 px-4 rounded shadow-[0_0_15px_rgba(21,114,138,0.2)] hover:shadow-[0_0_25px_rgba(21,114,138,0.4)] transition-all duration-300 disabled:opacity-50 text-xs uppercase tracking-wider mt-4 cursor-pointer font-sans"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : activeTab === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.submitSignIn}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.submitSignUp}</span>
                </>
              )}
            </button>

          </form>
        </div>
      )}

    </div>
  );
}

export default DesignerAuthPage;

