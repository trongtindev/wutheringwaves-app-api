import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IndexingService } from './indexing.service';

@Injectable()
export class IndexingSchedule {
  constructor(private indexNowService: IndexingService) {}

  @Cron('0 * * * *')
  async submit() {
    if (process.env.NODE_ENV !== 'production') return;

    this.indexNowService.nowSubmitUrls();
  }

  @Cron('0 1 * * *')
  async googleSubmitUrls() {
    if (process.env.NODE_ENV !== 'production') return;

    await this.indexNowService.googleSubmitUrls();
    await this.indexNowService.googleResubmitUrls();
  }
}
