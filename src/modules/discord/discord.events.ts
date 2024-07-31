import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscordEventType } from './discord.types';
import { DiscordService } from './discord.service';
import { ActivityType } from 'discord.js';

@Injectable()
export class DiscordEvents {
  constructor(private discordService: DiscordService) {}

  @OnEvent(DiscordEventType.initialized)
  async setPresence() {
    this.discordService.user.setPresence({
      activities: [
        {
          type: ActivityType.Custom,
          name: 'WutheringWaves.app',
        },
      ],
      status: 'online',
    });
  }
}
