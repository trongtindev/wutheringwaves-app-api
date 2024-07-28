import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { SyncService as SyncService } from './sync.service';
import { AuthGuard } from '../auth/auth.guard';
import { SyncPullQueryDto, SyncPushBodyDto } from './sync.dto';
import { UserDocument } from '../user/user.schema';
import { UserDecorator } from '../user/user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Throttle({
    'sync.pull': {
      limit: 10,
      ttl: 60000
    }
  })
  @UseGuards(AuthGuard)
  @Get('pull')
  async pull(
    @UserDecorator() user: UserDocument,
    @Query() query: SyncPullQueryDto
  ) {
    return await this.syncService.pull(user._id, {
      withData: query.withData
    });
  }

  @Throttle({
    'sync.push': {
      limit: 15,
      ttl: 60000
    }
  })
  @UseGuards(AuthGuard)
  @Post('push')
  async push(
    @UserDecorator() user: UserDocument,
    @Body() body: SyncPushBodyDto
  ) {
    return await this.syncService.push(user._id, {
      data: body.data
    });
  }

  @Throttle({
    'sync.erase': {
      limit: 3,
      ttl: 60000
    }
  })
  @UseGuards(AuthGuard)
  @Delete()
  async erase(@UserDecorator() user: UserDocument) {
    return await this.syncService.eraseAll(user._id);
  }
}
