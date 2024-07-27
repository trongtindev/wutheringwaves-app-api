import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscordEventType } from '../discord/discord.types';
import { Message } from 'discord.js';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserEvents {
  private logger = new Logger(UserEvents.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  @OnEvent(DiscordEventType.messageCreate)
  async onMessage(message: Message<boolean>) {
    if (!message.content.startsWith('/link ')) {
      return;
    }
    if (message.author.bot) {
      this.logger.verbose(`not allowed bot!`);
      return;
    }

    const userId = message.content.split('/link ')[1];
    if (!Types.ObjectId.isValid(userId)) {
      await message.channel.send({
        content: 'INVALID_USER_ID'
      });
      return;
    }

    const token = await this.jwtService.signAsync(
      {
        sub: userId,
        discordId: message.author.id
      },
      {
        secret: process.env.AUTH_SECRET,
        expiresIn: '30d'
      }
    );
    await message.channel.send({ content: token });
  }
}
