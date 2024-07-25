import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDecorator } from './user.decorator';
import { UserDocument } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@UserDecorator() user: UserDocument) {
    return await this.userService.resolve(user);
  }
}
