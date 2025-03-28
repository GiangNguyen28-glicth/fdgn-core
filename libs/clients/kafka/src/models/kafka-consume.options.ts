import {
  ConsumerConfig,
  ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  EachMessagePayload,
  KafkaMessage,
} from 'kafkajs';

export type ConsumerRunCfg = {
  autoCommit?: boolean;
  autoCommitInterval?: number | null;
  autoCommitThreshold?: number | null;
  eachBatchAutoResolve?: boolean;
  partitionsConsumedConcurrently?: number;
};

export type ConsumerBatchRunConfig = ConsumerRunCfg & {
  eachBatch: (payload: EachBatchPayload) => Promise<void>;
};

export type ConsumerMessageRunConfig = ConsumerRunCfg & {
  eachMessage: (payload: EachMessagePayload) => Promise<void>;
};

export interface IMessageConsume<Input> {
  data: Input;
  msg: EachMessagePayload;
}

export interface IConsumeable<Input> {
  start(): Promise<void>;

  consume(cb: (source: IMessageConsume<Input>) => void): Promise<void>;
}

export interface IKafkaConsumeConfig {
  consumerSubscribeTopic: ConsumerSubscribeTopics | ConsumerSubscribeTopic;
  consumerCfg: ConsumerConfig;
  consumerRunConfig: ConsumerBatchRunConfig | ConsumerMessageRunConfig;
  con_id?: string;
  numOfConsumer?: number;
}
