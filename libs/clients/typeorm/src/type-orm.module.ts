import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@fdgn/common';

import { TypeOrmClientConfig } from './type-orm.config';
export const CONFIG_KEY = 'typeOrm';

@Global()
@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const typeOrmConfig = new TypeOrmClientConfig(configService, CONFIG_KEY);
        return { ...typeOrmConfig.getConnectionConfig() };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmSQLModule {}
