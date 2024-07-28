import { Global, Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule {}
