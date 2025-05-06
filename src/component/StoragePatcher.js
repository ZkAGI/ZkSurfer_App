"use client";

/**
 * This file creates a utility to patch browser storage APIs before any wallet
 * connection code runs
 */

// In-memory storage that can be used in place of localStorage/sessionStorage
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  
  getItem(key) {
    return this.store.get(key) || null;
  }
  
  setItem(key, value) {
    this.store.set(key, value);
  }
  
  removeItem(key) {
    this.store.delete(key);
  }
  
  clear() {
    this.store.clear();
  }
  
  get length() {
    return this.store.size;
  }
  
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

// Patch storage APIs before wallets try to use them
export function patchStorageAPIs() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Create memory-based storage implementations
  const memoryLocalStorage = new MemoryStorage();
  const memorySessionStorage = new MemoryStorage();
  
  // Override localStorage getter
  try {
    Object.defineProperty(window, 'localStorage', {
      get: function() {
        // When localStorage is accessed, return our safe version
        return memoryLocalStorage;
      },
      configurable: true
    });
  } catch (e) {
    console.warn("Could not patch localStorage", e);
  }

  // Override sessionStorage getter  
  try {
    Object.defineProperty(window, 'sessionStorage', {
      get: function() {
        // When sessionStorage is accessed, return our safe version
        return memorySessionStorage;
      },
      configurable: true
    });
  } catch (e) {
    console.warn("Could not patch sessionStorage", e);
  }
}

export default patchStorageAPIs;