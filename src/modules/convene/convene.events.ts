import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConveneEventType } from './convene.types';
import { ConveneService } from './convene.service';
import { IAfterImportConveneEventArgs } from './convene.interface';

@Injectable()
export class ConveneEvents {
  constructor(private conveneService: ConveneService) {}

  @OnEvent(ConveneEventType.afterImport)
  async addChunk(args: IAfterImportConveneEventArgs) {
    await this.conveneService.createChunk(args.playerId, {
      items: args.items,
      cardPoolType: args.cardPoolType
    });
  }
}
