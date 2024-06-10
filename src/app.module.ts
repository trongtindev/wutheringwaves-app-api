import assert from 'assert';
import dotenv from 'dotenv';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

// environment
process.env.NODE_ENV = process.env.NODE_ENV.split(' ')[0] as any;
dotenv.config({ path: '.env.production' });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development', override: true });
}
dotenv.config({ path: '.env', override: true });

const { REDIS_HOST, REDIS_USER, REDIS_PASS } = process.env;
assert(REDIS_HOST);
assert(REDIS_USER);
assert(REDIS_PASS);

const { MONGODB_HOST, MONGODB_NAME, MONGODB_USER, MONGODB_PASS } = process.env;
assert(MONGODB_HOST);
assert(MONGODB_NAME);
assert(MONGODB_USER);
assert(MONGODB_PASS);

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}:27017/?retryWrites=true&w=majority`,
      {
        dbName: process.env.MONGODB_NAME,
        autoIndex: true,
        autoCreate: true
      }
    ),
    ScheduleModule.forRoot(),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      socket: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST
      },
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASS
    })
  ]
})
export class AppModule {}
