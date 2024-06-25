import { Controller, UseGuards } from '@nestjs/common';
import { GuideService } from './guide.service';

@Controller('guides')
export class GuideController {
  constructor(private guideService: GuideService) {}
}
