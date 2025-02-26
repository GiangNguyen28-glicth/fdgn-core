import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { CONFIG_KEY, MongooseClientConfig } from './configs';
import { MongooseService } from './mongoose.service';
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const mongooseConfig = new MongooseClientConfig(configService, CONFIG_KEY);
        return {
          uri: mongooseConfig.getUrl(),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MongooseService],
  exports: [MongooseService],
})
export class MongoDBModule {}
