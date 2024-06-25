import { Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Post,
  PostCategory,
  PostCategoryDocument,
  PostDocument
} from './post.schema';
import { IPost, IPostCategory } from './post.interface';
import { PostTypeEnum } from './post.types';

@Injectable()
export class PostService {
  private logger = new Logger(PostService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(PostCategory.name) private categoryModel: Model<PostCategory>
  ) {}

  async create(
    user: Types.ObjectId,
    args: {
      type: PostTypeEnum;
      category: Types.ObjectId;
      thumbnail: Types.ObjectId;
      title: string;
      content: string;
      attachments?: Types.ObjectId[];
    },
    options?: {
      createdAt?: Date;
    }
  ) {
    options ??= {};
  }

  async delete() {}

  async update() {}

  async resolve(document: PostDocument): Promise<IPost> {
    return {
      id: document.id
    };
  }

  async resolveCategory(
    document: PostCategoryDocument
  ): Promise<IPostCategory> {
    return {
      id: document.id
    };
  }
}
