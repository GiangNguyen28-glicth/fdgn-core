import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transport, ClientsModule } from '@nestjs/microservices';
import { Seed, SeedSchema } from './entities/seed.schema';
import { SeedKafkaConsumer } from './seed-kafka.consumer';
import { SeedController } from './seed.controller';
import { SeedConsumer } from './seed.consumer';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Seed.name, schema: SeedSchema }]),
    ClientsModule.register([
      {
        name: 'task',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 9003,
        },
      },
    ]),
  ],
  controllers: [SeedController],
  providers: [],
})
export class SeedModule {}
