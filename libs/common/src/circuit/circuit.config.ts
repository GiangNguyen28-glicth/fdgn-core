export interface CircuitBreakerConfig {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
  fallback?: (error: any) => any;
  cache?: boolean;
  volumeThreshold?: number;
  request?: (...args: any[]) => Promise<any>;
}
