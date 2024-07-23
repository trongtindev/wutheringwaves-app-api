import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Session,
  UseGuards
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  PostCreateBodyDto,
  PostIdParamDto,
  PostListQueryDto,
  PostSlugParamDto
} from './post.dto';
import { Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { AuthGuard } from '../auth/auth.guard';
import { CacheTTL } from '@nestjs/cache-manager';
import { UserDecorator } from '../user/user.decorator';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  async list(@Query() query: PostListQueryDto) {
    const result = await this.postService.list({
      categories: query.categories
        ? query.categories.map((e) => {
            return new Types.ObjectId(e);
          })
        : undefined
    });

    return {
      total: result.total,
      items: await Promise.all(
        result.items.map((e) => {
          return this.postService.resolve(e);
        })
      )
    };
  }

  @Post(':id/views')
  async increaseViews(
    @Param() param: PostIdParamDto,
    @Session() session: Record<string, any>
  ) {
    if (session[param.id]) {
      return;
    }
    session[param.id] = 1;

    const id = new Types.ObjectId(param.id);
    await this.postService.increaseViews(id, 1);
  }

  @CacheTTL(60 * 60 * 3)
  @Get('categories')
  async categories() {
    const result = this.postService.getCategories();
    return {
      total: result.total,
      items: await Promise.all(
        result.items.map((e) => {
          return this.postService.resolveCategory(e);
        })
      )
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @UserDecorator() user: UserDocument,
    @Body() body: PostCreateBodyDto
  ) {
    const result = await this.postService.create(user._id, {
      locale: body.locale,
      // locales: body.locales,
      title: body.title,
      description: body.description,
      content: body.content,
      categories: body.categories.map((e) => {
        return new Types.ObjectId(e);
      }),
      thumbnail: new Types.ObjectId(body.thumbnail),
      attachments: body.attachments
        ? body.attachments.map((e) => {
            return new Types.ObjectId(e);
          })
        : []
    });
    return await this.postService.resolve(result);
  }

  @Get(':slug')
  async get(@Param() param: PostSlugParamDto) {
    const document = await this.postService.findBySlug(param.slug);
    return await this.postService.resolve(document);
  }
}
