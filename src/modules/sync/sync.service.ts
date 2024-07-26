import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';
import { Types } from 'mongoose';

@Injectable()
export class SyncService {
  private logger = new Logger(SyncService.name);
  private path = process.env.SYNC_PATH;

  constructor(private eventEmitter: EventEmitter2) {}

  async pull(
    user: Types.ObjectId,
    options?: {
      withData?: boolean;
    }
  ) {
    const key = user.toString();
    this.logger.verbose(`pull(${key})`);

    options ??= {};

    const [exists] = await admin
      .storage()
      .bucket()
      .file(`${this.path}/${key}.json`)
      .exists();

    if (exists) {
      const [file] = await admin
        .storage()
        .bucket()
        .file(`${this.path}/${key}.json`)
        .get();

      return {
        data: await (async () => {
          if (options.withData) {
            const json = await file.download();
            return JSON.parse(Buffer.from(json[0]).toString('utf-8'));
          }
        })(),
        size: file.metadata.size,
        createdAt: file.metadata.timeCreated
      };
    }

    return {
      size: 0,
      createdAt: 0
    };
  }

  async push(
    user: Types.ObjectId,
    args: {
      data: string;
    }
  ) {
    const key = user.toString();
    this.logger.verbose(`push(${key})`);

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
      .file(`${this.path}/${key}.json`)
      .save(JSON.stringify(json));
    this.logger.verbose(`put(${key}) done! ${args.data.length}`);

    return await this.pull(user);
  }

  async eraseAll(user: Types.ObjectId) {
    const key = user.toString();
    this.logger.verbose(`eraseAll(${key})`);

    const [file] = await admin
      .storage()
      .bucket()
      .file(`${this.path}/${key}.json`)
      .get({ autoCreate: false });

    if (await file.exists()) {
      await file.delete();
    }
  }
}