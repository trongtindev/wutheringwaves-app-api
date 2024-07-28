import { Global, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEvents } from './comment.events';
import { CommentController } from './comment.controller';
import {
  Comment,
  CommentChannel,
  CommentChannelSchema,
  CommentSchema
} from './comment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchedule } from './comment.schedule';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: CommentChannel.name, schema: CommentChannelSchema }
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentEvents, CommentSchedule],
  exports: [CommentService]
})
export class CommentModule {}
