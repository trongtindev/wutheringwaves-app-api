import { Global, Module } from '@nestjs/common';
import { ConveneService } from './convene.service';
import { ConveneStore, ConveneStoreSchema } from './convene.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConveneController } from './convene.controller';
import { ConveneSchedule } from './convene.schedule';
import { ConveneEvents } from './convene.events';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConveneStore.name, schema: ConveneStoreSchema }
    ])
  ],
  controllers: [ConveneController],
  providers: [ConveneService, ConveneEvents, ConveneSchedule],
  exports: [ConveneService]
})
export class ConveneModule {}
