import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import * as moment from 'moment-timezone';
import { ASIA_HCM_TZ, DATE_FORMAT } from '../../consts';

export function createPinoHttp(configService: ConfigService) {
  const now = moment().tz(ASIA_HCM_TZ).format(DATE_FORMAT.DEFAULT);
  return {
    pinoHttp: [
      {
        stream: pino.destination({
          dest: `./logs/${now}.log`,
          minLength: 4096,
          sync: false,
        }),
      },
    ] as any,
  };
}
