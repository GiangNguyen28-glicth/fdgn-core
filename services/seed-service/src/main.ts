import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  await app.listen(3000);
}
bootstrap();
