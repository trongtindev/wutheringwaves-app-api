import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FileService } from './file.service';

@Injectable()
export class FileSchedule {
  constructor(private fileService: FileService) {}

  @Cron('*/15 * * * *')
  async cleanup() {
    await this.fileService.cleanup();
  }
}
