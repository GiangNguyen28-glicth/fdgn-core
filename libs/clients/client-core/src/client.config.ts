export const DEFAULT_CON_ID = 'default';
export class ClientConfig {
  conId?: string;

  context: string;

  constructor(props: ClientConfig) {
    this.conId = props?.conId ?? DEFAULT_CON_ID;
    this.context = props?.context;
  }
}
