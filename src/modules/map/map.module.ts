import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';

@Module({
  imports: [],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
