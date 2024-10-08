import { ClientConfig } from './client.config';

export interface Client<Config extends ClientConfig, Client = any> {
  getConfig(con_id: string): Config;

  getClient(con_id: string): Client;
}
