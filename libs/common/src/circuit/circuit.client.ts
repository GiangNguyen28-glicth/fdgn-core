import CircuitBreaker = require('opossum');
import { isNil } from 'lodash';

import { CircuitBreakerConfig } from './circuit.config';

export abstract class CircuitBreakerClient {
  private circuit_breakers: { [breaker_id: string]: CircuitBreaker } = {};
  private circuit_configs: { [breaker_id: string]: CircuitBreakerConfig } = {};
  protected requests: { [breaker_id: string]: (...args: any[]) => Promise<any> } = {};
  constructor(request: { [breaker_id: string]: (...args: any[]) => any }) {
    this.requests = request;
    this.initCircuitBreakers();
  }

  abstract createCircuitConfigs(): { [breaker_id: string]: CircuitBreakerConfig };

  initCircuitBreakers() {
    this.circuit_configs = this.createCircuitConfigs();
    for (const key in this.circuit_configs) {
      this.circuit_breakers[key] = this.createCircuitBreaker(
        this.circuit_configs[key].request,
        this.circuit_configs[key],
      );
    }
  }

  createCircuitBreaker(makeRequest: (...args: any[]) => any, config: CircuitBreakerConfig) {
    if (isNil(makeRequest) || isNil(config)) {
      throw new Error('Config is not accepted');
    }
    return new CircuitBreaker(makeRequest, config);
  }

  async request<T>(breaker_id: string, ...args: any[]): Promise<T> {
    return await this.circuit_breakers[breaker_id].fire(...args);
  }

  getCircuitConfigById(breaker_id: string): CircuitBreakerConfig {
    return this.circuit_configs[breaker_id];
  }

  setCircuitConfigById(circuit_config: CircuitBreakerConfig, breaker_id: string) {
    this.circuit_configs[breaker_id] = circuit_config;
  }

  getCircuitBreakerById(breaker_id: string): CircuitBreaker {
    return this.circuit_breakers[breaker_id];
  }

  setCircuitBreakerById(circuit_breaker: CircuitBreaker, breaker_id: string) {
    this.circuit_breakers[breaker_id] = circuit_breaker;
  }
}
