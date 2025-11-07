/**
 * API Key Manager for handling multiple Groq API keys
 * Supports round-robin and least-used key selection
 */

interface KeyUsage {
  key: string;
  lastUsed: number;
  usageCount: number;
}

class ApiKeyManager {
  private keys: KeyUsage[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.loadKeys();
  }

  /**
   * Load API keys from environment variables
   * Supports MODEL_API_KEY, MODEL_API_KEY_2, MODEL_API_KEY_3, etc.
   */
  private loadKeys(): void {
    const keys: string[] = [];

    // Primary key (backward compatible)
    const primaryKey = process.env.MODEL_API_KEY;
    if (primaryKey) {
      keys.push(primaryKey);
    }

    // Additional keys (MODEL_API_KEY_2, MODEL_API_KEY_3, etc.)
    let index = 2;
    while (true) {
      const key = process.env[`MODEL_API_KEY_${index}`];
      if (!key) break;
      keys.push(key);
      index++;
    }

    // Initialize key usage tracking
    this.keys = keys.map((key) => ({
      key,
      lastUsed: 0,
      usageCount: 0,
    }));

    if (this.keys.length === 0) {
      console.warn('No API keys found in environment variables');
    }
  }

  /**
   * Get the next available API key using round-robin
   */
  getNextKey(): string | null {
    if (this.keys.length === 0) {
      return null;
    }

    const keyUsage = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;

    // Update usage tracking
    keyUsage.lastUsed = Date.now();
    keyUsage.usageCount++;

    return keyUsage.key;
  }

  /**
   * Get the least recently used key
   */
  getLeastUsedKey(): string | null {
    if (this.keys.length === 0) {
      return null;
    }

    // Sort by lastUsed timestamp (oldest first)
    const sorted = [...this.keys].sort((a, b) => a.lastUsed - b.lastUsed);
    const leastUsed = sorted[0];

    // Update usage tracking
    leastUsed.lastUsed = Date.now();
    leastUsed.usageCount++;

    return leastUsed.key;
  }

  /**
   * Get all available keys (for testing/debugging)
   */
  getAllKeys(): string[] {
    return this.keys.map((k) => k.key);
  }

  /**
   * Get number of available keys
   */
  getKeyCount(): number {
    return this.keys.length;
  }
}

// Singleton instance
let keyManagerInstance: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!keyManagerInstance) {
    keyManagerInstance = new ApiKeyManager();
  }
  return keyManagerInstance;
}



