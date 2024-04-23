import { Global, Module } from '@nestjs/common';
import { CommonModule } from '@fdgn/common';
@Global()
@Module({
  imports: [CommonModule],
})
export class CoreServiceModule {}
