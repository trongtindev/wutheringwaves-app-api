import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { FileEventType } from './file.types';
import {
  IFileQueueOptimizeJob,
  IFileUploadedEventArgs,
} from './file.interface';
import fs from 'fs';
import path from 'path';

@Injectable()
export class FileEvents implements OnApplicationBootstrap {
  private logger = new Logger(FileEvents.name);
  private tempJobFileDir: string;

  constructor(@InjectQueue('file') private fileQueue: Queue) {}

  async onApplicationBootstrap() {
    this.tempJobFileDir = path.resolve('./', '.tmp/files/job');
    if (fs.existsSync(this.tempJobFileDir)) {
      fs.rmSync(this.tempJobFileDir, { recursive: true });
    }
    fs.mkdirSync(this.tempJobFileDir, { recursive: true });
  }

  @OnEvent(FileEventType.afterUpload)
  async sendQueueOptimize(args: IFileUploadedEventArgs) {
    this.logger.verbose(`sendQueueOptimize(${args.document.id})`);

    const tempFile = path.resolve(
      this.tempJobFileDir,
      `${args.document.id}_${args.document.name}`,
    );
    fs.writeFileSync(tempFile, args.file);

    const jobData: IFileQueueOptimizeJob = {
      _id: args.document._id,
      file: tempFile,
    };
    await this.fileQueue.add('optimize', jobData, {
      delay: 60 * 5 * 1000,
    });
  }
}
