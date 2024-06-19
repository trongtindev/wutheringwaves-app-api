import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Comment,
  CommentChannel,
  CommentChannelDocument,
  CommentDocument
} from './comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';
import { IAfterCreateCommentEventArgs, IComment } from './comment.interface';
import { CommentEventType } from './comment.types';
import { FileService } from '../file/file.service';

@Injectable()
export class CommentService {
  private logger = new Logger(CommentService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(CommentChannel.name)
    private commentChannelModel: Model<CommentChannel>,
    private fileService: FileService
  ) {}

  async resolve(document: CommentDocument): Promise<IComment> {
    return {} as any;
  }

  async upsertChannel(url: string): Promise<CommentChannelDocument> {
    const document = await this.commentChannelModel.findOne({
      url
    });
    if (document) return document;

    return await this.commentChannelModel.create({
      url
    });
  }

  async listComment(
    url: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    options ??= {};

    const channel = await this.upsertChannel(url);

    return {
      total: 0,
      items: []
    };
  }

  async createComment(
    user: UserDocument,
    args: {
      channel: string;
      content: string;
      parent?: Types.ObjectId;
      attachments?: Types.ObjectId[];
    }
  ): Promise<CommentDocument> {
    const channel = await this.upsertChannel(args.channel);
    const result = await this.commentModel.create({
      channel: channel._id,
      user: user._id,
      content: args.content
    });

    if (args.parent) {
      await this.commentModel.updateOne(
        {
          _id: args.parent
        },
        {
          $push: {
            replies: result._id
          }
        }
      );
    }

    await this.commentChannelModel.updateOne(
      {
        _id: args.channel
      },
      {
        $push: {
          comments: result._id
        }
      }
    );

    // get document
    const document = await this.commentModel.findById(result);

    // emit event
    const eventArgs: IAfterCreateCommentEventArgs = { document };
    await this.eventEmitter.emitAsync(
      CommentEventType.afterCreateAsync,
      eventArgs
    );
    this.eventEmitter.emit(CommentEventType.afterCreate, eventArgs);

    return document;
  }
}
