/**
 * Circuit Breaker Pattern
 * 
 * Prevents the app from continuously hitting an unreachable backend.
 * Strategies:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Too many failures, requests fail fast without hitting backend
 * - HALF_OPEN: Testing if backend recovered
 */

import { env } from '@/config/env';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Failures before opening circuit
  successThreshold: number; // Successes before closing circuit (in half-open state)
  timeout: number; // Time to wait before trying half-open state (ms)
  windowSize: number; // Rolling window for tracking failures (ms)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  private listeners = new Set<() => void>();

  /** Subscribe to state/metrics changes. Returns unsubscribe. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore subscriber errors */
      }
    });
  }

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    // In development, be more lenient (higher threshold, shorter recovery timeout)
    // In production, be stricter (lower threshold, longer recovery timeout)
    const isDevelopment = env.IS_DEVELOPMENT;
    
    this.config = {
      failureThreshold: config.failureThreshold ?? (isDevelopment ? 10 : 5),  // Raised from 8 to 10
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? (isDevelopment ? 10000 : 30000), // 10s dev, 30s prod (reduced from 15s)
      windowSize: config.windowSize ?? 60000, // 1 minute
    };
  }

  /**
   * Check if request should be allowed
   */
  canExecute(): boolean {
    // If circuit is closed, always allow
    if (this.state === 'CLOSED') {
      return true;
    }

    // If half-open, allow one request
    if (this.state === 'HALF_OPEN') {
      return true;
    }

    // If open, check if timeout has passed
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.config.timeout) {
        this.transitionToHalfOpen();
        this.notifyListeners();
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    }

    if (env.ENABLE_API_LOGS) {
      console.log(`🟢 Circuit Breaker: Success recorded (${this.successCount}/${this.config.successThreshold})`);
    }
    this.notifyListeners();
  }

  /**
   * Record a failed request
   */
  recordFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.successCount = 0;

    if (env.ENABLE_API_LOGS) {
      console.log(
        `🔴 Circuit Breaker: Failure recorded (${this.failureCount}/${this.config.failureThreshold})`
      );
    }

    if (
      this.state === 'CLOSED' &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.transitionToOpen();
    }

    if (this.state === 'HALF_OPEN') {
      this.transitionToOpen();
    }
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      timeSinceLastFailure: Date.now() - this.lastFailureTime,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    if (env.ENABLE_API_LOGS) {
      console.log('🔵 Circuit Breaker: Reset to CLOSED');
    }
    this.notifyListeners();
  }

  // Private state transitions

  private transitionToOpen(): void {
    this.state = 'OPEN';
    this.successCount = 0;
    console.warn(
      '🔴 Circuit Breaker: Opened (too many failures). Requests will fail fast.'
    );
    console.warn(
      `   Will retry in ${this.config.timeout / 1000}s. Check if backend is running.`
    );
  }

  private transitionToHalfOpen(): void {
    this.state = 'HALF_OPEN';
    this.successCount = 0;
    console.warn(
      '🟡 Circuit Breaker: Half-open (testing recovery). Allowing test requests...'
    );
  }

  private transitionToClosed(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    console.log('🟢 Circuit Breaker: Closed (backend recovered!)');
  }
}

// Global circuit breaker instance (uses intelligent defaults based on environment)
export const apiCircuitBreaker = new CircuitBreaker();
