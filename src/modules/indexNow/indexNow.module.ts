import { Module } from '@nestjs/common';
import { IndexNowSchedule } from './indexNow.schedule';
import { IndexNowService } from './indexNow.service';
import { IndexNowUrl, IndexNowUrlSchema } from './indexNow.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndexNowUrl.name, schema: IndexNowUrlSchema }
    ])
  ],
  providers: [IndexNowService, IndexNowSchedule],
  exports: [IndexNowService]
})
export class IndexNowModule {}
