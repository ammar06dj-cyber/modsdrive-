/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gauge } from 'lucide-react';
import { Language, translations } from '../translations';

interface PageLoadingSkeletonProps {
  lang: Language;
}

export const PageLoadingSkeleton: React.FC<PageLoadingSkeletonProps> = ({ lang }) => {
  const t = translations[lang] || translations.en;
  const loadingText = t.loading || 'Loading...';

  return (
    <div
      id="page-loading-skeleton"
      className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-dark-bg text-white select-none"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Pulsing Container with the Gauge icon inside */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border-4 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
          <div className="w-12 h-12 rounded-full bg-dark-card border border-white/5 flex items-center justify-center text-brand-cyan animate-pulse">
            <Gauge className="w-6 h-6" />
          </div>
        </div>
        
        {/* Pulsing Loading Text */}
        <p className="text-sm font-mono font-bold uppercase tracking-wider text-brand-cyan/80 animate-pulse">
          {loadingText}
        </p>
      </div>
    </div>
  );
};

export default PageLoadingSkeleton;
