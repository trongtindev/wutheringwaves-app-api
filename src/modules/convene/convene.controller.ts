import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConveneService } from './convene.service';
import { AuthGuardNullable } from '../auth/auth.guard';
import { ImportConveneBodyDto } from './convene.dto';

@Controller('convenes')
export class ConveneController {
  constructor(private conveneService: ConveneService) {}

  @UseGuards(AuthGuardNullable)
  @Post('import')
  async import(@Body() body: ImportConveneBodyDto) {
    return await this.conveneService.import(body);
  }

  @Get('summary')
  async summary() {
    return await this.conveneService.summary();
  }
}
