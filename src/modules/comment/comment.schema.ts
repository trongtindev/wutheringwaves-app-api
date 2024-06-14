import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

// comment_channels
export type CommentChannelDocument = HydratedDocument<CommentChannel>;
@Schema({ collection: 'comment_channels' })
export class CommentChannel extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const CommentChannelSchema =
  SchemaFactory.createForClass(CommentChannel);

// comment_channels
export type CommentDocument = HydratedDocument<Comment>;
@Schema({ collection: 'comment_channels' })
export class Comment extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
