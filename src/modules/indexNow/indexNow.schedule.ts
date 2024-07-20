import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IndexNowService } from './indexNow.service';

@Injectable()
export class IndexNowSchedule {
  constructor(private indexNowService: IndexNowService) {}

  @Cron('0 1 * * *')
  async submit() {
    if (process.env.NODE_ENV !== 'production') return;
    this.indexNowService.submit();
  }

  @Cron('0 1 * * *')
  async submitGoogle() {
    if (process.env.NODE_ENV !== 'production') return;
    this.indexNowService.submitGoogle();
  }
}
