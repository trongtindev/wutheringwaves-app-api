import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { MapPinSummaryParamDto, MapPinSummaryUpdateBodyDto } from './map.dto';
import { AuthGuardRoot } from '../auth/auth.guard';

@Controller('map')
export class MapController {
  constructor(private mapService: MapService) {}

  @Get('markers')
  async markers() {
    return await this.mapService.markers();
  }

  @Get('pins/:id/summary')
  async pinSummary(@Param() param: MapPinSummaryParamDto) {
    return await this.mapService.pinSummary(parseInt(param.id));
  }

  @UseGuards(AuthGuardRoot)
  @Post('pins/:id/summary')
  async pinSummaryUpdate(
    @Param() param: MapPinSummaryParamDto,
    @Body() body: MapPinSummaryUpdateBodyDto,
  ) {
    return await this.mapService.pinSummaryUpdate(parseInt(param.id), {
      content: body.content,
    });
  }
}
