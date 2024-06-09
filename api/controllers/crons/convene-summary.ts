import { InternalServerErrorException } from '../../common/exception';
import { BaseResponse } from '../../common/response';
import mongodbInitialize from '../../middlewares/mongodb';
import { kv } from '@vercel/kv';
import ConveneModel from '../../models/convene';

export async function GET(req: Request) {
  try {
    // prevent parallel
    const session = await kv.get('convene-summary');
    if (session) {
      return new BaseResponse(200, {
        message: 'in_progress'
      }).json();
    }
    await kv.setex('convene-summary', 60 * 5, true);

    // initialize models
    const mongo = await mongodbInitialize();

    await kv.del('convene-summary');
    return new BaseResponse(200, { message: 'OK' }).json();
  } catch (error: any) {
    await kv.del('convene-summary');

    if (error instanceof BaseResponse) {
      console.debug(error);
      return error.json();
    }

    return new InternalServerErrorException(error.message).json();
  }
}
