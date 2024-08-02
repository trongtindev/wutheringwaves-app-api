import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DiscordService } from './discord.service';

@Injectable()
export class DiscordSchedule {
  private logger = new Logger(DiscordSchedule.name);
  constructor(private discordService: DiscordService) {}

  @Cron('*/5 * * * *')
  async refreshMembers() {
    await this.discordService.getMembers();
  }
}
