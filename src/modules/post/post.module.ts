import { Global, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import {
  Post,
  PostCategory,
  PostCategorySchema,
  PostRevision,
  PostRevisionSchema,
  PostSchema,
} from './post.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PostEvents } from './post.events';
import { PostSchedule } from './post.schedule';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostRevision.name, schema: PostRevisionSchema },
      { name: PostCategory.name, schema: PostCategorySchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, PostEvents, PostSchedule],
  exports: [PostService],
})
export class PostModule {}
