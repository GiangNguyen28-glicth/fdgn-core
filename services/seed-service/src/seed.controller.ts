import { Controller, Get } from '@nestjs/common';

@Controller('seed')
export class SeedController {
  @Get('test-1')
  test1() {
    return 'Test 1';
  }

  @Get('test-2')
  test2() {
    return 'Test 1';
  }
}
