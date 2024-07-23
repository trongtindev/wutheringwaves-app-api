import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async resolve(user: Types.ObjectId | UserDocument): Promise<IUser> {
    if (user instanceof Types.ObjectId) {
      user = await this.get(user);
    }
    return {
      id: user.id,
      name: user.name,
      photoUrl: user.photoUrl
    };
  }

  async get(id: string | Types.ObjectId): Promise<UserDocument> {
    const document = await this.userModel.findById(id);
    if (!document) throw new NotFoundException();
    return document;
  }

  async findById(id: string | Types.ObjectId) {
    if (typeof id === 'string') id = new Types.ObjectId(id);
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email });
  }

  async upsert(args: {
    email: string;
    name: string;
    photoUrl: string;
  }): Promise<UserDocument> {
    await this.userModel.updateOne(
      {
        email: args.email
      },
      {
        name: args.name,
        photoUrl: args.photoUrl,
        updatedAt: new Date()
      },
      {
        upsert: true
      }
    );
    return await this.findByEmail(args.email)!;
  }
}
