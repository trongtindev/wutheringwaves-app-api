import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConveneService } from './convene.service';

@Injectable()
export class ConveneSchedule {
  private logger = new Logger(ConveneSchedule.name);

  constructor(private conveneService: ConveneService) {}

  @Cron('*/30 * * * *')
  async globalStatsCalculate() {
    this.logger.verbose('globalStatsCalculate');
    await this.conveneService.globalStatsCalculate();
  }
}
