import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
const CONFIG_KEY = 'throttler';
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlerConfig = configService.get(CONFIG_KEY);
        return throttlerConfig;
      },
    }),
  ],
})
export class ThrottlerClientModule {}
