import { Controller, Get } from '@nestjs/common';
import { OK } from '../consts';

@Controller('health')
export class HealthRest {
  @Get('')
  async health(): Promise<string> {
    return OK;
  }
}
