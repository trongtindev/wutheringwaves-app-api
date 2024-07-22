import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserEvents {
  private logger = new Logger(UserEvents.name);
  constructor(private userService: UserService) {}
}
