import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as admin from 'firebase-admin';
import { Md5 } from 'ts-md5';
import { AuthVerifyEventArgs } from './auth.interface';
import { AuthEventType } from './auth.types';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async verifyIdToken(
    token: string,
    options?: {
      ignoreCache?: boolean;
    }
  ): Promise<DecodedIdToken> {
    options ??= {};

    // if cache
    const sessionId = Md5.hashStr(token);
    const sessionData = await this.cacheManager.get<DecodedIdToken>(sessionId);
    if (sessionData) return sessionData;

    // save cache
    const verifyIdToken = await admin.auth().verifyIdToken(token);
    const sessionTtl = Math.floor(
      (verifyIdToken.exp - new Date().getTime() / 1000 - 60) * 1000
    );
    await this.cacheManager.set(
      sessionId,
      verifyIdToken,
      sessionTtl < 0 ? 5 : sessionTtl
    );

    // emit events
    const getUser = await admin.auth().getUser(verifyIdToken.uid);
    const event: AuthVerifyEventArgs = {
      auth: verifyIdToken,
      userRecord: getUser
    };

    await this.eventEmitter.emitAsync(AuthEventType.afterVerifyAsync, event);
    this.eventEmitter.emit(AuthEventType.afterVerify, event);

    return verifyIdToken;
  }
}
