import assert from 'assert';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './modules/auth/auth.module';
import { BackupModule } from './modules/backup/backup.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { ConveneModule } from './modules/convene/convene.module.ts';

// environment
process.env.NODE_ENV = process.env.NODE_ENV.split(' ')[0] as any;
dotenv.config({ path: '.env.production' });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development', override: true });
}
dotenv.config({ path: '.env', override: true });

// redis
const { REDIS_HOST, REDIS_USER, REDIS_PASS } = process.env;
assert(REDIS_HOST);
assert(REDIS_USER);
assert(REDIS_PASS);

// mongodb
const {
  MONGODB_PROTOCOL,
  MONGODB_HOST,
  MONGODB_NAME,
  MONGODB_USER,
  MONGODB_PASS
} = process.env;
assert(MONGODB_HOST);
assert(MONGODB_NAME);
assert(MONGODB_USER);
assert(MONGODB_PASS);

// firebase
const { FIREBASE_ACCOUNT_KEY, FIREBASE_DATABASE_URL, FIREBASE_STORAGE_BUCKET } =
  process.env;
assert(FIREBASE_ACCOUNT_KEY);
assert(FIREBASE_DATABASE_URL);
assert(FIREBASE_STORAGE_BUCKET);

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(FIREBASE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: FIREBASE_DATABASE_URL,
    storageBucket: FIREBASE_STORAGE_BUCKET
  });
}

@Module({
  imports: [
    // core modules
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      `${MONGODB_PROTOCOL}://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}:27017/?retryWrites=true&w=majority`,
      {
        dbName: process.env.MONGODB_NAME,
        autoIndex: true,
        autoCreate: true
      }
    ),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      socket: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST
      },
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASS
    }),
    // custom modules
    AuthModule,
    BackupModule,
    ProxyModule,
    ConveneModule
  ]
})
export class AppModule {}
