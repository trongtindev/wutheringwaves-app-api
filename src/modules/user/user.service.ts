import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser, UserRoleId, userRoles } from './user.interface';
import { DiscordService } from '../discord/discord.service';
import { JwtService } from '@nestjs/jwt';
import { GuildMember } from 'discord.js';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(User.name) private userModel: Model<User>,
    private discordService: DiscordService,
    private jwtService: JwtService
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

  async link(user: Types.ObjectId, code: string) {
    const decoded = await this.jwtService.verifyAsync<{
      sub: string;
      discordId: string;
    }>(code, {
      secret: process.env.AUTH_SECRET
    });
    if (decoded.sub !== user.toString()) {
      throw new BadRequestException('user_mismatch');
    }

    await this.userModel.updateOne(
      { _id: user },
      {
        $set: {
          discordId: decoded.discordId
        }
      }
    );
  }

  async unlink(user: Types.ObjectId) {
    await this.userModel.updateOne(
      { _id: user },
      {
        $unset: {
          discordId: true
        }
      }
    );
  }

  async listRoles(
    user: Types.ObjectId | UserDocument,
    options?: {
      refresh?: boolean;
    }
  ) {
    options ??= {};
    if (user instanceof Types.ObjectId) {
      user = await this.get(user);
    }

    // if not verified
    if (!user.discordId) return null;

    // fetch members by id
    if (options.refresh) {
      this.logger.verbose(`listRoles() options.refresh enabled!`);
      await this.discordService.getMembers();
    }
    const members = await this.discordService.getMembers({
      user: user.discordId
    });
    const member = members as unknown as GuildMember;
    if (!member) {
      throw new BadRequestException(`user_not_found`);
    }

    return userRoles.map((e) => {
      const roleId = UserRoleId[e];
      return {
        role: e,
        status: member.roles.cache.has(roleId)
      };
    });
  }
}
