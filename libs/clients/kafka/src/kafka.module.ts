import { Global, Module } from '@nestjs/common';
import { CommonModule } from '@fdgn/common';
import { KafkaClientService } from './kafka.service';

@Global()
@Module({
  imports: [CommonModule],
  providers: [KafkaClientService],
  exports: [KafkaClientService],
})
export class KafkaClientModule {}
