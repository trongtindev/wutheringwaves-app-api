import { Global, Module } from '@nestjs/common';
import { ConveneService } from './convene.service';
import {
  ConveneStore,
  ConveneStoreSchema,
  ConveneSummary,
  ConveneSummarySchema
} from './convene.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConveneController } from './convene.controller';
import { ConveneSchedule } from './convene.schedule';
import { ConveneEvents } from './convene.events';
import { ConveneQueue } from './convene.queue';
import { BullModule } from '@nestjs/bull';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConveneStore.name, schema: ConveneStoreSchema },
      { name: ConveneSummary.name, schema: ConveneSummarySchema }
    ]),
    BullModule.registerQueue({ name: 'convene' })
  ],
  controllers: [ConveneController],
  providers: [ConveneService, ConveneEvents, ConveneSchedule, ConveneQueue],
  exports: [ConveneService]
})
export class ConveneModule {}
