import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { IFileQueueOptimizeJob } from './file.interface';
import sharp from 'sharp';
import fs from 'fs';
import { FileService } from './file.service';
import { Logger } from '@nestjs/common';

@Processor('file')
export class FileQueues {
  private logger = new Logger(FileQueues.name);

  constructor(private fileService: FileService) {}

  @Process({ name: 'optimize', concurrency: 10 })
  async optimize(job: Job<IFileQueueOptimizeJob>) {
    this.logger.verbose(`optimize(${job.data._id})...`);

    // get file stat
    const stat = fs.statSync(job.data.file);

    // convert to webp
    const newFile = await sharp(job.data.file)
      .webp({
        quality: 85
      })
      .toBuffer();

    this.logger.verbose(
      `optimize(${job.data._id})... result: ${stat.size} => ${newFile.length}`
    );
    await this.fileService.update(job.data._id, {
      file: newFile,
      type: 'image/webp'
    });

    fs.unlinkSync(job.data.file);
    this.logger.verbose(`optimize(${job.data._id}) done`);
  }
}
