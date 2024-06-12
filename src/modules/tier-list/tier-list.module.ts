import { Global, Module } from '@nestjs/common';
import { TierListService } from './tier-list.service';
import { TierListController } from './tier-list.controller';
import { TierList, TierListSchema } from './tier-list.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: TierList.name, schema: TierListSchema }])
  ],
  controllers: [TierListController],
  providers: [TierListService],
  exports: [TierListService]
})
export class TierListModule {}
