import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UserDecorator } from './user.decorator';
import { UserDocument } from './user.schema';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@UserDecorator() user: UserDocument) {
    return await this.userService.resolve(user);
  }
}
