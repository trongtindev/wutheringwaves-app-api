import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { kv } from '@vercel/kv';
import { jwtDecode } from 'jwt-decode';
import { Md5 } from 'ts-md5';

import * as admin from 'firebase-admin';
import { UnauthorizedException } from '../common/exception';

export const authorization = async (req: Request): Promise<Request> => {
  const authorization = req.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedException();
  }

  try {
    const token = authorization.split('Bearer ')[1];
    const decoded = jwtDecode<DecodedIdToken>(token);

    const sessionId = Md5.hashStr(token);
    const session = await kv.get<DecodedIdToken>(sessionId);
    if (session) {
      req.auth = session;
      return req;
    }

    const verifyIdToken = await admin.auth().verifyIdToken(token);
    const sessionTtl = Math.floor(
      verifyIdToken.exp - new Date().getTime() / 1000 - 30
    );
    await kv.setex(sessionId, sessionTtl, verifyIdToken);

    req.auth = decoded;
    return req;
  } catch (error: any) {
    console.debug(error);
    throw new UnauthorizedException(error.message);
  }
};
