import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';
import { AuthData } from '../auth/auth.interface';

@Injectable()
export class BackupService {
  private logger = new Logger(BackupService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   *
   * @param auth
   */
  async get(
    auth: AuthData,
    options?: {
      withData?: boolean;
    }
  ) {
    options ??= {};

    const exists = await admin
      .storage()
      .bucket()
      .file(`backup/${auth.uid}.json`)
      .exists();

    if (exists[0]) {
      const file = await admin
        .storage()
        .bucket()
        .file(`backup/${auth.uid}.json`)
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
    auth: AuthData,
    args: {
      data: string;
    }
  ) {
    this.logger.verbose(`put(${auth.uid})`);

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
      .file(`backup/${auth.uid}.json`)
      .save(JSON.stringify(json));
    this.logger.verbose(`put(${auth.uid}) done! ${args.data.length}`);

    return await this.get(auth);
  }

  /**
   *
   * @param auth
   */
  async eraseAll(auth: AuthData) {
    this.logger.verbose(`eraseAll(${auth.uid})`);

    const file = await admin
      .storage()
      .bucket()
      .file(`backup/${auth.uid}.json`)
      .get({ autoCreate: false });

    if (await file[0].exists()) {
      await file[0].delete();
    }
  }
}
