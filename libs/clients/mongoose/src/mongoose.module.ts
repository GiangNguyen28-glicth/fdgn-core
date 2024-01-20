import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseClientConfig } from './mongoose.config';
const CONFIG_KEY = 'mongoose';
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
})
export class MongoDBModule {}
