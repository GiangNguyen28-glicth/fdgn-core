import { Controller, Get } from '@nestjs/common';
import { OK } from '../constants';

@Controller('health')
export class HealthRest {
  @Get('')
  async health(): Promise<string> {
    return OK;
  }
}
