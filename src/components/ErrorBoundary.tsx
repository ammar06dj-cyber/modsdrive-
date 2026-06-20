/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // Attempt a soft reload or redirecting home
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-bg text-white font-sans p-6 select-none"
        >
          <div className="max-w-md w-full bg-dark-card border border-red-500/10 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            {/* Red aesthetic top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full border border-red-500/25 text-red-500 animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-red-400 font-mono mb-6 bg-black/30 p-3 rounded-lg border border-red-500/10 text-left overflow-auto max-h-32">
              {this.state.error?.toString() || 'Unknown application error'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 border border-white/5 cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
