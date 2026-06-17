/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, CheckCircle, Info, ShieldCheck } from 'lucide-react';

interface FeedbackToastProps {
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed top-20 right-4 z-[200] animate-slide-in max-w-sm w-full font-mono">
      <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md bg-dark-card border-white/5 ${
        type === 'success'
          ? 'text-brand-cyan shadow-brand-cyan/5'
          : 'text-brand-cyan shadow-brand-cyan/5'
      }`}>
        <div className="shrink-0 mt-0.5">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-brand-cyan" />
          ) : (
            <Info className="w-5 h-5 text-brand-cyan" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
            {type === 'success' ? 'SYSTEM NOTIFICATION' : 'INFORMATION PANEL'}
          </div>
          <p className="text-xs leading-relaxed text-gray-300">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="shrink-0 text-gray-500 hover:text-white p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
