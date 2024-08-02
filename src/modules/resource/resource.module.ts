import { Global, Module } from '@nestjs/common';
import { ResourceService } from './resource.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
