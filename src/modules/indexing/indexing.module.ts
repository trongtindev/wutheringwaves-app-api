import { Module } from '@nestjs/common';
import { IndexingService } from './indexing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { IndexingUrl, IndexingUrlSchema } from './indexing.schema';
import { IndexingSchedule } from './indexing.schedule';
import { IndexingEvents } from './indexing.events';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndexingUrl.name, schema: IndexingUrlSchema }
    ])
  ],
  providers: [IndexingService, IndexingSchedule, IndexingEvents],
  exports: [IndexingService]
})
export class IndexingModule {}
