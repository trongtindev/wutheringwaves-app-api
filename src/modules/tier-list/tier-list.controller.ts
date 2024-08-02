import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TierListService } from './tier-list.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDecorator } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import {
  CreateTierListBodyDto,
  GetListTierListQueryDto,
} from './tier-list.dto';
import { ICreateTierListResponse } from './tier-list.interface';
import { Throttle } from '@nestjs/throttler';

@Controller('tier-list')
export class TierListController {
  constructor(private tierListService: TierListService) {}

  @Get()
  async list(@Query() query: GetListTierListQueryDto) {
    const result = await this.tierListService.list({
      type: query.type,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      total: result.total,
      items: await Promise.all(
        result.items.map(async (element) => {
          return await this.tierListService.resolve(element);
        }),
      ),
    };
  }

  @Throttle({
    tierListCreate: {
      ttl: 60000,
      limit: 3,
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @UserDecorator() user: UserDocument,
    @Body() body: CreateTierListBodyDto,
  ): Promise<ICreateTierListResponse> {
    console.log(user);
    const document = await this.tierListService.create(user, {
      type: body.type,
      title: body.title,
      rows: body.rows.map((e) => {
        return {
          label: e.label,
          color: e.color,
          items: e.items,
        };
      }),
    });
    return await this.tierListService.resolve(document);
  }
}
