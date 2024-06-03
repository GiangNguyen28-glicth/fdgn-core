import CircuitBreaker = require('opossum');

import { CircuitBreakerConfig } from './circuit.config';

export abstract class CircuitBreakerClient {
  private circuit_breakers: { [breaker_id: string]: CircuitBreaker } = {};
  private circuit_configs: { [breaker_id: string]: CircuitBreakerConfig } = {};

  constructor() {
    // this.createCircuitBreakers();
  }

  abstract createCircuitConfigs(): { [breaker_id: string]: CircuitBreakerConfig };

  createCircuitBreakers() {
    this.circuit_configs = this.createCircuitConfigs();
    for (const key in this.circuit_configs) {
      this.circuit_breakers[key] = new CircuitBreaker(this.circuit_configs[key].request, this.circuit_configs[key]);
    }
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
