import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Comment,
  CommentChannel,
  CommentChannelDocument,
  CommentDocument,
} from './comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAfterCreateCommentEventArgs, IComment } from './comment.interface';
import { CommentEventType } from './comment.types';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class CommentService {
  private logger = new Logger(CommentService.name);
  private whitelistChannels = ['codes'];

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(CommentChannel.name)
    private commentChannelModel: Model<CommentChannel>,
    private fileService: FileService,
    private userService: UserService,
    private resourceService: ResourceService,
  ) {}

  async resolve(document: CommentDocument): Promise<IComment> {
    const user = await this.userService.get(document.user);
    const attachments = await Promise.all(
      document.attachments.map(async (e) => {
        const file = await this.fileService.findById(e);
        return file ? await this.fileService.resolve(file) : undefined;
      }),
    );

    return {
      id: document.id,
      user: await this.userService.resolve(user),
      content: document.content.replaceAll('\n', '<br/>'),
      likes: document.likes.length,
      dislikes: document.dislikes.length,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      attachments: attachments.filter((e) => e),
    };
  }

  async upsertChannel(key: string): Promise<CommentChannelDocument> {
    if (!this.whitelistChannels.includes(key)) {
      if (!key.includes('.')) {
        throw new BadRequestException();
      }

      const [keyName, keyValue] = key.split('.');
      if (!keyName || !keyValue) {
        throw new BadRequestException();
      }

      if (keyName === 'character') {
        if (!this.resourceService.characters.find((e) => e.slug === keyValue)) {
          throw new BadRequestException();
        }
      } else if (keyName === 'echo') {
        if (!this.resourceService.echoes.find((e) => e.slug === keyValue)) {
          throw new BadRequestException();
        }
      } else if (keyName === 'item') {
        if (!this.resourceService.items.find((e) => e.slug === keyValue)) {
          throw new BadRequestException();
        }
      } else if (keyName === 'trophy') {
        if (!this.resourceService.trophies.find((e) => e.slug === keyValue)) {
          throw new BadRequestException();
        }
      } else if (keyName === 'weapon') {
        if (!this.resourceService.weapons.find((e) => e.slug === keyValue)) {
          throw new BadRequestException();
        }
      }
    }

    const document = await this.commentChannelModel.findOne({ key });
    if (document) return document;
    return await this.commentChannelModel.create({ key });
  }

  async listComment(
    url: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ) {
    options ??= {};
    options.limit ??= 10;
    options.offset ??= 0;

    const channel = await this.upsertChannel(url);
    const items = await this.commentModel
      .find({
        _id: {
          $in: channel.comments,
        },
      })
      .limit(options.limit)
      .skip(options.offset)
      .sort({
        createdAt: 'desc',
      });

    const total = channel.comments.length;

    return {
      total: total,
      items: items,
    };
  }

  async createComment(
    user: Types.ObjectId,
    args: {
      channel: string;
      content: string;
      parent?: Types.ObjectId;
      attachments?: Types.ObjectId[];
    },
  ): Promise<CommentDocument> {
    if (args.attachments) {
      for (const element of args.attachments) {
        // if not exist, throw not found
        const file = await this.fileService.get(element);

        // if not owner, throw not found
        if (
          file.user.equals(user) === false ||
          file.expiresIn.getTime() === 0
        ) {
          // this.logger.verbose()
          throw new NotFoundException();
        }
      }
    }

    const channel = await this.upsertChannel(args.channel);
    const result = await this.commentModel.create({
      channel: channel._id,
      user,
      content: args.content,
      attachments: args.attachments,
    });

    if (args.parent) {
      await this.commentModel.updateOne(
        {
          _id: args.parent,
        },
        {
          $push: {
            replies: result._id,
          },
        },
      );
    }

    // TODO: maybe move to events
    await this.commentChannelModel.updateOne(
      {
        _id: channel._id,
      },
      {
        $push: {
          comments: result._id,
        },
      },
    );

    // TODO: maybe move to events
    if (args.attachments) {
      args.attachments.forEach((e) => {
        this.fileService.setExpire(e, -1);
      });
    }

    // get document
    const document = await this.commentModel.findById(result);

    // emit event
    const eventArgs: IAfterCreateCommentEventArgs = { document };
    await this.eventEmitter.emitAsync(
      CommentEventType.afterCreateAsync,
      eventArgs,
    );
    this.eventEmitter.emit(CommentEventType.afterCreate, eventArgs);

    return document;
  }
}
