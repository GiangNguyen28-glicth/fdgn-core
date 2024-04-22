import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@fdgn/common';

import { TypeOrmClientConfig } from './type-orm.config';
import { TypeOrmService } from './type-orm.service';
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
  providers: [TypeOrmService],
  exports: [TypeOrmService],
})
export class TypeOrmSQLModule {}
