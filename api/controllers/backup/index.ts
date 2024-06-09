import {
  BadRequestException,
  BaseException,
  InternalServerErrorException,
  UnauthorizedException
} from '../../common/exception';
import { BaseResponse } from '../../common/response';
import * as admin from 'firebase-admin';
import { authorization } from '../../middlewares/authorization';
import { firebase } from '../../middlewares/firebase';

export async function GET(req: Request) {
  try {
    await firebase();
    await authorization(req);
    if (!req.auth) throw new UnauthorizedException();

    // retrieve backup
    const file = await admin
      .storage()
      .bucket()
      .file(`backup/${req.auth.uid}.json`)
      .get({ autoCreate: false });

    if (await file[0].exists()) {
      return new BaseResponse(200, {
        data: await (async () => {
          const uri = new URL(req.url);
          if (uri.searchParams.get('withData')) {
            const json = await file[0].download();
            return JSON.parse(Buffer.from(json[0]).toString('utf-8'));
          }
        })(),
        size: file[0].metadata.size,
        createdAt: file[0].metadata.timeCreated
      }).json();
    }

    return new BaseResponse(200, {}).json();
  } catch (error: any) {
    if (error instanceof BaseException) {
      return error.json();
    }
    return new InternalServerErrorException(error.message);
  }
}

export async function POST(req: Request) {
  try {
    await firebase();
    await authorization(req);
    if (!req.auth) throw new UnauthorizedException();

    const text = await req.text();
    const maxPayloadSize = 1024 * 1024 * 5;
    if (text.length > maxPayloadSize) {
      throw new BaseException(413, 'invalid data');
    }

    const { json } = JSON.parse(text);
    if (!json) throw new BadRequestException('json is required');
    if (!json.collections) throw new BadRequestException('invalid data');
    if (typeof json.instanceToken !== 'string')
      throw new BadRequestException('invalid data');
    if (typeof json.name !== 'string')
      throw new BadRequestException('invalid data');

    // upload backup
    await admin
      .storage()
      .bucket()
      .file(`backup/${req.auth.uid}.json`)
      .save(JSON.stringify(json));
    console.log('3');
    return new BaseResponse(200, {}).json();
  } catch (error: any) {
    if (error instanceof BaseException) {
      return error.json();
    }
    return new InternalServerErrorException(error.message).json();
  }
}
