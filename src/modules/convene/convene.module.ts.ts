import { Global, Module } from '@nestjs/common';
import { ConveneService } from './convene.service';
import { Convene, ConveneSchema } from './convene.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConveneController } from './convene.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Convene.name, schema: ConveneSchema }])
  ],
  controllers: [ConveneController],
  providers: [ConveneService],
  exports: [ConveneService]
})
export class ConveneModule {}
