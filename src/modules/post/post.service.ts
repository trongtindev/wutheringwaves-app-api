import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Post,
  PostCategory,
  PostCategoryDocument,
  PostDocument,
  PostRevision,
} from './post.schema';
import { IPost, IPostCategory, IPostCreateArgs } from './post.interface';
import { FileService } from '../file/file.service';
import urlSlug from 'url-slug';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/user.schema';
import { compareObject, renderExportContent } from './post.utils';
import { isImage } from '../file/file.utils';

@Injectable()
export class PostService implements OnApplicationBootstrap {
  private logger = new Logger(PostService.name);
  private categories: PostCategoryDocument[];

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Post.name) private model: Model<Post>,
    @InjectModel(PostRevision.name) private revisionModel: Model<PostRevision>,
    @InjectModel(PostCategory.name) private categoryModel: Model<PostCategory>,
    private fileService: FileService,
    private userService: UserService,
  ) {}

  async onApplicationBootstrap() {
    this.categories = await this.initialCategories([
      {
        slug: 'characters',
        name: 'Characters',
      },
      {
        slug: 'weapons',
        name: 'Weapons',
      },
      {
        slug: 'echoes',
        name: 'Echoes',
      },
      {
        slug: 'items',
        name: 'Items',
      },
      {
        slug: 'maps',
        name: 'Maps',
      },
      {
        slug: 'tower-of-adversity',
        name: 'Tower of Adversity',
      },
      {
        slug: 'events',
        name: 'Events',
      },
      {
        slug: 'quests',
        name: 'Quests',
      },
      {
        slug: 'enemies',
        name: 'Enemies',
      },
      {
        slug: 'version-1-0',
        name: 'Version 1.0',
      },
      {
        slug: 'version-1-1',
        name: 'Version 1.1',
      },
    ]);
  }

  async get(id: Types.ObjectId) {
    const document = await this.model.findById(id);
    if (!document) throw new NotFoundException();
    return document;
  }

  async findBySlug(slug: string): Promise<PostDocument | null> {
    const document = await this.model.findOne({ slug });
    return document;
  }

  async list(
    args: { search?: string; categories?: Types.ObjectId[] },
    options?: {
      filter?: any;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    total: number;
    items: PostDocument[];
  }> {
    options ??= {};
    options.limit ??= 10;
    options.offset ??= 0;

    const filter: any = options.filter || {};
    if (args.categories) {
      filter.categories = {
        $in: args.categories,
      };
    }
    filter.deleted = false;
    filter.createdAt = {
      $lte: new Date(),
    };

    const total = await this.model.countDocuments(filter);
    const items = await this.model
      .find(filter)
      .limit(options.limit)
      .skip(options.offset)
      .sort({
        createdAt: 'desc',
      });

    return { total, items };
  }

  async create(
    user: Types.ObjectId,
    args: IPostCreateArgs,
  ): Promise<PostDocument> {
    const exists = await this.model.findOne({ title: args.title });
    if (exists) throw new BadRequestException();

    const result = await this.model.create({
      user,
      slug: urlSlug(args.title),
      locale: args.locale,
      locales: args.locales || [],
      title: args.title,
      titleLocalized: args.titleLocalized || {},
      description: args.description,
      descriptionLocalized: args.descriptionLocalized || {},
      content: args.content,
      contentLocalized: args.contentLocalized || {},
      attachments: args.attachments,
      thumbnail: args.thumbnail,
      categories: args.categories,
      keywords: args.keywords,
      createdAt: args.schedule || new Date(),
    });

    // check thumbnail
    const thumbnail = await this.fileService.get(args.thumbnail);
    if (!isImage(thumbnail.type)) {
      throw new BadRequestException('invalid-thumbnail');
    }
    await this.fileService.setExpire(args.thumbnail, -1);

    await Promise.all(
      args.attachments.map(async (e) => {
        return await this.fileService.setExpire(e, -1);
      }),
    );

    return await this.model.findById(result)!;
  }

  async update(
    user: Types.ObjectId | UserDocument,
    post: Types.ObjectId | PostDocument,
    args: IPostCreateArgs,
  ) {
    if (post instanceof Types.ObjectId) {
      post = await this.get(post);
    }
    if (user instanceof Types.ObjectId) {
      user = await this.userService.get(user);
    }

    // check thumbnail
    const thumbnail = await this.fileService.get(args.thumbnail);
    if (!isImage(thumbnail.type)) {
      throw new BadRequestException('invalid-thumbnail');
    }

    // create revision
    const changes: any = {};

    if (post.title !== args.title) {
      changes.title = post.title;
    }
    if (!compareObject(post.titleLocalized, args.titleLocalized)) {
      changes.titleLocalized = post.titleLocalized;
    }

    if (post.description !== args.description) {
      changes.description = post.description;
    }
    if (!compareObject(post.descriptionLocalized, args.descriptionLocalized)) {
      changes.descriptionLocalized = post.descriptionLocalized;
    }

    if (post.content !== args.content) {
      changes.content = post.content;
    }
    if (!compareObject(post.contentLocalized, args.contentLocalized)) {
      changes.contentLocalized = post.contentLocalized;
    }

    if (post.locale !== args.locale) {
      changes.locale = post.locale;
    }
    if (post.locales !== args.locales) {
      changes.locales = post.locales;
    }
    if (post.categories !== args.categories) {
      changes.categories = post.categories;
    }
    if (post.keywords !== args.keywords) {
      changes.keywords = post.keywords;
    }

    await this.revisionModel.create({
      post: post._id,
      user: user._id,
      changes,
    });

    // update this post
    await this.model.updateOne(
      {
        _id: post._id,
      },
      {
        $set: {
          title: args.title,
          titleLocalized: args.titleLocalized,
          description: args.description,
          descriptionLocalized: args.descriptionLocalized,
          content: args.content,
          contentLocalized: args.contentLocalized,
          categories: args.categories,
          keywords: args.keywords,
          thumbnail: args.thumbnail,
          attachments: args.attachments,
          createdAt: args.schedule || post.createdAt,
        },
      },
    );

    // delete old thumbnail
    if (!args.thumbnail.equals(post.thumbnail)) {
      this.fileService.setExpire(post.thumbnail, 0);
    }

    // update expiry attachments
    const unused = post.attachments.filter((e) => {
      return (
        args.attachments.findIndex((attachment) => {
          return e.equals(attachment);
        }) < 0
      );
    });
    const added = args.attachments.filter((e) => {
      return (
        post.attachments.findIndex((attachment) => {
          return e.equals(attachment);
        }) < 0
      );
    });
    Promise.all(
      unused.map(async (e) => {
        return await this.fileService.setExpire(e, 0);
      }),
    );
    Promise.all(
      added.map(async (e) => {
        return await this.fileService.setExpire(e, -1);
      }),
    );
  }

  async delete(
    user: Types.ObjectId | UserDocument,
    post: Types.ObjectId | PostDocument,
  ) {
    if (post instanceof Types.ObjectId) {
      post = await this.get(post);
    }
    if (user instanceof Types.ObjectId) {
      user = await this.userService.get(user);
    }

    if (post.user.equals(user._id) === false) {
      const isHasRoles = await this.userService.hasRoles(user, [
        'Moderator',
        'Manager',
        'Owner',
      ]);
      if (!isHasRoles) throw new ForbiddenException();
    }

    await this.model.updateOne(
      {
        _id: post._id,
      },
      {
        $set: {
          deleted: true,
        },
      },
    );
  }

  async resolve(document: PostDocument): Promise<IPost> {
    const user = await (async () => {
      return await this.userService.resolve(document.user);
    })();

    const title = (() => {
      return document.title;
    })();

    const description = (() => {
      return document.description;
    })();

    const content = (() => {
      return document.content;
    })();

    const thumbnail = await (async () => {
      const file = await this.fileService.findById(document.thumbnail);
      if (file) {
        return await this.fileService.resolve(file);
      }
    })();

    const categories = await (async () => {
      return await Promise.all(
        document.categories.map((e) => {
          return this.resolveCategory(e);
        }),
      );
    })();

    return {
      id: document.id,
      user,
      slug: document.slug,
      locale: document.locale,
      locales: document.locales,
      title,
      titleLocalized: document.titleLocalized,
      description,
      descriptionLocalized: document.descriptionLocalized,
      content: renderExportContent(content),
      contentLocalized: document.contentLocalized,
      thumbnail,
      views: document.views,
      categories,
      updatedAt: document.updatedAt.toISOString(),
      createdAt: document.createdAt.toISOString(),
      keywords: document.keywords,
      deleted: document.deleted,
    };
  }

  async resolveCategory(
    category: Types.ObjectId | PostCategoryDocument,
  ): Promise<IPostCategory> {
    if (category instanceof Types.ObjectId) {
      category = this.categories.find((e) => {
        return e._id.equals(category._id);
      })!;
    }
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      nameLocalized: category.nameLocalized,
    };
  }

  async initialCategories(
    items: {
      slug: string;
      name: string;
      nameLocalized?: string[];
    }[],
  ): Promise<PostCategoryDocument[]> {
    await this.categoryModel.bulkWrite(
      items.map((e) => {
        return {
          updateOne: {
            filter: {
              slug: e.slug,
            },
            update: {
              $set: {
                name: e.name,
                nameLocalized: e.nameLocalized || {},
                updatedAt: new Date(),
              },
              $setOnInsert: {
                slug: e.slug,
              },
            },
            upsert: true,
          },
        };
      }),
    );

    return Promise.all(
      items.map(async (e) => {
        return await this.categoryModel.findOne({
          slug: e.slug,
        });
      }),
    );
  }

  getCategories() {
    return {
      items: this.categories,
      total: this.categories.length,
    };
  }

  async increaseViews(post: Types.ObjectId, value: number) {
    await this.model.updateOne(
      {
        _id: post,
      },
      {
        $inc: {
          views: value,
        },
      },
    );
  }
}
