interface RateLimiterOptions {
  maxRequests: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
}

class RateLimiter {
  private requests: Map<string, { count: number; startTime: number }> =
    new Map();
  private maxRequests: number;
  private windowMs: number;
  private static limitersByName: Map<string, RateLimiter> = new Map();

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  static of(name: string) {
    return this.limitersByName.get(name);
  }

  static new(name: string, ...args: ConstructorParameters<typeof RateLimiter>) {
    const instance = new RateLimiter(...args);
    this.limitersByName.set(name, instance);

    return instance;
  }

  public async allows(key: string): Promise<boolean> {
    const now = Date.now();
    const requestInfo = this.requests.get(key) || { count: 0, startTime: now };

    // Check if the time window has passed
    if (now - requestInfo.startTime >= this.windowMs) {
      // Reset the count and start time for a new window
      requestInfo.count = 1;
      requestInfo.startTime = now;
    } else {
      requestInfo.count++;
    }

    // Update the map with the new request info
    this.requests.set(key, requestInfo);

    // Check if the count exceeds the limit
    return requestInfo.count <= this.maxRequests;
  }
}

export { RateLimiter };
