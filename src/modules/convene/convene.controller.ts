import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConveneService } from './convene.service';
import { AuthGuardNullable } from '../auth/auth.guard';
import { AuthDecorator } from '../auth/auth.decorator';
import { AuthData } from '../auth/auth.interface';
import { ImportConveneBodyDto } from './convene.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('convenes')
@Controller('convenes')
export class ConveneController {
  constructor(private conveneService: ConveneService) {}

  @UseGuards(AuthGuardNullable)
  @Post('import')
  async import(
    @AuthDecorator() auth: AuthData | undefined,
    @Body() body: ImportConveneBodyDto
  ) {
    return await this.conveneService.import(body.url, {
      userAgent: body.userAgent,
      cardPoolType: body.cardPoolType,
      auth
    });
  }
}
