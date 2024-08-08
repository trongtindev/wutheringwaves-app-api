import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SyncService } from './sync.service';

@Injectable()
export class SyncSchedule {
  constructor(private syncService: SyncService) {}

  @Cron('0 */12 * * *')
  async restart() {
    await this.syncService.initialize();
  }
}
