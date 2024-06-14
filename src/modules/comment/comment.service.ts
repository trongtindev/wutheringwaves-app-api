import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Comment, CommentChannel } from './comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentService {
  private logger = new Logger(CommentService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(CommentChannel.name)
    private commentChannelModel: Model<CommentChannel>
  ) {}
}
