/**
 * Simple rate throttler for per-instance token budget tracking
 * Note: In serverless (Vercel), each function instance tracks independently
 * This provides best-effort rate limiting without shared state
 */

const TPM_LIMIT = 6000; // Tokens per minute
const WINDOW_MS = 60000; // 60 seconds

interface TokenUsage {
  tokens: number;
  timestamp: number;
}

class RateThrottler {
  private usageHistory: TokenUsage[] = [];
  private currentBudget: number = TPM_LIMIT;

  /**
   * Estimate tokens from text (rough approximation: 4 chars ≈ 1 token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Clean up old entries outside the 60-second window
   */
  private cleanup(): void {
    const now = Date.now();
    this.usageHistory = this.usageHistory.filter(
      (entry) => now - entry.timestamp < WINDOW_MS
    );
  }

  /**
   * Calculate current token usage in the window
   */
  private getCurrentUsage(): number {
    this.cleanup();
    return this.usageHistory.reduce((sum, entry) => sum + entry.tokens, 0);
  }

  /**
   * Check if a request can be processed now
   * @param estimatedTokens Estimated tokens for the request (input + max_tokens)
   * @returns Object with canProcess flag and waitMs if throttled
   */
  checkCapacity(estimatedTokens: number): { canProcess: boolean; waitMs?: number } {
    this.cleanup();
    const currentUsage = this.getCurrentUsage();
    const available = TPM_LIMIT - currentUsage;

    if (available >= estimatedTokens) {
      return { canProcess: true };
    }

    // Calculate wait time based on when oldest entry expires
    if (this.usageHistory.length === 0) {
      // No history, should be able to process
      return { canProcess: true };
    }

    const oldestEntry = this.usageHistory[0];
    const timeSinceOldest = Date.now() - oldestEntry.timestamp;
    const waitMs = Math.max(0, WINDOW_MS - timeSinceOldest);

    return { canProcess: false, waitMs };
  }

  /**
   * Record token usage after successful API call
   * @param inputTokens Estimated input tokens
   * @param outputTokens Actual or estimated output tokens (max_tokens)
   */
  recordUsage(inputTokens: number, outputTokens: number): void {
    const totalTokens = inputTokens + outputTokens;
    this.usageHistory.push({
      tokens: totalTokens,
      timestamp: Date.now(),
    });
    this.cleanup();
  }

  /**
   * Estimate tokens for a request based on messages and max_tokens
   */
  estimateRequestTokens(messages: Array<{ content: string }>, maxTokens: number): number {
    const inputTokens = messages.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content || ''),
      0
    );
    return inputTokens + maxTokens;
  }
}

// Singleton instance (per function instance in serverless)
let throttlerInstance: RateThrottler | null = null;

export function getRateThrottler(): RateThrottler {
  if (!throttlerInstance) {
    throttlerInstance = new RateThrottler();
  }
  return throttlerInstance;
}



