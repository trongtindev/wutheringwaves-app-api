import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

// comment_channels
export type CommentChannelDocument = HydratedDocument<CommentChannel>;
@Schema({ collection: 'comment_channels' })
export class CommentChannel extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: [] })
  comments: Types.ObjectId[];

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const CommentChannelSchema =
  SchemaFactory.createForClass(CommentChannel);

// comments
export type CommentDocument = HydratedDocument<Comment>;
@Schema({ collection: 'comments' })
export class Comment extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  channel: Types.ObjectId;

  @Prop({ index: true })
  user: Types.ObjectId;

  @Prop()
  content: string;

  @Prop({ default: [], index: true })
  likes: Types.ObjectId[];

  @Prop({ default: [], index: true })
  dislikes: Types.ObjectId[];

  @Prop({ default: [] })
  replies: Types.ObjectId[];

  @Prop({ default: [] })
  attachments: Types.ObjectId[];

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;

  @Prop({ index: true })
  parent?: Types.ObjectId;

  @Prop({})
  guest?: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
