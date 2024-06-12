import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthVerifyEventArgs } from '../auth/auth.interface';
import { AuthEventType } from '../auth/auth.types';
import { UserService } from './user.service';

@Injectable()
export class UserEvents {
  private logger = new Logger(UserEvents.name);
  constructor(private userService: UserService) {}

  @OnEvent(AuthEventType.afterVerifyAsync)
  async upsert(args: AuthVerifyEventArgs) {
    this.logger.verbose(`upsert ${args.auth.uid}`);
    await this.userService.upsert(args.userRecord);
  }
}
