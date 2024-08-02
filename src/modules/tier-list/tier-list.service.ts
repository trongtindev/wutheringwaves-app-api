import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TierList, TierListDocument } from './tier-list.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ITierList } from './tier-list.interface';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { TierListType } from './tier-list.types';

@Injectable()
export class TierListService {
  private logger = new Logger(TierListService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(TierList.name) private tierListModel: Model<TierList>,
    private userService: UserService,
  ) {}

  async resolve(document: TierListDocument): Promise<ITierList> {
    const user = await this.userService.findById(document.user);
    return {
      id: document.id,
      user: user ? await this.userService.resolve(user) : (null as any),
      type: document.type,
      title: document.title,
      content: document.content,
      updatedAt: document.updatedAt,
      createdAt: document.createdAt,
    };
  }

  async list(query?: {
    sort?: 'likes' | 'createAt';
    type?: TierListType;
    search?: string;
    offset?: number;
    limit?: number;
  }): Promise<{ total: number; items: TierListDocument[] }> {
    query ??= {};
    query.limit ??= 20;
    query.offset ??= 0;

    const filter: any = {};
    if (query.search) {
      filter.$text = {
        $search: query.search,
      };
    }

    const total = await this.tierListModel.countDocuments(filter);
    const items = await this.tierListModel
      .find(filter)
      .limit(query.limit)
      .skip(query.offset)
      .sort({
        createdAt: 'desc',
      });

    return { total, items };
  }

  async create(
    user: UserDocument,
    args: {
      type: TierListType;
      title: string;
      rows: {
        label: string;
        items: string[];
        color: string;
      }[];
    },
  ): Promise<TierListDocument> {
    return await this.tierListModel.create({
      user: user._id,
      type: args.type,
      title: args.title,
      content: JSON.stringify(args.rows),
    });
  }

  async delete(
    id: Types.ObjectId,
    args?: {
      user?: Types.ObjectId;
    },
  ) {}
}
