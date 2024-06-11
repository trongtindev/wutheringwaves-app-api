import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetBackupQueryDto, PutBackupBodyDto } from './backup.dto';
import { AuthDecorator } from '../auth/auth.decorator';
import { AuthData } from '../auth/auth.interface';

@Controller('backup')
export class BackupController {
  constructor(private backupService: BackupService) {}

  @UseGuards(AuthGuard)
  @Get()
  async get(
    @AuthDecorator() auth: AuthData,
    @Query() query: GetBackupQueryDto
  ) {
    return await this.backupService.get(auth, {
      withData: query.withData
    });
  }

  @UseGuards(AuthGuard)
  @Post()
  async put(@AuthDecorator() auth: AuthData, @Body() body: PutBackupBodyDto) {
    return await this.backupService.put(auth, {
      data: body.data
    });
  }

  @UseGuards(AuthGuard)
  @Delete()
  async eraseAll(@AuthDecorator() auth: AuthData) {
    return await this.backupService.eraseAll(auth);
  }
}
