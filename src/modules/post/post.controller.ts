import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Ip,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  PostCreateBodyDto,
  PostIdParamDto,
  PostListQueryDto,
  PostSlugParamDto,
} from './post.dto';
import { Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { AuthGuard } from '../auth/auth.guard';
import { Cache, CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import { UserDecorator } from '../user/user.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  extractAttachments,
  validatorContentLocalized,
  validatorDescriptionLocalized,
  validatorTitleLocalized,
} from './post.utils';

@Controller('posts')
export class PostController {
  constructor(
    private postService: PostService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async list(@Query() query: PostListQueryDto) {
    const result = await this.postService.list({
      categories: query.categories
        ? query.categories.map((e) => {
            return new Types.ObjectId(e);
          })
        : undefined,
    });

    return {
      total: result.total,
      items: await Promise.all(
        result.items.map((e) => {
          return this.postService.resolve(e);
        }),
      ),
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
        }),
      ),
    };
  }

  @Throttle({
    'post.create': {
      ttl: 60000 * 30,
      limit: 10,
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @UserDecorator() user: UserDocument,
    @Body() body: PostCreateBodyDto,
  ) {
    // titleLocalized
    if (!body.titleLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.titleLocalized)) {
      validatorTitleLocalized(locale, body.locales, body.titleLocalized);
    }

    // descriptionLocalized
    if (!body.descriptionLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.descriptionLocalized)) {
      validatorDescriptionLocalized(
        locale,
        body.locales,
        body.descriptionLocalized,
      );
    }

    // contentLocalized
    if (!body.contentLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.contentLocalized)) {
      validatorContentLocalized(locale, body.locales, body.contentLocalized);
    }

    // attachments
    let attachments = [...extractAttachments(body.content)];
    for (const locale of Object.keys(body.contentLocalized)) {
      attachments = [
        ...attachments,
        ...extractAttachments(body.contentLocalized[locale]),
      ];
    }

    const result = await this.postService.create(user._id, {
      locale: body.locale,
      locales: body.locales,
      title: body.title,
      titleLocalized: body.titleLocalized,
      description: body.description,
      descriptionLocalized: body.descriptionLocalized,
      content: body.content,
      contentLocalized: body.contentLocalized,
      categories: body.categories.map((e) => {
        return new Types.ObjectId(e);
      }),
      thumbnail: new Types.ObjectId(body.thumbnail),
      attachments: attachments.map((e) => {
        return new Types.ObjectId(e);
      }),
      keywords: body.keywords,
      schedule: body.schedule ? new Date(body.schedule) : undefined,
    });
    return await this.postService.resolve(result);
  }

  @Throttle({
    'post.update': {
      ttl: 60000 * 30,
      limit: 5,
    },
  })
  @UseGuards(AuthGuard)
  @Post(':id')
  async update(
    @Param() param: PostIdParamDto,
    @UserDecorator() user: UserDocument,
    @Body() body: PostCreateBodyDto,
  ) {
    const id = new Types.ObjectId(param.id);
    const post = await this.postService.get(id);

    // titleLocalized
    if (!body.titleLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.titleLocalized)) {
      validatorTitleLocalized(locale, body.locales, body.titleLocalized);
    }

    // descriptionLocalized
    if (!body.descriptionLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.descriptionLocalized)) {
      validatorDescriptionLocalized(
        locale,
        body.locales,
        body.descriptionLocalized,
      );
    }

    // contentLocalized
    if (!body.contentLocalized) throw new BadRequestException();
    for (const locale of Object.keys(body.contentLocalized)) {
      validatorContentLocalized(locale, body.locales, body.contentLocalized);
    }

    // attachments
    let attachments = [...extractAttachments(body.content)];
    for (const locale of Object.keys(body.contentLocalized)) {
      attachments = [
        ...attachments,
        ...extractAttachments(body.contentLocalized[locale]),
      ];
    }

    await this.postService.update(user, post, {
      locale: body.locale,
      locales: body.locales,
      title: body.title,
      titleLocalized: body.titleLocalized,
      description: body.description,
      descriptionLocalized: body.descriptionLocalized,
      content: body.content,
      contentLocalized: body.contentLocalized,
      categories: body.categories.map((e) => {
        return new Types.ObjectId(e);
      }),
      thumbnail: new Types.ObjectId(body.thumbnail),
      attachments: attachments.map((e) => {
        return new Types.ObjectId(e);
      }),
      keywords: body.keywords,
      schedule: body.schedule ? new Date(body.schedule) : undefined,
    });
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
        categories: document.categories,
      },
      {
        filter: {
          _id: {
            $ne: document._id,
          },
        },
      },
    );

    return {
      total: result.total,
      items: await Promise.all(
        result.items.map((e) => {
          return this.postService.resolve(e);
        }),
      ),
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(
    @Param() param: PostIdParamDto,
    @UserDecorator() user: UserDocument,
  ) {
    const post = await this.postService.get(new Types.ObjectId(param.id));
    if (post.deleted) throw new NotFoundException();
    return await this.postService.delete(user, post);
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
