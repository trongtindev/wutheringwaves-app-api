import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async resolve(document: UserDocument): Promise<IUser> {
    return {
      id: document.id,
      name: document.name,
      photoUrl: document.photoUrl
    };
  }

  async findById(id: string | Types.ObjectId) {
    if (typeof id === 'string') id = new Types.ObjectId(id);
    return await this.userModel.findById(id);
  }

  async findByUid(uid: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ uid });
  }

  async upsert(userRecord: UserRecord): Promise<void> {
    await this.userModel.updateOne(
      {
        uid: userRecord.uid
      },
      {
        name: userRecord.displayName || userRecord.uid,
        email: userRecord.email,
        disabled: userRecord.disabled,
        photoUrl: userRecord.photoURL,
        updatedAt: new Date()
      },
      {
        upsert: true
      }
    );
  }
}
