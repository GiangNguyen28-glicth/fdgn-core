import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseClientConfig } from './mongoose.config';
import { MongooseService } from './mongoose.service';
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
  providers: [MongooseService],
  exports: [MongooseService],
})
export class MongoDBModule {}
