import { Global, Module } from '@nestjs/common';
import { ConveneService } from './convene.service';
import { Convene, ConveneSchema } from './convene.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConveneController } from './convene.controller';
import { ConveneSchedule } from './convene.schedule';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Convene.name, schema: ConveneSchema }])
  ],
  controllers: [ConveneController],
  providers: [ConveneService, ConveneSchedule],
  exports: [ConveneService]
})
export class ConveneModule {}
