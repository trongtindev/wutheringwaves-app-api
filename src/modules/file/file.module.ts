import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileEvents } from './file.events';
import { FileSchedule } from './file.schedule';
import { FileController } from './file.controller';
import { BullModule } from '@nestjs/bull';
import { File, FileSchema } from './file.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { FileQueues } from './file.queues';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    BullModule.registerQueue({ name: 'file' }),
    NestjsFormDataModule
  ],
  controllers: [FileController],
  providers: [FileService, FileEvents, FileSchedule, FileQueues],
  exports: [FileService]
})
export class FileModule {}
