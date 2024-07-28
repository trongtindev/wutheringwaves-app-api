import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
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
import { Cache, CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import { UserDecorator } from '../user/user.decorator';

@Controller('posts')
export class PostController {
  constructor(
    private postService: PostService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

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
  async increaseViews(@Param() param: PostIdParamDto, @Ip() ip: string) {
    const key = `${ip}-${param.id}`;
    const session = await this.cacheManager.get(key);
    if (session) return;

    const id = new Types.ObjectId(param.id);
    await this.postService.increaseViews(id, 1);
    await this.cacheManager.set(key, true, 60 * 15 * 1000);
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
      locales: body.locales,
      title: body.title,
      titleLocalized: Object.fromEntries(body.titleLocalized),
      description: body.description,
      descriptionLocalized: Object.fromEntries(body.descriptionLocalized),
      content: body.content,
      contentLocalized: Object.fromEntries(body.contentLocalized),
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
    let document = await this.postService.findBySlug(param.slug);
    if (!document) {
      const id = new Types.ObjectId(param.slug);
      document = await this.postService.get(id);
    }
    return await this.postService.resolve(document);
  }

  @Get(':id/related')
  async listRelated(@Param() param: PostIdParamDto) {
    const document = await this.postService.get(new Types.ObjectId(param.id));
    const result = await this.postService.list(
      {
        categories: document.categories
      },
      {
        filter: {
          _id: {
            $ne: document._id
          }
        }
      }
    );

    return {
      total: result.total,
      items: await Promise.all(
        result.items.map((e) => {
          return this.postService.resolve(e);
        })
      )
    };
  }

  // @Get(':id/latest')
  // async listLatest(@Param() param: PostIdParamDto) {
  //   const document = await this.postService.get(new Types.ObjectId(param.id));
  //   const result = await this.postService.list(
  //     {
  //       categories: document.categories
  //     },
  //     {
  //       filter: {
  //         _id: {
  //           $ne: document._id
  //         }
  //       }
  //     }
  //   );

  //   return {
  //     total: result.total,
  //     items: await Promise.all(
  //       result.items.map((e) => {
  //         return this.postService.resolve(e);
  //       })
  //     )
  //   };
  // }
}
