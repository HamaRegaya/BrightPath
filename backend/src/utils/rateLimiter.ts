export class RateLimiter {
  private calls: number[] = [];
  private maxCalls: number;
  private timeWindow: number;

  constructor(maxCalls: number = 10, timeWindowMs: number = 60000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindowMs;
  }

  canMakeCall(): boolean {
    const now = Date.now();
    // Remove calls older than the time window
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    
    if (this.calls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }

  getRemainingCalls(): number {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxCalls - this.calls.length);
  }

  getTimeUntilReset(): number {
    if (this.calls.length === 0) return 0;
    const oldestCall = Math.min(...this.calls);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestCall);
    return Math.max(0, timeUntilReset);
  }
}
