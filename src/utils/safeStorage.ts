/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Memory fallback cache for when localStorage / sessionStorage are restricted or throw SecurityError
const storageCache: Record<string, string> = {};
const sessionCache: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage block detected for key "${key}". Falling back to memory.`, e);
    }
    return storageCache[key] !== undefined ? storageCache[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage write blocked for key "${key}". Saving to memory.`, e);
    }
    storageCache[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage remove blocked for key "${key}". Removing from memory.`, e);
    }
    delete storageCache[key];
  }
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] sessionStorage block detected for key "${key}". Falling back to memory.`, e);
    }
    return sessionCache[key] !== undefined ? sessionCache[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] sessionStorage write blocked for key "${key}". Saving to memory.`, e);
    }
    sessionCache[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] sessionStorage remove blocked for key "${key}". Removing from memory.`, e);
    }
    delete sessionCache[key];
  }
};
