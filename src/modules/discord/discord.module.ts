import { Global, Module } from '@nestjs/common';
import { DiscordEvents } from './discord.events';
import { DiscordService } from './discord.service';
import { DiscordSchedule } from './discord.schedule';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [DiscordService, DiscordEvents, DiscordSchedule],
  exports: [DiscordService],
})
export class DiscordModule {}
