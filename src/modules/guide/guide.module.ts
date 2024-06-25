import { Module } from '@nestjs/common';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';

@Module({
  imports: [],
  controllers: [GuideController],
  providers: [GuideService],
  exports: [GuideService]
})
export class GuideModule {}
