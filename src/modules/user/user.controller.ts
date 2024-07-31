import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDecorator } from './user.decorator';
import { UserDocument } from './user.schema';
import { UserGetRolesQueryDto, UserVerifyBodyDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@UserDecorator() user: UserDocument) {
    return await this.userService.resolve(user);
  }

  @UseGuards(AuthGuard)
  @Post('me/link')
  async link(
    @UserDecorator() user: UserDocument,
    @Body() body: UserVerifyBodyDto,
  ) {
    if (user.discordId) {
      throw new BadRequestException('already_verified');
    }
    return await this.userService.link(user._id, body.code);
  }

  @UseGuards(AuthGuard)
  @Delete('me/link')
  async unlink(@UserDecorator() user: UserDocument) {
    if (!user.discordId) {
      throw new BadRequestException('not_verified');
    }
    return await this.userService.unlink(user._id);
  }

  @UseGuards(AuthGuard)
  @Get('me/roles')
  async getRoles(
    @UserDecorator() user: UserDocument,
    @Query() query: UserGetRolesQueryDto,
  ) {
    const result = await this.userService.listRoles(user, {
      refresh: query.refresh,
    });
    if (result === null) return null;
    return {
      total: result.length,
      items: result,
    };
  }
}
