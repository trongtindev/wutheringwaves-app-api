import { Global, Module } from '@nestjs/common';
import { ConveneService } from './convene.service';
import {
  Convene,
  ConveneChunk,
  ConveneChunkSchema,
  ConveneSchema
} from './convene.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConveneController } from './convene.controller';
import { ConveneSchedule } from './convene.schedule';
import { ConveneEvents } from './convene.events';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Convene.name, schema: ConveneSchema },
      { name: ConveneChunk.name, schema: ConveneChunkSchema }
    ])
  ],
  controllers: [ConveneController],
  providers: [ConveneService, ConveneEvents, ConveneSchedule],
  exports: [ConveneService]
})
export class ConveneModule {}
