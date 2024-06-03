import { CircuitBreakerClient, CircuitBreakerConfig } from '@fdgn/common';

export class ProductCircuit extends CircuitBreakerClient {
  private rq: { [conId: string]: (...args: any[]) => Promise<any> } = {};

  constructor(request: { [conId: string]: (...args: any[]) => any }) {
    super();
    this.rq = request;
    this.createCircuitBreakers();
  }
  createCircuitConfigs(): { [breaker_id: string]: CircuitBreakerConfig } {
    return {
      default_1: {
        volumeThreshold: 1,
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        request: this.rq['default_1'],
      },
    };
  }
}
