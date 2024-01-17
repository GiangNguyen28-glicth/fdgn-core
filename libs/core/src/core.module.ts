import { Global, Module, CommonModule } from '@fdgn/common';

@Global()
@Module({
  imports: [CommonModule],
})
export class CoreServiceModule {}
