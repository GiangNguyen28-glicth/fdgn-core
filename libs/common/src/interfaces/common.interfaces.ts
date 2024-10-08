import { DomainEventStatus } from '../consts';
import { IBaseEntity, ISoftDelete } from '../domain/common';

export interface IParseJson<DATA, ERROR = unknown> {
  data: DATA;
  error?: ERROR;
}

export interface IIntegrationEventLogService {
  retrieveEventLogsPendingToPublish(evt_id: string | number);
  markEventAsPublished(evt_id: string | number);
  markEventAsInProgress(evt_id: string | number);
  markEventAsFailed(evt_id: string | number);
}

export interface ILogEvent<ID extends string | number> extends Omit<IBaseEntity<ID>, keyof ISoftDelete<ID>> {
  request_id: string;

  transaction_id: string;

  event_name: string;

  event_content: string;

  context: string;

  status: DomainEventStatus;

  error?: string;
}
