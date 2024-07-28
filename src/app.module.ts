import assert from 'assert';
import dotenv from 'dotenv';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './modules/auth/auth.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { ConveneModule } from './modules/convene/convene.module';
import { TierListModule } from './modules/tier-list/tier-list.module';
import { UserModule } from './modules/user/user.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { CommentModule } from './modules/comment/comment.module';
import { FileModule } from './modules/file/file.module';
import { MapModule } from './modules/map/map.module';
import { PostModule } from './modules/post/post.module';
import { AIModule } from './modules/ai/ai.module';
import { SyncModule } from './modules/sync/sync.module';
import { ResourceModule } from './modules/resource/resource.module';
import { IndexingModule } from './modules/indexing/indexing.module';
import { DiscordModule } from './modules/discord/discord.module';

// environment
dotenv.config({ path: '.env.production' });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development', override: true });
}
dotenv.config({ path: '.env', override: true });

// redis
const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } = process.env;
assert(REDIS_HOST);
assert(REDIS_PORT);
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

@Module({
  imports: [
    // core modules
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      `${MONGODB_PROTOCOL}://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}/?retryWrites=true&w=majority`,
      {
        dbName: MONGODB_NAME,
        autoIndex: true,
        autoCreate: true
      }
    ),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      socket: {
        port: parseInt(REDIS_PORT),
        host: process.env.REDIS_HOST
      },
      username: REDIS_USER,
      password: REDIS_PASS
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 10000,
        limit: 50
      }
    ]),
    BullModule.forRoot({
      redis: {
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
        username: REDIS_USER,
        password: REDIS_PASS
      }
    }),
    // custom modules
    AuthModule,
    SyncModule,
    ProxyModule,
    ConveneModule,
    TierListModule,
    UserModule,
    CommentModule,
    FileModule,
    MapModule,
    PostModule,
    IndexingModule,
    AIModule,
    ResourceModule,
    DiscordModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
