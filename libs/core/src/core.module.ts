import { CommonModule } from '@fdgn/common';
import { Global, Module } from '@nestjs/common';
@Global()
@Module({
  imports: [CommonModule],
})
export class CoreServiceModule {}
