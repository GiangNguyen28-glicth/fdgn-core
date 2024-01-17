import { Global, Module } from '@fdgn/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './type-orm.config';
export const CONFIG_KEY = 'typeOrm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const typeOrmConfig = new TypeOrmConfig(configService, CONFIG_KEY);
        return typeOrmConfig.getConfig() as any;
      },
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmSQLModule {}
