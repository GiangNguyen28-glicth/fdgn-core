import { CircuitBreakerClient, CircuitBreakerConfig } from '@fdgn/common';

export class ProductCircuit extends CircuitBreakerClient {
  constructor(request: { [con_id: string]: (...args: any[]) => any }) {
    super(request);
  }
  createCircuitConfigs(): { [breaker_id: string]: CircuitBreakerConfig } {
    return {
      default_1: {
        volumeThreshold: 1,
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        // request: this.requests['default_1'],
      },
    };
  }
}
