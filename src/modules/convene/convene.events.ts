import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConveneService } from './convene.service';
import { ResourceEventTypes } from '../resource/resource.types';

@Injectable()
export class ConveneEvents {
  constructor(private conveneService: ConveneService) {}

  @OnEvent(ResourceEventTypes.initialized)
  async globalStatsCalculate() {
    this.conveneService.globalStatsCalculate();
  }
}
