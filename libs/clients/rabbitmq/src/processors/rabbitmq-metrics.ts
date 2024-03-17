import { Injectable } from '@nestjs/common';
import { InjectMetric, makeCounterProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';
const PROCESSOR_DATUM_SUCCEED_TOTAL_METRIC = 'processor_datum_succeed_total';
const ProcessorDatumSucceedTotalMetric = makeCounterProvider({
  name: PROCESSOR_DATUM_SUCCEED_TOTAL_METRIC,
  help: `processor datums succeed total`,
  labelNames: ['context'],
});

const PROCESSOR_DATUM_SUCCEED_METRIC = 'processor_datum_succeed_gauge';
const ProcessorDatumSucceedMetric = makeGaugeProvider({
  name: PROCESSOR_DATUM_SUCCEED_METRIC,
  help: `processor datums succeed in latest batch`,
  labelNames: ['context'],
});

@Injectable()
export class RabbitMQMetrics {
  constructor(
    @InjectMetric(PROCESSOR_DATUM_SUCCEED_TOTAL_METRIC)
    public readonly processorDatumSucceedTotal: Counter<string>,

    @InjectMetric(PROCESSOR_DATUM_SUCCEED_METRIC)
    public readonly processorDatumSucceed: Gauge<string>,
  ) {}

  success(context: string, number: number) {
    const labels = { context };
    this.processorDatumSucceed.set(labels, number);
    this.processorDatumSucceedTotal.inc(labels, number);
  }
}

export const ProcessorMetricProviders = [ProcessorDatumSucceedTotalMetric, ProcessorDatumSucceedMetric];
