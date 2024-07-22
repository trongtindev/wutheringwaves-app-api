import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';
import { Types } from 'mongoose';

@Injectable()
export class BackupService {
  private logger = new Logger(BackupService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   *
   * @param auth
   */
  async get(
    user: Types.ObjectId,
    options?: {
      withData?: boolean;
    }
  ) {
    options ??= {};

    const exists = await admin
      .storage()
      .bucket()
      .file(`backup/${user.id}.json`)
      .exists();

    if (exists[0]) {
      const file = await admin
        .storage()
        .bucket()
        .file(`backup/${user.id}.json`)
        .get();

      return {
        data: await (async () => {
          if (options.withData) {
            const json = await file[0].download();
            return JSON.parse(Buffer.from(json[0]).toString('utf-8'));
          }
        })(),
        size: file[0].metadata.size,
        createdAt: file[0].metadata.timeCreated
      };
    }

    return {
      size: 0,
      createdAt: 0
    };
  }

  /**
   *
   * @param auth
   */
  async put(
    user: Types.ObjectId,
    args: {
      data: string;
    }
  ) {
    this.logger.verbose(`put(${user.id})`);

    const json = JSON.parse(args.data);
    if (!json) throw new BadRequestException('json is required');
    if (!json.collections) throw new BadRequestException('invalid data');
    if (typeof json.instanceToken !== 'string')
      throw new BadRequestException('invalid data');
    if (typeof json.name !== 'string')
      throw new BadRequestException('invalid data');

    await admin
      .storage()
      .bucket()
      .file(`backup/${user.id}.json`)
      .save(JSON.stringify(json));
    this.logger.verbose(`put(${user.id}) done! ${args.data.length}`);

    return await this.get(user);
  }

  /**
   *
   * @param auth
   */
  async eraseAll(user: Types.ObjectId) {
    this.logger.verbose(`eraseAll(${user.id})`);

    const [result] = await admin
      .storage()
      .bucket()
      .file(`backup/${user.id}.json`)
      .get({ autoCreate: false });

    if (await result.exists()) {
      await result.delete();
    }
  }
}
