import { ValidationError, validateSync } from '@fdgn/common';
export const DEFAULT_CON_ID = 'default';

export class ClientConfig {
  con_id?: string;

  context: string;

  constructor(props: ClientConfig) {
    this.con_id = props?.con_id ?? DEFAULT_CON_ID;
    this.context = props?.context;
  }

  validate(): string[] {
    const errors: ValidationError[] = validateSync(this);
    return errors.length ? errors.reduce((res, err) => res.concat(Object.values(err.constraints)), []) : null;
  }
}
