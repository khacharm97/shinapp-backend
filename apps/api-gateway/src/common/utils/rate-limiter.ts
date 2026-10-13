/**
 * Minimal in-memory sliding-window limiter for the handful of endpoints an
 * anonymous visitor can hit. Per-process only, which is enough while the
 * gateway runs as a single instance.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Records a hit for `key`; returns false if it is over the limit. */
  take(key: string): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    if (this.hits.size > 5000) {
      for (const [k, times] of this.hits) {
        if (times[times.length - 1] <= cutoff) this.hits.delete(k);
      }
    }

    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
