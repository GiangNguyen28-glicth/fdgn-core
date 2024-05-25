import { DomainEventStatus } from '../consts';
import { IBaseEntity, ISoftDelete } from './database.interface';

export interface IParseJson<T> {
  data: T;
  error: unknown;
}

export interface IIntegrationEventLogService {
  retrieveEventLogsPendingToPublish(evt_id: string | number);
  markEventAsPublished(evt_id: string | number);
  markEventAsInProgress(evt_id: string | number);
  markEventAsFailed(evt_id: string | number);
}

export interface ILogEvent extends Omit<IBaseEntity, keyof ISoftDelete> {
  request_id: string;

  transaction_id: string;

  event_name: string;

  event_content: string;

  context: string;

  status: DomainEventStatus;

  error?: string;
}
